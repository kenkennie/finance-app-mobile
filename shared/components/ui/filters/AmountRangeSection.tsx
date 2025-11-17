import { FilterState } from "@/shared/types/filter.types";
import React, { useCallback } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Typography } from "../Typography";
import { colors } from "@/theme/colors";
import { borderRadius, spacing, typography } from "@/theme/spacing";

interface AmountRangeSectionProps {
  filters: FilterState;
  onUpdate: (updates: Partial<FilterState>) => void;
}

// eslint-disable-next-line react/display-name
export const AmountRangeSection: React.FC<AmountRangeSectionProps> = React.memo(
  ({ filters, onUpdate }) => {
    const presets = [
      { label: "Under $10", min: 0, max: 10 },
      { label: "$10-$50", min: 10, max: 50 },
      { label: "$50-$100", min: 50, max: 100 },
      { label: "$100-$500", min: 100, max: 500 },
      { label: "$500+", min: 500, max: null },
    ];

    const handlePresetSelect = useCallback(
      (min: number, max: number | null) => {
        onUpdate({
          amountRange: { min, max },
        });
      },
      [onUpdate]
    );

    const handleMinChange = useCallback(
      (text: string) => {
        const value = text === "" ? null : parseFloat(text);
        onUpdate({
          amountRange: { ...filters.amountRange, min: value },
        });
      },
      [filters.amountRange, onUpdate]
    );

    const handleMaxChange = useCallback(
      (text: string) => {
        const value = text === "" ? null : parseFloat(text);
        onUpdate({
          amountRange: { ...filters.amountRange, max: value },
        });
      },
      [filters.amountRange, onUpdate]
    );

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography
            variant="body1"
            weight="semibold"
          >
            Amount Range
          </Typography>
          <TouchableOpacity
            onPress={() => onUpdate({ amountRange: { min: null, max: null } })}
          >
            <Typography
              variant="body2"
              color={colors.primary}
            >
              Reset
            </Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Typography
              variant="body2"
              color={colors.gray[500]}
              style={styles.inputLabel}
            >
              Min Amount
            </Typography>
            <View style={styles.amountInput}>
              <Typography
                variant="body1"
                color={colors.gray[500]}
              >
                $
              </Typography>
              <TextInput
                style={styles.textInput}
                placeholder="0.00"
                placeholderTextColor={colors.gray[400]}
                keyboardType="decimal-pad"
                value={filters.amountRange.min?.toString() || ""}
                onChangeText={handleMinChange}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Typography
              variant="body2"
              color={colors.gray[500]}
              style={styles.inputLabel}
            >
              Max Amount
            </Typography>
            <View style={styles.amountInput}>
              <Typography
                variant="body1"
                color={colors.gray[500]}
              >
                $
              </Typography>
              <TextInput
                style={styles.textInput}
                placeholder="No limit"
                placeholderTextColor={colors.gray[400]}
                keyboardType="decimal-pad"
                value={filters.amountRange.max?.toString() || ""}
                onChangeText={handleMaxChange}
              />
            </View>
          </View>
        </View>

        <Typography
          variant="body2"
          weight="semibold"
          color={colors.gray[600]}
          style={styles.presetsLabel}
        >
          Quick Presets
        </Typography>
        <View style={styles.presetGrid}>
          {presets.map((preset, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.presetButton,
                filters.amountRange.min === preset.min &&
                  filters.amountRange.max === preset.max &&
                  styles.presetButtonActive,
              ]}
              onPress={() => handlePresetSelect(preset.min, preset.max)}
            >
              <Typography
                variant="body2"
                weight="medium"
                color={
                  filters.amountRange.min === preset.min &&
                  filters.amountRange.max === preset.max
                    ? colors.text.white
                    : colors.gray[700]
                }
              >
                {preset.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    marginBottom: spacing.sm,
  },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.primary,
    paddingVertical: spacing.md,
  },
  presetsLabel: {
    marginBottom: spacing.sm,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  presetButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
