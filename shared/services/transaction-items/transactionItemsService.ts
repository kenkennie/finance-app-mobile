import { apiClient } from "@/config/api.config";
import {
  extractResponseData,
  handleApiResponse,
} from "@/shared/utils/api/responseHandler";
import { TransactionItem } from "@/shared/types/transaction.types";

export const transactionItemsService = {
  async getTransactionItemsByTransactionId(
    transactionId: string
  ): Promise<TransactionItem[]> {
    const response = await apiClient.get(
      `/transaction-items/transaction/${transactionId}`
    );
    const data = extractResponseData(response) as { data: TransactionItem[] };
    return data.data || [];
  },

  async getTransactionItemById(id: string): Promise<TransactionItem> {
    const response = await apiClient.get(`/transaction-items/${id}`);
    const data = extractResponseData(response) as { data: TransactionItem };
    return data.data;
  },

  async createTransactionItem(data: any): Promise<TransactionItem> {
    const response = await apiClient.post("/transaction-items", data);
    const result = extractResponseData(response) as { data: TransactionItem };
    return result.data;
  },

  async updateTransactionItem(id: string, data: any): Promise<TransactionItem> {
    const response = await apiClient.patch(`/transaction-items/${id}`, data);
    const result = extractResponseData(response) as { data: TransactionItem };
    return result.data;
  },

  async deleteTransactionItem(id: string): Promise<void> {
    await apiClient.delete(`/transaction-items/${id}`);
  },
};
