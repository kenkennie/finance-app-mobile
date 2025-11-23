import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/context/ThemeContext";
import { Typography } from "./Typography";

interface TransactionTypeSelectorProps {
  value?: "INCOME" | "EXPENSE";
  onChange: (value: "INCOME" | "EXPENSE") => void;
  error?: string;
}

const TransactionTypeSelector: React.FC<TransactionTypeSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Typography style={[styles.label, isDark && styles.labelDark]}>
        Transaction Type
      </Typography>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            value === "INCOME" && styles.buttonActive,
            value === "INCOME" && styles.buttonIncome,
            isDark && styles.buttonDark,
          ]}
          onPress={() => onChange("INCOME")}
        >
          <View style={styles.buttonContent}>
            <Feather
              name="arrow-up"
              size={20}
              color={value === "INCOME" ? "#059669" : "#6B7280"}
            />
            <Typography
              style={
                value === "INCOME" ? styles.buttonTextActive : styles.buttonText
              }
            >
              Income
            </Typography>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            value === "EXPENSE" && styles.buttonActive,
            value === "EXPENSE" && styles.buttonExpense,
            isDark && styles.buttonDark,
          ]}
          onPress={() => onChange("EXPENSE")}
        >
          <View style={styles.buttonContent}>
            <Feather
              name="arrow-down"
              size={20}
              color={value === "EXPENSE" ? "#DC2626" : "#6B7280"}
            />
            <Typography
              style={
                value === "EXPENSE"
                  ? styles.buttonTextActive
                  : styles.buttonText
              }
            >
              Expense
            </Typography>
          </View>
        </TouchableOpacity>
      </View>
      {error && <Typography style={styles.errorText}>{error}</Typography>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  labelDark: {
    color: "#D1D5DB",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  subtitleDark: {
    color: "#9CA3AF",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonActive: {
    borderWidth: 2,
  },
  buttonIncome: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  buttonExpense: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  buttonDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  buttonTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    marginTop: 4,
  },
});

export default TransactionTypeSelector;
