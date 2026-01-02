import { colors } from "@/theme/colors";
import { borderRadius, fontSize, spacing } from "@/theme/spacing";
import React from "react";
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  isDark?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  isDark = false,
}) => {
  const dynamicStyles = {
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: spacing.lg,
    },
    modal: {
      backgroundColor: isDark
        ? colors.dark.background
        : colors.light.background,
      borderRadius: borderRadius.xl,
      width: width - spacing.xl * 2,
      maxHeight: "90%" as const,
    },
    header: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.dark.border : colors.light.border,
    },
    title: {
      fontSize: fontSize.xl,
      fontWeight: "bold" as const,
      color: isDark ? colors.dark.text.primary : colors.light.text.primary,
    },
    closeButton: {
      padding: spacing.xs,
    },
    closeText: {
      fontSize: fontSize.xl,
      color: isDark ? colors.dark.text.secondary : colors.light.text.secondary,
    },
    content: {
      padding: spacing.lg,
    },
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.overlay}>
        <View style={dynamicStyles.modal}>
          {title && (
            <View style={dynamicStyles.header}>
              <Text style={dynamicStyles.title}>{title}</Text>
              <TouchableOpacity
                onPress={onClose}
                style={dynamicStyles.closeButton}
              >
                <Text style={dynamicStyles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={dynamicStyles.content}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
};

const { width } = Dimensions.get("window");
