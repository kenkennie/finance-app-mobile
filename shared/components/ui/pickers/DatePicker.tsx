import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Input } from "../Input";
import { Typography } from "../Typography";
import { useTheme } from "@/theme/context/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DatePickerProps {
  value: Date | string;
  onChange: (date: Date) => void;
  error?: string;
  label?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  error,
  label,
}) => {
  const { isDark } = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    if (value) {
      const parsedDate = value instanceof Date ? value : new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate);
      }
    }
  }, [value]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      // Set current time when date is selected
      const now = new Date();
      newDate.setHours(now.getHours());
      newDate.setMinutes(now.getMinutes());
      setDate(newDate);
      onChange(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
      onChange(newDate);
    }
  };

  const showDateSelection = () => {
    setShowDatePicker(true);
  };

  const showTimeSelection = () => {
    setShowTimePicker(true);
  };

  const displayValue = value ? formatDate(date) : "";

  return (
    <View style={styles.container}>
      {label && (
        <Typography style={[styles.label, isDark && styles.labelDark]}>
          {label}
        </Typography>
      )}
      <View style={styles.inputRow}>
        <TouchableOpacity
          onPress={showDateSelection}
          style={[styles.dateInput, styles.datePart]}
        >
          <Input
            value={displayValue.split(" ")[0] || ""}
            placeholder="Select date"
            editable={false}
            error={error}
            rightIcon="calendar"
            onRightIconPress={showDateSelection}
            isDark={isDark}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={showTimeSelection}
          style={[styles.dateInput, styles.timePart]}
        >
          <Input
            value={displayValue.split(" ")[1] || ""}
            placeholder="Select time"
            editable={false}
            rightIcon="clock"
            onRightIconPress={showTimeSelection}
            isDark={isDark}
          />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date(2030, 11, 31)}
          minimumDate={new Date(2023, 0, 1)}
          themeVariant={isDark ? "dark" : "light"}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={handleTimeChange}
          maximumDate={new Date(2030, 11, 31)}
          minimumDate={new Date(2023, 0, 1)}
          themeVariant={isDark ? "dark" : "light"}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  labelDark: {
    color: "#D1D5DB",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  dateInput: {
    flex: 1,
  },
  datePart: {
    // Date input specific styles if needed
  },
  timePart: {
    // Time input specific styles if needed
  },
});

export default DatePicker;
