import { create } from "zustand";
import {
  TransactionItemsState,
  TransactionItem,
} from "@/shared/types/transaction.types";
import { extractErrorMessage } from "@/shared/utils/api/responseHandler";
import { transactionItemsService } from "@/shared/services/transaction-items/transactionItemsService";

interface TransactionItemsStore extends TransactionItemsState {
  // Actions
  getTransactionItemsByTransactionId: (transactionId: string) => Promise<void>;
  createTransactionItem: (data: any) => Promise<void>;
  updateTransactionItem: (id: string, data: any) => Promise<void>;
  deleteTransactionItem: (id: string) => Promise<void>;

  // Utility actions
  clearError: () => void;
  reset: () => void;
}

export const useTransactionItemsStore = create<TransactionItemsStore>(
  (set, get) => ({
    // Initial state
    transactionItems: [],
    isLoading: false,
    error: null,

    getTransactionItemsByTransactionId: async (
      transactionId: string
    ): Promise<void> => {
      try {
        set({ isLoading: true, error: null });

        const transactionItems =
          await transactionItemsService.getTransactionItemsByTransactionId(
            transactionId
          );

        set({
          transactionItems,
          isLoading: false,
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

    createTransactionItem: async (data: any): Promise<void> => {
      try {
        set({ isLoading: true, error: null });

        await transactionItemsService.createTransactionItem(data);

        set({
          isLoading: false,
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

    updateTransactionItem: async (id: string, data: any): Promise<void> => {
      try {
        set({ isLoading: true, error: null });

        await transactionItemsService.updateTransactionItem(id, data);

        set({
          isLoading: false,
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

    deleteTransactionItem: async (id: string): Promise<void> => {
      try {
        set({ isLoading: true, error: null });

        await transactionItemsService.deleteTransactionItem(id);

        set({
          isLoading: false,
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

    clearError: () => set({ error: null }),
    reset: () =>
      set({
        transactionItems: [],
        isLoading: false,
        error: null,
      }),
  })
);
