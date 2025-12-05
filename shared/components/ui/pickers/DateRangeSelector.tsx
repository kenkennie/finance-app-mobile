import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addWeeks,
  addMonths,
} from "date-fns";
import { Typography } from "../Typography";
import DatePicker from "./DatePicker";
import { useTheme } from "@/theme/context/ThemeContext";

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string | undefined;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  startError?: string;
  endError?: string;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startError,
  endError,
}) => {
  const { isDark } = useTheme();
  const [selectedMode, setSelectedMode] = useState<
    | "Today"
    | "This Week"
    | "Next Week"
    | "This Month"
    | "Next Month"
    | "This Year"
    | "Custom"
  >("Custom");

  const presets = [
    "Today",
    "This Week",
    "Next Week",
    "This Month",
    "Next Month",
    "This Year",
    "Custom",
  ];

  const handlePresetSelect = (mode: typeof selectedMode) => {
    setSelectedMode(mode);
    if (mode !== "Custom") {
      const now = new Date();
      let start: Date, end: Date;

      switch (mode) {
        case "Today":
          start = startOfDay(now);
          end = endOfDay(now);
          break;
        case "This Week":
          start = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
          end = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case "Next Week":
          start = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
          end = endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
          break;
        case "This Month":
          start = startOfMonth(now);
          end = endOfMonth(now);
          break;
        case "Next Month":
          start = startOfMonth(addMonths(now, 1));
          end = endOfMonth(addMonths(now, 1));
          break;
        case "This Year":
          start = startOfYear(now);
          end = endOfYear(now);
          break;
        default:
          return;
      }

      onStartDateChange(start.toISOString().split("T")[0]);
      onEndDateChange(end.toISOString().split("T")[0]);
    }
  };

  return (
    <View style={styles.container}>
      <Typography style={[styles.label, isDark && styles.labelDark]}>
        Date
      </Typography>
      <View style={styles.presetContainer}>
        {presets.map((preset) => (
          <TouchableOpacity
            key={preset}
            style={[
              styles.presetButton,
              selectedMode === preset && styles.selectedPreset,
              isDark && styles.presetButtonDark,
              selectedMode === preset && isDark && styles.selectedPresetDark,
            ]}
            onPress={() => handlePresetSelect(preset as any)}
          >
            <Typography
              style={[
                styles.presetText,
                selectedMode === preset && styles.selectedPresetText,
                isDark && styles.presetTextDark,
              ]}
            >
              {preset}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
      {selectedMode === "Custom" && (
        <View style={styles.customContainer}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(date) =>
              onStartDateChange(date.toISOString().split("T")[0])
            }
            error={startError}
          />
          <DatePicker
            label="End Date (Optional)"
            value={endDate || ""}
            onChange={(date) =>
              onEndDateChange(date.toISOString().split("T")[0])
            }
            error={endError}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 },
  labelDark: { color: "#D1D5DB" },
  presetContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  presetButtonDark: { borderColor: "#4B5563" },
  selectedPreset: { backgroundColor: "#3B82F6", borderColor: "#3B82F6" },
  selectedPresetDark: { backgroundColor: "#1D4ED8" },
  presetText: { fontSize: 14, color: "#374151" },
  presetTextDark: { color: "#D1D5DB" },
  selectedPresetText: { color: "#FFF" },
  customContainer: { gap: 8 },
});

export default DateRangeSelector;
