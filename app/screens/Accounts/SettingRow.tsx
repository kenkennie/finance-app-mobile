import SwitchButton from "@/shared/components/ui/SwitchButton";
import { useTheme } from "@/theme/context/ThemeContext";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SettingRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}
const SettingRow: React.FC<SettingRowProps> = ({
  label,
  description,
  value,
  onValueChange,
}) => {
  const { isDark } = useTheme();

  return (
    <View style={[styles.row, isDark && styles.rowDark]}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
        {description && (
          <Text style={[styles.description, isDark && styles.descriptionDark]}>
            {description}
          </Text>
        )}
      </View>
      <SwitchButton
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  rowDark: {
    borderBottomColor: "#2C2C2E",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  labelDark: {
    color: "#FFF",
  },
  labelContainer: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  descriptionDark: {
    color: "#9CA3AF",
  },
});
export default SettingRow;
