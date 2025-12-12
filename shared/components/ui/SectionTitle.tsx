import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Typography } from "./Typography";
import { useTheme } from "@/theme/context/ThemeContext";
import { spacing } from "@/theme/spacing";

interface SectionTitleProps {
  title: string;
  onViewAll?: () => void;
  variant?: "h1" | "h2" | "h3" | "h4" | "body1" | "body2" | "caption";
  style?: any;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  onViewAll,
  variant = "h3",
  style,
}) => {
  const { isDark } = useTheme();

  const themeColors = {
    text: {
      primary: isDark ? "#FFFFFF" : "#000000",
      secondary: isDark ? "#9CA3AF" : "#6B7280",
    },
  };

  return (
    <View style={[styles.container, style]}>
      <Typography
        variant={variant}
        style={[styles.title, { color: themeColors.text.primary }]}
      >
        {title}
      </Typography>
      {onViewAll && (
        <TouchableOpacity
          onPress={onViewAll}
          style={styles.viewAllButton}
        >
          <Typography
            variant="body2"
            style={[styles.viewAllText, { color: themeColors.text.secondary }]}
          >
            View All
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    flex: 1,
  },
  viewAllButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
