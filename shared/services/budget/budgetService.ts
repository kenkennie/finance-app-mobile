import {
  Budget,
  BudgetDetails,
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
    status?: string[];
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

    if (filters?.status && filters.status.length > 0) {
      queryParams.append("status", filters.status.join(","));
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
    status?: string[];
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    data: (Budget & { stats: BudgetDetails })[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();

    if (filters?.status && filters.status.length > 0) {
      queryParams.append("status", filters.status.join(","));
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
        data: (Budget & { stats: BudgetDetails })[];
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

  async getBudgetById(
    id: string
  ): Promise<Budget & { budgetDetails: BudgetDetails }> {
    const response = await apiClient.get<
      ApiSuccessResponse<Budget & { budgetDetails: BudgetDetails }>
    >(`/budgets/${id}`);

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
      message: result.message,
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

  async getBudgetStatistics(id: string): Promise<BudgetDetails> {
    const response = await apiClient.get<ApiSuccessResponse<BudgetDetails>>(
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

  async getBudgetTransactions(
    id: string,
    filters?: {
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<{
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();

    if (filters?.limit) {
      queryParams.append("limit", filters.limit.toString());
    }
    if (filters?.page) {
      queryParams.append("page", filters.page.toString());
    }
    if (filters?.sortBy) {
      queryParams.append("sortBy", filters.sortBy);
    }
    if (filters?.sortOrder) {
      queryParams.append("sortOrder", filters.sortOrder);
    }

    const url = `/budgets/${id}/transactions${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        data: any[];
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

  // ============================================
  // BUDGET STATUS TRANSITIONS
  // ============================================

  async suspendRenewal(
    id: string,
    reason?: string
  ): Promise<{
    data: Budget;
    message: string;
  }> {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: Budget;
    }>(`/budgets/${id}/suspend-renewal`, { reason });

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Budget renewal suspended successfully",
    };
  },

  async pauseTracking(
    id: string,
    reason?: string
  ): Promise<{
    data: Budget;
    message: string;
  }> {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: Budget;
    }>(`/budgets/${id}/pause-tracking`, { reason });

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Budget tracking paused successfully",
    };
  },

  async archiveBudget(
    id: string,
    reason?: string
  ): Promise<{
    data: Budget;
    message: string;
  }> {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: Budget;
    }>(`/budgets/${id}/archive`, { reason });

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Budget archived successfully",
    };
  },

  async resumeBudget(id: string): Promise<{
    data: Budget;
    message: string;
  }> {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: Budget;
    }>(`/budgets/${id}/resume`);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Budget resumed successfully",
    };
  },

  async restoreBudget(id: string): Promise<{
    data: Budget;
    message: string;
  }> {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: Budget;
    }>(`/budgets/${id}/restore`);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Budget restored successfully",
    };
  },

  async resumeTracking(id: string): Promise<{
    data: Budget;
    message: string;
  }> {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: Budget;
    }>(`/budgets/${id}/resume-tracking`);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Budget tracking resumed successfully",
    };
  },

  async renewBudget(id: string): Promise<{
    data: Budget;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: Budget;
    }>(`/budgets/${id}/renew`);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Budget renewed successfully",
    };
  },

  async getUpcomingBudgets(daysAhead: number = 30): Promise<Budget[]> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: Budget[];
    }>(`/budgets/upcoming/list?daysAhead=${daysAhead}`);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return result.data;
  },

  async getBudgetsWithStatus(filters?: {
    status?: string[];
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    data: (Budget & { stats?: BudgetDetails })[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();

    if (filters?.status && filters.status.length > 0) {
      queryParams.append("status", filters.status.join(","));
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
        data: (Budget & { stats?: BudgetDetails })[];
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
};
