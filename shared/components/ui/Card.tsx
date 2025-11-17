import React from "react";
import { View, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  isDark?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  isDark,
}) => {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      onPress={onPress}
      style={[styles.card, isDark && styles.cardDark, style]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: "#1C1C1E",
  },
});
