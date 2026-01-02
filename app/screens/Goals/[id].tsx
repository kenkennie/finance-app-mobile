import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { Header } from "@/shared/components/ui/Header";
import { Card } from "@/shared/components/ui/Card";
import { Typography } from "@/shared/components/ui/Typography";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { ConfirmationModal } from "@/shared/components/ui/ConfirmationModal";
import { useGoalStore } from "@/store/goalStore";
import {
  GoalDetails as GoalDetailsType,
  GoalContribution,
} from "@/shared/types/goal.types";
import { colors } from "@/theme/colors";
import { formatNumber } from "@/shared/utils/formatUtils";
import AddContributionModal from "./AddContributionModal";
import EditContributionModal from "./EditContributionModal";

const GoalDetails = () => {
  const route = useRoute();
  const { id: goalId } = route.params as { id: string };
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const {
    goalDetails,
    isLoading,
    error,
    getGoalIncludingDetails,
    deleteGoal,
    addContribution,
    updateContribution,
    deleteContribution,
    pauseGoal,
    resumeGoal,
  } = useGoalStore();

  const [refreshing, setRefreshing] = useState(false);
  const [isAddContributionModalVisible, setIsAddContributionModalVisible] =
    useState(false);
  const [isEditContributionModalVisible, setIsEditContributionModalVisible] =
    useState(false);
  const [selectedContribution, setSelectedContribution] =
    useState<GoalContribution | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteContributionId, setDeleteContributionId] = useState<
    string | null
  >(null);

  const goal = goalDetails[goalId || ""];

  useEffect(() => {
    if (goalId && !goal) {
      loadGoalDetails();
    }
  }, [goalId]);

  const loadGoalDetails = async () => {
    if (!goalId) return;
    await getGoalIncludingDetails(goalId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGoalDetails();
    setRefreshing(false);
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!goalId) return;

    try {
      setDeleteModalVisible(false);
      await deleteGoal(goalId);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to delete goal");
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
  };

  const handleAddContribution = () => {
    setIsAddContributionModalVisible(true);
  };

  const handlePauseGoal = async () => {
    if (!goalId) return;

    try {
      await pauseGoal(goalId);
    } catch (error) {
      Alert.alert("Error", "Failed to pause goal");
    }
  };

  const handleResumeGoal = async () => {
    if (!goalId) return;

    try {
      await resumeGoal(goalId);
    } catch (error) {
      Alert.alert("Error", "Failed to resume goal");
    }
  };

  const handleEditContribution = (contribution: GoalContribution) => {
    setSelectedContribution(contribution);
    setIsEditContributionModalVisible(true);
  };

  const handleDeleteContribution = (contributionId: string) => {
    setDeleteContributionId(contributionId);
    setDeleteModalVisible(true);
  };

  const handleConfirmDeleteContribution = async () => {
    if (!goalId || !deleteContributionId) return;

    try {
      setDeleteModalVisible(false);
      await deleteContribution(goalId, deleteContributionId);
      setDeleteContributionId(null);
    } catch (error) {
      Alert.alert("Error", "Failed to delete contribution");
    }
  };

  const handleCancelDeleteContribution = () => {
    setDeleteModalVisible(false);
    setDeleteContributionId(null);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return colors.success;
    if (percentage >= 75) return colors.primary;
    if (percentage >= 50) return colors.warning;
    return colors.error;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "#EF4444";
      case "MEDIUM":
        return "#F59E0B";
      case "LOW":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  if (isLoading && !goal) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          ...(isDark ? [styles.containerDark] : []),
        ]}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? colors.text.white : colors.text.primary}
        />
      </View>
    );
  }

  if (error || !goal) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          ...(isDark ? [styles.containerDark] : []),
        ]}
      >
        <Typography style={isDark ? styles.errorTextDark : styles.errorText}>
          {error || "Goal not found"}
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

  const progressPercentage = goal.progressPercentage || 0;
  const remainingAmount = goal.targetAmount - goal.currentAmount;

  return (
    <View style={[styles.container, ...(isDark ? [styles.containerDark] : [])]}>
      <Header
        title="Goal Details"
        showBack
        onBackPress={() => router.back()}
        isDark={isDark}
        rightIcons={[
          {
            icon: "edit",
            onPress: () =>
              router.push(`/screens/Goals/EditGoal?goalId=${goal.id}` as any),
          },
        ]}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? colors.text.white : colors.text.primary}
          />
        }
      >
        {/* Goal Overview Card */}
        <Card
          isDark={isDark}
          style={styles.overviewCard}
        >
          <View style={styles.headerSection}>
            <Typography
              variant="h2"
              style={[
                styles.goalTitle,
                ...(isDark ? [styles.goalTitleDark] : []),
              ]}
            >
              {goal.name}
            </Typography>
            <Badge
              variant="custom"
              customColor={getPriorityColor(goal.priority)}
              size="small"
            >
              {goal.priority} Priority
            </Badge>
          </View>

          {goal.description && (
            <Typography
              variant="body1"
              style={[
                styles.description,
                ...(isDark ? [styles.descriptionDark] : []),
              ]}
            >
              {goal.description}
            </Typography>
          )}

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.amountsRow}>
              <View style={styles.amountItem}>
                <Typography
                  variant="caption"
                  style={[
                    styles.amountLabel,
                    ...(isDark ? [styles.amountLabelDark] : []),
                  ]}
                >
                  Current Amount
                </Typography>
                <Typography
                  variant="h3"
                  style={[styles.amountValue, styles.currentAmount]}
                >
                  ${formatNumber(goal.currentAmount, 2)}
                </Typography>
              </View>

              <View style={styles.amountItem}>
                <Typography
                  variant="caption"
                  style={[
                    styles.amountLabel,
                    ...(isDark ? [styles.amountLabelDark] : []),
                  ]}
                >
                  Target Amount
                </Typography>
                <Typography
                  variant="h3"
                  style={[
                    styles.amountValue,
                    ...(isDark ? [styles.amountValueDark] : []),
                  ]}
                >
                  ${formatNumber(goal.targetAmount, 2)}
                </Typography>
              </View>

              <View style={styles.amountItem}>
                <Typography
                  variant="caption"
                  style={[
                    styles.amountLabel,
                    ...(isDark ? [styles.amountLabelDark] : []),
                  ]}
                >
                  Remaining
                </Typography>
                <Typography
                  variant="h3"
                  style={[
                    styles.amountValue,
                    remainingAmount > 0
                      ? styles.remainingAmount
                      : styles.overAmount,
                  ]}
                >
                  ${formatNumber(Math.abs(remainingAmount), 2)}
                </Typography>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` },
                  { backgroundColor: getProgressColor(progressPercentage) },
                ]}
              />
            </View>

            <Typography
              variant="caption"
              style={[
                styles.progressText,
                ...(isDark ? [styles.progressTextDark] : []),
              ]}
            >
              {progressPercentage.toFixed(1)}% complete
            </Typography>
          </View>

          {/* Goal Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Typography
                variant="body2"
                style={[
                  styles.detailLabel,
                  ...(isDark ? [styles.detailLabelDark] : []),
                ]}
              >
                Status:
              </Typography>
              <Badge
                variant="custom"
                customColor={goal.status.color}
                size="small"
              >
                {goal.status.name}
              </Badge>
            </View>

            {goal.targetDate && (
              <View style={styles.detailRow}>
                <Typography
                  variant="body2"
                  style={[
                    styles.detailLabel,
                    ...(isDark ? [styles.detailLabelDark] : []),
                  ]}
                >
                  Target Date:
                </Typography>
                <Typography
                  variant="body2"
                  style={[
                    styles.detailValue,
                    ...(isDark ? [styles.detailValueDark] : []),
                  ]}
                >
                  {new Date(goal.targetDate).toLocaleDateString()}
                </Typography>
              </View>
            )}

            <View style={styles.detailRow}>
              <Typography
                variant="body2"
                style={[
                  styles.detailLabel,
                  ...(isDark ? [styles.detailLabelDark] : []),
                ]}
              >
                Created:
              </Typography>
              <Typography
                variant="body2"
                style={[
                  styles.detailValue,
                  ...(isDark ? [styles.detailValueDark] : []),
                ]}
              >
                {new Date(goal.createdAt).toLocaleDateString()}
              </Typography>
            </View>
          </View>
        </Card>

        {/* Recent Contributions */}
        {goal.contributions && goal.contributions.length > 0 && (
          <Card
            isDark={isDark}
            style={styles.contributionsCard}
          >
            <View style={styles.sectionHeader}>
              <Typography
                variant="h3"
                style={[
                  styles.sectionTitle,
                  ...(isDark ? [styles.sectionTitleDark] : []),
                ]}
              >
                Contributions
              </Typography>
            </View>

            {goal.contributions.map((contribution) => (
              <View
                key={contribution.id}
                style={styles.contributionItem}
              >
                <View style={styles.contributionInfo}>
                  <Typography
                    variant="body2"
                    style={[
                      styles.contributionAmount,
                      ...(isDark ? [styles.contributionAmountDark] : []),
                    ]}
                  >
                    +${formatNumber(contribution.amount, 2)}
                  </Typography>
                  {contribution.description && (
                    <Typography
                      variant="caption"
                      style={[
                        styles.contributionDescription,
                        ...(isDark ? [styles.contributionDescriptionDark] : []),
                      ]}
                    >
                      {contribution.description}
                    </Typography>
                  )}
                </View>
                <View style={styles.contributionActions}>
                  <Typography
                    variant="caption"
                    style={[
                      styles.contributionDate,
                      ...(isDark ? [styles.contributionDateDark] : []),
                    ]}
                  >
                    {new Date(contribution.date).toLocaleDateString()}
                  </Typography>
                  {!goal.status.isCompleted && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        onPress={() => handleEditContribution(contribution)}
                        style={styles.contributionActionButton}
                      >
                        <Typography
                          variant="caption"
                          style={styles.editButton}
                        >
                          Edit
                        </Typography>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleDeleteContribution(contribution.id)
                        }
                        style={styles.contributionActionButton}
                      >
                        <Typography
                          variant="caption"
                          style={styles.deleteButton}
                        >
                          Delete
                        </Typography>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {goal.contributions.length > 5 && (
              <Typography
                variant="caption"
                style={[
                  styles.moreContributions,
                  ...(isDark ? [styles.moreContributionsDark] : []),
                ]}
              >
                And {goal.contributions.length - 5} more contributions...
              </Typography>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {!goal.status.isPaused && !goal.status.isCompleted && (
            <Button
              onPress={handleAddContribution}
              style={styles.actionButton}
            >
              Add Contribution
            </Button>
          )}

          {!goal.status.isCompleted && (
            <Button
              onPress={
                goal.status.isPaused ? handleResumeGoal : handlePauseGoal
              }
              variant="outline"
              style={styles.actionButton}
            >
              {goal.status.isPaused ? "Resume Goal" : "Pause Goal"}
            </Button>
          )}

          <Button
            onPress={() =>
              router.push(`/screens/Goals/EditGoal?goalId=${goal.id}` as any)
            }
            variant="outline"
            style={styles.actionButton}
          >
            Edit Goal
          </Button>
          <Button
            onPress={handleDelete}
            variant="danger"
            style={styles.actionButton}
          >
            Delete Goal
          </Button>
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={deleteModalVisible}
        title={deleteContributionId ? "Delete Contribution" : "Delete Goal"}
        message={
          deleteContributionId
            ? "Are you sure you want to delete this contribution? This will update your goal progress."
            : `Are you sure you want to delete "${goal?.name}"? This action cannot be undone.`
        }
        onConfirm={
          deleteContributionId
            ? handleConfirmDeleteContribution
            : handleConfirmDelete
        }
        onCancel={
          deleteContributionId
            ? handleCancelDeleteContribution
            : handleCancelDelete
        }
        isDark={isDark}
        destructive
      />

      <AddContributionModal
        visible={isAddContributionModalVisible}
        onClose={() => setIsAddContributionModalVisible(false)}
        goalId={goal.id}
        goalName={goal.name}
      />

      <EditContributionModal
        visible={isEditContributionModalVisible}
        onClose={() => {
          setIsEditContributionModalVisible(false);
          setSelectedContribution(null);
        }}
        goalId={goal.id}
        goalName={goal.name}
        contribution={selectedContribution}
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
  scrollView: {
    flex: 1,
  },
  overviewCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  goalTitleDark: {
    color: colors.text.white,
  },
  description: {
    color: colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  descriptionDark: {
    color: "#9CA3AF",
  },
  progressSection: {
    marginBottom: 16,
  },
  amountsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  amountItem: {
    alignItems: "center",
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  amountLabelDark: {
    color: "#9CA3AF",
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  amountValueDark: {
    color: colors.text.white,
  },
  currentAmount: {
    color: colors.success,
  },
  remainingAmount: {
    color: colors.primary,
  },
  overAmount: {
    color: colors.error,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
  },
  progressTextDark: {
    color: "#9CA3AF",
  },
  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    color: colors.text.secondary,
  },
  detailLabelDark: {
    color: "#9CA3AF",
  },
  detailValue: {
    color: colors.text.primary,
    fontWeight: "500",
  },
  detailValueDark: {
    color: colors.text.white,
  },
  contributionsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  sectionTitleDark: {
    color: colors.text.white,
  },
  contributionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contributionInfo: {
    flex: 1,
  },
  contributionAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.success,
  },
  contributionAmountDark: {
    color: "#34D399",
  },
  contributionDescription: {
    color: colors.text.secondary,
    marginTop: 2,
  },
  contributionDescriptionDark: {
    color: "#9CA3AF",
  },
  contributionDate: {
    color: colors.text.secondary,
  },
  contributionDateDark: {
    color: "#9CA3AF",
  },
  contributionActions: {
    alignItems: "flex-end",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  contributionActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButton: {
    color: colors.primary,
    fontWeight: "500",
  },
  deleteButton: {
    color: colors.error,
    fontWeight: "500",
  },
  moreContributions: {
    textAlign: "center",
    marginTop: 12,
    color: colors.text.secondary,
  },
  moreContributionsDark: {
    color: "#9CA3AF",
  },
  actionsSection: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginBottom: 16,
  },
  errorTextDark: {
    color: "#F87171",
  },
  backButton: {
    minWidth: 120,
  },
});

export default GoalDetails;
