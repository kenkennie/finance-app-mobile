import { colors } from "@/theme/colors";
import { fontSize, spacing } from "@/theme/spacing";
import React from "react";
import { Text, StyleSheet } from "react-native";

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: fontSize.sm,
    fontWeight: 600,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
