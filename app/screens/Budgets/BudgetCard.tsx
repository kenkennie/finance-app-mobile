import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Budget } from "@/shared/types/budget.types";
import { colors } from "@/theme/colors";

interface BudgetCardProps {
  budget: Budget;
  onPress?: () => void;
  onLongPress?: () => void;
  isDark: boolean;
  spentAmount?: number;
  totalAllocated?: number;
  totalRemaining?: number;
  overallPercentageUsed?: number;
  currency?: string;
  formattedEndDate?: string;
  formattedStartDate?: string;
  categoryStats?: {
    categoryId: string;
    categoryName: string;
    allocatedAmount: number;
    spentAmount: number;
    percentageUsed: number;
    isOverBudget: boolean;
  }[];
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onPress,
  onLongPress,
  isDark = false,
  spentAmount = 0,
  totalAllocated = 0,
  totalRemaining = 0,
  overallPercentageUsed = 0,
}) => {
  const getProgressBarColor = () => {
    if (overallPercentageUsed > 100) return colors.error;
    if (overallPercentageUsed > 80) return colors.warning;
    return colors.primary;
  };

  const getRemainingAmountColor = () => {
    if (totalRemaining >= 0) return colors.success;
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
            {budget.name}
          </Text>
          <Badge
            variant="custom"
            customColor={budget.status?.color || colors.text.secondary}
            size="small"
          >
            {budget.status?.name || "Unknown"}
          </Badge>
        </View>
      </View>

      {/* Budget Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
            Allocated
          </Text>
          <Text style={[styles.statValue, isDark && styles.statValueDark]}>
            {totalAllocated}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
            Spent
          </Text>
          <Text style={[styles.statValue, isDark && styles.statValueDark]}>
            {spentAmount}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
            Remaining
          </Text>
          <Text
            style={[
              styles.statValue,
              { color: getRemainingAmountColor() },
              isDark && styles.statValueDark,
            ]}
          >
            {totalRemaining}
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
                width: `${Math.min(overallPercentageUsed, 100)}%`,
                backgroundColor: getProgressBarColor(),
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
          {overallPercentageUsed}% used
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
            {budget.formattedStartDate}
            {budget.formattedEndDate && ` - ${budget.formattedEndDate}`}
          </Text>
        </View>
        <Text
          style={[styles.categoriesCount, isDark && styles.categoriesCountDark]}
        >
          {budget.budgetCategories?.length || 0} categories
        </Text>
      </View>
    </Card>
  );
};

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
  categoriesCount: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  categoriesCountDark: {
    color: "#9CA3AF",
  },
});
