import { colors } from "@/theme/colors";
import { borderRadius } from "@/theme/spacing";
import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";

interface IconButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: "ghost" | "filled" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  onPress,
  variant = "ghost",
  size = "medium",
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.md,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  filled: {
    backgroundColor: colors.gray[100],
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  small: {
    width: 32,
    height: 32,
  },
  medium: {
    width: 40,
    height: 40,
  },
  large: {
    width: 48,
    height: 48,
  },
  disabled: {
    opacity: 0.5,
  },
});
