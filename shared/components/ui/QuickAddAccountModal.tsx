import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
} from "react-native";
import { Input } from "./Input";
import { Button } from "./Button";
import { Typography } from "./Typography";
import { useAccountStore } from "@/store/accountStore";
import { useTheme } from "@/theme/context/ThemeContext";

interface QuickAddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAccountCreated: (accountId: string) => void;
}

const QuickAddAccountModal: React.FC<QuickAddAccountModalProps> = ({
  visible,
  onClose,
  onAccountCreated,
}) => {
  const { isDark } = useTheme();
  const { createAccount, isLoading } = useAccountStore();
  const [formData, setFormData] = useState({
    accountName: "",
    accountNumber: "",
    balance: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!formData.accountName.trim()) {
      setError("Account name is required");
      return;
    }
    if (!formData.accountNumber.trim()) {
      setError("Account number is required");
      return;
    }
    if (!formData.balance.trim()) {
      setError("Balance is required");
      return;
    }

    const balance = parseFloat(formData.balance);
    if (isNaN(balance)) {
      setError("Balance must be a valid number");
      return;
    }

    try {
      setError("");
      const account = await createAccount({
        accountName: formData.accountName.trim(),
        accountNumber: formData.accountNumber.trim(),
        icon: "wallet",
        color: "#1976D2",
        openingBalance: balance,
        balance: balance,
        currency: "KSh",
        isSystemAccount: false,
      });

      onAccountCreated(account.id);
      setFormData({ accountName: "", accountNumber: "", balance: "" });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    }
  };

  const handleClose = () => {
    setFormData({ accountName: "", accountNumber: "", balance: "" });
    setError("");
    onClose();
  };

  return (
    <RNModal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={[styles.modal, isDark && styles.modalDark]}>
          <View style={[styles.header, isDark && styles.headerDark]}>
            <Typography
              variant="h3"
              weight="bold"
            >
              Add New Account
            </Typography>
          </View>

          <View style={styles.content}>
            <Typography
              style={[styles.description, isDark && styles.descriptionDark]}
            >
              Create a new account for transactions
            </Typography>

            <Input
              label="Account Name"
              placeholder="e.g., Main Checking"
              value={formData.accountName}
              onChangeText={(text) => {
                setFormData({ ...formData, accountName: text });
                if (error) setError("");
              }}
              error={error === "Account name is required" ? error : undefined}
              isDark={isDark}
              autoFocus
            />

            <Input
              label="Account Number"
              placeholder="e.g., 1234567890"
              value={formData.accountNumber}
              onChangeText={(text) => {
                setFormData({ ...formData, accountNumber: text });
                if (error) setError("");
              }}
              error={error === "Account number is required" ? error : undefined}
              isDark={isDark}
              keyboardType="numeric"
            />

            <Input
              label="Initial Balance"
              placeholder="0.00"
              value={formData.balance}
              onChangeText={(text) => {
                setFormData({ ...formData, balance: text });
                if (
                  error &&
                  (error.includes("Balance") || error.includes("valid number"))
                )
                  setError("");
              }}
              error={
                error.includes("Balance") || error.includes("valid number")
                  ? error
                  : undefined
              }
              isDark={isDark}
              keyboardType="numeric"
            />

            <View style={styles.buttonContainer}>
              <Button
                onPress={handleClose}
                variant="outline"
                style={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onPress={handleSubmit}
                loading={isLoading}
                disabled={
                  !formData.accountName.trim() ||
                  !formData.accountNumber.trim() ||
                  !formData.balance.trim() ||
                  isLoading
                }
                style={styles.createButton}
              >
                {isLoading ? "Creating..." : "Create Account"}
              </Button>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
    overflow: "hidden",
  },
  modalDark: {
    backgroundColor: "#1C1C1E",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerDark: {
    borderBottomColor: "#374151",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  descriptionDark: {
    color: "#9CA3AF",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 1,
  },
});

export default QuickAddAccountModal;
