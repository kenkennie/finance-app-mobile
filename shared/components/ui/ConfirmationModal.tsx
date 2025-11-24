import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal as RNModal,
  Dimensions,
} from "react-native";
import { Typography } from "./Typography";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDark?: boolean;
  destructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDark = false,
  destructive = true,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, isDark && styles.modalDark]}>
          <View style={styles.content}>
            <Typography
              variant="h3"
              style={isDark ? styles.titleDark : styles.title}
            >
              {title}
            </Typography>
            <Typography
              variant="body1"
              style={isDark ? styles.messageDark : styles.message}
            >
              {message}
            </Typography>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Typography
                variant="body1"
                style={
                  isDark ? styles.cancelButtonTextDark : styles.cancelButtonText
                }
              >
                {cancelText}
              </Typography>
            </TouchableOpacity>

            <View style={isDark ? styles.dividerDark : styles.divider} />

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Typography
                variant="body1"
                style={
                  destructive
                    ? isDark
                      ? styles.destructiveTextDark
                      : styles.destructiveText
                    : isDark
                    ? styles.confirmButtonTextDark
                    : styles.confirmButtonText
                }
              >
                {confirmText}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    width: width - 80,
    maxWidth: 320,
    overflow: "hidden",
  },
  modalDark: {
    backgroundColor: "#1C1C1E",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  titleDark: {
    color: "#FFFFFF",
  },
  message: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 18,
  },
  messageDark: {
    color: "#98989D",
  },
  buttonContainer: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#C6C6C8",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: "400",
    color: "#007AFF",
  },
  cancelButtonTextDark: {
    color: "#0A84FF",
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: "#C6C6C8",
  },
  dividerDark: {
    backgroundColor: "#38383A",
  },
  confirmButton: {
    backgroundColor: "transparent",
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#007AFF",
  },
  destructiveText: {
    color: "#FF3B30",
  },
  destructiveTextDark: {
    color: "#FF453A",
  },
  confirmButtonTextDark: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0A84FF",
  },
});
