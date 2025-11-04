import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Assuming Expo vector icons are available
import { fontSize } from "@/theme/spacing";
import { colors } from "@/theme/colors";

interface NavigableRowProps {
  // Main label for the row (e.g., "Alice Johnson (Personal)")
  primaryText: string;
  // Optional secondary text (e.g., "Current Account")
  secondaryText?: string;
  // Icon name for the leading icon (optional, used for Legal section)
  leadingIconName?: keyof typeof MaterialIcons.glyphMap;
  // Function to call when the row is pressed
  onPress: () => void;
  // If true, shows the right arrow icon (default: true)
  showArrow?: boolean;
}

export const NavigableRow: React.FC<NavigableRowProps> = ({
  primaryText,
  secondaryText,
  leadingIconName,
  onPress,
  showArrow = true,
}) => (
  <TouchableOpacity
    style={styles.container}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {/* Leading Icon (Optional) */}
    {leadingIconName && (
      <MaterialIcons
        name={leadingIconName}
        size={24}
        color="#666666"
        style={styles.leadingIcon}
      />
    )}

    {/* Text Content */}
    <View style={styles.textContainer}>
      <Text style={styles.primaryText}>{primaryText}</Text>
      {secondaryText && (
        <Text style={styles.secondaryText}>{secondaryText}</Text>
      )}
    </View>

    {/* Trailing Arrow (Optional) */}
    {showArrow && (
      <MaterialIcons
        name="keyboard-arrow-right"
        size={fontSize.xl}
        color="#C7C7CC" // Light gray color for the arrow
      />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    minHeight: 50,
  },
  leadingIcon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  secondaryText: {
    fontSize: 13,
    color: colors.secondary,
    marginTop: 2,
  },
});
