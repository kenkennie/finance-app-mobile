import { colors } from "@/theme/colors";
import { fontSize, spacing } from "@/theme/spacing";
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: React.ReactNode;
  error?: string;
}

export function Checkbox({ checked, onPress, label, error }: CheckboxProps) {
  return (
    <View>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        {label && <Text style={styles.label}>{label}</Text>}
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    marginLeft: 32,
  },
});
