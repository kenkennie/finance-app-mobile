import { create } from "zustand";
import {
  Budget,
  BudgetState,
  BudgetStats,
  CreateBudgetData,
  UpdateBudgetData,
  OverallBudgetStats,
} from "@/shared/types/budget.types";
import { extractErrorMessage } from "@/shared/utils/api/responseHandler";
import { budgetService } from "@/shared/services/budget/budgetService";

interface BudgetStore extends BudgetState {
  // List state
  budgetStats: {
    [budgetId: string]: {
      totalAllocated: number;
      totalSpent: number;
      totalRemaining: number;
      overallPercentageUsed: number;
      categoryStats: {
        categoryId: string;
        categoryName: string;
        allocatedAmount: number;
        spentAmount: number;
        percentageUsed: number;
        isOverBudget: boolean;
      }[];
    };
  };
  overallStats: OverallBudgetStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoadingMore: boolean;
  hasMore: boolean;

  // Actions
  createBudget: (data: CreateBudgetData) => Promise<Budget>;
  getBudgets: (filters?: {
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  loadMoreBudgets: (filters?: {
    isActive?: boolean;
    search?: string;
  }) => Promise<void>;
  getBudgetById: (id: string) => Promise<Budget | null>;
  getBudgetWithStats: (
    id: string
  ) => Promise<(Budget & { stats: BudgetStats }) | null>;
  updateBudget: (id: string, data: UpdateBudgetData) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetStats: (id: string) => Promise<BudgetStats | null>;
  setCurrentBudget: (budget: Budget | null) => void;

  // Utility actions
  clearError: () => void;
  clearSuccess: () => void;
  resetPagination: () => void;
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
  budgetStats: {},
  overallStats: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

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

  getBudgets: async (filters = {}): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      const [budgetsResponse, statsResponse] = await Promise.all([
        budgetService.getBudgetsWithStats(filters),
        budgetService.getOverallBudgetStats(),
      ]);

      // Extract budgets and stats
      const budgets = budgetsResponse.data.map((item) => ({
        ...item,
        stats: undefined, // Remove stats from budget object
      }));

      const budgetStats: {
        [budgetId: string]: {
          totalAllocated: number;
          totalSpent: number;
          totalRemaining: number;
          overallPercentageUsed: number;
          categoryStats: {
            categoryId: string;
            categoryName: string;
            allocatedAmount: number;
            spentAmount: number;
            percentageUsed: number;
            isOverBudget: boolean;
          }[];
        };
      } = {};
      budgetsResponse.data.forEach((budgetWithStats) => {
        budgetStats[budgetWithStats.id] = {
          totalAllocated: budgetWithStats.stats.totalAllocated,
          totalSpent: budgetWithStats.stats.totalSpent,
          totalRemaining: budgetWithStats.stats.totalRemaining,
          overallPercentageUsed: budgetWithStats.stats.overallPercentageUsed,
          categoryStats: budgetWithStats.stats.categoryStats,
        };
      });

      set({
        budgets,
        budgetStats,
        overallStats: statsResponse,
        pagination: {
          page: budgetsResponse.meta.page,
          limit: budgetsResponse.meta.limit,
          total: budgetsResponse.meta.total,
          totalPages: budgetsResponse.meta.totalPages,
        },
        hasMore: budgetsResponse.meta.page < budgetsResponse.meta.totalPages,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  loadMoreBudgets: async (filters = {}): Promise<void> => {
    const currentPagination = get().pagination;
    if (currentPagination.page >= currentPagination.totalPages) {
      return; // No more pages
    }

    try {
      set({ isLoadingMore: true, error: null });

      const nextPage = currentPagination.page + 1;
      const budgetsResponse = await budgetService.getBudgetsWithStats({
        ...filters,
        page: nextPage,
        limit: currentPagination.limit,
      });

      // Extract budgets and stats
      const newBudgets = budgetsResponse.data.map((item) => ({
        ...item,
        stats: undefined, // Remove stats from budget object
      }));

      const newBudgetStats: {
        [budgetId: string]: {
          totalAllocated: number;
          totalSpent: number;
          totalRemaining: number;
          overallPercentageUsed: number;
          categoryStats: {
            categoryId: string;
            categoryName: string;
            allocatedAmount: number;
            spentAmount: number;
            percentageUsed: number;
            isOverBudget: boolean;
          }[];
        };
      } = {};
      budgetsResponse.data.forEach((budgetWithStats) => {
        newBudgetStats[budgetWithStats.id] = {
          totalAllocated: budgetWithStats.stats.totalAllocated,
          totalSpent: budgetWithStats.stats.totalSpent,
          totalRemaining: budgetWithStats.stats.totalRemaining,
          overallPercentageUsed: budgetWithStats.stats.overallPercentageUsed,
          categoryStats: budgetWithStats.stats.categoryStats,
        };
      });

      set((state) => ({
        budgets: [...state.budgets, ...newBudgets],
        budgetStats: { ...state.budgetStats, ...newBudgetStats },
        pagination: {
          page: budgetsResponse.meta.page,
          limit: budgetsResponse.meta.limit,
          total: budgetsResponse.meta.total,
          totalPages: budgetsResponse.meta.totalPages,
        },
        hasMore: budgetsResponse.meta.page < budgetsResponse.meta.totalPages,
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

  getBudgetWithStats: async (
    id: string
  ): Promise<(Budget & { stats: BudgetStats }) | null> => {
    try {
      set({ isLoading: true, error: null });

      const budgetWithStats = await budgetService.getBudgetById(id);

      set({ isLoading: false });
      return budgetWithStats;
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
  resetPagination: () =>
    set({
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      hasMore: true,
    }),
}));
