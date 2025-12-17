import { Category } from "@/shared/types/category.types";
import { ApiSuccessResponse } from "@/shared/types/auth.types";
import { apiClient } from "@/config/api.config";
import { handleApiResponse } from "@/shared/utils/api/responseHandler";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/schemas/category.schema";

export const categoryService = {
  async createCategory(categoryData: CreateCategoryDto): Promise<{
    data: Category;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: Category;
    }>("/categories", categoryData);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Category created successfully",
    };
  },

  async getCategories(
    type?: "EXPENSE" | "INCOME",
    includeInactive?: boolean,
    search?: string,
    limit?: number,
    offset?: number
  ): Promise<{ data: Category[]; meta: any }> {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (includeInactive) params.append("includeInactive", "true");
    if (search) params.append("search", search);
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());

    const queryString = params.toString();
    const url = queryString ? `/categories?${queryString}` : "/categories";

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        data: Category[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    }>(url);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message || "Failed to fetch categories");
    }

    return result.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<ApiSuccessResponse<Category>>(
      `/categories/${id}`
    );

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message || "Failed to fetch category");
    }
    return result.data;
  },

  async updateCategory(
    id: string,
    categoryData: UpdateCategoryDto
  ): Promise<{
    data: Category;
    message: string;
  }> {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: Category;
    }>(`/categories/${id}`, categoryData);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Category updated successfully",
    };
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: null;
    }>(`/categories/${id}`);

    const result = handleApiResponse(response);
    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      message: result.message || "Category deleted successfully",
    };
  },
};
