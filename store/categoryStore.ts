import { create } from "zustand";
import {
  Category,
  CategoryState,
  CreateCategoryData,
  UpdateCategoryData,
  Subcategory,
} from "@/shared/types/category.types";
import { extractErrorMessage } from "@/shared/utils/api/responseHandler";
import { categoryService } from "@/shared/services/category/categoryService";

interface CategoryStore extends CategoryState {
  // Actions
  createCategory: (data: CreateCategoryData) => Promise<Category>;
  getCategories: (filters?: {
    type?: "EXPENSE" | "INCOME";
    includeInactive?: boolean;
    search?: string;
  }) => Promise<void>;
  getCategoryById: (id: string) => Promise<Category | null>;
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  setCurrentCategory: (category: Category | null) => void;

  // Utility actions
  clearError: () => void;
  clearSuccess: () => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  // Initial state
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,
  successMessage: null,

  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      // Extract subcategories from data
      const { ...categoryData } = data;

      // Create the parent category first (API doesn't accept subcategories)
      const { data: category, message } = await categoryService.createCategory({
        ...categoryData,
        orderIndex: categoryData.orderIndex || 0,
      });

      // Return category with subcategories for UI compatibility
      const categoryWithSubcategories = {
        ...category,
        // subcategories: createdSubcategories,
        // children: createdSubcategories,
      };

      set((state) => ({
        categories: [...state.categories, categoryWithSubcategories],
        isLoading: false,
        successMessage: message,
      }));

      return categoryWithSubcategories;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  getCategories: async (filters?: {
    type?: "EXPENSE" | "INCOME";
    includeInactive?: boolean;
    search?: string;
  }): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      const response = await categoryService.getCategories(
        filters?.type,
        filters?.includeInactive,
        filters?.search
      );

      // Flatten the hierarchical categories for flat display
      const flattenCategories = (cats: any[]): any[] => {
        if (!Array.isArray(cats)) return [];
        const result: any[] = [];
        for (const cat of cats) {
          result.push(cat);
          if (
            cat.children &&
            Array.isArray(cat.children) &&
            cat.children.length > 0
          ) {
            result.push(...flattenCategories(cat.children));
          }
        }

        return result;
      };

      set({
        categories: flattenCategories(response.data),
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  getCategoryById: async (id: string): Promise<Category | null> => {
    try {
      set({ isLoading: true, error: null });

      const category = await categoryService.getCategoryById(id);

      set({ isLoading: false });
      return category;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  updateCategory: async (
    id: string,
    data: UpdateCategoryData
  ): Promise<Category> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      // Extract subcategories from data
      const { subcategories, ...categoryData } = data;

      // Get current category to know existing children
      const currentCategory = await categoryService.getCategoryById(id);
      const existingChildren = currentCategory.children || [];

      // Update the parent category
      const { data: updatedCategory, message } =
        await categoryService.updateCategory(id, categoryData);

      // Handle subcategories
      let updatedChildren: Category[] = [...existingChildren];
      const newSubcategories = subcategories || [];

      // Create a map of existing children by id
      const existingChildrenMap = new Map(
        existingChildren.map((c) => [c.id, c])
      );

      // Determine subcategories to create, update, delete
      const toCreate: Subcategory[] = [];
      const toUpdate: { id: string; data: Partial<UpdateCategoryData> }[] = [];
      const existingIdsInNew = new Set<string>();

      for (const sub of newSubcategories) {
        if (sub.id && existingChildrenMap.has(sub.id)) {
          // Update existing
          existingIdsInNew.add(sub.id);
          const existing = existingChildrenMap.get(sub.id)!;
          const updateData: Partial<UpdateCategoryData> = {};
          if (sub.name !== existing.name) updateData.name = sub.name;
          if (sub.description !== existing.description)
            updateData.description = sub.description;
          if (sub.icon !== existing.icon) updateData.icon = sub.icon;
          if (Object.keys(updateData).length > 0) {
            toUpdate.push({ id: sub.id, data: updateData });
          }
        } else {
          // Create new
          toCreate.push(sub);
        }
      }

      // Delete removed subcategories
      const toDelete = existingChildren.filter(
        (c) => !existingIdsInNew.has(c.id)
      );

      // Execute operations
      let orderIndex = existingChildren.length;
      for (const sub of toCreate) {
        try {
          const { data: createdSub } = await categoryService.createCategory({
            name: sub.name,
            description: sub.description,
            icon: sub.icon || updatedCategory.icon,
            color: updatedCategory.color,
            transactionType: updatedCategory.transactionType,
            parentId: updatedCategory.id,
            orderIndex,
          });
          updatedChildren.push(createdSub);
          orderIndex++;
        } catch (error) {
          console.error("Failed to create subcategory:", sub.name, error);
        }
      }

      for (const { id, data } of toUpdate) {
        try {
          const { data: updatedSub } = await categoryService.updateCategory(
            id,
            data
          );
          const index = updatedChildren.findIndex((c) => c.id === id);
          if (index !== -1) updatedChildren[index] = updatedSub;
        } catch (error) {
          console.error("Failed to update subcategory:", id, error);
        }
      }

      for (const child of toDelete) {
        try {
          await categoryService.deleteCategory(child.id);
          updatedChildren = updatedChildren.filter((c) => c.id !== child.id);
        } catch (error) {
          console.error("Failed to delete subcategory:", child.id, error);
        }
      }

      // Update local state
      const categoryWithChildren = {
        ...updatedCategory,
        children: updatedChildren,
        subcategories: newSubcategories,
      };
      const updatedCategories = get().categories.map((cat) =>
        cat.id === id ? categoryWithChildren : cat
      );

      set({
        categories: updatedCategories,
        currentCategory:
          get().currentCategory?.id === id
            ? categoryWithChildren
            : get().currentCategory,
        isLoading: false,
        successMessage: message,
      });

      return categoryWithChildren;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Update Category Error:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { message } = await categoryService.deleteCategory(id);

      // Remove the category from local state
      const { categories } = get();
      const filteredCategories = categories.filter((cat) => cat.id !== id);

      set({
        categories: filteredCategories,
        currentCategory:
          get().currentCategory?.id === id ? null : get().currentCategory,
        isLoading: false,
        successMessage: message,
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  setCurrentCategory: (category: Category | null) => {
    set({ currentCategory: category });
  },

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ successMessage: null }),
}));
