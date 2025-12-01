import { create } from "zustand";
import {
  Budget,
  BudgetState,
  BudgetStats,
  CreateBudgetData,
  UpdateBudgetData,
} from "@/shared/types/budget.types";
import { extractErrorMessage } from "@/shared/utils/api/responseHandler";
import { budgetService } from "@/shared/services/budget/budgetService";

interface BudgetStore extends BudgetState {
  // Actions
  createBudget: (data: CreateBudgetData) => Promise<Budget>;
  getBudgets: () => Promise<void>;
  getBudgetById: (id: string) => Promise<Budget | null>;
  updateBudget: (id: string, data: UpdateBudgetData) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetStats: (id: string) => Promise<BudgetStats | null>;
  setCurrentBudget: (budget: Budget | null) => void;

  // Utility actions
  clearError: () => void;
  clearSuccess: () => void;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  // Initial state
  budgets: [],
  currentBudget: null,
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  error: null,
  successMessage: null,

  createBudget: async (data: CreateBudgetData): Promise<Budget> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { data: budget, message } = await budgetService.createBudget(data);

      set((state) => ({
        budgets: [budget, ...state.budgets],
        isLoading: false,
        successMessage: message,
      }));

      return budget;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  getBudgets: async (): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      const { data: budgets } = await budgetService.getBudgets();

      set({
        budgets: budgets,
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

  getBudgetById: async (id: string): Promise<Budget | null> => {
    try {
      set({ isLoading: true, error: null });

      const budget = await budgetService.getBudgetById(id);

      set({ isLoading: false });
      return budget;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  updateBudget: async (id: string, data: UpdateBudgetData): Promise<Budget> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { data: updatedBudget, message } = await budgetService.updateBudget(
        id,
        data
      );

      const updatedBudgets = get().budgets.map((budget) =>
        budget.id === id ? updatedBudget : budget
      );

      set({
        budgets: updatedBudgets,
        currentBudget:
          get().currentBudget?.id === id ? updatedBudget : get().currentBudget,
        isLoading: false,
        successMessage: message,
      });

      return updatedBudget;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Update Budget Error:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  deleteBudget: async (id: string): Promise<void> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { message } = await budgetService.deleteBudget(id);

      // Remove the budget from local state
      const { budgets } = get();
      const filteredBudgets = budgets.filter((budget) => budget.id !== id);

      set({
        budgets: filteredBudgets,
        currentBudget:
          get().currentBudget?.id === id ? null : get().currentBudget,
        isLoading: false,
        successMessage: message,
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

  getBudgetStats: async (id: string): Promise<BudgetStats | null> => {
    try {
      set({ isLoading: true, error: null });

      const stats = await budgetService.getBudgetStats(id);

      set({ isLoading: false });
      return stats;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  setCurrentBudget: (budget: Budget | null) => {
    set({ currentBudget: budget });
  },

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ successMessage: null }),
}));
