import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";
import { useRouter } from "expo-router";
import {
  Plus,
  CreditCard,
  PiggyBank,
  BarChart3,
  ArrowRightLeft,
  ListChevronsDownUp,
} from "lucide-react-native";
import { useAccountStore } from "@/store/accountStore";
import { useTransactionStore } from "@/store/transactionStore";
import { useBudgetStore } from "@/store/budgetStore";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  Typography,
  LoadingIndicator,
  SectionTitle,
} from "@/shared/components/ui";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/context/ThemeContext";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const {
    accounts = [],
    totalAccountBalance,
    getAccounts,
    isLoading: accountsLoading,
  } = useAccountStore();
  const {
    transactions = [],
    summary,
    getRecentTransactions,
    isLoading: transactionsLoading,
  } = useTransactionStore();
  const {
    budgets = [],
    budgetDetails = {},
    getBudgets,
    isLoading: budgetsLoading,
  } = useBudgetStore();

  // Ensure we always have arrays to prevent "length of undefined" errors
  const safeTransactions = transactions || [];
  const safeAccounts = accounts || [];
  const safeBudgets = budgets || [];

  // Calculate tab bar height to ensure content isn't hidden
  const tabBarHeight = (Platform.OS === "ios" ? 120 : 100) + insets.bottom;
  const contentPaddingBottom = tabBarHeight + 30; // Extra 30px for better spacing

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await getAccounts();
        await getRecentTransactions(50);
        await getBudgets();
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    loadDashboardData();
  }, []);

  // Debug effect to track component lifecycle

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        getAccounts(),
        getRecentTransactions(50),
        getBudgets(),
      ]);
    } catch (error) {
      console.error("Failed to refresh dashboard data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const themeColors = useMemo(
    () => ({
      background: isDark ? colors.dark.background : colors.light.background,
      backgroundSecondary: isDark
        ? colors.dark.backgroundSecondary
        : colors.light.backgroundSecondary,
      text: {
        primary: isDark ? colors.dark.text.primary : colors.light.text.primary,
        secondary: isDark
          ? colors.dark.text.secondary
          : colors.light.text.secondary,
        tertiary: isDark
          ? colors.dark.text.tertiary
          : colors.light.text.tertiary,
      },
      border: isDark ? colors.dark.border : colors.light.border,
    }),
    [isDark]
  );

  const totalIncome = summary?.totalIncome || 0;
  const totalExpenses = summary?.totalExpenses || 0;
  const netBalance = totalIncome - totalExpenses;

  const currency = user?.currency;

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const [selectedWeeklyTimePeriod, setSelectedWeeklyTimePeriod] = useState<
    "lastWeek" | "thisWeek" | "lastMonth" | "thisMonth" | "thisYear"
  >("thisWeek");

  // Calculate real chart data from transactions
  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (selectedWeeklyTimePeriod) {
      case "lastWeek":
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "thisWeek":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        startDate = lastMonth;
        endDate = lastMonthEnd;
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
    }

    // Generate array of dates from start to end
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const dailyExpenses = dates.map((date) => {
      const dateStr = date.toISOString().split("T")[0];
      const dayTransactions = safeTransactions.filter(
        (t: any) =>
          t.date.startsWith(dateStr) && t.transactionType === "EXPENSE"
      );
      return dayTransactions.reduce(
        (sum: number, t: any) => sum + (parseFloat(t.totalAmount) || 0),
        0
      );
    });

    // For labels, adjust based on period length
    let labels;
    if (dates.length <= 7) {
      labels = dates.map((date) =>
        date.toLocaleDateString("en-US", { weekday: "short" })
      );
    } else if (dates.length <= 31) {
      labels = dates.map((date) => date.getDate().toString());
    } else {
      // For longer periods, show monthly labels
      const monthlyLabels: string[] = [];
      let currentMonth = -1;
      dates.forEach((date) => {
        if (date.getMonth() !== currentMonth) {
          monthlyLabels.push(
            date.toLocaleDateString("en-US", { month: "short" })
          );
          currentMonth = date.getMonth();
        } else {
          monthlyLabels.push("");
        }
      });
      labels = monthlyLabels;
    }

    return {
      labels,
      datasets: [
        {
          data: dailyExpenses,
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [safeTransactions, selectedWeeklyTimePeriod]);

  // Category spending data with time filtering
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<
    "lastWeek" | "thisWeek" | "lastMonth" | "thisMonth" | "thisYear"
  >("thisMonth");

  const categoryData = useMemo(() => {
    // Ensure transactions is always an array
    const safeTransactions = transactions || [];
    const categoryTotals: { [key: string]: number } = {};

    // Calculate date range based on selected time period
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (selectedTimePeriod) {
      case "lastWeek":
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "thisWeek":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        startDate = lastMonth;
        endDate = lastMonthEnd;
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
    }

    // Filter transactions by time period
    safeTransactions
      .filter((t) => {
        const transactionDate = new Date(t.date);

        return (
          t.transactionType === "EXPENSE" &&
          transactionDate >= startDate &&
          transactionDate <= endDate
        );
      })
      .forEach((t) => {
        // Iterate through all transaction items to properly categorize spending
        t.TransactionItems?.forEach((item: any) => {
          const category = item.Category?.name || "Other";
          categoryTotals[category] =
            (categoryTotals[category] || 0) + (parseFloat(item.amount) || 0);
        });
      });

    const colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#FF6B6B",
      "#4ECDC4",
    ];

    const sortedCategories = Object.entries(categoryTotals).sort(
      ([, a], [, b]) => b - a
    );

    return sortedCategories.slice(0, 8).map(([category, amount], index) => ({
      name: category,
      amount,
      color: colors[index % colors.length],
      legendFontColor: themeColors.text.primary,
      legendFontSize: 12,
    }));
  }, [safeTransactions, selectedTimePeriod, themeColors.text.primary]);

  const chartConfig = {
    backgroundColor: themeColors.background,
    backgroundGradientFrom: themeColors.background,
    backgroundGradientTo: themeColors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => themeColors.text.secondary,
    style: {
      borderRadius: 16,
    },
    formatYLabel: (value: string) => `${currency}${value}`,
    // Configure individual bar colors for multi-dataset charts
    barPercentage: 0.8,
    // Custom properties for better bar spacing
    showBarTops: true,
    withScrollableDot: false,
    // Bar-specific colors for income vs expenses
    propsForBackgroundLines: {
      strokeDasharray: "",
    },
  };

  if (accountsLoading || transactionsLoading || budgetsLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#000" : "#F9FAFB" },
        ]}
      >
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#F9FAFB" },
      ]}
    >
      <ScrollView
        style={[styles.scrollView, { paddingBottom: contentPaddingBottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? "#FFFFFF" : "#000000"}
            colors={[isDark ? "#FFFFFF" : "#000000"]}
          />
        }
      >
        {/* User Greeting Section */}
        <View style={styles.userGreetingContainer}>
          <View
            style={[
              styles.userGreetingCard,
              { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" },
            ]}
          >
            <View style={styles.userInfo}>
              <View
                style={[
                  styles.avatarContainer,
                  { backgroundColor: isDark ? "#374151" : "#E5E7EB" },
                ]}
              >
                <Typography
                  variant="h3"
                  style={[
                    styles.avatarText,
                    { color: isDark ? "#FFFFFF" : "#000000" },
                  ]}
                >
                  {user?.fullName?.charAt(0) || "U"}
                </Typography>
              </View>
              <View style={styles.greetingText}>
                <Typography
                  variant="caption"
                  style={[
                    styles.greetingTime,
                    { color: isDark ? "#9CA3AF" : "#6B7280" },
                  ]}
                >
                  {getTimeBasedGreeting()}
                </Typography>
                <Typography
                  variant="h4"
                  style={[
                    styles.userName,
                    { color: isDark ? "#FFFFFF" : "#000000" },
                  ]}
                >
                  {user?.fullName || "User"}
                </Typography>
              </View>
            </View>
            <View style={styles.greetingDecoration}>
              <View
                style={[
                  styles.decorationDot,
                  { backgroundColor: colors.primary },
                ]}
              />
              <View
                style={[
                  styles.decorationDot,
                  { backgroundColor: colors.income },
                ]}
              />
              <View
                style={[
                  styles.decorationDot,
                  { backgroundColor: colors.expense },
                ]}
              />
            </View>
          </View>
        </View>

        {/* ATM Card Design */}
        <View style={styles.atmCardContainer}>
          <View
            style={[
              styles.atmCard,
              { backgroundColor: isDark ? "#1a1a1a" : "#ffffff" },
            ]}
          >
            {/* Balance Section */}
            <View style={styles.atmBalanceSection}>
              <Typography
                variant="caption"
                style={[
                  styles.atmBalanceLabel,
                  { color: isDark ? "#cccccc" : "#666666" },
                ]}
              >
                TOTAL BALANCE
              </Typography>
              <Typography
                variant="h1"
                style={[
                  styles.atmBalanceAmount,
                  { color: isDark ? "#ffffff" : "#000000" },
                ]}
              >
                {currency}
                {totalAccountBalance}
              </Typography>
            </View>

            {/* Income/Expense Row */}
            <View style={styles.atmStatsRow}>
              <View style={styles.atmStat}>
                <Typography
                  variant="caption"
                  style={[
                    styles.atmStatLabel,
                    { color: isDark ? "#cccccc" : "#666666" },
                  ]}
                >
                  INCOME
                </Typography>
                <Typography
                  variant="body1"
                  style={[styles.atmStatValue, { color: colors.income }]}
                >
                  +{currency}
                  {totalIncome}
                </Typography>
              </View>
              <View style={styles.atmDivider} />
              <View style={styles.atmStat}>
                <Typography
                  variant="caption"
                  style={[
                    styles.atmStatLabel,
                    { color: isDark ? "#cccccc" : "#666666" },
                  ]}
                >
                  EXPENSES
                </Typography>
                <Typography
                  variant="body1"
                  style={[styles.atmStatValue, { color: colors.expense }]}
                >
                  -{currency}
                  {totalExpenses}
                </Typography>
              </View>
              <View style={styles.atmDivider} />
              <View style={styles.atmStat}>
                <Typography
                  variant="caption"
                  style={[
                    styles.atmStatLabel,
                    { color: isDark ? "#cccccc" : "#666666" },
                  ]}
                >
                  NET BALANCE
                </Typography>
                <Typography
                  variant="body1"
                  style={[
                    styles.atmStatValue,
                    { color: netBalance >= 0 ? colors.income : colors.expense },
                  ]}
                >
                  {netBalance >= 0 ? "+" : "-"}
                  {currency}
                  {Math.abs(netBalance)}
                </Typography>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Card
          isDark={isDark}
          style={styles.quickActionsCard}
        >
          <Typography
            variant="h3"
            style={[styles.sectionTitle, { color: themeColors.text.primary }]}
          >
            Quick Actions
          </Typography>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: themeColors.background },
              ]}
              onPress={() =>
                router.push("/screens/Transactions/addTransaction")
              }
            >
              <ArrowRightLeft
                size={32}
                color={colors.secondary}
              />
              <Typography
                variant="caption"
                style={[
                  styles.quickActionText,
                  { color: themeColors.text.secondary },
                ]}
              >
                Transaction
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: themeColors.background },
              ]}
              onPress={() => router.push("/screens/Budgets/addBudget")}
            >
              <PiggyBank
                size={32}
                color={colors.secondary}
              />
              <Typography
                variant="caption"
                style={[
                  styles.quickActionText,
                  { color: themeColors.text.secondary },
                ]}
              >
                Budget
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: themeColors.background },
              ]}
              onPress={() => router.push("/screens/Accounts/AddAccountSreen")}
            >
              <CreditCard
                size={32}
                color={colors.secondary}
              />
              <Typography
                variant="caption"
                style={[
                  styles.quickActionText,
                  { color: themeColors.text.secondary },
                ]}
              >
                Account
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: themeColors.background },
              ]}
              onPress={() => router.push("/screens/Categories/AddCategory")}
            >
              <ListChevronsDownUp
                size={32}
                color={colors.secondary}
              />
              <Typography
                variant="caption"
                style={[
                  styles.quickActionText,
                  { color: themeColors.text.secondary },
                ]}
              >
                Category
              </Typography>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Account Slider */}
        {accounts && accounts.length > 0 && (
          <Card
            isDark={isDark}
            style={styles.sliderCard}
          >
            <Typography
              variant="h3"
              style={[styles.sectionTitle, { color: themeColors.text.primary }]}
            >
              My Accounts
            </Typography>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.accountSlider}
              contentContainerStyle={styles.accountSliderContent}
            >
              {safeAccounts.map((account: any) => (
                <View
                  key={account.id}
                  style={[
                    styles.accountCard,
                    { backgroundColor: account.color || colors.primary },
                  ]}
                >
                  <Typography
                    variant="body2"
                    style={[styles.accountName, { color: "#FFFFFF" }]}
                  >
                    {account.accountName}
                  </Typography>
                  <Typography
                    variant="h2"
                    style={[styles.accountBalance, { color: "#FFFFFF" }]}
                  >
                    {account.currency}
                    {account.formattedBalance}
                  </Typography>
                  <Typography
                    variant="caption"
                    style={[styles.accountNumber, { color: "#FFFFFF" }]}
                  >
                    {account.accountNumber}
                  </Typography>
                </View>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card
          isDark={isDark}
          style={styles.transactionsCard}
        >
          <Typography
            variant="h3"
            style={[styles.sectionTitle, { color: themeColors.text.primary }]}
          >
            Recent Transactions
          </Typography>
          {safeTransactions.slice(0, 5).map((transaction: any) => (
            <View
              key={transaction.id}
              style={[
                styles.transactionItem,
                { borderBottomColor: themeColors.border },
              ]}
            >
              <View style={styles.transactionLeft}>
                <Typography
                  variant="body1"
                  style={[
                    styles.transactionTitle,
                    { color: themeColors.text.primary },
                  ]}
                >
                  {typeof transaction.title === "string"
                    ? transaction.title
                    : transaction.title?.name ||
                      transaction.title?.code ||
                      "Transaction"}
                </Typography>
                <Typography
                  variant="caption"
                  style={[
                    styles.transactionDate,
                    { color: themeColors.text.tertiary },
                  ]}
                >
                  {transaction.formatedDate}
                </Typography>
              </View>
              <Typography
                variant="body1"
                style={[
                  styles.transactionAmount,
                  {
                    color:
                      transaction.transactionType === "INCOME"
                        ? colors.income
                        : colors.expense,
                  },
                ]}
              >
                {transaction.formattedAmount ||
                  `${
                    transaction.transactionType === "INCOME" ? "+" : "-"
                  }${currency}${Math.abs(
                    parseFloat(transaction.totalAmount) || 0
                  )}`}
              </Typography>
            </View>
          ))}
        </Card>

        {/* Current Budgets */}
        {budgets && budgets.length > 0 && (
          <Card
            isDark={isDark}
            style={styles.budgetsCard}
          >
            <Typography
              variant="h3"
              style={[styles.sectionTitle, { color: themeColors.text.primary }]}
            >
              Current Budgets
            </Typography>

            {safeBudgets.slice(0, 4).map((budget: any) => {
              const budgetStat = budgetDetails[budget.id];
              const spent = budgetStat?.totalSpent;
              const allocated = budgetStat?.totalAllocated;
              const remaining = budgetStat?.totalRemaining;
              const percentage = budgetStat?.overallPercentageUsed;
              const budgetCurrency = budgetStat?.currency;
              const isOverBudget = spent > allocated;

              return (
                <View
                  key={budget.id}
                  style={styles.budgetItem}
                >
                  <View style={styles.budgetHeader}>
                    <Typography
                      variant="body1"
                      style={[
                        styles.budgetName,
                        { color: themeColors.text.primary },
                      ]}
                    >
                      {budget.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      style={[
                        styles.budgetAmount,
                        {
                          color: isOverBudget
                            ? colors.expense
                            : themeColors.text.secondary,
                        },
                      ]}
                    >
                      {budgetCurrency}
                      {spent} / {budgetCurrency}
                      {allocated}
                    </Typography>
                  </View>
                  <View
                    style={[
                      styles.progressBarContainer,
                      { backgroundColor: isDark ? "#374151" : "#E5E7EB" },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: isOverBudget
                            ? colors.expense
                            : percentage >= 80
                            ? colors.warning
                            : colors.success,
                        },
                      ]}
                    />
                  </View>
                  <Typography
                    variant="caption"
                    style={[
                      styles.budgetPercentage,
                      { color: colors.text.tertiary },
                    ]}
                  >
                    {percentage}% used •{" "}
                    {remaining >= 0 ? "Over " : " Remaining "}
                    {remaining}
                  </Typography>
                </View>
              );
            })}
          </Card>
        )}

        {/* Weekly Spending Chart */}
        <Card
          isDark={isDark}
          style={styles.chartCard}
        >
          <Typography
            variant="h3"
            style={[styles.sectionTitle, { color: themeColors.text.primary }]}
          >
            Weekly Spending
          </Typography>

          {/* Time Period Selector */}
          <View style={styles.timePeriodSelector}>
            {[
              { key: "thisWeek", label: "This Week" },
              { key: "lastWeek", label: "Last Week" },
              { key: "thisMonth", label: "This Month" },
              { key: "lastMonth", label: "Last Month" },
              { key: "thisYear", label: "This Year" },
            ].map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.timePeriodButton,
                  selectedWeeklyTimePeriod === period.key &&
                    styles.timePeriodButtonActive,
                  {
                    backgroundColor:
                      selectedWeeklyTimePeriod === period.key
                        ? colors.primary
                        : "transparent",
                  },
                ]}
                onPress={() => setSelectedWeeklyTimePeriod(period.key as any)}
              >
                <Typography
                  variant="caption"
                  style={[
                    styles.timePeriodButtonText,
                    {
                      color:
                        selectedWeeklyTimePeriod === period.key
                          ? colors.text.white
                          : themeColors.text.secondary,
                    },
                  ]}
                >
                  {period.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          <LineChart
            data={chartData}
            width={width - spacing.lg * 2}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card>

        {/* Category Spending Pie Chart */}
        <Card
          isDark={isDark}
          style={styles.chartCard}
        >
          <Typography
            variant="h3"
            style={[styles.sectionTitle, { color: themeColors.text.primary }]}
          >
            Spending by Category
          </Typography>

          {/* Time Period Selector */}
          <View style={styles.timePeriodSelector}>
            {[
              { key: "thisWeek", label: "This Week" },
              { key: "lastWeek", label: "Last Week" },
              { key: "thisMonth", label: "This Month" },
              { key: "lastMonth", label: "Last Month" },
              { key: "thisYear", label: "This Year" },
            ].map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.timePeriodButton,
                  selectedTimePeriod === period.key &&
                    styles.timePeriodButtonActive,
                  {
                    backgroundColor:
                      selectedTimePeriod === period.key
                        ? colors.primary
                        : "transparent",
                  },
                ]}
                onPress={() => setSelectedTimePeriod(period.key as any)}
              >
                <Typography
                  variant="caption"
                  style={[
                    styles.timePeriodButtonText,
                    {
                      color:
                        selectedTimePeriod === period.key
                          ? colors.text.white
                          : themeColors.text.secondary,
                    },
                  ]}
                >
                  {period.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {categoryData.length > 0 ? (
            <>
              <PieChart
                data={categoryData}
                width={width - spacing.lg * 2}
                height={220}
                chartConfig={{
                  backgroundColor: "transparent",
                  backgroundGradientFrom: "transparent",
                  backgroundGradientTo: "transparent",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => themeColors.text.secondary,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 10]}
                style={styles.pieChart}
              />

              {/* Category Summary */}
              <View style={styles.categorySummary}>
                <Typography
                  variant="body2"
                  style={[
                    styles.categorySummaryText,
                    { color: themeColors.text.secondary },
                  ]}
                >
                  Total: {currency}
                  {categoryData.reduce((sum, item) => sum + item.amount, 0)}
                </Typography>
              </View>

              {/* Category List */}
              <View style={styles.categoryList}>
                {categoryData.slice(0, 5).map((category, index) => (
                  <View
                    key={category.name}
                    style={styles.categoryListItem}
                  >
                    <View style={styles.categoryListLeft}>
                      <View
                        style={[
                          styles.categoryColorDot,
                          { backgroundColor: category.color },
                        ]}
                      />
                      <Typography
                        variant="body2"
                        style={[
                          styles.categoryName,
                          { color: themeColors.text.primary },
                        ]}
                        numberOfLines={1}
                      >
                        {category.name}
                      </Typography>
                    </View>
                    <Typography
                      variant="body2"
                      style={[
                        styles.categoryAmount,
                        { color: themeColors.text.secondary },
                      ]}
                    >
                      {currency}
                      {category.amount}
                    </Typography>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Typography
                variant="body1"
                style={[
                  styles.noDataText,
                  { color: themeColors.text.secondary },
                ]}
              >
                No category data available
              </Typography>
              <Typography
                variant="caption"
                style={[
                  styles.noDataSubtext,
                  { color: themeColors.text.tertiary },
                ]}
              >
                Add some expense transactions to see category breakdown
              </Typography>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  summaryContainer: {
    marginTop: spacing.md,
  },
  summaryCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    alignItems: "center",
  },
  cardTitle: {
    marginBottom: spacing.xs,
  },
  cardValue: {
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfCard: {
    flex: 1,
    marginHorizontal: spacing.xs / 2,
  },
  chartCard: {
    marginVertical: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.md,
    borderRadius: 16,
  },
  pieChart: {
    marginVertical: spacing.md,
    borderRadius: 16,
  },
  transactionsCard: {
    marginVertical: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionTitle: {
    marginBottom: spacing.xs / 2,
  },
  transactionDate: {},
  transactionAmount: {
    fontWeight: "600",
  },
  sliderCard: {
    marginVertical: spacing.md,
    padding: spacing.lg,
  },
  accountSlider: {
    marginTop: spacing.md,
  },
  accountSliderContent: {
    paddingHorizontal: spacing.xs,
  },
  accountCard: {
    width: 140,
    height: 100,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountName: {
    fontSize: 14,
    fontWeight: "600",
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: spacing.xs,
  },
  accountNumber: {
    fontSize: 12,
    opacity: 0.8,
  },
  budgetsCard: {
    marginVertical: spacing.md,
    padding: spacing.lg,
  },
  recentBudgetsCard: {
    marginVertical: spacing.md,
    padding: spacing.lg,
  },
  recentBudgetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  recentBudgetLeft: {
    flex: 1,
  },
  recentBudgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs / 2,
  },
  recentBudgetName: {
    fontWeight: "600",
    flex: 1,
    marginRight: spacing.sm,
  },
  budgetStatusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 50,
    alignItems: "center",
  },
  budgetStatusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  recentBudgetDate: {
    fontSize: 11,
  },
  recentBudgetRight: {
    alignItems: "flex-end",
  },
  recentBudgetAmount: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  viewBudgetButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  viewBudgetText: {
    fontSize: 11,
    fontWeight: "500",
  },
  budgetItem: {
    marginBottom: spacing.lg,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  budgetName: {
    fontWeight: "600",
    flex: 1,
  },
  budgetAmount: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  budgetPercentage: {
    fontSize: 12,
    textAlign: "right",
  },
  quickActionsCard: {
    marginVertical: spacing.md,
    padding: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  quickActionCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    padding: spacing.sm,
    marginHorizontal: spacing.xs / 2,
    alignItems: "center",
    justifyContent: "center",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  quickActionText: {
    marginTop: spacing.sm,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
  },
  atmCardContainer: {
    marginTop: spacing.md,
  },
  atmCard: {
    height: 200,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  atmCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  atmBalanceSection: {
    marginBottom: spacing.lg,
  },
  atmBalanceLabel: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  atmBalanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
  },
  atmStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  atmStat: {
    flex: 1,
    alignItems: "center",
    paddingTop: spacing.md,
  },
  atmStatLabel: {
    fontSize: 10,
    marginBottom: spacing.xs / 2,
  },
  atmStatValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  atmDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: spacing.md,
  },
  atmCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  atmCardHolder: {
    fontSize: 10,
    marginBottom: spacing.xs / 2,
  },
  atmCardName: {
    fontSize: 14,
    fontWeight: "600",
  },
  atmCardType: {
    alignItems: "flex-end",
  },
  atmCardTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  userGreetingContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  userGreetingCard: {
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  greetingText: {
    flex: 1,
  },
  greetingTime: {
    fontSize: 14,
    marginBottom: spacing.xs / 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
  },
  greetingDecoration: {
    flexDirection: "row",
    alignItems: "center",
  },
  decorationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.xs / 2,
  },
  timePeriodSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: spacing.md,
    gap: spacing.xs,
    maxWidth: width - spacing.lg * 2,
  },
  timePeriodButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    minWidth: 70,
    maxWidth: 85,
    alignItems: "center",
  },
  timePeriodButtonActive: {
    backgroundColor: colors.primary,
  },
  timePeriodButtonText: {
    fontSize: 11,
    fontWeight: "500",
  },
  categorySummary: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  categorySummaryText: {
    fontSize: 11,
    textAlign: "center",
  },
  categoryList: {
    marginTop: spacing.sm,
  },
  categoryListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  categoryListLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "400",
    flex: 1,
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: "500",
  },
  noDataContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  noDataSubtext: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  budgetOverviewContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  budgetOverviewItem: {
    alignItems: "center",
    flex: 1,
  },
  budgetOverviewLabel: {
    fontSize: 11,
    marginBottom: spacing.xs / 2,
    textAlign: "center",
  },
  budgetOverviewValue: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
