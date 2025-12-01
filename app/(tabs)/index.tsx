import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { useRouter } from "expo-router";
import { Plus, CreditCard, PiggyBank, BarChart3 } from "lucide-react-native";
import { useAccountStore } from "@/store/accountStore";
import { useTransactionStore } from "@/store/transactionStore";
import { useBudgetStore } from "@/store/budgetStore";
import { useAuthStore } from "@/store/authStore";
import { Card, Typography, LoadingIndicator } from "@/shared/components/ui";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/theme/context/ThemeContext";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const {
    accounts,
    getAccounts,
    isLoading: accountsLoading,
  } = useAccountStore();
  const {
    transactions,
    summary,
    getRecentTransactions,
    isLoading: transactionsLoading,
  } = useTransactionStore();
  const { budgets, getBudgets, isLoading: budgetsLoading } = useBudgetStore();

  useEffect(() => {
    getAccounts();
    getRecentTransactions(10);
    getBudgets();
  }, [getAccounts, getRecentTransactions, getBudgets]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        getAccounts(),
        getRecentTransactions(10),
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

  const totalBalance = accounts.reduce(
    (sum, account) =>
      sum + (parseFloat(account.balance?.toString() || "0") || 0),
    0
  );
  const totalIncome = summary?.totalIncome || 0;
  const totalExpenses = summary?.totalExpenses || 0;

  // Get currency from user profile or default to USD
  const currency = user?.currency || "USD";
  const currencySymbol =
    currency === "USD"
      ? "KSh"
      : currency === "EUR"
      ? "€"
      : currency === "GBP"
      ? "£"
      : currency;

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Calculate real chart data from transactions
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const dailyExpenses = last7Days.map((date) => {
      const dayTransactions = transactions.filter(
        (t) => t.date.startsWith(date) && t.transactionType === "EXPENSE"
      );
      return dayTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    });

    return {
      labels: last7Days.map((date) => {
        const d = new Date(date);
        return d.toLocaleDateString("en-US", { weekday: "short" });
      }),
      datasets: [
        {
          data: dailyExpenses,
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [transactions]);

  // Category spending data for pie chart
  const categoryData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};

    transactions
      .filter((t) => t.transactionType === "EXPENSE")
      .forEach((t) => {
        const category = t.TransactionItems?.[0]?.Category?.name || "Other";
        categoryTotals[category] =
          (categoryTotals[category] || 0) + (t.totalAmount || 0);
      });

    const colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
    ];

    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([category, amount], index) => ({
        name: category,
        amount,
        color: colors[index % colors.length],
        legendFontColor: themeColors.text.primary,
        legendFontSize: 12,
      }));
  }, [transactions, themeColors.text.primary]);

  // Monthly comparison data
  const monthlyData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(currentYear, currentMonth - (5 - i), 1);
      return {
        month: date.toLocaleDateString("en-US", { month: "short" }),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        yearValue: date.getFullYear(),
      };
    });

    const monthlyStats = months.map(({ month, monthIndex, yearValue }) => {
      const monthTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getMonth() === monthIndex &&
          transactionDate.getFullYear() === yearValue
        );
      });

      const income = monthTransactions
        .filter((t) => t.transactionType === "INCOME")
        .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

      const expenses = monthTransactions
        .filter((t) => t.transactionType === "EXPENSE")
        .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

      return {
        month,
        income,
        expenses,
      };
    });

    return {
      labels: monthlyStats.map((stat) => stat.month),
      datasets: [
        {
          data: monthlyStats.map((stat) => stat.income),
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        },
        {
          data: monthlyStats.map((stat) => stat.expenses),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        },
      ],
    };
  }, [transactions]);

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
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary,
    },
    formatYLabel: (value: string) => `${currencySymbol}${value}`,
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
        style={styles.scrollView}
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
          <View style={styles.userGreetingCard}>
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
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
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
                {currencySymbol}
                {totalBalance.toFixed(2)}
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
                  +{currencySymbol}
                  {totalIncome.toFixed(2)}
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
                  -{currencySymbol}
                  {totalExpenses.toFixed(2)}
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
              <Plus
                size={32}
                color={colors.primary}
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
              onPress={() => router.push("/screens/Budgets/BudgetForm")}
            >
              <PiggyBank
                size={32}
                color={colors.success}
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
              onPress={() => router.push("/(tabs)/transactions")}
            >
              <BarChart3
                size={32}
                color={colors.info}
              />
              <Typography
                variant="caption"
                style={[
                  styles.quickActionText,
                  { color: themeColors.text.secondary },
                ]}
              >
                Reports
              </Typography>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Account Slider */}
        {accounts.length > 0 && (
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
              {accounts.map((account) => (
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
                    {account.currency === "USD"
                      ? "$"
                      : account.currency === "EUR"
                      ? "€"
                      : account.currency === "GBP"
                      ? "£"
                      : account.currency}
                    {parseFloat(account.balance?.toString() || "0")}
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

        {/* Current Budgets */}
        {budgets.length > 0 && (
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
            {budgets.slice(0, 3).map((budget) => {
              const spent =
                budget.budgetCategories?.reduce(
                  (sum, cat) => sum + (cat.spentAmount || 0),
                  0
                ) || 0;
              const allocated = budget.amount || 0;
              const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
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
                      {currencySymbol}
                      {spent} / {currencySymbol}
                      {allocated}
                    </Typography>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: isOverBudget
                            ? colors.expense
                            : colors.success,
                        },
                      ]}
                    />
                  </View>
                  <Typography
                    variant="caption"
                    style={[
                      styles.budgetPercentage,
                      { color: themeColors.text.tertiary },
                    ]}
                  >
                    {percentage.toFixed(1)}% used
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
          <LineChart
            data={chartData}
            width={width - spacing.lg * 2}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card>

        {/* Category Breakdown */}
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
          <PieChart
            data={categoryData}
            width={width - spacing.lg * 2}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card>

        {/* Monthly Comparison */}
        <Card
          isDark={isDark}
          style={styles.chartCard}
        >
          <Typography
            variant="h3"
            style={[styles.sectionTitle, { color: themeColors.text.primary }]}
          >
            Monthly Income vs Expenses
          </Typography>
          <BarChart
            data={monthlyData}
            width={width - spacing.lg * 2}
            height={220}
            chartConfig={chartConfig}
            showValuesOnTopOfBars
            yAxisLabel="$"
            yAxisSuffix=""
            style={styles.chart}
          />
        </Card>

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
          {transactions.slice(0, 10).map((transaction) => (
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
                  {transaction.title || "Transaction"}
                </Typography>
                <Typography
                  variant="caption"
                  style={[
                    styles.transactionDate,
                    { color: themeColors.text.tertiary },
                  ]}
                >
                  {new Date(transaction.date).toLocaleDateString()}
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
                {transaction.transactionType === "INCOME" ? "+" : "-"}
                {currencySymbol}
                {Math.abs(transaction.totalAmount || 0).toFixed(2)}
              </Typography>
            </View>
          ))}
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
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.md,
    borderRadius: 16,
  },
  transactionsCard: {
    marginVertical: spacing.md,
    padding: spacing.lg,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: "#1C1C1E",
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
});
