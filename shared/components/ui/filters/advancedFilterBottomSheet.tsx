import React, { useCallback, useMemo, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { DateRangeSection } from "./DateRangeSection";
import { AmountRangeSection } from "./AmountRangeSection";
import { CategoryMultiSelect } from "./CategoryMultiSelect";
import { FilterState } from "@/shared/types/filter.types";
import { Typography } from "../Typography";
import { colors } from "@/theme/colors";
import { borderRadius, spacing } from "@/theme/spacing";

interface AdvancedFilterBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  filters: FilterState;
  onUpdate: (updates: Partial<FilterState>) => void;
  onApply: () => void;
  onClear: () => void;
  transactionCount: number;
}

export const AdvancedFilterBottomSheet: React.FC<
  AdvancedFilterBottomSheetProps
> = ({
  isVisible,
  onClose,
  filters,
  onUpdate,
  onApply,
  onClear,
  transactionCount,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "90%"], []);

  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(["dateRange"])
  );

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  // Mock categories data
  const mockCategories = useMemo(
    () => [
      {
        id: "cat_1",
        name: "Groceries",
        icon: "🛒",
        type: "expense" as const,
        count: 23,
      },
      {
        id: "cat_2",
        name: "Food & Dining",
        icon: "🍽️",
        type: "expense" as const,
        count: 15,
      },
      {
        id: "cat_3",
        name: "Transportation",
        icon: "🚗",
        type: "expense" as const,
        count: 8,
      },
      {
        id: "cat_4",
        name: "Shopping",
        icon: "🛍️",
        type: "expense" as const,
        count: 12,
      },
      {
        id: "cat_5",
        name: "Entertainment",
        icon: "🎬",
        type: "expense" as const,
        count: 6,
      },
    ],
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography
            variant="h3"
            weight="bold"
          >
            Advanced Filters
          </Typography>
          <TouchableOpacity onPress={onClose}>
            <Typography variant="h4">✕</Typography>
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Range Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection("dateRange")}
            >
              <Typography
                variant="body1"
                weight="semibold"
              >
                {expandedSections.has("dateRange") ? "▼" : "▶"} Date Range
              </Typography>
            </TouchableOpacity>
            {expandedSections.has("dateRange") && (
              <DateRangeSection
                filters={filters}
                onUpdate={onUpdate}
              />
            )}
          </View>

          {/* Amount Range Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection("amountRange")}
            >
              <Typography
                variant="body1"
                weight="semibold"
              >
                {expandedSections.has("amountRange") ? "▼" : "▶"} Amount Range
              </Typography>
            </TouchableOpacity>
            {expandedSections.has("amountRange") && (
              <AmountRangeSection
                filters={filters}
                onUpdate={onUpdate}
              />
            )}
          </View>

          {/* Categories Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection("categories")}
            >
              <Typography
                variant="body1"
                weight="semibold"
              >
                {expandedSections.has("categories") ? "▼" : "▶"} Categories
              </Typography>
            </TouchableOpacity>
            {expandedSections.has("categories") && (
              <CategoryMultiSelect
                filters={filters}
                onUpdate={onUpdate}
                categories={mockCategories}
              />
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </BottomSheetScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.countContainer}>
            <Typography
              variant="body2"
              color={colors.gray[600]}
            >
              {transactionCount} transactions found
            </Typography>
          </View>
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={onClear}
            >
              <Typography
                variant="body1"
                weight="semibold"
                color={colors.gray[700]}
              >
                Clear All
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={onApply}
            >
              <Typography
                variant="body1"
                weight="bold"
                color={colors.text.white}
              >
                Apply Filters
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.text.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  handleIndicator: {
    backgroundColor: colors.gray[300],
    width: 40,
    height: 4,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    paddingVertical: spacing.md,
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.text.white,
  },
  countContainer: {
    marginBottom: spacing.sm,
  },
  footerActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  clearButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
  },
  applyButton: {
    flex: 2,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
  },
});
