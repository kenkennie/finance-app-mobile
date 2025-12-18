import React from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "../../../shared/components/ui/Card";
import { Typography } from "../../../shared/components/ui/Typography";
import { OverallBudgetStats } from "@/shared/types/budget.types";
import { colors } from "@/theme/colors";
import { spacing, borderRadius } from "@/theme/spacing";

interface BudgetOverviewStatsProps {
  stats: OverallBudgetStats;
  isDark?: boolean;
}

const BudgetOverviewStats: React.FC<BudgetOverviewStatsProps> = ({
  stats,
  isDark = false,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KSh",
    }).format(amount);
  };

  const getUtilizationColor = () => {
    const percentage = stats.utilizationPercentage;
    if (percentage >= 100) return colors.error;
    if (percentage >= 90) return colors.warning;
    if (percentage >= 75) return colors.primary;
    return colors.success;
  };

  return (
    <Card
      isDark={isDark}
      style={styles.card}
    >
      <Typography
        variant="h3"
        weight="semibold"
        style={[styles.title, ...(isDark ? [styles.titleDark] : [])]}
      >
        Budget Overview
      </Typography>

      {/* Summary Stats */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Typography
            variant="caption"
            style={[
              styles.summaryLabel,
              ...(isDark ? [styles.summaryLabelDark] : []),
            ]}
          >
            Total Budgets
          </Typography>
          <Typography
            variant="h2"
            weight="semibold"
            style={[
              styles.summaryValue,
              ...(isDark ? [styles.summaryValueDark] : []),
            ]}
          >
            {stats.totalBudgets}
          </Typography>
          <Typography
            variant="caption"
            style={[
              styles.summarySubtext,
              ...(isDark ? [styles.summarySubtextDark] : []),
            ]}
          >
            {stats.activeBudgets} active
          </Typography>
        </View>

        <View style={styles.summaryItem}>
          <Typography
            variant="caption"
            style={[
              styles.summaryLabel,
              ...(isDark ? [styles.summaryLabelDark] : []),
            ]}
          >
            Total Allocated
          </Typography>
          <Typography
            variant="h2"
            weight="semibold"
            style={[
              styles.summaryValue,
              ...(isDark ? [styles.summaryValueDark] : []),
            ]}
          >
            {formatCurrency(stats.totalAllocated)}
          </Typography>
        </View>

        <View style={styles.summaryItem}>
          <Typography
            variant="caption"
            style={[
              styles.summaryLabel,
              ...(isDark ? [styles.summaryLabelDark] : []),
            ]}
          >
            Total Spent
          </Typography>
          <Typography
            variant="h2"
            weight="semibold"
            style={[
              styles.summaryValue,
              ...(isDark ? [styles.summaryValueDark] : []),
            ]}
          >
            {formatCurrency(stats.totalSpent)}
          </Typography>
        </View>

        <View style={styles.summaryItem}>
          <Typography
            variant="caption"
            style={[
              styles.summaryLabel,
              ...(isDark ? [styles.summaryLabelDark] : []),
            ]}
          >
            Remaining
          </Typography>
          <Typography
            variant="h2"
            weight="semibold"
            style={[
              styles.summaryValue,
              ...(isDark ? [styles.summaryValueDark] : []),
              {
                color:
                  stats.totalRemaining >= 0 ? colors.success : colors.error,
              },
            ]}
          >
            {formatCurrency(stats.totalRemaining)}
          </Typography>
        </View>
      </View>

      {/* Overall Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Typography
            variant="body2"
            weight="semibold"
            style={[
              styles.progressTitle,
              ...(isDark ? [styles.progressTitleDark] : []),
            ]}
          >
            Overall Utilization
          </Typography>
          <Typography
            variant="body2"
            style={[
              styles.progressPercent,
              ...(isDark ? [styles.progressPercentDark] : []),
            ]}
          >
            {stats.utilizationPercentage.toFixed(1)}%
          </Typography>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(stats.utilizationPercentage, 100)}%`,
                backgroundColor: getUtilizationColor(),
              },
            ]}
          />
        </View>
      </View>

      {/* Category Status */}
      <View style={styles.categorySection}>
        <Typography
          variant="body2"
          weight="semibold"
          style={[
            styles.sectionTitle,
            ...(isDark ? [styles.sectionTitleDark] : []),
          ]}
        >
          Category Status ({stats.totalCategories} total)
        </Typography>

        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <View style={styles.statusIndicator}>
              <View
                style={[styles.statusDot, { backgroundColor: colors.success }]}
              />
              <Typography
                variant="caption"
                style={[
                  styles.statusText,
                  ...(isDark ? [styles.statusTextDark] : []),
                ]}
              >
                On Track
              </Typography>
            </View>
            <Typography
              variant="h3"
              weight="semibold"
              style={[
                styles.statusNumber,
                ...(isDark ? [styles.statusNumberDark] : []),
              ]}
            >
              {stats.categoriesOnTrack}
            </Typography>
          </View>

          <View style={styles.statusItem}>
            <View style={styles.statusIndicator}>
              <View
                style={[styles.statusDot, { backgroundColor: colors.warning }]}
              />
              <Typography
                variant="caption"
                style={[
                  styles.statusText,
                  ...(isDark ? [styles.statusTextDark] : []),
                ]}
              >
                Warning
              </Typography>
            </View>
            <Typography
              variant="h3"
              weight="semibold"
              style={[
                styles.statusNumber,
                ...(isDark ? [styles.statusNumberDark] : []),
              ]}
            >
              {stats.categoriesWarning}
            </Typography>
          </View>

          <View style={styles.statusItem}>
            <View style={styles.statusIndicator}>
              <View
                style={[styles.statusDot, { backgroundColor: colors.error }]}
              />
              <Typography
                variant="caption"
                style={[
                  styles.statusText,
                  ...(isDark ? [styles.statusTextDark] : []),
                ]}
              >
                Exceeded
              </Typography>
            </View>
            <Typography
              variant="h3"
              weight="semibold"
              style={[
                styles.statusNumber,
                ...(isDark ? [styles.statusNumberDark] : []),
              ]}
            >
              {stats.categoriesExceeded}
            </Typography>
          </View>
        </View>
      </View>
    </Card>
  );
};

export { BudgetOverviewStats };
export default BudgetOverviewStats;

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  titleDark: {
    color: colors.text.white,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.lg,
  },
  summaryItem: {
    width: "50%",
    marginBottom: spacing.md,
  },
  summaryLabel: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryLabelDark: {
    color: colors.text.white,
  },
  summaryValue: {
    color: colors.text.primary,
    fontSize: 20,
  },
  summaryValueDark: {
    color: colors.text.white,
  },
  summarySubtext: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  summarySubtextDark: {
    color: colors.text.white,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  progressTitle: {
    color: colors.text.primary,
  },
  progressTitleDark: {
    color: colors.text.white,
  },
  progressPercent: {
    color: colors.text.primary,
    fontWeight: "600",
  },
  progressPercentDark: {
    color: colors.text.white,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: borderRadius.sm,
  },
  categorySection: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionTitleDark: {
    color: colors.text.white,
  },
  statusGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusItem: {
    alignItems: "center",
    flex: 1,
  },
  statusIndicator: {
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  statusText: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  statusTextDark: {
    color: colors.text.white,
  },
  statusNumber: {
    color: colors.text.primary,
    fontSize: 24,
  },
  statusNumberDark: {
    color: colors.text.white,
  },
});
