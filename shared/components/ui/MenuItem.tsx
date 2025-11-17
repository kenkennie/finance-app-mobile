import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "./Card";
import { Feather } from "@expo/vector-icons";

interface MenuItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
  disabled?: boolean;
  isDark?: boolean;
  iconColor?: string;
  danger?: boolean;
  icon?: React.ReactNode | keyof typeof Feather.glyphMap; // Optional, can be React element or Feather icon name
}

export const MenuItem: React.FC<MenuItemProps> = ({
  title,
  subtitle,
  onPress,
  showArrow,
  rightElement,
  disabled,
  isDark = false,
  iconColor,
  danger = false,
  icon,
}) => {
  const defaultIconBg = isDark ? "#2C2C2E" : "#F5F5F5";

  // Render icon based on type
  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      // If icon is a React element, render it directly
      return icon;
    }

    if (typeof icon === "string") {
      // If icon is a string, render as Feather icon
      return (
        <Feather
          name={icon as keyof typeof Feather.glyphMap}
          size={22}
          color={danger ? "#EF4444" : isDark ? "#FFF" : "#000"}
        />
      );
    }

    return null;
  };

  return (
    <Card
      onPress={onPress}
      isDark={isDark}
    >
      <View style={styles.container}>
        {icon && (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: iconColor || defaultIconBg },
            ]}
          >
            {renderIcon()}
          </View>
        )}
        <View style={[styles.content, !icon && styles.contentNoIcon]}>
          <Text
            style={[
              styles.title,
              danger && styles.titleDanger,
              isDark && styles.titleDark,
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              {subtitle}
            </Text>
          )}
        </View>
        {!danger && (
          <Feather
            name="chevron-right"
            size={20}
            color={isDark ? "#666" : "#999"}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  contentNoIcon: {
    marginLeft: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  titleDark: {
    color: "#FFF",
  },
  titleDanger: {
    color: "#EF4444",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  subtitleDark: {
    color: "#9CA3AF",
  },
});
