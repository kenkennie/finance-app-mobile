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
import { useTransactionStore } from "@/store/transactionStore";
import { Typography } from "@/shared/components/ui/Typography";
import { TransactionCard } from "../screens/Transactions/TransactionCard";
import { TabBar } from "@/shared/components/ui/TabBar";
import { Card } from "@/shared/components/ui/Card";
import SimpleFilterBottomSheet from "@/shared/components/ui/filters/simpleFilterBottomSheet";
import { ConfirmationModal } from "@/shared/components/ui/ConfirmationModal";
import { Transaction } from "@/shared/types/filter.types";
import { colors } from "@/theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderItem {
  type: "header";
  dateString: string;
  displayDate: string;
}

interface TransactionItem {
  type: "transaction";
  transaction: Transaction;
}

type FlatDataItem = HeaderItem | TransactionItem;

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

const AllTransactions = () => {
  const router = useRouter();
  const {
    transactions,
    isLoading,
    isLoadingMore,
    error,
    getTransactions,
    loadMoreTransactions,
    deleteTransaction,
    summary,
    pagination,
  } = useTransactionStore();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  // Calculate tab bar height to ensure content isn't hidden
  const tabBarHeight = (Platform.OS === "ios" ? 100 : 82) + insets.bottom;
  const contentPaddingBottom = tabBarHeight + 20; // Extra 20px for better spacing
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  // Refs for request deduplication
  const currentRequestRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 800);

  // Fetch transactions when filters change
  useEffect(() => {
    // Create request identifier for deduplication
    const requestId = `${activeTab}-${debouncedSearchQuery}-${JSON.stringify(
      appliedFilters
    )}`;

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

    const fetchTransactions = async () => {
      try {
        const params: any = {};

        // Add type filter
        if (activeTab === "income") {
          params.type = "INCOME";
        } else if (activeTab === "expenses") {
          params.type = "EXPENSE";
        }

        // Add search filter
        if (debouncedSearchQuery.trim()) {
          params.search = debouncedSearchQuery.trim();
        }

        // Add applied filters
        if (appliedFilters.datePreset) {
          if (appliedFilters.datePreset === "custom") {
            if (appliedFilters.startDate) {
              params.startDate = appliedFilters.startDate;
            }
            if (appliedFilters.endDate) {
              params.endDate = appliedFilters.endDate;
            }
          } else {
            // Handle preset date ranges
            const now = new Date();
            const today = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );

            if (appliedFilters.datePreset === "today") {
              params.startDate = today;
              params.endDate = new Date(
                today.getTime() + 24 * 60 * 60 * 1000 - 1
              );
            } else if (appliedFilters.datePreset === "yesterday") {
              const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
              params.startDate = yesterday;
              params.endDate = new Date(
                yesterday.getTime() + 24 * 60 * 60 * 1000 - 1
              );
            } else if (appliedFilters.datePreset === "thisWeek") {
              // Start of week (Sunday)
              const startOfWeek = new Date(today);
              startOfWeek.setDate(today.getDate() - today.getDay());
              // End of week (Saturday)
              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);
              endOfWeek.setHours(23, 59, 59, 999);
              params.startDate = startOfWeek;
              params.endDate = endOfWeek;
            } else if (appliedFilters.datePreset === "lastWeek") {
              // Start of last week (Sunday of previous week)
              const startOfLastWeek = new Date(today);
              startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
              // End of last week (Saturday of previous week)
              const endOfLastWeek = new Date(startOfLastWeek);
              endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
              endOfLastWeek.setHours(23, 59, 59, 999);
              params.startDate = startOfLastWeek;
              params.endDate = endOfLastWeek;
            } else if (appliedFilters.datePreset === "thisMonth") {
              const firstDayOfMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
              );
              const lastDayOfMonth = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59,
                999
              );
              params.startDate = firstDayOfMonth;
              params.endDate = lastDayOfMonth;
            } else if (appliedFilters.datePreset === "lastMonth") {
              const firstDayOfLastMonth = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
              );
              const lastDayOfLastMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                0,
                23,
                59,
                59,
                999
              );
              params.startDate = firstDayOfLastMonth;
              params.endDate = lastDayOfLastMonth;
            }
          }
        }

        if (appliedFilters.statuses && appliedFilters.statuses.length > 0) {
          params.statuses = appliedFilters.statuses;
        }

        if (appliedFilters.categories && appliedFilters.categories.length > 0) {
          params.categories = appliedFilters.categories.join(",");
        }

        if (appliedFilters.accounts && appliedFilters.accounts.length > 0) {
          params.accounts = appliedFilters.accounts.join(",");
        }

        // Call getTransactions with the params
        await getTransactions(params);
      } catch (error: any) {
        // Don't log abort errors
        if (error.name !== "AbortError") {
          console.error("Failed to fetch transactions:", error);
        }
      } finally {
        // Clear request tracking
        if (currentRequestRef.current === requestId) {
          currentRequestRef.current = "";
          abortControllerRef.current = null;
        }
      }
    };

    fetchTransactions();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [activeTab, debouncedSearchQuery, appliedFilters, getTransactions]);

  // Since we're now doing server-side filtering, use transactions directly
  const filteredTransactions = transactions;

  // Use summary from store, fallback to local calculation if not available
  const displaySummary = summary || {
    totalIncome: 0,
    totalExpenses: 0,
    netAmount: 0,
    formattedTotalIncome: "$0.00",
    formattedTotalExpenses: "$0.00",
    formattedNetAmount: "$0.00",
  };

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce(
    (groups, transaction) => {
      const date = new Date(transaction.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {} as Record<string, typeof filteredTransactions>
  );

  // Sort dates in descending order (most recent first)
  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Handle delete transaction
  const handleDeletePress = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      try {
        await deleteTransaction(transactionToDelete.id);
        setDeleteModalVisible(false);
        setTransactionToDelete(null);
      } catch (error) {
        // Error is handled by the store
        console.error("Failed to delete transaction:", error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setTransactionToDelete(null);
  };

  // Handle load more transactions
  const handleLoadMore = () => {
    if (isLoadingMore || pagination.page >= pagination.totalPages) return;

    const params: any = { page: pagination.page + 1, limit: pagination.limit };
    if (activeTab === "income") {
      params.type = "INCOME";
    } else if (activeTab === "expenses") {
      params.type = "EXPENSE";
    }
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery.trim();
    }

    // Add applied filters
    if (appliedFilters.datePreset) {
      if (appliedFilters.datePreset === "custom") {
        if (appliedFilters.startDate) {
          params.startDate = appliedFilters.startDate;
        }
        if (appliedFilters.endDate) {
          params.endDate = appliedFilters.endDate;
        }
      } else {
        // Handle preset date ranges
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        if (appliedFilters.datePreset === "today") {
          params.startDate = today;
          params.endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
        } else if (appliedFilters.datePreset === "yesterday") {
          const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
          params.startDate = yesterday;
          params.endDate = new Date(
            yesterday.getTime() + 24 * 60 * 60 * 1000 - 1
          );
        } else if (appliedFilters.datePreset === "thisWeek") {
          // Start of week (Sunday)
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          // End of week (Saturday)
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          params.startDate = startOfWeek;
          params.endDate = endOfWeek;
        } else if (appliedFilters.datePreset === "lastWeek") {
          // Start of last week (Sunday of previous week)
          const startOfLastWeek = new Date(today);
          startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
          // End of last week (Saturday of previous week)
          const endOfLastWeek = new Date(startOfLastWeek);
          endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
          endOfLastWeek.setHours(23, 59, 59, 999);
          params.startDate = startOfLastWeek;
          params.endDate = endOfLastWeek;
        } else if (appliedFilters.datePreset === "thisMonth") {
          const firstDayOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
          );
          const lastDayOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );
          params.startDate = firstDayOfMonth;
          params.endDate = lastDayOfMonth;
        } else if (appliedFilters.datePreset === "lastMonth") {
          const firstDayOfLastMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
          );
          const lastDayOfLastMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            0,
            23,
            59,
            59,
            999
          );
          params.startDate = firstDayOfLastMonth;
          params.endDate = lastDayOfLastMonth;
        }
      }
    }

    if (appliedFilters.statuses && appliedFilters.statuses.length > 0) {
      params.statuses = appliedFilters.statuses;
    }

    if (appliedFilters.categories && appliedFilters.categories.length > 0) {
      params.categories = appliedFilters.categories.join(",");
    }

    if (appliedFilters.accounts && appliedFilters.accounts.length > 0) {
      params.accounts = appliedFilters.accounts.join(",");
    }

    loadMoreTransactions(params);
  };

  // Create flat data for FlatList
  const flatData = sortedDates.flatMap((dateString) => {
    const transactionsForDate = groupedTransactions[dateString];
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let displayDate: string;
    if (date.toDateString() === today.toDateString()) {
      displayDate = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      displayDate = "Yesterday";
    } else {
      displayDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return [
      { type: "header", dateString, displayDate },
      ...transactionsForDate.map((transaction) => ({
        type: "transaction",
        transaction,
      })),
    ];
  });

  const handleRefresh = async () => {
    await getTransactions();
  };
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="All Transactions"
        onBackPress={() => router.back()}
        isDark={isDark}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          placeholder="Search transactions"
          value={searchQuery}
          onChangeText={setSearchQuery}
          isDark={isDark}
          showFilterButton
          onFilterPress={() => setIsFilterVisible(true)}
        />
      </View>

      <FlatList
        data={
          (isLoading || error || filteredTransactions.length === 0
            ? []
            : flatData) as FlatDataItem[]
        }
        keyExtractor={(item: FlatDataItem) =>
          item.type === "header"
            ? `header-${item.dateString}`
            : `transaction-${item.transaction.id}`
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={isDark ? colors.text.white : colors.text.primary}
          />
        }
        renderItem={({ item }) => {
          if (item.type === "header") {
            const headerItem = item as HeaderItem;
            return (
              <View
                style={[styles.dateHeader, isDark ? styles.dateHeaderDark : {}]}
              >
                <Typography
                  variant="body2"
                  weight="semibold"
                  style={[
                    styles.dateHeaderText,
                    isDark ? styles.dateHeaderTextDark : {},
                  ]}
                >
                  {headerItem.displayDate}
                </Typography>
              </View>
            );
          } else {
            const transactionItem = item as TransactionItem;
            return (
              <TransactionCard
                transaction={transactionItem.transaction}
                isDark={isDark}
                onPress={() =>
                  router.push(
                    `/screens/Transactions/TransactionDetails?transactionId=${transactionItem.transaction.id}`
                  )
                }
                onLongPress={() =>
                  handleDeletePress(transactionItem.transaction)
                }
              />
            );
          }
        }}
        ListHeaderComponent={() => (
          <>
            {/* Summary Card */}
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
                  Transaction Summary
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
                    Income
                  </Typography>
                  <Typography
                    variant="h2"
                    style={[styles.summaryValue, styles.incomeValue]}
                  >
                    {(displaySummary as any).formattedTotalIncome ||
                      `$${displaySummary.totalIncome}`}
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
                    Expenses
                  </Typography>
                  <Typography
                    variant="h2"
                    style={[styles.summaryValue, styles.expenseValue]}
                  >
                    {(displaySummary as any).formattedTotalExpenses ||
                      `$${displaySummary.totalExpenses}`}
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
                    Net
                  </Typography>
                  <Typography
                    variant="h2"
                    style={[
                      styles.summaryValue,
                      displaySummary.netAmount >= 0
                        ? styles.netPositive
                        : styles.netNegative,
                    ]}
                  >
                    {(displaySummary as any).formattedNetAmount ||
                      `${displaySummary.netAmount >= 0 ? "+" : ""}$${
                        displaySummary.netAmount
                      }`}
                  </Typography>
                </View>
              </View>
            </Card>

            {/* Filters Section */}

            <Card
              isDark={isDark}
              style={styles.filtersCard}
            >
              <TabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isDark={isDark}
              />
            </Card>
          </>
        )}
        ListEmptyComponent={() => {
          if (isLoading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={isDark ? "#FFF" : "#000"}
                />
                <Typography
                  style={[
                    styles.loadingText,
                    isDark ? styles.loadingTextDark : {},
                  ]}
                >
                  Loading transactions...
                </Typography>
              </View>
            );
          } else if (error) {
            return (
              <View style={styles.errorContainer}>
                <Typography
                  style={[styles.errorText, isDark ? styles.errorTextDark : {}]}
                >
                  {error}
                </Typography>
              </View>
            );
          } else {
            return (
              <View style={styles.emptyContainer}>
                <Typography
                  style={[styles.emptyText, isDark ? styles.emptyTextDark : {}]}
                >
                  {debouncedSearchQuery
                    ? "No transactions found matching your search."
                    : "No transactions found. Create your first transaction!"}
                </Typography>
              </View>
            );
          }
        }}
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={isDark ? "#FFF" : "#000"}
              />
              <Typography
                style={[
                  styles.loadingText,
                  isDark ? styles.loadingTextDark : {},
                ]}
              >
                Loading more transactions...
              </Typography>
            </View>
          ) : null
        }
      />

      <FAB
        icon="plus"
        onPress={() => router.push("/screens/Transactions/addTransaction")}
      />

      <SimpleFilterBottomSheet
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={setAppliedFilters}
        initialFilters={appliedFilters}
      />

      <ConfirmationModal
        visible={deleteModalVisible}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${transactionToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDark={isDark}
        destructive
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
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  loadingTextDark: {
    color: "#9CA3AF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  emptyTextDark: {
    color: "#9CA3AF",
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
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
  filtersCard: {
    marginBottom: 16,
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
  incomeValue: {
    color: "#10B981",
  },
  expenseValue: {
    color: "#EF4444",
  },
  netPositive: {
    color: "#10B981",
  },
  netNegative: {
    color: "#EF4444",
  },
  dateHeader: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateHeaderDark: {
    // borderBottomColor: "#374151",
  },
  dateHeaderText: {
    fontSize: 12,
    color: "#374151",
    textTransform: "none",
    letterSpacing: 0.5,
  },
  dateHeaderTextDark: {
    // color: "#D1D5DB",
    // backgroundColor: "#1F2937",
  },
});

export default AllTransactions;
