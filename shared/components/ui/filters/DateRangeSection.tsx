import { FilterState } from "@/shared/types/filter.types";
import { getDateRangeFromPreset } from "@/shared/utils/filterTransactions";
import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Typography } from "../Typography";
import { colors } from "@/theme/colors";
import { borderRadius, spacing } from "@/theme/spacing";
import { Calendar, DateData } from "react-native-calendars";

interface DateRangeSectionProps {
  filters: FilterState;
  onUpdate: (updates: Partial<FilterState>) => void;
}

// eslint-disable-next-line react/display-name
export const DateRangeSection: React.FC<DateRangeSectionProps> = React.memo(
  ({ filters, onUpdate }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarMode, setCalendarMode] = useState<"start" | "end">("start");

    const presets = [
      { label: "Today", value: "today" },
      { label: "Yesterday", value: "yesterday" },
      { label: "This Week", value: "thisWeek" },
      { label: "This Month", value: "thisMonth" },
      { label: "Last Month", value: "lastMonth" },
      { label: "Last 3 Months", value: "last3Months" },
      { label: "This Year", value: "thisYear" },
      { label: "Last Year", value: "lastYear" },
    ];

    const handlePresetSelect = useCallback(
      (preset: string) => {
        const { start, end } = getDateRangeFromPreset(preset);
        onUpdate({
          dateRange: {
            preset: preset as any,
            startDate: start,
            endDate: end,
          },
        });
      },
      [onUpdate]
    );

    const handleDateSelect = useCallback(
      (date: DateData) => {
        const selectedDate = new Date(date.dateString);

        if (calendarMode === "start") {
          onUpdate({
            dateRange: {
              preset: "custom",
              startDate: selectedDate,
              endDate: filters.dateRange.endDate,
            },
          });
        } else {
          onUpdate({
            dateRange: {
              preset: "custom",
              startDate: filters.dateRange.startDate,
              endDate: selectedDate,
            },
          });
        }
        setShowCalendar(false);
      },
      [calendarMode, filters.dateRange, onUpdate]
    );

    const formatDate = (date: Date | null) => {
      if (!date) return "Select date";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography
            variant="body1"
            weight="semibold"
          >
            Date Range
          </Typography>
          <TouchableOpacity
            onPress={() =>
              onUpdate({
                dateRange: { preset: null, startDate: null, endDate: null },
              })
            }
          >
            <Typography
              variant="body2"
              color={colors.primary}
            >
              Reset
            </Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.presetGrid}>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset.value}
              style={[
                styles.presetButton,
                filters.dateRange.preset === preset.value &&
                  styles.presetButtonActive,
              ]}
              onPress={() => handlePresetSelect(preset.value)}
            >
              <Typography
                variant="body2"
                weight="medium"
                color={
                  filters.dateRange.preset === preset.value
                    ? colors.text.white
                    : colors.gray[700]
                }
              >
                {preset.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.customSection}>
          <Typography
            variant="body2"
            weight="semibold"
            color={colors.gray[600]}
            style={styles.label}
          >
            Custom Range
          </Typography>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => {
              setCalendarMode("start");
              setShowCalendar(true);
            }}
          >
            <Typography
              variant="body2"
              color={colors.gray[500]}
            >
              From:
            </Typography>
            <Typography
              variant="body1"
              weight="medium"
            >
              {formatDate(filters.dateRange.startDate)}
            </Typography>
            <Typography
              variant="body1"
              color={colors.gray[400]}
            >
              📅
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => {
              setCalendarMode("end");
              setShowCalendar(true);
            }}
          >
            <Typography
              variant="body2"
              color={colors.gray[500]}
            >
              To:
            </Typography>
            <Typography
              variant="body1"
              weight="medium"
            >
              {formatDate(filters.dateRange.endDate)}
            </Typography>
            <Typography
              variant="body1"
              color={colors.gray[400]}
            >
              📅
            </Typography>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showCalendar}
          animationType="slide"
          transparent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarModal}>
              <View style={styles.calendarHeader}>
                <Typography
                  variant="h4"
                  weight="bold"
                >
                  Select {calendarMode === "start" ? "Start" : "End"} Date
                </Typography>
                <TouchableOpacity onPress={() => setShowCalendar(false)}>
                  <Typography variant="h4">✕</Typography>
                </TouchableOpacity>
              </View>
              <Calendar
                onDayPress={handleDateSelect}
                markedDates={{
                  [filters.dateRange.startDate?.toISOString().split("T")[0] ||
                  ""]: {
                    selected: true,
                    selectedColor: colors.primary,
                  },
                  [filters.dateRange.endDate?.toISOString().split("T")[0] ||
                  ""]: {
                    selected: true,
                    selectedColor: colors.primary,
                  },
                }}
                theme={{
                  todayTextColor: colors.primary,
                  selectedDayBackgroundColor: colors.primary,
                  arrowColor: colors.primary,
                }}
              />
            </View>
          </View>
        </Modal>
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
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
  customSection: {
    marginTop: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  calendarModal: {
    backgroundColor: colors.text.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.base,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.base,
  },
});
