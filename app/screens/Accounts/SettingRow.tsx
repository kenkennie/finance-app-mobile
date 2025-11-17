import SwitchButton from "@/shared/components/ui/SwitchButton";
import { useTheme } from "@/theme/context/ThemeContext";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SettingRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}
const SettingRow: React.FC<SettingRowProps> = ({
  label,
  value,
  onValueChange,
}) => {
  const { isDark } = useTheme();

  return (
    <View style={[styles.row, isDark && styles.rowDark]}>
      <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
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
});
export default SettingRow;
