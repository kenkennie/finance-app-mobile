import {
  Budget,
  BudgetStats,
  OverallBudgetStats,
  CreateBudgetData,
  UpdateBudgetData,
} from "@/shared/types/budget.types";
import { ApiSuccessResponse } from "@/shared/types/auth.types";
import { apiClient } from "@/config/api.config";
import {
  extractResponseData,
  handleApiResponse,
} from "@/shared/utils/api/responseHandler";

export const budgetService = {
  async createBudget(budgetData: CreateBudgetData): Promise<{
    data: Budget;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: Budget;
    }>("/budgets", budgetData);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Budget created successfully",
    };
  },

  async getBudgets(filters?: {
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    data: Budget[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();

    if (filters?.isActive !== undefined) {
      queryParams.append("isActive", filters.isActive.toString());
    }
    if (filters?.startDate) {
      queryParams.append("startDate", filters.startDate);
    }
    if (filters?.endDate) {
      queryParams.append("endDate", filters.endDate);
    }
    if (filters?.search) {
      queryParams.append("search", filters.search);
    }
    if (filters?.limit) {
      queryParams.append("limit", filters.limit.toString());
    }
    if (filters?.page) {
      queryParams.append("page", filters.page.toString());
    }

    const url = `/budgets${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        data: Budget[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    }>(url);

    return response.data.data;
  },

  async getBudgetsWithStats(filters?: {
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    data: (Budget & { stats: BudgetStats })[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();

    if (filters?.isActive !== undefined) {
      queryParams.append("isActive", filters.isActive.toString());
    }
    if (filters?.startDate) {
      queryParams.append("startDate", filters.startDate);
    }
    if (filters?.endDate) {
      queryParams.append("endDate", filters.endDate);
    }
    if (filters?.search) {
      queryParams.append("search", filters.search);
    }
    if (filters?.limit) {
      queryParams.append("limit", filters.limit.toString());
    }
    if (filters?.page) {
      queryParams.append("page", filters.page.toString());
    }

    const url = `/budgets/with-stats${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        data: (Budget & { stats: BudgetStats })[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    }>(url);
    console.log("===========queryParamsqueryParams=========================");
    console.log(url);
    console.log("=============queryParamsqueryParams=======================");
    return response.data.data;
  },

  async getBudgetById(id: string): Promise<Budget> {
    const response = await apiClient.get<ApiSuccessResponse<Budget>>(
      `/budgets/${id}`
    );
    return extractResponseData(response);
  },

  async updateBudget(
    id: string,
    budgetData: UpdateBudgetData
  ): Promise<{
    data: Budget;
    message: string;
  }> {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: Budget;
    }>(`/budgets/${id}`, budgetData);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Budget updated successfully",
    };
  },

  async deleteBudget(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: Budget;
    }>(`/budgets/${id}`);

    const result = handleApiResponse(response);
    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      message: result.message || "Budget deleted successfully",
    };
  },

  async getBudgetStats(id: string): Promise<BudgetStats> {
    const response = await apiClient.get<ApiSuccessResponse<BudgetStats>>(
      `/budgets/${id}/stats`
    );
    return extractResponseData(response);
  },

  async getOverallBudgetStats(): Promise<OverallBudgetStats> {
    const response = await apiClient.get<
      ApiSuccessResponse<OverallBudgetStats>
    >("/budgets/stats/overview");
    return extractResponseData(response);
  },
};
