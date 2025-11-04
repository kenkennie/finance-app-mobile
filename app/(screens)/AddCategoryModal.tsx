// ==========================================
// Add Category Modal Component
import React, { useState } from "react";

import { Badge } from "@/shared/components/ui/Badge";
import { IconButton } from "@/shared/components/ui/IconButton";
import { Typography } from "@/shared/components/ui/Typography";
import { colors } from "@/theme/colors";
import { borderRadius, shadows, spacing, typography } from "@/theme/spacing";

import {
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "expense" | "income";
  parentId: string | null;
  transactionCount: number;
  totalAmount: number;
  children?: Category[];
  isDefault: boolean;
}

const mockCategories: Category[] = [
  {
    id: "cat_1",
    name: "Food & Dining",
    icon: "🍽️",
    color: "#FF6B6B",
    type: "expense",
    parentId: null,
    transactionCount: 45,
    totalAmount: 892.5,
    isDefault: true,
    children: [
      {
        id: "cat_1_1",
        name: "Restaurants",
        icon: "🍴",
        color: "#FF6B6B",
        type: "expense",
        parentId: "cat_1",
        transactionCount: 20,
        totalAmount: 450.0,
        isDefault: false,
      },
      {
        id: "cat_1_2",
        name: "Coffee Shops",
        icon: "☕",
        color: "#FF6B6B",
        type: "expense",
        parentId: "cat_1",
        transactionCount: 15,
        totalAmount: 225.0,
        isDefault: false,
      },
      {
        id: "cat_1_3",
        name: "Fast Food",
        icon: "🍔",
        color: "#FF6B6B",
        type: "expense",
        parentId: "cat_1",
        transactionCount: 10,
        totalAmount: 217.5,
        isDefault: false,
      },
    ],
  },
  {
    id: "cat_2",
    name: "Shopping",
    icon: "🛍️",
    color: "#E91E63",
    type: "expense",
    parentId: null,
    transactionCount: 28,
    totalAmount: 1245.8,
    isDefault: true,
    children: [
      {
        id: "cat_2_1",
        name: "Clothing",
        icon: "👔",
        color: "#E91E63",
        type: "expense",
        parentId: "cat_2",
        transactionCount: 12,
        totalAmount: 650.0,
        isDefault: false,
      },
      {
        id: "cat_2_2",
        name: "Electronics",
        icon: "💻",
        color: "#E91E63",
        type: "expense",
        parentId: "cat_2",
        transactionCount: 8,
        totalAmount: 450.8,
        isDefault: false,
      },
      {
        id: "cat_2_3",
        name: "Home Goods",
        icon: "🏠",
        color: "#E91E63",
        type: "expense",
        parentId: "cat_2",
        transactionCount: 8,
        totalAmount: 145.0,
        isDefault: false,
      },
    ],
  },
  {
    id: "cat_3",
    name: "Groceries",
    icon: "🛒",
    color: "#4ECDC4",
    type: "expense",
    parentId: null,
    transactionCount: 32,
    totalAmount: 1580.4,
    isDefault: true,
  },
  {
    id: "cat_4",
    name: "Transportation",
    icon: "🚗",
    color: "#95E1D3",
    type: "expense",
    parentId: null,
    transactionCount: 24,
    totalAmount: 456.9,
    isDefault: true,
  },
  {
    id: "cat_5",
    name: "Salary",
    icon: "💰",
    color: "#10B981",
    type: "income",
    parentId: null,
    transactionCount: 2,
    totalAmount: 7000.0,
    isDefault: true,
  },
  {
    id: "cat_6",
    name: "Freelance",
    icon: "💼",
    color: "#10B981",
    type: "income",
    parentId: null,
    transactionCount: 5,
    totalAmount: 2500.0,
    isDefault: true,
  },
];

