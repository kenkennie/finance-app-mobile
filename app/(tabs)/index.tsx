import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors } from "@/theme/colors";
import { Card } from "@/shared/components/ui/Card";
import { borderRadius, fontSize, spacing } from "@/theme/spacing";
import { Modal } from "@/shared/components/ui/Modal";
import { useAuthStore } from "@/store/authStore";

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const stats = [
    {
      label: "Total Income",
      value: "$5,240",
      change: "+12%",
      icon: "📈",
      color: colors.success,
      bgColor: "#d1fae5",
    },
    {
      label: "Total Expenses",
      value: "$3,840",
      change: "+8%",
      icon: "💸",
      color: colors.error,
      bgColor: "#fee2e2",
    },
    {
      label: "Net Balance",
      value: "$1,400",
      change: "+4%",
      icon: "💰",
      color: colors.primary,
      bgColor: "#dbeafe",
    },
  ];

  const quickActions = [
    {
      icon: "➕",
      label: "Add Expense",
      color: colors.primary,
      bgColor: "#dbeafe",
    },
    {
      icon: "📊",
      label: "Add Income",
      color: colors.success,
      bgColor: "#d1fae5",
    },
    { icon: "🎯", label: "Set Budget", color: "#a855f7", bgColor: "#f3e8ff" },
    { icon: "💼", label: "New Project", color: "#f97316", bgColor: "#fed7aa" },
  ];

  const recentTransactions = [
    {
      id: 1,
      title: "Grocery Shopping",
      amount: -85.5,
      category: "Food",
      date: "2 hours ago",
      icon: "🛒",
    },
    {
      id: 2,
      title: "Salary Deposit",
      amount: 2500.0,
      category: "Income",
      date: "Yesterday",
      icon: "💵",
    },
    {
      id: 3,
      title: "Electric Bill",
      amount: -120.0,
      category: "Bills",
      date: "2 days ago",
      icon: "⚡",
    },
    {
      id: 4,
      title: "Freelance Project",
      amount: 850.0,
      category: "Income",
      date: "3 days ago",
      icon: "💻",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back, {user?.fullName}!
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setShowAccountModal(true)}
          >
            <Text style={styles.switchIcon}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Card
              key={index}
              style={styles.statCard}
            >
              <View style={styles.statContent}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={[styles.statChange, { color: stat.color }]}>
                    {stat.change} from last month
                  </Text>
                </View>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: stat.bgColor },
                  ]}
                >
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionButton,
                  { backgroundColor: action.bgColor },
                ]}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Recent Transactions */}
        <Card style={styles.transactionsCard}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionItem}
              >
                <View style={styles.transactionLeft}>
                  <View style={styles.transactionIconContainer}>
                    <Text style={styles.transactionIcon}>
                      {transaction.icon}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.transactionTitle}>
                      {transaction.title}
                    </Text>
                    <Text style={styles.transactionMeta}>
                      {transaction.category} • {transaction.date}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.amount > 0
                      ? styles.transactionAmountPositive
                      : styles.transactionAmountNegative,
                  ]}
                >
                  {transaction.amount > 0 ? "+" : ""}$
                  {Math.abs(transaction.amount).toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Account Switch Modal */}
      <Modal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title="Switch Account"
      >
        <View style={styles.accountModalContent}>
          <Card style={styles.accountCardActive}>
            <View style={styles.accountCardContent}>
              <View style={styles.accountIconContainer}>
                <Text style={styles.accountIcon}>👤</Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Personal Account</Text>
                <Text style={styles.accountStatus}>Currently Active</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.accountCardDisabled}>
            <View style={styles.accountCardContent}>
              <View style={styles.accountIconContainerDisabled}>
                <Text style={styles.accountIconDisabled}>💼</Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Business Account</Text>
                <Text style={styles.comingSoon}>Coming Soon</Text>
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  switchButton: {
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
  },
  switchIcon: {
    fontSize: 20,
  },
  notificationButton: {
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    position: "relative",
  },
  bellIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: colors.error,
    borderRadius: 4,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  statsGrid: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    padding: spacing.lg,
  },
  statContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xxxl,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statChange: {
    fontSize: fontSize.sm,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  statIcon: {
    fontSize: 24,
  },
  quickActionsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  actionButton: {
    width: "47%",
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  actionIcon: {
    fontSize: 32,
  },
  actionLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  transactionsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  viewAllButton: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: "600",
  },
  transactionsList: {
    gap: spacing.sm,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionIcon: {
    fontSize: 20,
  },
  transactionTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  transactionMeta: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  transactionAmount: {
    fontSize: fontSize.md,
    fontWeight: "bold",
  },
  transactionAmountPositive: {
    color: colors.success,
  },
  transactionAmountNegative: {
    color: colors.error,
  },
  accountModalContent: {
    gap: spacing.md,
  },
  accountCardActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.lg,
  },
  accountCardDisabled: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    opacity: 0.7,
  },
  accountCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  accountIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  accountIcon: {
    fontSize: 24,
  },
  accountIconContainerDisabled: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[200],
    justifyContent: "center",
    alignItems: "center",
  },
  accountIconDisabled: {
    fontSize: 24,
    opacity: 0.5,
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  accountStatus: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  comingSoon: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: "600",
  },
});
