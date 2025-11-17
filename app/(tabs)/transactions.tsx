import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { FilterState, Transaction } from "@/shared/types/filter.types";
import { Typography } from "@/shared/components/ui/Typography";
import { colors } from "@/theme/colors";
import { Badge } from "@/shared/components/ui/Badge";
import { borderRadius, shadows, spacing, typography } from "@/theme/spacing";
import { IconButton } from "@/shared/components/ui/IconButton";
import { useFilterState } from "@/shared/hooks/useFilterState";
import { filterTransactions } from "@/shared/utils/filterTransactions";
import { AdvancedFilterBottomSheet } from "@/shared/components/ui/filters/advancedFilterBottomSheet";
import { ExportModal } from "@/shared/components/ui/filters/ExportModal";

// Mock data - replace with actual data from API/database
const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "expense",
    amount: -245.5,
    description: "Whole Foods Market",
    category: "Groceries",
    categoryIcon: "🛒",
    categoryId: "cat_1",
    account: "Chase Sapphire",
    accountId: "acc_1",
    date: "2025-11-05",
    status: "cleared",
    tags: ["food", "essentials"],
  },
  {
    id: "2",
    type: "expense",
    amount: -15.99,
    description: "Netflix Premium",
    category: "Entertainment",
    categoryIcon: "🎬",
    categoryId: "cat_5",
    account: "Chase Checking",
    accountId: "acc_2",
    date: "2025-11-05",
    status: "pending",
    isRecurring: true,
  },
  {
    id: "3",
    type: "income",
    amount: 3500.0,
    description: "Salary - Acme Corp",
    category: "Salary",
    categoryIcon: "💰",
    categoryId: "cat_8",
    account: "Chase Checking",
    accountId: "acc_2",
    date: "2025-11-04",
    status: "cleared",
  },
  // Add more mock data as needed
];

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);

  const {
    filters,
    tempFilters,
    activeFilterCount,
    applyFilters,
    clearAllFilters,
    updateTempFilters,
    resetTempFilters,
    setFilters,
  } = useFilterState();

  // Debounced search
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        setFilters((prev) => ({ ...prev, searchQuery: text }));
      }, 300);
    },
    [setFilters]
  );

  // Filter transactions with memoization
  const filteredTransactions = useMemo(() => {
    return filterTransactions(mockTransactions, filters);
  }, [filters]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};

    filteredTransactions.forEach((transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });

    return Object.entries(groups).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  }, [filteredTransactions]);

  // Calculate summary with memoization
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = Math.abs(
      filteredTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)
    );

    return {
      income,
      expenses,
      net: income - expenses,
    };
  }, [filteredTransactions]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, []);

  const handleQuickFilter = useCallback(
    (filter: string) => {
      let updates: Partial<FilterState> = { quickFilter: filter as any };

      if (filter === "today") {
        const today = new Date();
        updates.dateRange = {
          preset: "today",
          startDate: today,
          endDate: today,
        };
      } else if (filter === "thisWeek") {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        updates.dateRange = {
          preset: "thisWeek",
          startDate: startOfWeek,
          endDate: today,
        };
      } else if (filter === "thisMonth") {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        updates.dateRange = {
          preset: "thisMonth",
          startDate: startOfMonth,
          endDate: today,
        };
      }

      setFilters((prev) => ({ ...prev, ...updates }));
    },
    [setFilters]
  );

  const handleApplyFilters = useCallback(() => {
    applyFilters();
    setShowFilterSheet(false);
  }, [applyFilters]);

  const handleRemoveFilter = useCallback(
    (filterType: string) => {
      const updates: Partial<FilterState> = {};

      if (filterType === "dateRange") {
        updates.dateRange = { preset: null, startDate: null, endDate: null };
      } else if (filterType === "amountRange") {
        updates.amountRange = { min: null, max: null };
      } else if (filterType === "categories") {
        updates.categories = { selected: [], selectAll: false };
      }

      setFilters((prev) => ({ ...prev, ...updates }));
    },
    [setFilters]
  );

  const getDateRangeLabel = useCallback(() => {
    if (filters.dateRange.preset) {
      return filters.dateRange.preset.replace(/([A-Z])/g, " $1").trim();
    }
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      const start = filters.dateRange.startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const end = filters.dateRange.endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `${start} - ${end}`;
    }
    return null;
  }, [filters.dateRange]);

  const renderTransaction = useCallback(
    ({ item }: { item: Transaction }) => (
      <TouchableOpacity
        style={styles.transactionCard}
        activeOpacity={0.7}
      >
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.transactionIcon,
              {
                backgroundColor:
                  item.type === "income" ? colors.incomeBg : colors.expenseBg,
              },
            ]}
          >
            <Typography variant="h4">{item.categoryIcon}</Typography>
          </View>

          <View style={styles.transactionInfo}>
            <View style={styles.transactionTitleRow}>
              <Typography
                variant="body1"
                weight="semibold"
                numberOfLines={1}
                style={styles.transactionDescription}
              >
                {item.description}
              </Typography>
              {item.isRecurring && (
                <Typography
                  variant="caption"
                  color={colors.primary}
                >
                  🔁
                </Typography>
              )}
            </View>

            <View style={styles.transactionMeta}>
              <Typography
                variant="caption"
                color={colors.gray[500]}
              >
                {item.category}
              </Typography>
              <Typography
                variant="caption"
                color={colors.gray[400]}
              >
                •
              </Typography>
              <Typography
                variant="caption"
                color={colors.gray[500]}
              >
                {item.account}
              </Typography>
            </View>

            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 2).map((tag) => (
                  <View
                    key={tag}
                    style={styles.tag}
                  >
                    <Typography
                      variant="caption"
                      color={colors.gray[600]}
                    >
                      #{tag}
                    </Typography>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.transactionRight}>
          <Typography
            variant="body1"
            weight="bold"
            color={item.type === "income" ? colors.income : colors.expense}
            style={styles.transactionAmount}
          >
            {item.type === "income" ? "+" : "-"}
            {formatCurrency(item.amount)}
          </Typography>
          {item.status === "pending" && (
            <Badge
              variant="warning"
              size="small"
            >
              Pending
            </Badge>
          )}
          {item.status === "cleared" && (
            <Badge
              variant="success"
              size="small"
            >
              Cleared
            </Badge>
          )}
        </View>
      </TouchableOpacity>
    ),
    [formatCurrency]
  );

  const renderDateGroup = useCallback(
    ({ item }: { item: [string, Transaction[]] }) => {
      const [date, transactions] = item;

      return (
        <View style={styles.dateGroup}>
          <Typography
            variant="overline"
            color={colors.gray[500]}
            style={styles.dateHeader}
          >
            {formatDate(date)}
          </Typography>
          {transactions.map((transaction) => (
            <View key={transaction.id}>
              {renderTransaction({ item: transaction })}
            </View>
          ))}
        </View>
      );
    },
    [formatDate, renderTransaction]
  );

  const renderHeader = useCallback(
    () => (
      <>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Typography
                variant="caption"
                color={colors.gray[500]}
              >
                Income
              </Typography>
              <Typography
                variant="body1"
                weight="bold"
                color={colors.income}
              >
                +{formatCurrency(summary.income)}
              </Typography>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Typography
                variant="caption"
                color={colors.gray[500]}
              >
                Expenses
              </Typography>
              <Typography
                variant="body1"
                weight="bold"
                color={colors.expense}
              >
                -{formatCurrency(summary.expenses)}
              </Typography>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Typography
                variant="caption"
                color={colors.gray[500]}
              >
                Net
              </Typography>
              <Typography
                variant="body1"
                weight="bold"
                color={summary.net >= 0 ? colors.income : colors.expense}
              >
                {summary.net >= 0 ? "+" : ""}
                {formatCurrency(summary.net)}
              </Typography>
            </View>
          </View>
        </View>

        {/* Filter and Export Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              activeFilterCount > 0 && styles.actionButtonActive,
            ]}
            onPress={() => {
              resetTempFilters();
              setShowFilterSheet(true);
            }}
          >
            <Typography
              variant="body2"
              color={colors.gray[500]}
            >
              🎚️
            </Typography>
            <Typography
              variant="body2"
              weight="semibold"
              color={activeFilterCount > 0 ? colors.primary : colors.gray[700]}
            >
              Advanced Filters
            </Typography>
            {activeFilterCount > 0 && (
              <View style={styles.badge}>
                <Typography
                  variant="caption"
                  color={colors.text.white}
                  weight="bold"
                >
                  {activeFilterCount}
                </Typography>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              filteredTransactions.length === 0 && styles.actionButtonDisabled,
            ]}
            onPress={() => setShowExportModal(true)}
            disabled={filteredTransactions.length === 0}
          >
            <Typography
              variant="body2"
              color={colors.gray[500]}
            >
              📤
            </Typography>
            <Typography
              variant="body2"
              weight="semibold"
              color={colors.gray[700]}
            >
              Export
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <View style={styles.filterChipsContainer}>
            <Typography
              variant="caption"
              color={colors.gray[500]}
              style={styles.filterChipsLabel}
            >
              Active Filters:
            </Typography>
            <View style={styles.filterChips}>
              {getDateRangeLabel() && (
                <TouchableOpacity
                  style={styles.filterChip}
                  onPress={() => handleRemoveFilter("dateRange")}
                >
                  <Typography
                    variant="caption"
                    color={colors.primary}
                    weight="medium"
                  >
                    📅 {getDateRangeLabel()}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={colors.primary}
                  >
                    {" "}
                    ✕
                  </Typography>
                </TouchableOpacity>
              )}

              {(filters.amountRange.min !== null ||
                filters.amountRange.max !== null) && (
                <TouchableOpacity
                  style={styles.filterChip}
                  onPress={() => handleRemoveFilter("amountRange")}
                >
                  <Typography
                    variant="caption"
                    color={colors.primary}
                    weight="medium"
                  >
                    💵 ${filters.amountRange.min || 0} - $
                    {filters.amountRange.max || "∞"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={colors.primary}
                  >
                    {" "}
                    ✕
                  </Typography>
                </TouchableOpacity>
              )}

              {filters.categories.selected.length > 0 && (
                <TouchableOpacity
                  style={styles.filterChip}
                  onPress={() => handleRemoveFilter("categories")}
                >
                  <Typography
                    variant="caption"
                    color={colors.primary}
                    weight="medium"
                  >
                    🛒 {filters.categories.selected.length} Categories
                  </Typography>
                  <Typography
                    variant="caption"
                    color={colors.primary}
                  >
                    {" "}
                    ✕
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </>
    ),
    [
      summary,
      activeFilterCount,
      filteredTransactions.length,
      filters,
      formatCurrency,
      getDateRangeLabel,
      handleRemoveFilter,
      resetTempFilters,
    ]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Typography variant="h1">📭</Typography>
        <Typography
          variant="h4"
          weight="semibold"
          style={styles.emptyTitle}
        >
          No transactions found
        </Typography>
        <Typography
          variant="body2"
          color={colors.gray[500]}
          align="center"
        >
          {activeFilterCount > 0
            ? "Try adjusting your filters"
            : "Add your first transaction to get started"}
        </Typography>
        {activeFilterCount > 0 && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearAllFilters}
          >
            <Typography
              variant="body2"
              weight="semibold"
              color={colors.primary}
            >
              Clear All Filters
            </Typography>
          </TouchableOpacity>
        )}
      </View>
    ),
    [activeFilterCount, clearAllFilters]
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.text.white}
        />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <IconButton onPress={() => {}}>
                <Typography variant="h3">☰</Typography>
              </IconButton>
              <Typography
                variant="h2"
                weight="bold"
              >
                Transactions
              </Typography>
            </View>
            <View style={styles.headerRight}>
              <IconButton
                onPress={() => {}}
                variant="ghost"
              >
                <Typography variant="h4">🔔</Typography>
              </IconButton>
              <IconButton
                onPress={() => {}}
                variant="ghost"
              >
                <Typography variant="h4">⋯</Typography>
              </IconButton>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchIconContainer}>
              <Typography
                variant="body1"
                color={colors.gray[400]}
              >
                🔍
              </Typography>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor={colors.gray[400]}
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => handleSearchChange("")}
                style={styles.clearButton}
              >
                <Typography
                  variant="body2"
                  color={colors.gray[400]}
                >
                  ✕
                </Typography>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Filter Chips */}
          <View style={styles.quickFilters}>
            <TouchableOpacity
              style={[
                styles.quickFilterChip,
                !filters.quickFilter && styles.quickFilterChipActive,
              ]}
              onPress={() => {
                setFilters((prev) => ({
                  ...prev,
                  quickFilter: null,
                  dateRange: { preset: null, startDate: null, endDate: null },
                }));
              }}
            >
              <Typography
                variant="body2"
                weight="medium"
                color={
                  !filters.quickFilter ? colors.text.white : colors.gray[700]
                }
              >
                All
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickFilterChip,
                filters.quickFilter === "today" && styles.quickFilterChipActive,
              ]}
              onPress={() => handleQuickFilter("today")}
            >
              <Typography
                variant="body2"
                weight="medium"
                color={
                  filters.quickFilter === "today"
                    ? colors.text.white
                    : colors.gray[700]
                }
              >
                Today
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickFilterChip,
                filters.quickFilter === "thisWeek" &&
                  styles.quickFilterChipActive,
              ]}
              onPress={() => handleQuickFilter("thisWeek")}
            >
              <Typography
                variant="body2"
                weight="medium"
                color={
                  filters.quickFilter === "thisWeek"
                    ? colors.text.white
                    : colors.gray[700]
                }
              >
                This Week
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickFilterChip,
                filters.quickFilter === "thisMonth" &&
                  styles.quickFilterChipActive,
              ]}
              onPress={() => handleQuickFilter("thisMonth")}
            >
              <Typography
                variant="body2"
                weight="medium"
                color={
                  filters.quickFilter === "thisMonth"
                    ? colors.text.white
                    : colors.gray[700]
                }
              >
                This Month
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction List */}
        <FlatList
          data={groupedTransactions}
          renderItem={renderDateGroup}
          keyExtractor={(item) => item[0]}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
        />

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.9}
        >
          <Typography
            variant="h2"
            color={colors.text.white}
          >
            +
          </Typography>
        </TouchableOpacity>

        {/* Advanced Filter Bottom Sheet */}
        <AdvancedFilterBottomSheet
          isVisible={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          filters={tempFilters}
          onUpdate={updateTempFilters}
          onApply={handleApplyFilters}
          onClear={clearAllFilters}
          transactionCount={
            filterTransactions(mockTransactions, tempFilters).length
          }
        />

        {/* Export Modal */}
        {/* <ExportModal
          visible={showExportModal}
          onClose={() => setShowExportModal(false)}
          transactions={filteredTransactions}
          dateRange={getDateRangeLabel() || "All Time"}
        /> */}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.text.white,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.base,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  searchIconContainer: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.primary,
    padding: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
  quickFilters: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickFilterChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
  },
  quickFilterChipActive: {
    backgroundColor: colors.primary,
  },
  listContent: {
    padding: spacing.base,
  },
  summaryCard: {
    backgroundColor: colors.text.white,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.md,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  actionBar: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.text.white,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  actionButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  badge: {
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  filterChipsContainer: {
    marginBottom: spacing.base,
  },
  filterChipsLabel: {
    marginBottom: spacing.sm,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateHeader: {
    marginBottom: spacing.sm,
  },
  transactionCard: {
    flexDirection: "row",
    backgroundColor: colors.text.white,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionLeft: {
    flexDirection: "row",
    flex: 1,
    marginRight: spacing.md,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
    justifyContent: "center",
  },
  transactionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  transactionDescription: {
    flex: 1,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  transactionRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  transactionAmount: {
    marginBottom: spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  emptyTitle: {
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  clearFiltersButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
  },
  fab: {
    position: "absolute",
    right: spacing.base,
    bottom: spacing.base,
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
});
