import { colors } from "@/theme/colors";
import { fontSize, spacing } from "@/theme/spacing";
import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";

interface SwitchButtonProps {
  title: string;
  description: string;
  value: boolean;
  onToggle: (newValue: boolean) => void;
}

export const SwitchButton: React.FC<SwitchButtonProps> = ({
  title,
  description,
  value,
  onToggle,
}) => (
  <View style={styles.settingsItem}>
    <View style={styles.settingsTextContainer}>
      <Text style={styles.settingsTitle}>{title}</Text>
      <Text style={styles.settingsDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: colors.gray[200], true: colors.gray[400] }}
      thumbColor={value ? colors.primary : colors.gray[300]}
      ios_backgroundColor={colors.gray[400]}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: 16,
  },
  settingsTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingsTitle: {
    fontSize: fontSize.md,
    fontWeight: 500,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  settingsDescription: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
