import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";

import { Badge } from "@/shared/components/ui/Badge";
import { IconButton } from "@/shared/components/ui/IconButton";
import { Typography } from "@/shared/components/ui/Typography";
import { colors } from "@/theme/colors";
import { borderRadius, shadows, spacing, typography } from "@/theme/spacing";
import { useRouter } from "expo-router";

interface TransactionInterface {
  id: string;
  type: "expense" | "income";
  amount: number;
  description: string;
  category: string;
  categoryIcon: string;
  account: string;
  date: string;
  status: "pending" | "cleared" | "reconciled";
  tags?: string[];
  isRecurring?: boolean;
}

const mockTransactions: TransactionInterface[] = [
  {
    id: "1",
    type: "expense",
    amount: -245.5,
    description: "Whole Foods Market",
    category: "Groceries",
    categoryIcon: "🛒",
    account: "Chase Sapphire",
    date: "2025-10-31",
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
    account: "Chase Checking",
    date: "2025-10-31",
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
    account: "Chase Checking",
    date: "2025-10-30",
    status: "cleared",
  },
  {
    id: "4",
    type: "expense",
    amount: -89.99,
    description: "Comcast Internet",
    category: "Bills & Utilities",
    categoryIcon: "💡",
    account: "Chase Checking",
    date: "2025-10-30",
    status: "cleared",
    isRecurring: true,
  },
  {
    id: "5",
    type: "expense",
    amount: -45.0,
    description: "Shell Gas Station",
    category: "Transportation",
    categoryIcon: "🚗",
    account: "Chase Sapphire",
    date: "2025-10-29",
    status: "reconciled",
  },
  {
    id: "6",
    type: "expense",
    amount: -45.0,
    description: "Shell Gas Station",
    category: "Transportation",
    categoryIcon: "🚗",
    account: "Chase Sapphire",
    date: "2025-11-10",
    status: "reconciled",
  },
];

export default function Transactions() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">(
    "all"
  );
  const filteredTransactions = mockTransactions.filter((t) => {
    const matchesSearch = t.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const groupedTransactions = filteredTransactions.reduce(
    (groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(transaction);
      return groups;
    },
    {} as Record<string, TransactionInterface[]>
  );

  const formatDate = (dateString: string) => {
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
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "cleared":
        return (
          <Badge
            count={0}
            variant="success"
            size="small"
          >
            Cleared
          </Badge>
        );
      case "pending":
        return (
          <Badge
            count={0}
            variant="warning"
            size="small"
          >
            Pending
          </Badge>
        );
      case "reconciled":
        return (
          <Badge
            count={0}
            variant="info"
            size="small"
          >
            Reconciled
          </Badge>
        );
      default:
        return null;
    }
  };

  const calculatePeriodTotal = () => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  };

  return (
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
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
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

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterType === "all" && styles.filterTabActive,
            ]}
            onPress={() => setFilterType("all")}
          >
            <Typography
              variant="body2"
              weight="semibold"
              color={
                filterType === "all" ? colors.text.white : colors.gray[600]
              }
            >
              All
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterType === "expense" && styles.filterTabActive,
            ]}
            onPress={() => setFilterType("expense")}
          >
            <Typography
              variant="body2"
              weight="semibold"
              color={
                filterType === "expense" ? colors.text.white : colors.gray[600]
              }
            >
              Expenses
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterType === "income" && styles.filterTabActive,
            ]}
            onPress={() => setFilterType("income")}
          >
            <Typography
              variant="body2"
              weight="semibold"
              color={
                filterType === "income" ? colors.text.white : colors.gray[600]
              }
            >
              Income
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <Typography
              variant="body2"
              color={colors.gray[600]}
            >
              Period Total
            </Typography>
            <Typography
              variant="h3"
              weight="bold"
              color={
                calculatePeriodTotal() >= 0 ? colors.income : colors.expense
              }
            >
              {calculatePeriodTotal() >= 0 ? "+" : ""}
              {formatCurrency(calculatePeriodTotal())}
            </Typography>
          </View>
          <TouchableOpacity style={styles.summaryAction}>
            <Typography
              variant="body2"
              weight="semibold"
              color={colors.text.white}
            >
              View Report →
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
          <View
            key={date}
            style={styles.dateGroup}
          >
            <Typography
              variant="overline"
              color={colors.gray[600]}
              style={styles.dateHeader}
            >
              {formatDate(date)}
            </Typography>

            {dayTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionCard}
                activeOpacity={0.7}
              >
                {/* Icon & Info */}
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor:
                          transaction.type === "income"
                            ? colors.incomeBg
                            : colors.expenseBg,
                      },
                    ]}
                  >
                    <Typography variant="h4">
                      {transaction.categoryIcon}
                    </Typography>
                  </View>

                  <View style={styles.transactionInfo}>
                    <View style={styles.transactionTitleRow}>
                      <Typography
                        variant="body1"
                        weight="semibold"
                        numberOfLines={1}
                        style={styles.transactionDescription}
                      >
                        {transaction.description}
                      </Typography>
                      {transaction.isRecurring && (
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
                        color={colors.gray[400]}
                      >
                        {transaction.category}
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
                        {transaction.account}
                      </Typography>
                    </View>

                    {transaction.tags && transaction.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {transaction.tags.map((tag) => (
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

                {/* Amount & Status */}
                <View style={styles.transactionRight}>
                  <Typography
                    variant="body1"
                    weight="bold"
                    color={
                      transaction.type === "income"
                        ? colors.income
                        : colors.expense
                    }
                    style={styles.transactionAmount}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </Typography>
                  {getStatusBadge(transaction.status)}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
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
              Try adjusting your search or filters
            </Typography>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => router.push("/(screens)/CategoryManagementScreen")}
      >
        <Typography
          variant="h2"
          color={colors.text.white}
        >
          +
        </Typography>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.text.white,
    paddingHorizontal: spacing.md,
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
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  searchIconContainer: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    padding: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
  filterContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[200],
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  summaryCard: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryAction: {
    alignSelf: "flex-start",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateHeader: {
    marginBottom: spacing.md,
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
    paddingVertical: spacing.base,
  },
  emptyTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  bottomSpacer: {
    height: 80,
  },
  fab: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
});
