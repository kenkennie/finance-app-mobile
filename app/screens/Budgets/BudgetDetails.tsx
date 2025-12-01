import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Header } from "@/shared/components/ui/Header";
import { Card } from "@/shared/components/ui/Card";
import { Typography } from "@/shared/components/ui/Typography";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { ConfirmationModal } from "@/shared/components/ui/ConfirmationModal";
import { budgetService } from "@/shared/services/budget/budgetService";
import { Budget, BudgetStats } from "@/shared/types/budget.types";
import { colors } from "@/theme/colors";
import { spacing, borderRadius } from "@/theme/spacing";

export default function BudgetDetailsScreen() {
  const { budgetId } = useLocalSearchParams<{ budgetId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [budget, setBudget] = useState<Budget | null>(null);
  const [stats, setStats] = useState<BudgetStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (budgetId) {
      loadBudget();
    }
  }, [budgetId]);

  const loadBudget = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [budgetResponse, statsResponse] = await Promise.all([
        budgetService.getBudgetById(budgetId),
        budgetService.getBudgetStats(budgetId),
      ]);

      setBudget(budgetResponse);
      setStats(statsResponse);
    } catch (err: any) {
      setError(err.message || "Failed to load budget details");
      console.error("Failed to load budget:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: "/screens/Budgets/EditBudget",
      params: { budgetId },
    });
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!budgetId) return;

    try {
      setIsDeleting(true);
      setDeleteModalVisible(false);
      await budgetService.deleteBudget(budgetId);
      router.replace("/(tabs)/budgets");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete budget");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return colors.error;
    if (percentage >= 80) return colors.warning;
    return colors.primary;
  };

  const getRecurrenceLabel = (recurrenceId?: string) => {
    // This would need to be mapped from the recurrence ID
    // For now, return a placeholder
    return "Monthly";
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContainer,
          isDark && styles.containerDark,
        ]}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? colors.text.white : colors.text.primary}
        />
        <Typography
          style={[styles.loadingText, isDark ? styles.loadingTextDark : {}]}
        >
          Loading budget details...
        </Typography>
      </View>
    );
  }

  if (error || !budget) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContainer,
          isDark && styles.containerDark,
        ]}
      >
        <Typography
          style={[styles.errorText, isDark ? styles.errorTextDark : {}]}
        >
          {error || "Budget not found"}
        </Typography>
        <Button
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const totalAllocated =
    budget.budgetCategories?.reduce(
      (sum, cat) => sum + cat.allocatedAmount,
      0
    ) || 0;

  const totalSpent =
    stats?.categoryStats?.reduce((sum, cat) => sum + cat.spentAmount, 0) || 0;

  const utilizationPercentage =
    totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Budget Details"
        showBack
        onBackPress={() => router.back()}
        isDark={isDark}
        rightIcons={[
          {
            icon: "edit-3",
            onPress: handleEdit,
          },
        ]}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Budget Header Card */}
        <Card
          isDark={isDark}
          style={styles.headerCard}
        >
          <View style={styles.budgetHeader}>
            <View
              style={[
                styles.budgetIcon,
                {
                  backgroundColor: budget.isActive ? "#10B98120" : "#6B728020",
                },
              ]}
            >
              <Typography
                variant="h1"
                style={{
                  color: budget.isActive ? "#10B981" : "#6B7280",
                }}
              >
                💰
              </Typography>
            </View>
            <View style={styles.budgetInfo}>
              <Typography
                variant="h2"
                style={[styles.budgetName, isDark ? styles.budgetNameDark : {}]}
              >
                {budget.name}
              </Typography>
              <Typography
                style={[
                  styles.budgetStatus,
                  isDark ? styles.budgetStatusDark : {},
                ]}
              >
                {budget.isActive ? "Active Budget" : "Inactive Budget"}
              </Typography>
            </View>
          </View>

          <View style={styles.amountSection}>
            <Typography
              style={[styles.amountLabel, isDark ? styles.amountLabelDark : {}]}
            >
              Total Allocated
            </Typography>
            <Typography
              variant="h1"
              style={[styles.amount, isDark ? styles.amountDark : {}]}
            >
              ${totalAllocated}
            </Typography>
            <Badge variant={budget.isActive ? "success" : "neutral"}>
              {budget.isActive ? "Active" : "Inactive"}
            </Badge>
          </View>
        </Card>

        {/* Budget Overview */}
        <Card
          isDark={isDark}
          style={styles.overviewCard}
        >
          <Typography
            variant="h3"
            style={[styles.sectionTitle, isDark ? styles.sectionTitleDark : {}]}
          >
            Budget Overview
          </Typography>

          <View style={styles.statsGrid}>
            <View style={styles.stat}>
              <Typography
                variant="caption"
                style={[styles.statLabel, isDark ? styles.statLabelDark : {}]}
              >
                Total Spent
              </Typography>
              <Typography
                variant="h2"
                style={[styles.statValue, isDark ? styles.statValueDark : {}]}
              >
                {formatCurrency(totalSpent)}
              </Typography>
            </View>

            <View style={styles.stat}>
              <Typography
                variant="caption"
                style={[styles.statLabel, isDark ? styles.statLabelDark : {}]}
              >
                Remaining
              </Typography>
              <Typography
                variant="h2"
                style={[
                  styles.statValue,
                  isDark ? styles.statValueDark : {},
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

            <View style={styles.stat}>
              <Typography
                variant="caption"
                style={[styles.statLabel, isDark ? styles.statLabelDark : {}]}
              >
                Utilization
              </Typography>
              <Typography
                variant="h2"
                style={[styles.statValue, isDark ? styles.statValueDark : {}]}
              >
                {utilizationPercentage.toFixed(1)}%
              </Typography>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(utilizationPercentage, 100)}%`,
                  backgroundColor: getProgressColor(utilizationPercentage),
                },
              ]}
            />
          </View>
        </Card>

        {/* Budget Information */}
        <Card
          isDark={isDark}
          style={styles.infoCard}
        >
          <Typography
            variant="h3"
            style={[styles.sectionTitle, isDark ? styles.sectionTitleDark : {}]}
          >
            Budget Information
          </Typography>

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Start Date
            </Typography>
            <Typography
              style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
            >
              {new Date(budget.startDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </View>

          {budget.endDate && (
            <View style={styles.infoRow}>
              <Typography
                style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
              >
                End Date
              </Typography>
              <Typography
                style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
              >
                {new Date(budget.endDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </View>
          )}

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Recurring Period
            </Typography>
            <Typography
              style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
            >
              {getRecurrenceLabel(budget.recuringPeriodId)}
            </Typography>
          </View>

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Rollover Enabled
            </Typography>
            <Typography
              style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
            >
              {budget.rolloverEnabled ? "Yes" : "No"}
            </Typography>
          </View>
        </Card>

        {/* Category Breakdown */}
        {stats?.categoryStats && stats.categoryStats.length > 0 && (
          <Card
            isDark={isDark}
            style={styles.categoriesCard}
          >
            <Typography
              variant="h3"
              style={[
                styles.sectionTitle,
                isDark ? styles.sectionTitleDark : {},
              ]}
            >
              Category Breakdown
            </Typography>

            {stats.categoryStats.map((categoryStat) => {
              const categoryProgress =
                categoryStat.allocatedAmount > 0
                  ? (categoryStat.spentAmount / categoryStat.allocatedAmount) *
                    100
                  : 0;

              return (
                <View
                  key={categoryStat.categoryId}
                  style={styles.categoryRow}
                >
                  <View style={styles.categoryInfo}>
                    <View style={styles.categoryDetails}>
                      <View style={styles.categoryNameRow}>
                        <Typography
                          style={[
                            styles.categoryIcon,
                            isDark ? styles.categoryIconDark : {},
                          ]}
                        >
                          📊
                        </Typography>
                        <Typography
                          style={[
                            styles.categoryName,
                            isDark ? styles.categoryNameDark : {},
                          ]}
                        >
                          {categoryStat.categoryName.toUpperCase()}
                        </Typography>
                      </View>
                      <Typography
                        style={[
                          styles.categoryDescription,
                          isDark ? styles.categoryDescriptionDark : {},
                        ]}
                      >
                        {formatCurrency(categoryStat.spentAmount)} of{" "}
                        {formatCurrency(categoryStat.allocatedAmount)}
                      </Typography>
                    </View>
                  </View>
                  <View style={styles.categoryRight}>
                    <Badge
                      variant={
                        categoryStat.isOverBudget
                          ? "error"
                          : categoryProgress >= 80
                          ? "warning"
                          : "success"
                      }
                      size="small"
                    >
                      {categoryProgress.toFixed(1)}%
                    </Badge>
                    <View style={styles.categoryProgress}>
                      <View
                        style={[
                          styles.categoryProgressBar,
                          {
                            width: `${Math.min(categoryProgress, 100)}%`,
                            backgroundColor: getProgressColor(categoryProgress),
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            onPress={handleEdit}
            variant="primary"
            style={styles.editButton}
          >
            Edit Budget
          </Button>

          <Button
            onPress={handleDelete}
            variant="danger"
            style={styles.deleteButton}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Budget"}
          </Button>
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={deleteModalVisible}
        title="Delete Budget"
        message={`Are you sure you want to delete "${budget.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDark={isDark}
        destructive
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  containerDark: {
    backgroundColor: "#000",
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.secondary,
  },
  loadingTextDark: {
    color: colors.text.white,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  errorTextDark: {
    color: colors.error,
  },
  backButton: {
    marginTop: spacing.md,
  },
  headerCard: {
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  budgetIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  budgetNameDark: {
    color: "#FFF",
  },
  budgetStatus: {
    fontSize: 16,
    color: "#6B7280",
    textTransform: "capitalize",
  },
  budgetStatusDark: {
    color: "#9CA3AF",
  },
  amountSection: {
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  amountLabelDark: {
    color: "#9CA3AF",
  },
  amount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  amountDark: {
    color: "#FFF",
  },
  overviewCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: "#FFF",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
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
  progressContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: borderRadius.sm,
  },
  infoCard: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  infoLabel: {
    fontSize: 16,
    color: "#6B7280",
    flex: 1,
  },
  infoLabelDark: {
    color: "#9CA3AF",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    textAlign: "right",
    flex: 1,
  },
  infoValueDark: {
    color: "#FFF",
  },
  categoriesCard: {
    marginBottom: 24,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryDetails: {
    flexDirection: "column",
    gap: 4,
  },
  categoryNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryIconDark: {
    color: "#9CA3AF",
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  categoryNameDark: {
    color: "#9CA3AF",
  },
  categoryDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  categoryDescriptionDark: {
    color: "#9CA3AF",
  },
  categoryRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  categoryProgress: {
    width: 60,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  categoryProgressBar: {
    height: "100%",
    borderRadius: 2,
  },
  actionButtons: {
    paddingBottom: 32,
  },
  editButton: {
    marginBottom: 12,
  },
  deleteButton: {
    marginBottom: 12,
  },
});
