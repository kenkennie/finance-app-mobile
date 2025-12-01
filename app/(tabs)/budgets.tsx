import {
  View,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Header } from "@/shared/components/ui/Header";
import { FAB } from "@/shared/components/ui/FAB";
import { useRouter } from "expo-router";
import { SearchBar } from "@/shared/components/ui/SearchBar";
import { Typography } from "@/shared/components/ui/Typography";
import { Card } from "@/shared/components/ui/Card";
import { TabBar } from "@/shared/components/ui/TabBar";
import { BudgetCard } from "@/app/screens/Budgets/BudgetCard";
import { budgetService } from "@/shared/services/budget/budgetService";
import { Budget, OverallBudgetStats } from "@/shared/types/budget.types";
import { colors } from "@/theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Budgets = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [overallStats, setOverallStats] = useState<OverallBudgetStats | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [paginationMeta, setPaginationMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);

  // Calculate tab bar height to ensure content isn't hidden
  const tabBarHeight = (Platform.OS === "ios" ? 100 : 82) + insets.bottom;
  const contentPaddingBottom = tabBarHeight + 20; // Extra 20px for better spacing

  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchBudgets = async (page: number = 1) => {
    try {
      setError(null);

      // Build filters based on current state
      const filters: any = {
        page,
        limit: 20, // Page size
      };

      // Add search filter
      if (debouncedSearchQuery.trim()) {
        filters.search = debouncedSearchQuery.trim();
      }

      // Add active status filter based on tab
      if (activeTab === "active") {
        filters.isActive = true;
      } else if (activeTab === "inactive") {
        filters.isActive = false;
      }

      console.log("Fetching budgets with filters:", filters);

      const [budgetsResponse, statsResponse] = await Promise.all([
        budgetService.getBudgets(filters),
        budgetService.getOverallBudgetStats(),
      ]);

      console.log("Budgets response:", budgetsResponse);
      console.log("Stats response:", statsResponse);

      if (page === 1) {
        setBudgets(budgetsResponse.data);
      } else {
        // For pagination - append new data
        setBudgets((prev) => [...prev, ...budgetsResponse.data]);
      }

      setPaginationMeta(budgetsResponse.meta);
      setOverallStats(statsResponse);
    } catch (err: any) {
      setError(err.message || "Failed to load budgets");
      console.error("Failed to fetch budgets:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchBudgets(1);
  }, []);

  // Re-fetch when search query or active tab changes
  useEffect(() => {
    const delayedFetch = setTimeout(() => {
      setIsLoading(true);
      fetchBudgets(1);
    }, 300); // Small delay to avoid too many requests

    return () => clearTimeout(delayedFetch);
  }, [debouncedSearchQuery, activeTab]);

  // Note: Filtering is now done on the backend, so budgets array is already filtered
  // Just show the budgets as returned from the API

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBudgets(1);
  };

  const handleLoadMore = async () => {
    if (
      !isLoading &&
      paginationMeta &&
      paginationMeta.page < paginationMeta.totalPages
    ) {
      await fetchBudgets(paginationMeta.page + 1);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const renderBudgetCard = ({ item: budget }: { item: Budget }) => {
    // For now, we'll calculate spent amount from budget categories
    // In a real implementation, this would come from budget stats API
    const spentAmount =
      budget.budgetCategories?.reduce(
        (sum, cat) => sum + cat.allocatedAmount * 0.6, // Placeholder: assume 60% spent
        0
      ) || 0;

    return (
      <BudgetCard
        budget={budget}
        onPress={() =>
          router.push(`/screens/Budgets/BudgetDetails?budgetId=${budget.id}`)
        }
        isDark={isDark}
        spentAmount={spentAmount}
      />
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          isDark && styles.containerDark,
        ]}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? colors.text.white : colors.text.primary}
        />
        <Typography
          style={
            isDark
              ? [styles.loadingText, styles.loadingTextDark]
              : styles.loadingText
          }
        >
          Loading budgets...
        </Typography>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Budgets"
        onBackPress={() => router.back()}
        isDark={isDark}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          placeholder="Search budgets"
          value={searchQuery}
          onChangeText={setSearchQuery}
          isDark={isDark}
        />
      </View>

      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? colors.text.white : colors.text.primary}
          />
        }
        renderItem={renderBudgetCard}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoading && budgets.length > 0 ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator
                size="small"
                color={isDark ? colors.text.white : colors.text.primary}
              />
              <Typography
                variant="caption"
                style={[
                  styles.loadMoreText,
                  isDark ? styles.loadMoreTextDark : {},
                ]}
              >
                Loading more budgets...
              </Typography>
            </View>
          ) : null
        }
        ListHeaderComponent={() => (
          <>
            {/* Overview Card */}
            {overallStats && (
              <Card
                isDark={isDark}
                style={styles.summaryCard}
              >
                <View style={styles.summaryHeader}>
                  <Typography
                    variant="h3"
                    style={[
                      styles.summaryTitle,
                      isDark ? styles.summaryTitleDark : {},
                    ]}
                  >
                    Budget Overview
                  </Typography>
                </View>

                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Typography
                      variant="caption"
                      style={[
                        styles.summaryLabel,
                        isDark ? styles.summaryLabelDark : {},
                      ]}
                    >
                      Total Allocated
                    </Typography>
                    <Typography
                      variant="h2"
                      style={[styles.summaryValue, styles.allocatedValue]}
                    >
                      {formatCurrency(overallStats.totalAllocated)}
                    </Typography>
                  </View>

                  <View style={styles.summaryItem}>
                    <Typography
                      variant="caption"
                      style={[
                        styles.summaryLabel,
                        isDark ? styles.summaryLabelDark : {},
                      ]}
                    >
                      Total Spent
                    </Typography>
                    <Typography
                      variant="h2"
                      style={[styles.summaryValue, styles.spentValue]}
                    >
                      {formatCurrency(overallStats.totalSpent)}
                    </Typography>
                  </View>

                  <View style={styles.summaryItem}>
                    <Typography
                      variant="caption"
                      style={[
                        styles.summaryLabel,
                        isDark ? styles.summaryLabelDark : {},
                      ]}
                    >
                      Remaining
                    </Typography>
                    <Typography
                      variant="h2"
                      style={[
                        styles.summaryValue,
                        overallStats.totalRemaining >= 0
                          ? styles.remainingPositive
                          : styles.remainingNegative,
                      ]}
                    >
                      {formatCurrency(overallStats.totalRemaining)}
                    </Typography>
                  </View>
                </View>
              </Card>
            )}

            {/* Filters Section */}
            <Card
              isDark={isDark}
              style={styles.filtersCard}
            >
              <TabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isDark={isDark}
                tabs={[
                  { id: "all", label: "All" },
                  { id: "active", label: "Active" },
                  { id: "inactive", label: "Inactive" },
                ]}
              />
            </Card>

            <View style={styles.sectionHeader}>
              <Typography
                variant="h3"
                weight="semibold"
                style={
                  isDark
                    ? [styles.sectionTitle, styles.sectionTitleDark]
                    : styles.sectionTitle
                }
              >
                Your Budgets ({budgets.length}
                {paginationMeta && paginationMeta.total > budgets.length
                  ? ` of ${paginationMeta.total}`
                  : ""}
                )
              </Typography>
            </View>
          </>
        )}
        ListEmptyComponent={() => {
          if (error) {
            return (
              <View style={[styles.centered, styles.errorContainer]}>
                <Typography
                  style={
                    isDark
                      ? [styles.errorText, styles.errorTextDark]
                      : styles.errorText
                  }
                >
                  {error}
                </Typography>
              </View>
            );
          }

          return (
            <View style={[styles.centered, styles.emptyContainer]}>
              <Typography
                variant="h2"
                style={
                  isDark
                    ? [styles.emptyTitle, styles.emptyTitleDark]
                    : styles.emptyTitle
                }
              >
                {debouncedSearchQuery ? "No budgets found" : "No budgets yet"}
              </Typography>
              <Typography
                variant="body1"
                style={[
                  styles.emptySubtitle,
                  ...(isDark ? [styles.emptySubtitleDark] : []),
                ]}
              >
                {debouncedSearchQuery
                  ? "Try adjusting your search or filters"
                  : "Create your first budget to start tracking your expenses"}
              </Typography>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={
          budgets.length === 0
            ? [styles.fullHeight, { paddingBottom: contentPaddingBottom }]
            : { paddingBottom: contentPaddingBottom }
        }
      />

      <FAB
        icon="plus"
        onPress={() => router.push("/screens/Budgets/addBudget")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  containerDark: {
    backgroundColor: "#000",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  fullHeight: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryHeader: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  summaryTitleDark: {
    color: "#FFF",
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    textAlign: "center",
  },
  summaryLabelDark: {
    color: "#9CA3AF",
  },
  summaryValue: {
    fontSize: 16,
    textAlign: "center",
  },
  allocatedValue: {
    color: "#10B981",
  },
  spentValue: {
    color: "#EF4444",
  },
  remainingPositive: {
    color: "#10B981",
  },
  remainingNegative: {
    color: "#EF4444",
  },
  filtersCard: {
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  loadingTextDark: {
    color: "#9CA3AF",
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.text.primary,
  },
  sectionTitleDark: {
    color: colors.text.white,
  },

  errorContainer: {
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  errorTextDark: {
    color: "#F87171",
  },
  emptyContainer: {
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  emptyTitle: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyTitleDark: {
    color: "#9CA3AF",
  },
  emptySubtitle: {
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  emptySubtitleDark: {
    color: "#9CA3AF",
  },
  loadMoreContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loadMoreText: {
    marginTop: 8,
    color: colors.text.secondary,
  },
  loadMoreTextDark: {
    color: colors.text.white,
  },
});

export default Budgets;
