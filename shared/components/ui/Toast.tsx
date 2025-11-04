import { borderRadius, fontSize, spacing } from "@/theme/spacing";
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

export function Toast({
  visible,
  message,
  type = "info",
  duration = 3000,
  onHide,
}: ToastProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  //   if (!visible && opacity._value === 0) return null;

  const toastStyles = getToastStyles(type);

  return (
    <Animated.View
      style={[
        styles.container,
        toastStyles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={hideToast}
        activeOpacity={0.9}
      >
        <Text style={styles.icon}>{toastStyles.icon}</Text>
        <Text
          style={[styles.message, toastStyles.text]}
          numberOfLines={3}
        >
          {message}
        </Text>
        <TouchableOpacity
          onPress={hideToast}
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

function getToastStyles(type: ToastType) {
  switch (type) {
    case "success":
      return {
        container: { backgroundColor: "#10b981", borderLeftColor: "#059669" },
        text: { color: "#ffffff" },
        icon: "✓",
      };
    case "error":
      return {
        container: { backgroundColor: "#ef4444", borderLeftColor: "#dc2626" },
        text: { color: "#ffffff" },
        icon: "✕",
      };
    case "warning":
      return {
        container: { backgroundColor: "#f59e0b", borderLeftColor: "#d97706" },
        text: { color: "#ffffff" },
        icon: "⚠",
      };
    case "info":
    default:
      return {
        container: { backgroundColor: "#3b82f6", borderLeftColor: "#2563eb" },
        text: { color: "#ffffff" },
        icon: "ℹ",
      };
  }
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    maxWidth: width - spacing.lg * 2,
    borderRadius: borderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
    zIndex: 9999,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "bold",
  },
  message: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: "500",
    lineHeight: 20,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
