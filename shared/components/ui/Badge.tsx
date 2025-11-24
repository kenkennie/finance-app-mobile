import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Typography } from "./Typography";
import { borderRadius, spacing } from "@/theme/spacing";
import { colors } from "@/theme/colors";

interface BadgeProps {
  children: React.ReactNode;
  count?: number;
  variant?:
    | "danger"
    | "primary"
    | "success"
    | "warning"
    | "info"
    | "neutral"
    | "error"
    | "custom";
  customColor?: string;
  size?: "small" | "medium";
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  children,
  size = "medium",
  variant = "danger",
  customColor,
  style,
}) => {
  const badgeStyle =
    variant === "custom"
      ? [
          styles.badge,
          styles[size],
          { backgroundColor: customColor + "20" },
          style,
        ]
      : [styles.badge, styles[variant], styles[size], style];

  const textStyle =
    variant === "custom" ? { color: customColor } : styles[`${variant}Text`];

  return (
    <View style={badgeStyle}>
      <Typography
        variant="caption"
        weight="semibold"
        style={textStyle}
      >
        {children}
      </Typography>
      {/* {count !== undefined && (
        <View
          style={{
            backgroundColor: colors.gray[700],
            borderRadius: borderRadius.full,
            paddingHorizontal: spacing.xs,
            marginLeft: spacing.xs,
          }}
        >
          <Typography
            variant="caption"
            weight="semibold"
            style={{ color: colors.text.inverse }}
          >
            {count}
          </Typography>
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: "flex-start",
  },
  small: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  success: {
    backgroundColor: colors.successLight,
  },
  successText: {
    color: colors.success,
  },
  warning: {
    backgroundColor: colors.warningLight,
  },
  warningText: {
    color: colors.warning,
  },
  error: {
    backgroundColor: colors.errorLight,
  },
  errorText: {
    color: colors.error,
  },
  info: {
    backgroundColor: colors.infoLight,
  },
  infoText: {
    color: colors.info,
  },
  neutral: {
    backgroundColor: colors.gray[200],
  },
  neutralText: {
    color: colors.gray[700],
  },
  primary: {
    backgroundColor: colors.primaryLight,
  },
  primaryText: {
    color: colors.primary,
  },
  danger: {
    backgroundColor: colors.errorLight,
  },
  dangerText: {
    color: colors.error,
  },
});
