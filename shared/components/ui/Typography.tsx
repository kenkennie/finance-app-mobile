import { colors } from "@/theme/colors";
import { typography } from "@/theme/spacing";
import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";

interface TypographyProps {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "body1"
    | "body2"
    | "caption"
    | "overline";
  color?: string;
  weight?: "regular" | "medium" | "semibold" | "bold";
  align?: "left" | "center" | "right";
  numberOfLines?: number;
  children: React.ReactNode;
  style?: TextStyle;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = "body1",
  color = colors.text.primary,
  weight = "regular",
  align = "left",
  numberOfLines,
  children,
  style,
}) => {
  return (
    <Text
      style={[
        styles[variant],
        { color, fontWeight: typography.fontWeight[weight], textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: typography.fontSize["3xl"],
    lineHeight: typography.fontSize["3xl"] * typography.lineHeight.tight,
    fontWeight: typography.fontWeight.bold,
  },
  h2: {
    fontSize: typography.fontSize["2xl"],
    lineHeight: typography.fontSize["2xl"] * typography.lineHeight.tight,
    fontWeight: typography.fontWeight.bold,
  },
  h3: {
    fontSize: typography.fontSize.xl,
    lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
    fontWeight: typography.fontWeight.semibold,
  },
  h4: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
    fontWeight: typography.fontWeight.semibold,
  },
  body1: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    fontWeight: typography.fontWeight.regular,
  },
  body2: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    fontWeight: typography.fontWeight.regular,
  },
  caption: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    fontWeight: typography.fontWeight.regular,
  },
  overline: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    fontWeight: typography.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
