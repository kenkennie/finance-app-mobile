import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../theme/context/ThemeContext";

interface IconColorSelectorProps {
  label: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  color?: string;
  onPress: () => void;
  type?: "icon" | "color";
}

const IconColorSelector: React.FC<IconColorSelectorProps> = ({
  label,
  icon,
  color,
  onPress,
  type = "icon",
}) => {
  const { isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.row, isDark && styles.rowDark]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      <View style={styles.right}>
        {type === "icon" && icon && (
          <View style={[styles.iconPreview, { backgroundColor: color + "30" }]}>
            <Feather
              name={icon}
              size={24}
              color={color}
            />
          </View>
        )}
        {type === "color" && color && (
          <View style={[styles.colorPreview, { backgroundColor: color }]} />
        )}
        <Feather
          name="chevron-right"
          size={20}
          color={isDark ? "#666" : "#9CA3AF"}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconPreview: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  colorPreview: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default IconColorSelector;
