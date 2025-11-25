import { View, StyleSheet, useColorScheme, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Header } from "@/shared/components/ui/Header";
import { Typography } from "@/shared/components/ui/Typography";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { ConfirmationModal } from "@/shared/components/ui/ConfirmationModal";
import { useCategoryStore } from "@/store/categoryStore";
import { Category } from "@/shared/types/category.types";

const CategoryDetailsScreen = () => {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { getCategoryById, deleteCategory, isLoading } = useCategoryStore();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [category, setCategory] = useState<Category | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  const loadCategory = async () => {
    if (!categoryId) return;

    try {
      setLoadingCategory(true);
      const categoryData = await getCategoryById(categoryId);
      setCategory(categoryData);
    } catch (error) {
      console.error("Error loading category:", error);
    } finally {
      setLoadingCategory(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditCategory = () => {
    if (category) {
      router.replace(
        `/screens/Categories/EditCategory?categoryId=${category.id}` as any
      );
    }
  };

  const handleDeleteCategory = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!category) return;

    try {
      await deleteCategory(category.id);
      setShowDeleteModal(false);
      router.back();
    } catch (error: any) {
      setShowDeleteModal(false);
      // Could show a toast or alert here, but since we removed Alert import, maybe use console or add back Alert
      console.error("Failed to deactivate category:", error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (loadingCategory) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Header
          title="Category Details"
          showBack
          onBackPress={() => router.back()}
          isDark={isDark}
        />
        <View style={styles.loadingContainer}>
          <Typography
            style={[styles.loadingText, isDark ? styles.loadingTextDark : {}]}
          >
            Loading category details...
          </Typography>
        </View>
      </View>
    );
  }

  if (!category) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Header
          title="Category Details"
          showBack
          onBackPress={() => router.back()}
          isDark={isDark}
        />
        <View style={styles.errorContainer}>
          <Typography
            style={[styles.errorText, isDark ? styles.errorTextDark : {}]}
          >
            Category not found
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Category Details"
        showBack
        onBackPress={() => router.back()}
        isDark={isDark}
        rightIcons={[
          {
            icon: "edit-3",
            onPress: handleEditCategory,
          },
        ]}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Header Card */}
        <Card
          isDark={isDark}
          style={styles.headerCard}
        >
          <View style={styles.categoryHeader}>
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: category.color + "20" },
              ]}
            >
              <Feather
                name={category.icon as any}
                size={32}
                color={category.color}
              />
            </View>
            <View style={styles.categoryInfo}>
              <Typography
                variant="h2"
                style={[
                  styles.categoryName,
                  isDark ? styles.categoryNameDark : {},
                ]}
              >
                {category.name}
              </Typography>
              <Typography
                style={[
                  styles.transactionType,
                  isDark ? styles.transactionTypeDark : {},
                ]}
              >
                {category.transactionType}
              </Typography>
            </View>
          </View>

          {category.description && (
            <View style={styles.descriptionSection}>
              <Typography
                style={[
                  styles.description,
                  isDark ? styles.descriptionDark : {},
                ]}
              >
                {category.description}
              </Typography>
            </View>
          )}
        </Card>

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <Card
            isDark={isDark}
            style={styles.subcategoriesCard}
          >
            <Typography
              variant="h3"
              style={[
                styles.sectionTitle,
                isDark ? styles.sectionTitleDark : {},
              ]}
            >
              Subcategories
            </Typography>

            {category.children.map((subcategory, index) => (
              <View
                key={subcategory.id}
                style={styles.subcategoryRow}
              >
                <View style={styles.subcategoryIcon}>
                  <Feather
                    name={subcategory.icon as any}
                    size={20}
                    color={category.color}
                  />
                </View>
                <Typography
                  style={[
                    styles.subcategoryName,
                    isDark ? styles.subcategoryNameDark : {},
                  ]}
                >
                  {subcategory.name}
                </Typography>
                {subcategory.description && (
                  <Typography
                    style={[
                      styles.subcategoryDescription,
                      isDark ? styles.subcategoryDescriptionDark : {},
                    ]}
                  >
                    {subcategory.description}
                  </Typography>
                )}
              </View>
            ))}
          </Card>
        )}

        {/* Category Information */}
        <Card
          isDark={isDark}
          style={styles.infoCard}
        >
          <Typography
            variant="h3"
            style={[styles.sectionTitle, isDark ? styles.sectionTitleDark : {}]}
          >
            Category Information
          </Typography>

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Transaction Type
            </Typography>
            <Typography
              style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
            >
              {category.transactionType}
            </Typography>
          </View>

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Order Index
            </Typography>
            <Typography
              style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
            >
              {category.orderIndex}
            </Typography>
          </View>

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Status
            </Typography>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: category.isActive ? "#10B981" : "#EF4444",
                  },
                ]}
              />
              <Typography
                style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
              >
                {category.isActive ? "Active" : "Inactive"}
              </Typography>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Created
            </Typography>
            <Typography
              style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
            >
              {formatDate(category.createdAt)}
            </Typography>
          </View>

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Last Updated
            </Typography>
            <Typography
              style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
            >
              {formatDate(category.updatedAt)}
            </Typography>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            onPress={handleEditCategory}
            variant="primary"
            style={styles.editButton}
          >
            Edit Category
          </Button>

          {!category.isSystem && (
            <Button
              onPress={handleDeleteCategory}
              variant="danger"
              style={styles.deleteButton}
              disabled={isLoading}
            >
              Deactivate Category
            </Button>
          )}
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={showDeleteModal}
        title="Deactivate Category"
        message={
          category && (category as any)._count?.TransactionItems > 0
            ? `This category has ${
                (category as any)._count?.TransactionItems
              } transaction(s). Deactivating it will hide the category but keep existing transactions intact. Are you sure?`
            : `Are you sure you want to deactivate "${category?.name}"? This will hide the category from new transactions.`
        }
        confirmText="Deactivate"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDark={isDark}
        destructive={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  containerDark: {
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  loadingTextDark: {
    color: "#9CA3AF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
  },
  errorTextDark: {
    color: "#F87171",
  },
  headerCard: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  categoryNameDark: {
    color: "#FFF",
  },
  transactionType: {
    fontSize: 16,
    color: "#6B7280",
    textTransform: "capitalize",
  },
  transactionTypeDark: {
    color: "#9CA3AF",
  },
  descriptionSection: {
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  descriptionDark: {
    color: "#D1D5DB",
  },
  subcategoriesCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: "#FFF",
  },
  subcategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  subcategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  subcategoryName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    flex: 1,
  },
  subcategoryNameDark: {
    color: "#FFF",
  },
  subcategoryDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  subcategoryDescriptionDark: {
    color: "#9CA3AF",
  },
  infoCard: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  infoLabel: {
    fontSize: 16,
    color: "#6B7280",
    flex: 1,
  },
  infoLabelDark: {
    color: "#9CA3AF",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    textAlign: "right",
    flex: 1,
  },
  infoValueDark: {
    color: "#FFF",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  actionButtons: {
    paddingBottom: 32,
  },
  editButton: {
    marginBottom: 12,
  },
  deleteButton: {
    marginBottom: 12,
  },
});

export default CategoryDetailsScreen;
