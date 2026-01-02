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
  addYears,
} from "date-fns";
import { Typography } from "../Typography";
import DatePicker from "./DatePicker";
import { useTheme } from "@/theme/context/ThemeContext";

interface DateSelectorProps {
  value?: Date | string;
  onChange: (date: Date) => void;
  label?: string;
  error?: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  value,
  onChange,
  label,
  error,
}) => {
  const { isDark } = useTheme();
  const [selectedMode, setSelectedMode] = useState<
    | "Today"
    | "End of Week"
    | "End of Month"
    | "3 Months"
    | "6 Months"
    | "End of Year"
    | "Custom"
  >("Custom");

  const presets = [
    "Today",
    "End of Week",
    "End of Month",
    "3 Months",
    "6 Months",
    "End of Year",
    "Custom",
  ];

  const handlePresetSelect = (mode: typeof selectedMode) => {
    setSelectedMode(mode);
    if (mode !== "Custom") {
      const now = new Date();
      let selectedDate: Date;

      switch (mode) {
        case "Today":
          selectedDate = startOfDay(now);
          break;
        case "End of Week":
          selectedDate = endOfWeek(now, { weekStartsOn: 1 }); // Monday start
          break;
        case "End of Month":
          selectedDate = endOfMonth(now);
          break;
        case "End of Year":
          selectedDate = endOfYear(now);
          break;
        default:
          return;
      }

      onChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Typography style={[styles.label, isDark && styles.labelDark]}>
          {label}
        </Typography>
      )}
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
        <DatePicker
          value={value}
          onChange={onChange}
          error={error}
          showTime={false}
        />
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
});

export default DateSelector;
