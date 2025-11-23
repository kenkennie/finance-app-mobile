import { Header } from "@/shared/components/ui/Header";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/theme/context/ThemeContext";
import { useToastStore } from "@/store/toastStore";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/schemas/category.schema";
import { useCategoryStore } from "@/store/categoryStore";
import CategoryForm from "./CategoryForm";

const AddCategoryScreen = ({}) => {
  const { showSuccess, showError } = useToastStore();
  const router = useRouter();
  const { isDark } = useTheme();
  const { createCategory, isLoading, clearError, successMessage } =
    useCategoryStore();

  useEffect(() => {
    return () => clearError();
  }, []);

  const onSubmit = async (data: CreateCategoryDto) => {
    try {
      await createCategory(data);
      showSuccess(successMessage || "Category created successfully!");

      setTimeout(() => {
        router.replace("/screens/Categories/AllCategories");
      }, 100);
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Create New Category"
        showBack
        onBackPress={() => router.back()}
        isDark={isDark}
      />

      <CategoryForm
        mode="create"
        onSubmit={
          onSubmit as (
            data: CreateCategoryDto | UpdateCategoryDto
          ) => Promise<void>
        }
        isLoading={isLoading}
        submitButtonText="Save Category"
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
});

export default AddCategoryScreen;
