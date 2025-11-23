import { apiClient } from "@/config/api.config";
import {
  extractResponseData,
  handleApiResponse,
} from "@/shared/utils/api/responseHandler";
import { Transaction } from "@/shared/types/filter.types";

interface GetTransactionsParams {
  page?: number;
  limit?: number;
  type?: "EXPENSE" | "INCOME";
  categoryId?: string;
  categoryIds?: string[];
  accountId?: string;
  accountIds?: string[];
  status?: "PENDING" | "CLEARED" | "RECONCILED";
  statuses?: string[];
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  search?: string;
  isSplit?: boolean;
  includeChildren?: boolean;
  isRecurring?: boolean;
  sortBy?: "date" | "amount" | "description" | "createdAt" | "status";
  sortOrder?: "asc" | "desc";
}

interface TransactionsResponse {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const transactionsService = {
  async getAllTransactions(
    params: GetTransactionsParams = {}
  ): Promise<TransactionsResponse> {
    const queryParams = new URLSearchParams();

    // Add pagination
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    // Add filters
    if (params.type) queryParams.append("type", params.type);
    if (params.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params.categoryIds?.length)
      queryParams.append("categoryIds", params.categoryIds.join(","));
    if (params.accountId) queryParams.append("accountId", params.accountId);
    if (params.accountIds?.length)
      queryParams.append("accountIds", params.accountIds.join(","));
    if (params.status) queryParams.append("status", params.status);
    if (params.statuses?.length)
      queryParams.append("statuses", params.statuses.join(","));
    if (params.startDate)
      queryParams.append("startDate", params.startDate.toISOString());
    if (params.endDate)
      queryParams.append("endDate", params.endDate.toISOString());
    if (params.minAmount !== undefined)
      queryParams.append("minAmount", params.minAmount.toString());
    if (params.maxAmount !== undefined)
      queryParams.append("maxAmount", params.maxAmount.toString());
    if (params.tags?.length) queryParams.append("tags", params.tags.join(","));
    if (params.search) queryParams.append("search", params.search);
    if (params.isSplit !== undefined)
      queryParams.append("isSplit", params.isSplit.toString());
    if (params.includeChildren !== undefined)
      queryParams.append("includeChildren", params.includeChildren.toString());
    if (params.isRecurring !== undefined)
      queryParams.append("isRecurring", params.isRecurring.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await apiClient.get(
      `/transactions?${queryParams.toString()}`
    );
    const data = extractResponseData(response) as TransactionsResponse;

    // Transform the data to match mobile app expectations
    const transformedData: TransactionsResponse = {
      ...data,
      data: data.data.map((transaction: any) => {
        // For now, take the first transaction item (assuming single-item transactions)
        const firstItem = transaction.TransactionItems?.[0];
        return {
          ...transaction,
          type: transaction.transactionType?.toLowerCase() || transaction.type,
          status: transaction.status?.toLowerCase() || transaction.status,
          amount: firstItem?.amount || 0,
          title: transaction.title,
          category: firstItem?.Category
            ? {
                id: firstItem.Category.id,
                name: firstItem.Category.name,
                icon: firstItem.Category.icon,
                color: firstItem.Category.color,
                transactionType: firstItem.Category.transactionType,
              }
            : undefined,
          account: firstItem?.Account
            ? {
                id: firstItem.Account.id,
                accountName: firstItem.Account.accountName,
              }
            : undefined,
          categoryId: firstItem?.categoryId,
          accountId: firstItem?.accountId,
          categoryIcon: firstItem?.Category?.icon,
        };
      }),
    };

    return transformedData;
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const response = await apiClient.get(`/transactions/${id}`);
    const transaction = extractResponseData(response) as any;
    const firstItem = transaction.TransactionItems?.[0];
    return {
      ...transaction,
      type: transaction.transactionType?.toLowerCase() || transaction.type,
      status: transaction.status?.toLowerCase() || transaction.status,
      amount: firstItem?.amount || 0,
      title: transaction.title,
      category: firstItem?.Category
        ? {
            id: firstItem.Category.id,
            name: firstItem.Category.name,
            icon: firstItem.Category.icon,
            color: firstItem.Category.color,
            transactionType: firstItem.Category.transactionType,
          }
        : undefined,
      account: firstItem?.Account
        ? {
            id: firstItem.Account.id,
            accountName: firstItem.Account.accountName,
          }
        : undefined,
      categoryId: firstItem?.categoryId,
      accountId: firstItem?.accountId,
      categoryIcon: firstItem?.Category?.icon,
    };
  },

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    const response = await apiClient.get(`/transactions/recent?limit=${limit}`);
    const transactions = extractResponseData(response) as any[];
    return transactions.map((transaction: any) => {
      const firstItem = transaction.TransactionItems?.[0];
      return {
        ...transaction,
        type: transaction.transactionType?.toLowerCase() || transaction.type,
        status: transaction.status?.toLowerCase() || transaction.status,
        amount: firstItem?.amount || 0,
        title: transaction.title,
        category: firstItem?.Category
          ? {
              id: firstItem.Category.id,
              name: firstItem.Category.name,
              icon: firstItem.Category.icon,
              color: firstItem.Category.color,
              transactionType: firstItem.Category.transactionType,
            }
          : undefined,
        account: firstItem?.Account
          ? {
              id: firstItem.Account.id,
              accountName: firstItem.Account.accountName,
            }
          : undefined,
        categoryId: firstItem?.categoryId,
        accountId: firstItem?.accountId,
        categoryIcon: firstItem?.Category?.icon,
      };
    });
  },

