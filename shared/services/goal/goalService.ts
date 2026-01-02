import {
  Goal,
  GoalDetails,
  OverallGoalStats,
  CreateGoalData,
  UpdateGoalData,
  AddContributionData,
  GoalContribution,
} from "@/shared/types/goal.types";
import { ApiSuccessResponse } from "@/shared/types/auth.types";
import { apiClient } from "@/config/api.config";
import {
  extractResponseData,
  handleApiResponse,
} from "@/shared/utils/api/responseHandler";

export const goalService = {
  async createGoal(goalData: CreateGoalData): Promise<{
    data: Goal;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: Goal;
    }>("/goals", goalData);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    // Transform Decimal fields to numbers
    const transformedData = {
      ...result.data,
      currentAmount: Number(result.data.currentAmount),
      targetAmount: Number(result.data.targetAmount),
    };

    return {
      data: transformedData,
      message: result.message || "Goal created successfully",
    };
  },

  async getGoals(filters?: {
    status?: string[];
    priority?: string[];
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    data: Goal[];
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
    if (filters?.priority && filters.priority.length > 0) {
      queryParams.append("priority", filters.priority.join(","));
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

    const url = `/goals${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        data: Goal[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    }>(url);

    const result = response.data.data;
    // Transform Decimal fields to numbers
    result.data = result.data.map((goal) => ({
      ...goal,
      currentAmount: Number(goal.currentAmount),
      targetAmount: Number(goal.targetAmount),
    }));

    return result;
  },

  async getGoalById(id: string): Promise<Goal> {
    const response = await apiClient.get<ApiSuccessResponse<Goal>>(
      `/goals/${id}`
    );
    const goal = extractResponseData(response);
    // Transform Decimal fields to numbers
    return {
      ...goal,
      currentAmount: Number(goal.currentAmount),
      targetAmount: Number(goal.targetAmount),
    };
  },

  async updateGoal(
    id: string,
    goalData: UpdateGoalData
  ): Promise<{
    data: Goal;
    message: string;
  }> {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: Goal;
    }>(`/goals/${id}`, goalData);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    // Transform Decimal fields to numbers
    const transformedData = {
      ...result.data,
      currentAmount: Number(result.data.currentAmount),
      targetAmount: Number(result.data.targetAmount),
    };

    return {
      data: transformedData,
      message: result.message || "Goal updated successfully",
    };
  },

  async deleteGoal(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: Goal;
    }>(`/goals/${id}`);

    const result = handleApiResponse(response);
    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      message: result.message || "Goal deleted successfully",
    };
  },

  async addContribution(
    goalId: string,
    contributionData: AddContributionData
  ): Promise<{
    data: Goal;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: Goal;
    }>(`/goals/${goalId}/contributions`, contributionData);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    // Transform Decimal fields to numbers
    const transformedData = {
      ...result.data,
      currentAmount: Number(result.data.currentAmount),
      targetAmount: Number(result.data.targetAmount),
    };

    return {
      data: transformedData,
      message: result.message || "Contribution added successfully",
    };
  },

  async getContributions(
    goalId: string,
    filters?: {
      limit?: number;
      page?: number;
    }
  ): Promise<{
    data: GoalContribution[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      activeCount?: number;
      completedCount?: number;
    };
  }> {
    const queryParams = new URLSearchParams();

    if (filters?.limit) {
      queryParams.append("limit", filters.limit.toString());
    }
    if (filters?.page) {
      queryParams.append("page", filters.page.toString());
    }

    const url = `/goals/${goalId}/contributions${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        data: GoalContribution[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    }>(url);

    const result = response.data.data;
    // Transform Decimal fields to numbers
    result.data = result.data.map((contribution) => ({
      ...contribution,
      amount: Number(contribution.amount),
    }));

    return result;
  },

  async updateContribution(
    goalId: string,
    contributionId: string,
    contributionData: Partial<AddContributionData>
  ): Promise<{
    data: Goal;
    message: string;
  }> {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: Goal;
    }>(`/goals/${goalId}/contributions/${contributionId}`, contributionData);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    // Transform Decimal fields to numbers
    const transformedData = {
      ...result.data,
      currentAmount: Number(result.data.currentAmount),
      targetAmount: Number(result.data.targetAmount),
    };

    return {
      data: transformedData,
      message: result.message || "Contribution updated successfully",
    };
  },

  async deleteContribution(
    goalId: string,
    contributionId: string
  ): Promise<{
    data: Goal;
    message: string;
  }> {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: Goal;
    }>(`/goals/${goalId}/contributions/${contributionId}`);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    // Transform Decimal fields to numbers
    const transformedData = {
      ...result.data,
      currentAmount: Number(result.data.currentAmount),
      targetAmount: Number(result.data.targetAmount),
    };

    return {
      data: transformedData,
      message: result.message || "Contribution deleted successfully",
    };
  },

  async pauseGoal(goalId: string): Promise<{
    data: Goal;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: Goal;
    }>(`/goals/${goalId}/pause`);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    // Transform Decimal fields to numbers
    const transformedData = {
      ...result.data,
      currentAmount: Number(result.data.currentAmount),
      targetAmount: Number(result.data.targetAmount),
    };

    return {
      data: transformedData,
      message: result.message || "Goal paused successfully",
    };
  },

  async resumeGoal(goalId: string): Promise<{
    data: Goal;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: Goal;
    }>(`/goals/${goalId}/resume`);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    // Transform Decimal fields to numbers
    const transformedData = {
      ...result.data,
      currentAmount: Number(result.data.currentAmount),
      targetAmount: Number(result.data.targetAmount),
    };

    return {
      data: transformedData,
      message: result.message || "Goal resumed successfully",
    };
  },

  // Note: Overall stats endpoint doesn't exist in backend yet
  // This would need to be added to the API
  async getOverallGoalStats(): Promise<OverallGoalStats> {
    // Placeholder - would need backend implementation
    throw new Error("Overall goal stats endpoint not implemented");
  },
};
