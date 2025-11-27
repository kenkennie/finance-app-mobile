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
import { useCategoryStore } from "@/store/categoryStore";
import { useTheme } from "@/theme/context/ThemeContext";

interface QuickAddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  transactionType: "EXPENSE" | "INCOME";
  onCategoryCreated: (categoryId: string) => void;
}

const QuickAddCategoryModal: React.FC<QuickAddCategoryModalProps> = ({
  visible,
  onClose,
  transactionType,
  onCategoryCreated,
}) => {
  const { isDark } = useTheme();
  const { createCategory, isLoading } = useCategoryStore();
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setError("");
      const category = await createCategory({
        name: categoryName.trim(),
        transactionType,
        icon: "target", // Default icon
        color: "#1976D2", // Default color
        orderIndex: 0,
      });

      onCategoryCreated(category.id);
      setCategoryName("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create category");
    }
  };

  const handleClose = () => {
    setCategoryName("");
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
              Add New Category
            </Typography>
          </View>

          <View style={styles.content}>
            <Typography
              style={[styles.description, isDark && styles.descriptionDark]}
            >
              Create a new {transactionType.toLowerCase()} category
            </Typography>

            <Input
              label="Category Name"
              placeholder={`e.g., ${
                transactionType === "EXPENSE" ? "Food" : "Salary"
              }`}
              value={categoryName}
              onChangeText={(text) => {
                setCategoryName(text);
                if (error) setError("");
              }}
              error={error}
              isDark={isDark}
              autoFocus
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
                disabled={!categoryName.trim() || isLoading}
                style={styles.createButton}
              >
                {isLoading ? "Creating..." : "Create Category"}
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

export default QuickAddCategoryModal;
