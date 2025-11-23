import { Header } from "@/shared/components/ui/Header";
import { LoadingIndicator } from "@/shared/components/ui/LoadingIndicator";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useToastStore } from "@/store/toastStore";
import { UpdateCategoryDto } from "@/schemas/category.schema";
import { useCategoryStore } from "@/store/categoryStore";
import CategoryForm from "./CategoryForm";
import { Category } from "@/shared/types/category.types";

const EditCategoryScreen = ({}) => {
  const { showSuccess, showError } = useToastStore();
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const {
    updateCategory,
    getCategoryById,
    isLoading,
    clearError,
    successMessage,
  } = useCategoryStore();

  const [category, setCategory] = useState<Category | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(true);

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  useEffect(() => {
    return () => clearError();
  }, []);

  const loadCategory = async () => {
    if (!categoryId) return;

    try {
      setLoadingCategory(true);
      const categoryData = await getCategoryById(categoryId);
      setCategory(categoryData);
    } catch (error: any) {
      showError("Failed to load category");
      router.back();
    } finally {
      setLoadingCategory(false);
    }
  };

  const onSubmit = async (data: UpdateCategoryDto) => {
    console.log("====================================");
    console.log(
      "EditCategory onSubmit called with data:",
      JSON.stringify(data, null, 2)
    );
    console.log("====================================");

    if (!categoryId) {
      console.log("No categoryId found");
      return;
    }

    try {
      console.log("Calling updateCategory with id:", categoryId);
      const updatedCategory = await updateCategory(categoryId, data);
      console.log("Update successful:", updatedCategory);
      setCategory(updatedCategory);
      showSuccess(successMessage || "Category updated successfully!");
      setTimeout(() => {
        router.replace(
          `/screens/Categories/CategoryDetails?categoryId=${categoryId}` as any
        );
      }, 100);
    } catch (error: any) {
      console.error("Update failed:", error);
      showError(error.message);
    }
  };

  if (loadingCategory || !category) {
    return (
      <View style={styles.container}>
        <Header
          title="Edit Category"
          showBack
          onBackPress={() => router.back()}
        />
        <LoadingIndicator
          size="large"
          message="Loading category..."
          style={styles.loadingContainer}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Edit Category"
        showBack
        onBackPress={() => router.back()}
      />

      <CategoryForm
        mode="edit"
        initialData={category}
        onSubmit={onSubmit as (data: UpdateCategoryDto | any) => Promise<void>}
        isLoading={isLoading}
        submitButtonText="Update Category"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditCategoryScreen;
