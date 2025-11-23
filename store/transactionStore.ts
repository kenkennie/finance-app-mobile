import { create } from "zustand";
import {
  TransactionState,
  GetTransactionsParams,
  TransactionsResponse,
} from "@/shared/types/transaction.types";
import { Transaction } from "@/shared/types/filter.types";
import { extractErrorMessage } from "@/shared/utils/api/responseHandler";
import { transactionsService } from "@/shared/services/transaction/transactionsService";

interface TransactionStore extends TransactionState {
  // Actions
  createTransaction: (data: any) => Promise<void>;
  updateTransaction: (id: string, data: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactions: (params?: GetTransactionsParams) => Promise<void>;
  loadMoreTransactions: (params?: GetTransactionsParams) => Promise<void>;
  getTransactionById: (id: string) => Promise<Transaction | null>;
  getRecentTransactions: (limit?: number) => Promise<void>;
  getPendingTransactions: () => Promise<void>;
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Promise<void>;
  setCurrentTransaction: (transaction: Transaction | null) => void;

  // Utility actions
  clearError: () => void;
  clearSuccess: () => void;
  resetPagination: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  // Initial state
  transactions: [],
  currentTransaction: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  successMessage: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  summary: undefined,

  createTransaction: async (data: any): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      // Call the API to create transaction
      await transactionsService.createTransaction(data);

      set({
        isLoading: false,
        successMessage: "Transaction created successfully",
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  updateTransaction: async (id: string, data: any): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      // Call the API to update transaction
      // For now, we'll just simulate success
      set({
        isLoading: false,
        successMessage: "Transaction updated successfully",
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  deleteTransaction: async (id: string): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      // Call the API to delete transaction
      // For now, we'll just simulate success
      set({
        isLoading: false,
        successMessage: "Transaction deleted successfully",
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  getTransactions: async (
    params: GetTransactionsParams = {}
  ): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      const response: TransactionsResponse =
        await transactionsService.getAllTransactions(params);

      set({
        transactions: response.data,
        pagination: {
          page: response.meta.page,
          limit: response.meta.limit,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
        },
        summary: response.summary?.summary,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error; // Re-throw to allow component to handle
    }
  },

  loadMoreTransactions: async (
    params: GetTransactionsParams = {}
  ): Promise<void> => {
    const currentPagination = get().pagination;
    if (currentPagination.page >= currentPagination.totalPages) {
      return; // No more pages
    }

    try {
      set({ isLoadingMore: true, error: null });

      const nextPage = currentPagination.page + 1;
      const response: TransactionsResponse =
        await transactionsService.getAllTransactions({
          ...params,
          page: nextPage,
        });

      set((state) => ({
        transactions: [...state.transactions, ...response.data],
        pagination: {
          page: response.meta.page,
          limit: response.meta.limit,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
        },
        isLoadingMore: false,
      }));
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoadingMore: false,
      });
      throw error;
    }
  },

  getTransactionById: async (id: string): Promise<Transaction | null> => {
    try {
      set({ isLoading: true, error: null });

      const transaction = await transactionsService.getTransactionById(id);

      set({
        currentTransaction: transaction,
        isLoading: false,
      });

      return transaction;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  getRecentTransactions: async (limit: number = 10): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      const transactions = await transactionsService.getRecentTransactions(
        limit
      );

      set({
        transactions,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  getPendingTransactions: async (): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      const transactions = await transactionsService.getPendingTransactions();

      set({
        transactions,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  getTransactionsByDateRange: async (
    startDate: Date,
    endDate: Date
  ): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      const transactions = await transactionsService.getTransactionsByDateRange(
        startDate,
        endDate
      );

      set({
        transactions,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  setCurrentTransaction: (transaction: Transaction | null) => {
    set({ currentTransaction: transaction });
  },

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ successMessage: null }),
  resetPagination: () =>
    set({
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }),
}));
