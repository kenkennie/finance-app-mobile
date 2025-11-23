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
  const [showPicker, setShowPicker] = useState(false);
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
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
      onChange(selectedDate);
    }
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  const displayValue = value ? formatDate(date) : "";

  return (
    <View style={styles.container}>
      {label && (
        <Typography style={[styles.label, isDark && styles.labelDark]}>
          {label}
        </Typography>
      )}
      <TouchableOpacity
        onPress={showDatePicker}
        style={styles.dateInput}
      >
        <Input
          value={displayValue}
          placeholder="Select date"
          editable={false}
          error={error}
          rightIcon="calendar"
          onRightIconPress={showDatePicker}
          isDark={isDark}
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date(2030, 11, 31)}
          minimumDate={new Date(2000, 0, 1)}
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
  dateInput: {
    // Style for the touchable container if needed
  },
});

export default DatePicker;
