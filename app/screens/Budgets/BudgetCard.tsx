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
  categoryStats = [],
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const totalAllocated = budget.amount;
  const totalSpent = spentAmount;
  const remainingAmount = totalAllocated - totalSpent;
  const utilizationPercentage =
    totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  const getProgressBarColor = () => {
    if (utilizationPercentage > 100) return colors.error;
    if (utilizationPercentage > 80) return colors.warning;
    return colors.primary;
  };

  const getRemainingAmountColor = () => {
    if (remainingAmount >= 0) return colors.success;
    return colors.error;
  };

  // Get top 3 categories by allocation for display
  const topCategories = categoryStats
    .sort((a, b) => b.allocatedAmount - a.allocatedAmount)
    .slice(0, 3);

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
            customColor={
              budget.isActive ? colors.success : colors.text.secondary
            }
            size="small"
          >
            {budget.isActive ? "Active" : "Inactive"}
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
            {formatCurrency(totalAllocated)}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
            Spent
          </Text>
          <Text style={[styles.statValue, isDark && styles.statValueDark]}>
            {formatCurrency(totalSpent)}
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
            {formatCurrency(remainingAmount)}
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
                width: `${Math.min(utilizationPercentage, 100)}%`,
                backgroundColor: getProgressBarColor(),
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
          {utilizationPercentage.toFixed(1)}% used
        </Text>
      </View>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <View style={styles.categoriesSection}>
          <Text
            style={[
              styles.categoriesTitle,
              isDark && styles.categoriesTitleDark,
            ]}
          >
            Top Categories
          </Text>
          <View style={styles.categoriesList}>
            {topCategories.map((category, index) => (
              <View
                key={category.categoryId}
                style={styles.categoryItem}
              >
                <View style={styles.categoryInfo}>
                  <Text
                    style={[
                      styles.categoryName,
                      isDark && styles.categoryNameDark,
                    ]}
                    numberOfLines={1}
                  >
                    {category.categoryName}
                  </Text>
                  <Text
                    style={[
                      styles.categoryAmount,
                      isDark && styles.categoryAmountDark,
                    ]}
                  >
                    {formatCurrency(category.allocatedAmount)}
                  </Text>
                </View>
                <View style={styles.categoryProgress}>
                  <View style={styles.categoryProgressBar}>
                    <View
                      style={[
                        styles.categoryProgressFill,
                        {
                          width: `${Math.min(category.percentageUsed, 100)}%`,
                          backgroundColor: category.isOverBudget
                            ? colors.error
                            : colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryPercentage,
                      isDark && styles.categoryPercentageDark,
                    ]}
                  >
                    {category.percentageUsed.toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dateInfo}>
          <Feather
            name="calendar"
            size={14}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
          <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
            {formatDate(budget.startDate)}
            {budget.endDate && ` - ${formatDate(budget.endDate)}`}
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
  categoriesSection: {
    marginBottom: 16,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  categoriesTitleDark: {
    color: colors.text.white,
  },
  categoriesList: {
    gap: 8,
  },
  categoryItem: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 8,
  },
  categoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
    marginRight: 8,
  },
  categoryNameDark: {
    color: "#9CA3AF",
  },
  categoryAmount: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
  },
  categoryAmountDark: {
    color: colors.text.white,
  },
  categoryProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  categoryProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  categoryPercentage: {
    fontSize: 10,
    color: colors.text.secondary,
    minWidth: 24,
    textAlign: "right",
  },
  categoryPercentageDark: {
    color: "#9CA3AF",
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
