import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Header } from "@/shared/components/ui/Header";
import { Card } from "@/shared/components/ui/Card";
import { Typography } from "@/shared/components/ui/Typography";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { ConfirmationModal } from "@/shared/components/ui/ConfirmationModal";
import { useBudgetStore } from "@/store/budgetStore";
import { useToastStore } from "@/store/toastStore";
import { Budget, BudgetStats } from "@/shared/types/budget.types";
import { budgetService } from "@/shared/services/budget/budgetService";
import { TransactionCard } from "@/app/screens/Transactions/TransactionCard";
import { colors } from "@/theme/colors";
import { spacing, borderRadius } from "@/theme/spacing";

export default function BudgetDetailsScreen() {
  const { budgetId } = useLocalSearchParams<{ budgetId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { getBudgetWithStats, deleteBudget, isLoading, error } =
    useBudgetStore();
  const { showSuccess, showError } = useToastStore();

  const [budgetWithStats, setBudgetWithStats] = useState<
    (Budget & { stats: BudgetStats }) | null
  >(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [budgetTransactions, setBudgetTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsMeta, setTransactionsMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);

  interface Action {
    text: string;
    onPress: () => void;
    icon?: string;
  }

  useEffect(() => {
    if (budgetId) {
      loadBudget();
    }
  }, [budgetId]);

  const loadBudget = async () => {
    if (!budgetId) return;

    const budgetData = await getBudgetWithStats(budgetId);
    if (budgetData) {
      setBudgetWithStats(budgetData);
      // Load transactions for this budget
      await loadBudgetTransactions();
    }
  };

  const loadBudgetTransactions = async (page: number = 1) => {
    if (!budgetId) return;

    try {
      setTransactionsLoading(true);
      const { getBudgetTransactions } = useBudgetStore.getState();
      const result = await getBudgetTransactions(budgetId, {
        limit: 10,
        page,
        sortBy: "date",
        sortOrder: "desc",
      });

      if (result) {
        if (page === 1) {
          setBudgetTransactions(result.data);
        } else {
          setBudgetTransactions((prev) => [...prev, ...result.data]);
        }
        setTransactionsMeta(result.meta);
      }
    } catch (error) {
      console.error("Failed to load budget transactions:", error);
    } finally {
      setTransactionsLoading(false);
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
      await deleteBudget(budgetId);
      router.replace("/(tabs)/budgets");
    } catch (error: any) {
      showError(error.message || "Failed to delete budget");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
  };

  const handlePauseTracking = async () => {
    if (!budgetId) return;

    try {
      setIsPausing(true);
      await budgetService.pauseTracking(budgetId);
      showSuccess("Budget tracking paused successfully");
      await loadBudget(); // Reload budget data
    } catch (error: any) {
      showError(error.message || "Failed to pause budget tracking");
    } finally {
      setIsPausing(false);
    }
  };

  const handleSuspendRenewal = async () => {
    if (!budgetId) return;

    try {
      setIsPausing(true);
      await budgetService.suspendRenewal(budgetId);
      showSuccess("Budget renewal suspended successfully");
      await loadBudget(); // Reload budget data
    } catch (error: any) {
      showError(error.message || "Failed to suspend budget renewal");
    } finally {
      setIsPausing(false);
    }
  };

  const handleArchive = async () => {
    if (!budgetId) return;

    try {
      setIsPausing(true);
      await budgetService.archiveBudget(budgetId);
      showSuccess("Budget archived successfully");
      await loadBudget(); // Reload budget data
    } catch (error: any) {
      showError(error.message || "Failed to archive budget");
    } finally {
      setIsPausing(false);
    }
  };

  const handleResume = async () => {
    if (!budgetId) return;

    try {
      setIsResuming(true);
      await budgetService.resumeBudget(budgetId);
      showSuccess("Budget resumed successfully");
      await loadBudget(); // Reload budget data
    } catch (error: any) {
      showError(error.message || "Failed to resume budget");
    } finally {
      setIsResuming(false);
    }
  };

  const handleResumeTracking = async () => {
    if (!budgetId) return;

    try {
      setIsResuming(true);
      await budgetService.resumeTracking(budgetId);
      showSuccess("Budget tracking resumed successfully");
      await loadBudget(); // Reload budget data
    } catch (error: any) {
      showError(error.message || "Failed to resume budget tracking");
    } finally {
      setIsResuming(false);
    }
  };

  const handleRestore = async () => {
    if (!budgetId) return;

    try {
      setIsResuming(true);
      await budgetService.restoreBudget(budgetId);
      showSuccess("Budget restored successfully");
      await loadBudget(); // Reload budget data
    } catch (error: any) {
      showError(error.message || "Failed to restore budget");
    } finally {
      setIsResuming(false);
    }
  };

  const handleRenew = async () => {
    if (!budgetId) return;

    try {
      setIsRenewing(true);
      await budgetService.renewBudget(budgetId);
      showSuccess("Budget renewed successfully");
      await loadBudget(); // Reload budget data
    } catch (error: any) {
      showError(error.message || "Failed to renew budget");
    } finally {
      setIsRenewing(false);
    }
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
    const periodMap: { [key: string]: string } = {
      "1": "Weekly",
      "2": "Monthly",
      "3": "Quarterly",
      "4": "Yearly",
    };
    return periodMap[recurrenceId || ""] || "One-time";
  };

  const getStatusDisplay = (budget: Budget & { stats: BudgetStats }) => {
    return budget.status?.name || "Active";
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

  if (error || !budgetWithStats) {
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

  const budget = budgetWithStats;
  const stats = budgetWithStats.stats;

  const handleMoreActions = () => {
    const buttons: Action[] = [];
    if (budget.status.code === "active") {
      buttons.push(
        {
          text: "Pause Auto-Renewal",
          onPress: handleSuspendRenewal,
          icon: "pause-circle",
        },
        {
          text: "Stop Expense Tracking",
          onPress: handlePauseTracking,
          icon: "stop-circle",
        },
        { text: "Move to Archive", onPress: handleArchive, icon: "archive" }
      );
    } else if (budget.status.code === "suspended") {
      buttons.push(
        {
          text: "Reactivate Budget",
          onPress: handleResume,
          icon: "play-circle",
        },
        {
          text: "Stop Expense Tracking",
          onPress: handlePauseTracking,
          icon: "stop-circle",
        },
        { text: "Move to Archive", onPress: handleArchive, icon: "archive" }
      );
    } else if (budget.status.code === "paused") {
      buttons.push(
        {
          text: "Reactivate Budget",
          onPress: handleResume,
          icon: "play-circle",
        },
        {
          text: "Resume Expense Tracking",
          onPress: handleResumeTracking,
          icon: "play",
        },
        { text: "Move to Archive", onPress: handleArchive, icon: "archive" }
      );
    } else if (budget.status.code === "archived") {
      buttons.push({
        text: "Restore from Archive",
        onPress: handleRestore,
        icon: "rotate-ccw",
      });
    }
    if (
      budget.recuringPeriodId &&
      (budget.status.code === "active" || budget.status.code === "suspended")
    ) {
      buttons.push({
        text: "Renew Budget Now",
        onPress: handleRenew,
        icon: "refresh-cw",
      });
    }
    buttons.push({ text: "Cancel", onPress: () => {}, icon: "x" });
    setActions(buttons);
    setActionModalVisible(true);
  };

  const totalAllocated = stats.totalAllocated;
  const totalSpent = stats.totalSpent;
  const utilizationPercentage = stats.overallPercentageUsed;

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
        {/* Budget Header & Overview Combined */}
        <Card
          isDark={isDark}
          style={styles.headerCard}
        >
          <View style={styles.budgetHeader}>
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
                {getStatusDisplay(budget)} Budget
              </Typography>
            </View>
            <Badge
              variant="custom"
              customColor={budget.status?.color || colors.primary}
            >
              {getStatusDisplay(budget)}
            </Badge>
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
          </View>

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
              Carry Over Enabled
            </Typography>
            <Typography
              style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
            >
              {budget.carryOverEnabled ? "Yes" : "No"}
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

        {/* Budget Transactions */}
        <Card
          isDark={isDark}
          style={styles.transactionsCard}
        >
          <View style={styles.transactionsHeader}>
            <Typography
              variant="h3"
              style={[
                styles.sectionTitle,
                isDark ? styles.sectionTitleDark : {},
              ]}
            >
              Recent Transactions
            </Typography>
            {transactionsMeta && (
              <Typography
                style={[
                  styles.transactionCount,
                  isDark ? styles.transactionCountDark : {},
                ]}
              >
                {transactionsMeta.total} transaction
                {transactionsMeta.total !== 1 ? "s" : ""}
              </Typography>
            )}
          </View>

          {transactionsLoading && budgetTransactions.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={isDark ? colors.text.white : colors.text.primary}
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
          ) : budgetTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {budgetTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  isDark={isDark}
                  onPress={() => {
                    // Navigate to transaction details
                    router.push(
                      `/screens/Transactions/TransactionDetails?transactionId=${transaction.id}`
                    );
                  }}
                />
              ))}

              {transactionsMeta &&
                transactionsMeta.page < transactionsMeta.totalPages && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() =>
                      loadBudgetTransactions(transactionsMeta.page + 1)
                    }
                    disabled={transactionsLoading}
                  >
                    {transactionsLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.primary}
                      />
                    ) : (
                      <Typography style={styles.loadMoreText}>
                        Load More Transactions
                      </Typography>
                    )}
                  </TouchableOpacity>
                )}
            </View>
          ) : (
            !transactionsLoading && (
              <View style={styles.emptyState}>
                <Typography
                  style={[
                    styles.emptyStateText,
                    isDark ? styles.emptyStateTextDark : {},
                  ]}
                >
                  No transactions found for this budget period.
                </Typography>
              </View>
            )
          )}
        </Card>

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
            onPress={handleMoreActions}
            variant="secondary"
            style={styles.actionButton}
          >
            More Actions
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

      {actionModalVisible && (
        <Modal
          visible={actionModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setActionModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setActionModalVisible(false)}
          >
            <View style={styles.bottomContainer}>
              <View
                style={[
                  styles.modal,
                  isDark ? styles.modalDark : styles.modalLight,
                ]}
              >
                <Typography
                  variant="h3"
                  style={[
                    styles.modalTitle,
                    isDark ? styles.modalTitleDark : {},
                  ]}
                >
                  Actions
                </Typography>
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalItem}
                    onPress={() => {
                      action.onPress();
                      setActionModalVisible(false);
                    }}
                  >
                    {action.icon && (
                      <Feather
                        name={action.icon as any}
                        size={20}
                        color={isDark ? "#D1D5DB" : "#374151"}
                        style={styles.modalIcon}
                      />
                    )}
                    <Typography
                      style={[
                        styles.modalText,
                        isDark ? styles.modalTextDark : {},
                      ]}
                    >
                      {action.text}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

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
    justifyContent: "space-between",
    marginBottom: 24,
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
    marginBottom: 24,
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
  recurringActions: {
    marginBottom: 12,
    gap: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
  editButton: {
    marginBottom: 12,
  },
  deleteButton: {
    marginBottom: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalDark: {
    backgroundColor: "#1F2937",
  },
  modalLight: {
    backgroundColor: "#FFF",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  modalTitleDark: {
    color: "#FFF",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  modalIcon: {
    marginRight: spacing.sm,
  },
  modalText: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
  },
  modalTextDark: {
    color: "#D1D5DB",
  },
  transactionsCard: {
    marginBottom: 24,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  transactionCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  transactionCountDark: {
    color: "#9CA3AF",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  transactionsList: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  transactionItemDark: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F620",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionIconDark: {
    backgroundColor: "#3B82F640",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  transactionTitleDark: {
    color: "#FFF",
  },
  transactionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoriesContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  transactionCategory: {
    fontSize: 12,
    color: "#6B7280",
  },
  transactionCategoryDark: {
    color: "#9CA3AF",
  },
  transactionDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  transactionDateDark: {
    color: "#6B7280",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  amountIncome: {
    color: "#10B981",
  },
  amountExpense: {
    color: "#EF4444",
  },
  loadMoreButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  emptyStateTextDark: {
    color: "#9CA3AF",
  },
});
