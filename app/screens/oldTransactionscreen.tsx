import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

interface AdvancedFilters {
  dateRange: { startDate: string | null; endDate: string | null };
  amountRange: { min: string; max: string };
  categories: string[];
  statuses: ("pending" | "cleared" | "reconciled")[];
}

const defaultFilters: AdvancedFilters = {
  dateRange: { startDate: null, endDate: null },
  amountRange: { min: "", max: "" },
  categories: [],
  statuses: [],
};

// --- HELPER FUNCTIONS (for demo, you'd replace with real selectors) ---
const getUniqueCategories = () => {
  const categories = mockTransactions.map((t) => t.category);
  return [...new Set(categories)];
};

const allStatuses: AdvancedFilters["statuses"] = [
  "pending",
  "cleared",
  "reconciled",
];

const allCategories = getUniqueCategories();

export default function Transactions() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">(
    "all"
  );

  // --- NEW STATE FOR FILTERS ---
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  // Holds the filters *applied* to the list
  const [activeFilters, setActiveFilters] =
    useState<AdvancedFilters>(defaultFilters);
  // Holds the temporary filters *inside the modal*
  const [modalFilters, setModalFilters] =
    useState<AdvancedFilters>(defaultFilters);

  // --- NEW: OPEN MODAL ---
  const openFilterModal = () => {
    // Load active filters into the modal when opening
    setModalFilters(activeFilters);
    setFilterModalVisible(true);
  };

  // --- NEW: APPLY FILTERS ---
  const handleApplyFilters = () => {
    setActiveFilters(modalFilters);
    setFilterModalVisible(false);
  };

  // --- NEW: RESET FILTERS ---
  const handleResetFilters = () => {
    setModalFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setFilterModalVisible(false);
  };

  /* const filteredTransactions = mockTransactions.filter((t) => {
    const matchesSearch = t.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesFilter;
  }); */

  // --- UPDATED: FILTERING LOGIC ---
  const filteredTransactions = useMemo(() => {
    const { dateRange, amountRange, categories, statuses } = activeFilters;
    const minAmount = parseFloat(amountRange.min) || 0;
    const maxAmount = parseFloat(amountRange.max) || Infinity;

    return mockTransactions.filter((t) => {
      // 1. Simple Search
      const matchesSearch = t.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // 2. Tab Filter (All, Income, Expense)
      const matchesFilterType = filterType === "all" || t.type === filterType;

      // 3. Advanced: Date Range
      let matchesDate = true;
      if (dateRange.startDate && dateRange.endDate) {
        const txDate = new Date(t.date);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        startDate.setHours(0, 0, 0, 0); // Inclusive start
        endDate.setHours(23, 59, 59, 999); // Inclusive end
        matchesDate = txDate >= startDate && txDate <= endDate;
      }

      // 4. Advanced: Amount Range
      const absAmount = Math.abs(t.amount);
      const matchesAmount = absAmount >= minAmount && absAmount <= maxAmount;

      // 5. Advanced: Categories
      const matchesCategory =
        categories.length === 0 || categories.includes(t.category);

      // 6. Advanced: Status
      const matchesStatus =
        statuses.length === 0 || statuses.includes(t.status);

      return (
        matchesSearch &&
        matchesFilterType &&
        matchesDate &&
        matchesAmount &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [searchQuery, filterType, activeFilters]);

  const groupedTransactions = filteredTransactions.reduce(
    (groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(transaction);
      return groups;
    },
    {} as Record<string, TransactionInterface[]>
  );

  // --- NEW: EXPORT FUNCTIONALITY ---
  const showExportOptions = () => {
    Alert.alert(
      "Export Transactions",
      `Export ${filteredTransactions.length} currently filtered transactions as:`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Export as PDF", onPress: () => handleExport("pdf") },
        { text: "Export as Excel (CSV)", onPress: () => handleExport("csv") },
      ]
    );
  };

  const handleExport = async (format: "pdf" | "csv") => {
    if (filteredTransactions.length === 0) {
      Alert.alert("No Data", "There are no transactions to export.");
      return;
    }

    // This is where you would use libraries like 'react-native-csv',
    // 'react-native-pdf-lib', 'react-native-fs', and 'react-native-share'.

    if (format === "csv") {
      // --- PSEUDO-CODE for CSV ---
      // 1. Format `filteredTransactions` into a CSV string
      // const headers = "Date,Description,Amount,Category,Status\n";
      // const rows = filteredTransactions.map(t =>
      //   `${t.date},"${t.description}",${t.amount},${t.category},${t.status}`
      // ).join("\n");
      // const csvString = headers + rows;
      // 2. Use 'react-native-fs' to write string to a .csv file
      // 3. Use 'react-native-share' to share the file
      Alert.alert(
        "CSV Export Stub",
        "Implement CSV generation and sharing here."
      );
    } else if (format === "pdf") {
      // --- PSEUDO-CODE for PDF ---
      // 1. Generate HTML or use 'react-native-pdf-lib' to build a doc
      // 2. Save file using 'react-native-fs'
      // 3. Share using 'react-native-share'
      Alert.alert(
        "PDF Export Stub",
        "Implement PDF generation and sharing here."
      );
    }
  };

  const setDatePreset = (preset: "today" | "yesterday") => {
    const today = new Date().toISOString().split("T")[0];
    if (preset === "today") {
      setModalFilters((prev) => ({
        ...prev,
        dateRange: { startDate: today, endDate: today },
      }));
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const ydayStr = yesterday.toISOString().split("T")[0];
      setModalFilters((prev) => ({
        ...prev,
        dateRange: { startDate: ydayStr, endDate: ydayStr },
      }));
    }
  };

  // --- Helper for multi-select toggles ---
  const toggleCategory = (category: string) => {
    setModalFilters((prev) => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories };
    });
  };

  const toggleStatus = (status: AdvancedFilters["statuses"][0]) => {
    setModalFilters((prev) => {
      const newStatuses = prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status];
      return { ...prev, statuses: newStatuses };
    });
  };

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

        {/* Search Bar & Filter Button */}
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
          {/* --- UPDATED: Clear/Filter Buttons --- */}
          {searchQuery.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.searchClearButton}
            >
              <Typography
                variant="body2"
                color={colors.gray[400]}
              >
                ✕
              </Typography>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={openFilterModal}
              style={styles.filterButton}
            >
              <Typography variant="h4">🔧</Typography>
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
              color={colors.gray[500]}
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
        onPress={() => router.push("/(screens)/addTransaction")}
      >
        <Typography
          variant="h2"
          color={colors.text.white}
        >
          +
        </Typography>
      </TouchableOpacity>

      {/* --- NEW: Advanced Filter Modal --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setFilterModalVisible(false)}
          >
            <Pressable
              style={styles.modalContent}
              onPress={() => {}} /* Prevents closing on content press */
            >
              <View style={styles.modalHeader}>
                <Typography
                  variant="h3"
                  weight="bold"
                >
                  Advanced Filters
                </Typography>
                <IconButton onPress={() => setFilterModalVisible(false)}>
                  <Typography variant="h3">✕</Typography>
                </IconButton>
              </View>

              <ScrollView
                style={styles.modalScrollView}
                showsVerticalScrollIndicator={false}
              >
                {/* Date Range */}
                <View style={styles.formGroup}>
                  <Typography
                    variant="h4"
                    weight="semibold"
                  >
                    Date Range
                  </Typography>
                  <View style={styles.chipContainer}>
                    <TouchableOpacity
                      style={styles.chip}
                      onPress={() => setDatePreset("today")}
                    >
                      <Typography>Today</Typography>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.chip}
                      onPress={() => setDatePreset("yesterday")}
                    >
                      <Typography>Yesterday</Typography>
                    </TouchableOpacity>
                  </View>
                  <Typography
                    variant="body2"
                    color={colors.gray[500]}
                    style={{ marginBottom: spacing.xs }}
                  >
                    Custom (YYYY-MM-DD)
                  </Typography>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      placeholder="Start Date"
                      value={modalFilters.dateRange.startDate || ""}
                      onChangeText={(text) =>
                        setModalFilters((prev) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, startDate: text },
                        }))
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="End Date"
                      value={modalFilters.dateRange.endDate || ""}
                      onChangeText={(text) =>
                        setModalFilters((prev) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, endDate: text },
                        }))
                      }
                    />
                  </View>
                </View>

                {/* Amount Range */}
                <View style={styles.formGroup}>
                  <Typography
                    variant="h4"
                    weight="semibold"
                  >
                    Amount Range
                  </Typography>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      placeholder="Min Amount"
                      keyboardType="numeric"
                      value={modalFilters.amountRange.min}
                      onChangeText={(text) =>
                        setModalFilters((prev) => ({
                          ...prev,
                          amountRange: { ...prev.amountRange, min: text },
                        }))
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Max Amount"
                      keyboardType="numeric"
                      value={modalFilters.amountRange.max}
                      onChangeText={(text) =>
                        setModalFilters((prev) => ({
                          ...prev,
                          amountRange: { ...prev.amountRange, max: text },
                        }))
                      }
                    />
                  </View>
                </View>

                {/* Category Selection */}
                <View style={styles.formGroup}>
                  <Typography
                    variant="h4"
                    weight="semibold"
                  >
                    Categories
                  </Typography>
                  <View style={styles.chipContainer}>
                    {allCategories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.chip,
                          modalFilters.categories.includes(category) &&
                            styles.chipActive,
                        ]}
                        onPress={() => toggleCategory(category)}
                      >
                        <Typography
                          color={
                            modalFilters.categories.includes(category)
                              ? colors.text.white
                              : colors.text.primary
                          }
                        >
                          {category}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Status Selection */}
                <View style={styles.formGroup}>
                  <Typography
                    variant="h4"
                    weight="semibold"
                  >
                    Status
                  </Typography>
                  <View style={styles.chipContainer}>
                    {allStatuses.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.chip,
                          modalFilters.statuses.includes(status) &&
                            styles.chipActive,
                        ]}
                        onPress={() => toggleStatus(status)}
                      >
                        <Typography
                          color={
                            modalFilters.statuses.includes(status)
                              ? colors.text.white
                              : colors.text.primary
                          }
                        >
                          {status}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetFilters}
                >
                  <Typography
                    weight="semibold"
                    color={colors.primary}
                  >
                    Reset
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyFilters}
                >
                  <Typography
                    weight="semibold"
                    color={colors.text.white}
                  >
                    Apply Filters
                  </Typography>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
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
  searchClearButton: {
    // --- UPDATED ---
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  filterButton: {
    // --- NEW ---
    padding: spacing.xs,
    marginLeft: spacing.sm,
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

  // --- NEW MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.text.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.md,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  modalScrollView: {
    marginBottom: spacing.base,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    borderColor: colors.gray[200],
    borderWidth: 1,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    backgroundColor: colors.gray[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  applyButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: borderRadius.md,
  },
});
