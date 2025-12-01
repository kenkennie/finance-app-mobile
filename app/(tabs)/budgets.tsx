import {
  View,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/shared/components/ui/Header";
import { FAB } from "@/shared/components/ui/FAB";
import { useRouter } from "expo-router";
import { SearchBar } from "@/shared/components/ui/SearchBar";
import { Typography } from "@/shared/components/ui/Typography";
import { Card } from "@/shared/components/ui/Card";
import { TabBar } from "@/shared/components/ui/TabBar";
import { budgetService } from "@/shared/services/budget/budgetService";
import { Budget, OverallBudgetStats } from "@/shared/types/budget.types";
import { colors } from "@/theme/colors";

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

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [overallStats, setOverallStats] = useState<OverallBudgetStats | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Refs for request deduplication
  const currentRequestRef = useRef<string>("");

  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchBudgets = async () => {
    try {
      setError(null);
      const [budgetsResponse, statsResponse] = await Promise.all([
        budgetService.getBudgets(),
        budgetService.getOverallBudgetStats(),
      ]);

      setBudgets(budgetsResponse.data);
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
    fetchBudgets();
  }, []);

  // Filter budgets based on search and tab
  const filteredBudgets = budgets.filter((budget) => {
    // Filter by tab
    if (activeTab === "active" && !budget.isActive) return false;
    if (activeTab === "inactive" && budget.isActive) return false;

    // Filter by search
    if (debouncedSearchQuery.trim()) {
      return budget.name
        .toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase());
    }

    return true;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBudgets();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const renderBudgetCard = ({ item: budget }: { item: Budget }) => {
    const totalAllocated =
      budget.budgetCategories?.reduce(
        (sum, cat) => sum + cat.allocatedAmount,
        0
      ) || 0;

    const totalSpent =
      budget.budgetCategories?.reduce((sum, cat) => sum + cat.spentAmount, 0) ||
      0;

    const utilizationPercentage =
      totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    return (
      <Card
        isDark={isDark}
        style={styles.budgetCard}
        onPress={() =>
          router.push(`/screens/Budgets/BudgetDetails?budgetId=${budget.id}`)
        }
      >
        <View style={styles.budgetHeader}>
          <Typography
            variant="h3"
            weight="semibold"
            style={
              isDark
                ? [styles.budgetName, styles.budgetNameDark]
                : styles.budgetName
            }
          >
            {budget.name}
          </Typography>
          <View
            style={[
              styles.statusBadge,
              budget.isActive ? styles.activeBadge : styles.inactiveBadge,
            ]}
          >
            <Typography
              variant="caption"
              style={styles.statusText}
            >
              {budget.isActive ? "Active" : "Inactive"}
            </Typography>
          </View>
        </View>

        <View style={styles.budgetStats}>
          <View style={styles.statItem}>
            <Typography
              variant="caption"
              style={
                isDark
                  ? [styles.statLabel, styles.statLabelDark]
                  : styles.statLabel
              }
            >
              Allocated
            </Typography>
            <Typography
              variant="body2"
              weight="semibold"
              style={
                isDark
                  ? [styles.statValue, styles.statValueDark]
                  : styles.statValue
              }
            >
              {formatCurrency(totalAllocated)}
            </Typography>
          </View>

          <View style={styles.statItem}>
            <Typography
              variant="caption"
              style={
                isDark
                  ? [styles.statLabel, styles.statLabelDark]
                  : styles.statLabel
              }
            >
              Spent
            </Typography>
            <Typography
              variant="body2"
              weight="semibold"
              style={
                isDark
                  ? [styles.statValue, styles.statValueDark]
                  : styles.statValue
              }
            >
              {formatCurrency(totalSpent)}
            </Typography>
          </View>

          <View style={styles.statItem}>
            <Typography
              variant="caption"
              style={
                isDark
                  ? [styles.statLabel, styles.statLabelDark]
                  : styles.statLabel
              }
            >
              Remaining
            </Typography>
            <Typography
              variant="body2"
              weight="semibold"
              style={[
                ...(isDark
                  ? [styles.statValue, styles.statValueDark]
                  : [styles.statValue]),
                {
                  color:
                    totalAllocated - totalSpent >= 0
                      ? colors.success
                      : colors.error,
                },
              ]}
            >
              {formatCurrency(totalAllocated - totalSpent)}
            </Typography>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(utilizationPercentage, 100)}%`,
                  backgroundColor:
                    utilizationPercentage > 100
                      ? colors.error
                      : utilizationPercentage > 80
                      ? colors.warning
                      : colors.primary,
                },
              ]}
            />
          </View>
          <Typography
            variant="caption"
            style={
              isDark
                ? [styles.progressText, styles.progressTextDark]
                : styles.progressText
            }
          >
            {utilizationPercentage.toFixed(1)}% used
          </Typography>
        </View>
      </Card>
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
        data={filteredBudgets}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? colors.text.white : colors.text.primary}
          />
        }
        renderItem={renderBudgetCard}
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
                Your Budgets ({filteredBudgets.length})
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
          budgets.length === 0 ? styles.fullHeight : undefined
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
    paddingBottom: 100,
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
  budgetCard: {
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetName: {
    color: colors.text.primary,
    flex: 1,
  },
  budgetNameDark: {
    color: colors.text.white,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: colors.success,
  },
  inactiveBadge: {
    backgroundColor: colors.text.secondary,
  },
  statusText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: "500",
  },
  budgetStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    color: colors.text.secondary,
    marginBottom: 4,
  },
  statLabelDark: {
    color: colors.text.white,
  },
  statValue: {
    color: colors.text.primary,
  },
  statValueDark: {
    color: colors.text.white,
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "right",
  },
  progressTextDark: {
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
});

export default Budgets;
