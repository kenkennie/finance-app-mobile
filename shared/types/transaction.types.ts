import { Transaction } from "./filter.types";

export interface TransactionItem {
  id: string;
  transactionId: string;
  categoryId: string;
  accountId: string;
  amount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  formattedItemAmount?: string;
  Category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  Account: {
    id: string;
    accountName: string;
    accountNumber: string;
    currency: string;
  };
}

export interface TransactionItemsState {
  transactionItems: TransactionItem[];
  isLoading: boolean;
  error: string | null;
}

export interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  successMessage: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    totalTransactions: number;
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
  };
}

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  type?: "EXPENSE" | "INCOME";
  categoryId?: string;
  categoryIds?: string[];
  accountId?: string;
  accountIds?: string[];
  status?: string;
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

export interface TransactionsResponse {
  data: Transaction[];
  summary?: {
    summary: {
      totalTransactions: number;
      totalIncome: number;
      totalExpenses: number;
      netAmount: number;
    };
    totalItems: number;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
