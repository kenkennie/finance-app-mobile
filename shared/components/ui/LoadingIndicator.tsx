import React from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Text,
} from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { Typography } from "./Typography";

/**
 * LoadingIndicator - A reusable loading indicator component
 *
 * @example
 * // Basic usage
 * <LoadingIndicator />
 *
 * // With message
 * <LoadingIndicator message="Loading data..." />
 *
 * // Different sizes
 * <LoadingIndicator size="large" />
 * <LoadingIndicator size="small" />
 *
 * // Different types
 * <LoadingIndicator type="spinner" />
 * <LoadingIndicator type="dots" />
 * <LoadingIndicator type="pulse" />
 *
 * // Full screen overlay
 * <LoadingIndicator fullScreen />
 *
 * // Custom styling
 * <LoadingIndicator style={{ marginVertical: 20 }} />
 */
interface LoadingIndicatorProps {
  size?: "small" | "medium" | "large";
  color?: string;
  type?: "spinner" | "dots" | "pulse";
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
  overlay?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = "medium",
  color = colors.primary,
  type = "spinner",
  message,
  fullScreen = false,
  style,
  overlay = false,
}) => {
  const getSize = () => {
    switch (size) {
      case "small":
        return "small";
      case "large":
        return "large";
      default:
        return "small";
    }
  };

  const getSpinnerSize = () => {
    switch (size) {
      case "small":
        return 20;
      case "large":
        return 40;
      default:
        return 30;
    }
  };

  const renderIndicator = () => {
    switch (type) {
      case "spinner":
        return (
          <ActivityIndicator
            size={getSize()}
            color={color}
          />
        );
      case "dots":
        return (
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: color,
                    width: size === "small" ? 6 : size === "large" ? 12 : 8,
                    height: size === "small" ? 6 : size === "large" ? 12 : 8,
                  },
                ]}
              />
            ))}
          </View>
        );
      case "pulse":
        return (
          <View
            style={[
              styles.pulse,
              {
                backgroundColor: color,
                width: size === "small" ? 16 : size === "large" ? 32 : 24,
                height: size === "small" ? 16 : size === "large" ? 32 : 24,
              },
            ]}
          />
        );
      default:
        return (
          <ActivityIndicator
            size={getSize()}
            color={color}
          />
        );
    }
  };

  const containerStyle = [
    fullScreen && styles.fullScreen,
    overlay && styles.overlay,
    !fullScreen && !overlay && styles.centered,
    style,
  ];

  return (
    <View style={containerStyle}>
      {renderIndicator()}
      {message && (
        <Typography
          style={[
            styles.message,
            {
              marginTop: size === "small" ? spacing.sm : spacing.md,
              fontSize: size === "small" ? 12 : size === "large" ? 16 : 14,
            },
          ]}
        >
          {message}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 1000,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 2,
  },
  pulse: {
    borderRadius: 50,
    opacity: 0.7,
  },
  message: {
    textAlign: "center",
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
});
