import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

import { Typography } from "@/shared/components/ui/Typography";
import { IconButton } from "@/shared/components/ui/IconButton";
import { colors } from "@/theme/colors";
import { borderRadius, shadows, spacing, typography } from "@/theme/spacing";
import AddCategoryModal from "./AddCategoryModal";

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

export default function CategoryManagementScreen() {
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">(
    "all"
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = mockCategories.filter((cat) => {
    if (filterType === "all") return true;
    return cat.type === filterType;
  });

  const expenseCategories = filteredCategories.filter(
    (c) => c.type === "expense"
  );
  const incomeCategories = filteredCategories.filter(
    (c) => c.type === "income"
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const handleDelete = (category: Category) => {
    if (category.isDefault) {
      Alert.alert("Cannot Delete", "Default categories cannot be deleted.");
      return;
    }
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {} },
      ]
    );
  };

  const CategoryItem: React.FC<{ category: Category; isChild?: boolean }> = ({
    category,
    isChild = false,
  }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <View style={styles.categoryItemContainer}>
        <TouchableOpacity
          style={[styles.categoryCard, isChild && styles.categoryCardChild]}
          onPress={() => hasChildren && toggleExpand(category.id)}
          activeOpacity={hasChildren ? 0.7 : 1}
        >
          <View style={styles.categoryLeft}>
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: category.color + "20" },
              ]}
            >
              <Typography variant={isChild ? "body1" : "h4"}>
                {category.icon}
              </Typography>
            </View>
            <View style={styles.categoryInfo}>
              <Typography
                variant={isChild ? "body1" : "body1"}
                weight="semibold"
              >
                {category.name}
              </Typography>
              <Typography
                variant="caption"
                color={colors.gray[500]}
              >
                {category.transactionCount} transactions •{" "}
                {formatCurrency(category.totalAmount)}
              </Typography>
            </View>
          </View>
          <View style={styles.categoryRight}>
            {hasChildren && (
              <TouchableOpacity style={styles.expandButton}>
                <Typography
                  variant="body2"
                  color={colors.gray[600]}
                >
                  {isExpanded ? "▼" : "▶"}
                </Typography>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                Alert.alert("Category Options", category.name, [
                  { text: "Edit", onPress: () => handleEdit(category) },
                  { text: "Add Subcategory", onPress: () => {} },
                  {
                    text: "Delete",
                    onPress: () => handleDelete(category),
                    style: "destructive",
                  },
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
            >
              <Typography
                variant="body1"
                color={colors.gray[400]}
              >
                ⋮
              </Typography>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {isExpanded && hasChildren && (
          <View style={styles.childrenContainer}>
            {category.children?.map((child) => (
              <CategoryItem
                key={child.id}
                category={child}
                isChild
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.text.white}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton onPress={() => {}}>
            <Typography variant="h4">←</Typography>
          </IconButton>
          <Typography
            variant="h2"
            weight="bold"
            style={styles.headerTitle}
          >
            Categories
          </Typography>
          <IconButton
            onPress={() => setShowAddModal(true)}
            variant="filled"
          >
            <Typography
              variant="h4"
              color={colors.primary}
            >
              +
            </Typography>
          </IconButton>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterType === "all" && styles.filterTabActive,
            ]}
            onPress={() => setFilterType("all")}
          >
            <Typography
              variant="body2"
              weight="semibold"
              color={
                filterType === "all" ? colors.text.primary : colors.gray[600]
              }
            >
              All
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterType === "expense" && styles.filterTabActive,
            ]}
            onPress={() => setFilterType("expense")}
          >
            <Typography
              variant="body2"
              weight="semibold"
              color={
                filterType === "expense" ? colors.text.white : colors.gray[600]
              }
            >
              Expenses
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterType === "income" && styles.filterTabActive,
            ]}
            onPress={() => setFilterType("income")}
          >
            <Typography
              variant="body2"
              weight="semibold"
              color={
                filterType === "income" ? colors.text.white : colors.gray[600]
              }
            >
              Income
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {(filterType === "all" || filterType === "expense") &&
          expenseCategories.length > 0 && (
            <View style={styles.section}>
              <Typography
                variant="overline"
                color={colors.gray[600]}
                style={styles.sectionTitle}
              >
                📥 EXPENSE CATEGORIES ({expenseCategories.length})
              </Typography>
              {expenseCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                />
              ))}
            </View>
          )}

        {(filterType === "all" || filterType === "income") &&
          incomeCategories.length > 0 && (
            <View style={styles.section}>
              <Typography
                variant="overline"
                color={colors.gray[500]}
                style={styles.sectionTitle}
              >
                📤 INCOME CATEGORIES ({incomeCategories.length})
              </Typography>
              {incomeCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                />
              ))}
            </View>
          )}
      </ScrollView>

      {/* Add/Edit Category Modal */}
      <AddCategoryModal
        visible={showAddModal}
        category={editingCategory}
        onClose={() => {
          setShowAddModal(false);
          setEditingCategory(null);
        }}
      />
    </SafeAreaView>
  );
}

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
    backgroundColor: colors.primary,
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
    borderColor: colors.gray[700],
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
