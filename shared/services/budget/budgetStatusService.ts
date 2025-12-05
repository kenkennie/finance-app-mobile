import { apiClient } from "@/config/api.config";
import { BudgetStatus } from "@/shared/types/budget.types";
import { handleApiResponse } from "@/shared/utils/api/responseHandler";

export const budgetStatusService = {
  async getBudgetStatuses(): Promise<BudgetStatus[]> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: BudgetStatus[];
    }>("/budget-status");

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return result.data;
  },

  async getBudgetStatusById(id: string): Promise<BudgetStatus> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: BudgetStatus;
    }>(`/budget-status/${id}`);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return result.data;
  },
};
