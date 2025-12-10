import {
  View,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/shared/components/ui/Header";
import { FAB } from "@/shared/components/ui/FAB";
import { useRouter } from "expo-router";
import { SearchBar } from "@/shared/components/ui/SearchBar";
import { Typography } from "@/shared/components/ui/Typography";
import { Card } from "@/shared/components/ui/Card";
import { TabBar } from "@/shared/components/ui/TabBar";
import { BudgetCard } from "@/app/screens/Budgets/BudgetCard";
import { useBudgetStore } from "@/store/budgetStore";
import { Budget } from "@/shared/types/budget.types";
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

  const {
    budgets,
    budgetStats,
    overallStats,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    getBudgets,
    loadMoreBudgets,
  } = useBudgetStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Refs for request deduplication
  const currentRequestRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Calculate tab bar height to ensure content isn't hidden
  const tabBarHeight = (Platform.OS === "ios" ? 100 : 82) + insets.bottom;
  const contentPaddingBottom = tabBarHeight + 20; // Extra 20px for better spacing

  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch budgets when filters change
  useEffect(() => {
    // Create request identifier for deduplication
    const requestId = `${activeTab}-${debouncedSearchQuery}`;

    // Cancel previous request if it's still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Skip if this request is already in progress
    if (currentRequestRef.current === requestId) {
      return;
    }

    currentRequestRef.current = requestId;
    abortControllerRef.current = new AbortController();

    const fetchBudgets = async () => {
      try {
        const params: any = {};

        // Add status filter
        if (activeTab !== "all") {
          params.status = [activeTab];
        }

        // Add search filter
        if (debouncedSearchQuery.trim()) {
          params.search = debouncedSearchQuery.trim();
        }

        // Call getBudgets with the params
        await getBudgets(params);
      } catch (error: any) {
        // Don't log abort errors
        if (error.name !== "AbortError") {
          console.error("Failed to fetch budgets:", error);
        }
      } finally {
        // Clear request tracking
        if (currentRequestRef.current === requestId) {
          currentRequestRef.current = "";
          abortControllerRef.current = null;
        }
      }
    };

    fetchBudgets();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [activeTab, debouncedSearchQuery, getBudgets]);

  // Handle load more budgets
  const handleLoadMore = () => {
    if (isLoadingMore || pagination.page >= pagination.totalPages) return;

    const params: any = {};
    if (activeTab !== "all") {
      params.status = [activeTab];
    }
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery.trim();
    }

    loadMoreBudgets(params);
  };

  const handleRefresh = async () => {
    const params: any = {};
    if (activeTab !== "all") {
      params.status = [activeTab];
    }
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery.trim();
    }

    await getBudgets(params);
  };

  const renderBudgetCard = ({ item: budget }: { item: Budget }) => {
    const stats = budgetStats[budget.id];
    const spentAmount = stats?.totalSpent || 0;
    const totalAllocated = stats?.totalAllocated || 0;
    const totalRemaining = stats?.totalRemaining || 0;
    const overallPercentageUsed = stats?.overallPercentageUsed || 0;
    const categoryStats = stats?.categoryStats || [];

    return (
      <BudgetCard
        budget={budget}
        onPress={() =>
          router.push(`/screens/Budgets/BudgetDetails?budgetId=${budget.id}`)
        }
        isDark={isDark}
        spentAmount={spentAmount}
        totalAllocated={totalAllocated}
        totalRemaining={totalRemaining}
        overallPercentageUsed={overallPercentageUsed}
        categoryStats={categoryStats}
        formattedEndDate={budget.formattedEndDate}
        formattedStartDate={budget.formattedStartDate}
      />
    );
  };

  if (isLoading) {
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
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={isDark ? colors.text.white : colors.text.primary}
          />
        }
        renderItem={renderBudgetCard}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoadingMore ? (
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
                      {overallStats?.currency}
                      {overallStats.totalAllocated}
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
                      {overallStats?.currency}
                      {overallStats.totalSpent}
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
                      {overallStats?.currency}
                      {overallStats.totalRemaining}
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
                  { id: "suspended", label: "Suspended" },
                  { id: "paused", label: "Paused" },
                  { id: "archived", label: "Archived" },
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
                {pagination.total > budgets.length
                  ? ` of ${pagination.total}`
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
