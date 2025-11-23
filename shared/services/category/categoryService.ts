import { Category } from "@/shared/types/category.types";
import { ApiSuccessResponse } from "@/shared/types/auth.types";
import { apiClient } from "@/config/api.config";
import {
  extractResponseData,
  handleApiResponse,
} from "@/shared/utils/api/responseHandler";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/schemas/category.schema";

export const categoryService = {
  async createCategory(
    categoryData: Omit<CreateCategoryDto, "subcategories">
  ): Promise<{
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
    search?: string
  ): Promise<{ data: Category[]; meta: any }> {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (includeInactive) params.append("includeInactive", "true");
    if (search) params.append("search", search);

    const queryString = params.toString();
    const url = queryString ? `/categories?${queryString}` : "/categories";

    const response = await apiClient.get<{ data: Category[]; meta: any }>(url);
    // console.log("====================================");
    // console.log(response.data.data);
    // console.log("====================================");

    return response.data.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<ApiSuccessResponse<Category>>(
      `/categories/${id}`
    );
    return extractResponseData(response);
  },

  async updateCategory(
    id: string,
    categoryData: Omit<UpdateCategoryDto, "subcategories">
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
