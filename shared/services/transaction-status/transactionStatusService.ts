import { apiClient } from "@/config/api.config";
import { ApiSuccessResponse } from "@/shared/types/auth.types";
import {
  extractResponseData,
  handleApiResponse,
} from "@/shared/utils/api/responseHandler";

export interface TransactionStatus {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export const transactionStatusService = {
  async getAll(): Promise<{ data: TransactionStatus[]; meta: any }> {
    const response = await apiClient.get<{
      data: TransactionStatus[];
      meta: any;
    }>("/transaction-status");
    return response.data;
  },

  async getById(id: string): Promise<TransactionStatus> {
    const response = await apiClient.get<ApiSuccessResponse<TransactionStatus>>(
      `/transaction-status/${id}`
    );
    return extractResponseData(response);
  },

  async create(data: Omit<TransactionStatus, "id">): Promise<{
    data: TransactionStatus;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: TransactionStatus;
    }>("/transaction-status", data);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Transaction status created successfully",
    };
  },

  async update(
    id: string,
    data: Partial<TransactionStatus>
  ): Promise<{
    data: TransactionStatus;
    message: string;
  }> {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: TransactionStatus;
    }>(`/transaction-status/${id}`, data);

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Transaction status updated successfully",
    };
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: null;
    }>(`/transaction-status/${id}`);

    const result = handleApiResponse(response);
    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      message: result.message || "Transaction status deleted successfully",
    };
  },
};
