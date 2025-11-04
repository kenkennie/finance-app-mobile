import { colors } from "@/theme/colors";
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
interface DividerProps {
  style: ViewStyle | ViewStyle[];
}
export const Divider: React.FC<DividerProps> = ({ style }) => (
  <View style={[styles.divider, style]} />
);

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.gray[400],
    marginHorizontal: 16,
  },
});
