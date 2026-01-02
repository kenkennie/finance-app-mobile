import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Goal } from "@/shared/types/goal.types";
import { colors } from "@/theme/colors";

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
  onLongPress?: () => void;
  isDark: boolean;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onPress,
  onLongPress,
  isDark = false,
}) => {
  const progressPercentage = goal.progressPercentage || 0;
  const remainingAmount = goal.remainingAmount || 0;

  const getProgressBarColor = () => {
    if (progressPercentage >= 100) return colors.success;
    if (progressPercentage >= 75) return colors.primary;
    if (progressPercentage >= 50) return colors.warning;
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

  const getRemainingAmountColor = () => {
    if (remainingAmount >= 0) return colors.primary;
    return colors.error;
  };

  return (
    <Card
      onPress={onPress}
      onLongPress={onLongPress}
      isDark={isDark}
      style={styles.container}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text
            style={[styles.title, isDark && styles.titleDark]}
            numberOfLines={1}
          >
            {goal.name}
          </Text>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(goal.priority) },
            ]}
          >
            <Text style={styles.priorityText}>{goal.priority}</Text>
          </View>
        </View>
      </View>

      {/* Goal Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
            Current
          </Text>
          <Text style={[styles.statValue, isDark && styles.statValueDark]}>
            {goal.formattedCurrentAmount}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
            Target
          </Text>
          <Text style={[styles.statValue, isDark && styles.statValueDark]}>
            {goal.formattedTargetAmount}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
            {remainingAmount >= 0 ? "Remaining" : "Over"}
          </Text>
          <Text
            style={[
              styles.statValue,
              { color: getRemainingAmountColor() },
              isDark && styles.statValueDark,
            ]}
          >
            {goal.formattedRemainingAmount}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(progressPercentage, 100)}%`,
                backgroundColor: getProgressBarColor(),
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
          {progressPercentage.toFixed(1)}% complete
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dateInfo}>
          <Feather
            name="calendar"
            size={14}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
          <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
            {goal.formattedTargetDate || "No target date"}
          </Text>
        </View>
        <Badge
          variant="custom"
          customColor={goal.status.color}
          size="small"
        >
          {goal.status.name}
        </Badge>
      </View>
    </Card>
  );
};

export { GoalCard };
export default GoalCard;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  titleDark: {
    color: colors.text.white,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
    textAlign: "center",
  },
  statLabelDark: {
    color: "#9CA3AF",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  statValueDark: {
    color: colors.text.white,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "right",
  },
  progressTextDark: {
    color: colors.text.white,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  dateTextDark: {
    color: "#9CA3AF",
  },
});