// ==========================================
interface AddCategoryModalProps {
  visible: boolean;
  category: Category | null;
  onClose: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  visible,
  category,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    icon: "📁",
    color: "#0066FF",
    type: "expense" as "expense" | "income",
  });

  const colors = [
    "#FF6B6B",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#03A9F4",
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFEB3B",
    "#FFC107",
    "#FF9800",
    "#FF5722",
  ];

  const icons = [
    "🍽️",
    "🛒",
    "🛍️",
    "🚗",
    "💡",
    "🎬",
    "⚕️",
    "💰",
    "💼",
    "📚",
    "🏋️",
    "✈️",
    "🏠",
    "📱",
    "☕",
    "🎮",
  ];

  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
      });
    }
  }, [category]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Typography
              variant="h3"
              weight="bold"
            >
              {category ? "Edit Category" : "New Category"}
            </Typography>
            <IconButton onPress={onClose}>
              <Typography variant="h4">✕</Typography>
            </IconButton>
          </View>

          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Type Selector */}
            <View style={styles.formSection}>
              <Typography
                variant="body2"
                weight="semibold"
                color={colors.gray[600]}
                style={styles.formLabel}
              >
                Category Type
              </Typography>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.type === "expense" && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, type: "expense" })}
                >
                  <Typography
                    variant="body1"
                    weight="semibold"
                    color={
                      formData.type === "expense"
                        ? colors.text.white
                        : colors.gray[700]
                    }
                  >
                    Expense
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.type === "income" && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, type: "income" })}
                >
                  <Typography
                    variant="body1"
                    weight="semibold"
                    color={
                      formData.type === "income"
                        ? colors.text.white
                        : colors.gray[700]
                    }
                  >
                    Income
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.formSection}>
              <Typography
                variant="body2"
                weight="semibold"
                color={colors.gray[600]}
                style={styles.formLabel}
              >
                Category Name *
              </Typography>
              <TextInput
                style={styles.textInput}
                placeholder="Enter category name"
                placeholderTextColor={colors.gray[400]}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>

            {/* Icon Selector */}
            <View style={styles.formSection}>
              <Typography
                variant="body2"
                weight="semibold"
                color={colors.gray[600]}
                style={styles.formLabel}
              >
                Icon
              </Typography>
              <View style={styles.iconGrid}>
                {icons.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      formData.icon === icon && styles.iconOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, icon })}
                  >
                    <Typography variant="h4">{icon}</Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Selector */}
            <View style={styles.formSection}>
              <Typography
                variant="body2"
                weight="semibold"
                color={colors.gray[600]}
                style={styles.formLabel}
              >
                Color
              </Typography>
              <View style={styles.colorGrid}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      formData.color === color && styles.colorOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, color })}
                  >
                    {formData.color === color && (
                      <Typography
                        variant="body1"
                        color={colors.white}
                      >
                        ✓
                      </Typography>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview */}
            <View style={styles.formSection}>
              <Typography
                variant="body2"
                weight="semibold"
                color={colors.gray[600]}
                style={styles.formLabel}
              >
                Preview
              </Typography>
              <View style={styles.previewCard}>
                <View
                  style={[
                    styles.previewIcon,
                    { backgroundColor: formData.color + "20" },
                  ]}
                >
                  <Typography variant="h3">{formData.icon}</Typography>
                </View>
                <Typography
                  variant="body1"
                  weight="semibold"
                >
                  {formData.name || "Category Name"}
                </Typography>
                <Badge
                  variant={formData.type === "expense" ? "error" : "success"}
                  size="small"
                >
                  {formData.type === "expense" ? "Expense" : "Income"}
                </Badge>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Typography
                variant="body1"
                weight="semibold"
                color={colors.gray[600]}
              >
                Cancel
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !formData.name.trim() && styles.saveButtonDisabled,
              ]}
              disabled={!formData.name.trim()}
            >
              <Typography
                variant="body1"
                weight="bold"
                color={colors.text.white}
              >
                {category ? "Update" : "Create"}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddCategoryModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.text.white,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.base,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  categoryItemContainer: {
    marginBottom: spacing.sm,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.text.white,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryCardChild: {
    backgroundColor: colors.gray[50],
    marginLeft: spacing.xl,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  expandButton: {
    padding: spacing.sm,
  },
  menuButton: {
    padding: spacing.sm,
  },
  childrenContainer: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.text.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalScroll: {
    maxHeight: "70%",
  },
  formSection: {
    padding: spacing.base,
  },
  formLabel: {
    marginBottom: spacing.sm,
  },
  typeSelector: {
    flexDirection: "row",
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
    borderWidth: 2,
    borderColor: colors.gray[600],
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  textInput: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.primary,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  iconOption: {
    width: 56,
    height: 56,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.gray[600],
  },
  iconOptionActive: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionActive: {
    borderColor: colors.gray[600],
    transform: [{ scale: 1.1 }],
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.base,
    alignItems: "center",
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.base,
    alignItems: "center",
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
});
