import { create } from "zustand";
import {
  TransactionState,
  GetTransactionsParams,
  TransactionsResponse,
} from "@/shared/types/transaction.types";
import { Transaction } from "@/shared/types/filter.types";
import { extractErrorMessage } from "@/shared/utils/api/responseHandler";
import { transactionsService } from "@/shared/services/transaction/transactionsService";
import { useAccountStore } from "./accountStore";

interface TransactionStore extends TransactionState {
  // Actions
  createTransaction: (data: any) => Promise<void>;
  updateTransaction: (id: string, data: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactions: (params?: GetTransactionsParams) => Promise<void>;
  loadMoreTransactions: (params?: GetTransactionsParams) => Promise<void>;
  getTransactionById: (id: string) => Promise<Transaction | null>;
  getRecentTransactions: (limit?: number) => Promise<void>; // Now uses getAllTransactions internally
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

      // Refresh accounts to update balances
      await useAccountStore.getState().getAccounts();

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
      const updatedTransaction = await transactionsService.updateTransaction(
        id,
        data
      );

      // Refresh accounts to update balances
      await useAccountStore.getState().getAccounts();

      // Update the transaction in the local state
      set((state) => ({
        transactions: state.transactions.map((transaction) =>
          transaction.id === id ? updatedTransaction : transaction
        ),
        currentTransaction:
          state.currentTransaction?.id === id
            ? updatedTransaction
            : state.currentTransaction,
        isLoading: false,
        successMessage: "Transaction updated successfully",
      }));
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
      await transactionsService.deleteTransaction(id);

      // Refresh accounts to update balances
      await useAccountStore.getState().getAccounts();

      // Remove the transaction from the local state
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        isLoading: false,
        successMessage: "Transaction deleted successfully",
      }));
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

      // Use getAllTransactions with sorting and limiting instead of non-existent /recent endpoint
      const response = await transactionsService.getAllTransactions({
        limit,
        sortBy: "date",
        sortOrder: "desc",
      });

      set({
        transactions: response.data,
        summary: response.summary,
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
