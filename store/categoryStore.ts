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
  loadMoreCategories: (filters?: {
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
  isLoadingMore: false,
  hasMore: true,
  error: null,
  successMessage: null,

  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      // Map subcategories to DTO format (without id)
      const subcategories =
        data.subcategories?.map((sub) => ({
          name: sub.name,
          description: sub.description,
          icon: sub.icon,
        })) || [];

      const { data: category, message } = await categoryService.createCategory({
        ...data,
        subcategories,
        orderIndex: data.orderIndex || 0,
      });

      // Map children to subcategories for UI
      const uiSubcategories =
        category.children?.map((child) => ({
          id: child.id,
          name: child.name,
          description: child.description,
          icon: child.icon,
        })) || [];

      const categoryWithSubcategories = {
        ...category,
        subcategories: uiSubcategories,
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
        filters?.search,
        20, // limit
        0 // offset
      );

      // Flatten the hierarchical categories for flat display and map children to subcategories
      const flattenCategories = (cats: any[]): any[] => {
        if (!Array.isArray(cats)) return [];
        const result: any[] = [];
        for (const cat of cats) {
          // Map children to subcategories
          const subcategories =
            cat.children?.map((child: any) => ({
              id: child.id,
              name: child.name,
              description: child.description,
              icon: child.icon,
            })) || [];
          result.push({ ...cat, subcategories });
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

      const flattened = flattenCategories(response.data);

      set({
        categories: flattened,
        hasMore: response.meta?.hasMore ?? false,
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

  loadMoreCategories: async (filters?: {
    type?: "EXPENSE" | "INCOME";
    includeInactive?: boolean;
    search?: string;
  }): Promise<void> => {
    try {
      const { categories, hasMore } = get();

      if (!hasMore) {
        return;
      }

      set({ isLoadingMore: true, error: null });

      const response = await categoryService.getCategories(
        filters?.type,
        filters?.includeInactive,
        filters?.search,
        20, // limit
        categories.length // offset
      );

      // Flatten the hierarchical categories for flat display and map children to subcategories
      const flattenCategories = (cats: any[]): any[] => {
        if (!Array.isArray(cats)) return [];
        const result: any[] = [];
        for (const cat of cats) {
          // Map children to subcategories
          const subcategories =
            cat.children?.map((child: any) => ({
              id: child.id,
              name: child.name,
              description: child.description,
              icon: child.icon,
            })) || [];
          result.push({ ...cat, subcategories });
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

      const newCategories = flattenCategories(response.data);

      // Deduplicate by id to prevent infinite looping if API returns duplicates
      const existingIds = new Set(categories.map((cat) => cat.id));
      const uniqueNewCategories = newCategories.filter(
        (cat) => !existingIds.has(cat.id)
      );

      set({
        categories: [...categories, ...uniqueNewCategories],
        hasMore: response.meta?.hasMore ?? false,
        isLoadingMore: false,
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoadingMore: false,
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
      // If category not found, remove it from local state
      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("Category not found")
      ) {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          currentCategory:
            state.currentCategory?.id === id ? null : state.currentCategory,
        }));
      }
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

      const { data: updatedCategory, message } =
        await categoryService.updateCategory(id, data);

      // Map children to subcategories for UI
      const subcategories =
        updatedCategory.children?.map((child) => ({
          id: child.id,
          name: child.name,
          description: child.description,
          icon: child.icon,
        })) || [];

      const categoryWithSubcategories = {
        ...updatedCategory,
        subcategories,
      };

      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === id ? categoryWithSubcategories : cat
        ),
        currentCategory:
          state.currentCategory?.id === id
            ? categoryWithSubcategories
            : state.currentCategory,
        isLoading: false,
        successMessage: message,
      }));

      return categoryWithSubcategories;
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
