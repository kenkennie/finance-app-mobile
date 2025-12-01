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

  async getBudgets(): Promise<{ data: Budget[] }> {
    const response = await apiClient.get<{ data: Budget[] }>("/budgets");
    return response.data;
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
