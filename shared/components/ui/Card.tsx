import React from "react";
import { View, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { useTheme } from "@/theme/context/ThemeContext";
import { colors } from "@/theme/colors";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  isDark?: boolean; // Override theme
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  onLongPress,
  style,
  isDark,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const useDark = isDark !== undefined ? isDark : themeIsDark;
  const styles = createStyles(useDark);

  const CardWrapper = onPress || onLongPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.card, style]}
      activeOpacity={onPress || onLongPress ? 0.7 : 1}
    >
      {children}
    </CardWrapper>
  );
};

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDark
        ? colors.dark.background
        : colors.light.background,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
  });