  async getPendingTransactions(): Promise<Transaction[]> {
    const response = await apiClient.get("/transactions/pending");
    const transactions = extractResponseData(response) as any[];
    return transactions.map((transaction: any) => {
      const firstItem = transaction.TransactionItems?.[0];
      return {
        ...transaction,
        type: transaction.transactionType?.toLowerCase() || transaction.type,
        status: transaction.status?.toLowerCase() || transaction.status,
        amount: firstItem?.amount || 0,
        title: transaction.title,
        category: firstItem?.Category
          ? {
              id: firstItem.Category.id,
              name: firstItem.Category.name,
              icon: firstItem.Category.icon,
              color: firstItem.Category.color,
              transactionType: firstItem.Category.transactionType,
            }
          : undefined,
        account: firstItem?.Account
          ? {
              id: firstItem.Account.id,
              accountName: firstItem.Account.accountName,
            }
          : undefined,
        categoryId: firstItem?.categoryId,
        accountId: firstItem?.accountId,
        categoryIcon: firstItem?.Category?.icon,
      };
    });
  },

  async getTransactionsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    const queryParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    const response = await apiClient.get(
      `/transactions/by-date?${queryParams.toString()}`
    );
    const transactions = extractResponseData(response) as any[];
    return transactions.map((transaction: any) => {
      const firstItem = transaction.TransactionItems?.[0];
      return {
        ...transaction,
        type: transaction.transactionType?.toLowerCase() || transaction.type,
        status: transaction.status?.toLowerCase() || transaction.status,
        amount: firstItem?.amount || 0,
        title: transaction.title,
        category: firstItem?.Category
          ? {
              id: firstItem.Category.id,
              name: firstItem.Category.name,
              icon: firstItem.Category.icon,
              color: firstItem.Category.color,
              transactionType: firstItem.Category.transactionType,
            }
          : undefined,
        account: firstItem?.Account
          ? {
              id: firstItem.Account.id,
              accountName: firstItem.Account.accountName,
            }
          : undefined,
        categoryId: firstItem?.categoryId,
        accountId: firstItem?.accountId,
        categoryIcon: firstItem?.Category?.icon,
      };
    });
  },

  async createTransaction(data: any): Promise<any> {
    const response = await apiClient.post("/transactions", data);
    return extractResponseData(response);
  },

  async updateTransaction(id: string, data: any): Promise<any> {
    const response = await apiClient.patch(`/transactions/${id}`, data);
    return extractResponseData(response);
  },

  async deleteTransaction(id: string): Promise<any> {
    const response = await apiClient.delete(`/transactions/${id}`);
    return extractResponseData(response);
  },
};
