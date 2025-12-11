import { create } from "zustand";
import {
  Budget,
  BudgetStoreState,
  BudgetDetails,
  CreateBudgetData,
  UpdateBudgetData,
} from "@/shared/types/budget.types";
import { extractErrorMessage } from "@/shared/utils/api/responseHandler";
import { budgetService } from "@/shared/services/budget/budgetService";

interface BudgetStore extends BudgetStoreState {
  // Actions
  createBudget: (data: CreateBudgetData) => Promise<Budget>;
  getBudgets: (filters?: {
    status?: ("active" | "suspended" | "paused" | "archived")[];
    search?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  loadMoreBudgets: (filters?: {
    status?: ("active" | "suspended" | "paused" | "archived")[];
    search?: string;
  }) => Promise<void>;
  getBudgetById: (id: string) => Promise<Budget | null>;
  getBudgetWithStats: (
    id: string
  ) => Promise<(Budget & { budgetDetails: BudgetDetails }) | null>;
  updateBudget: (id: string, data: UpdateBudgetData) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetStats: (id: string) => Promise<BudgetDetails | null>;
  getBudgetTransactions: (
    id: string,
    filters?: {
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ) => Promise<{
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  } | null>;
  setCurrentBudget: (budget: Budget | null) => void;

  // Utility actions
  clearError: () => void;
  clearSuccess: () => void;
  resetPagination: () => void;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  // Initial state - now using BudgetStoreState interface
  budgets: [],
  currentBudget: null,
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  error: null,
  successMessage: null,
  budgetDetails: {},
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
        budgetService.getBudgetsWithStatus(filters),
        budgetService.getOverallBudgetStats(),
      ]);

      // Add safety checks for undefined/null response data
      if (!budgetsResponse?.data || !Array.isArray(budgetsResponse.data)) {
        console.warn("Budgets response data is invalid:", budgetsResponse);
        set({
          budgets: [],
          budgetDetails: {},
          overallStats: statsResponse || null,
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
          hasMore: false,
          isLoading: false,
        });
        return;
      }

      // Extract budgets and their associated details (BudgetDetails)
      const budgetsWithDetails = budgetsResponse.data.filter(
        (item) => item && item.stats
      );
      const budgets = budgetsWithDetails.map((item) => ({
        ...item,
        stats: undefined, // Remove stats from budget object to keep clean
      }));

      // Create budgetDetails map using proper BudgetDetails type
      const budgetDetails: { [budgetId: string]: BudgetDetails } = {};
      budgetsWithDetails.forEach((budgetWithDetails) => {
        if (budgetWithDetails?.stats) {
          // The stats from API already match BudgetDetails structure
          budgetDetails[budgetWithDetails.id] = budgetWithDetails.stats;
        }
      });

      set({
        budgets,
        budgetDetails,
        overallStats: statsResponse,
        pagination: {
          page: budgetsResponse.meta?.page || 1,
          limit: budgetsResponse.meta?.limit || 20,
          total: budgetsResponse.meta?.total || 0,
          totalPages: budgetsResponse.meta?.totalPages || 0,
        },
        hasMore:
          (budgetsResponse.meta?.page || 1) <
          (budgetsResponse.meta?.totalPages || 0),
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Error loading budgets:", errorMessage);
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
      const budgetsResponse = await budgetService.getBudgetsWithStatus({
        ...filters,
        page: nextPage,
        limit: currentPagination.limit,
      });

      // Add safety checks for undefined/null response data
      if (!budgetsResponse?.data || !Array.isArray(budgetsResponse.data)) {
        console.warn(
          "Load more budgets response data is invalid:",
          budgetsResponse
        );
        set({
          isLoadingMore: false,
        });
        return;
      }

      // Extract budgets and their details
      const newBudgetsWithDetails = budgetsResponse.data.filter(
        (item) => item && item.stats
      );
      const newBudgets = newBudgetsWithDetails.map((item) => ({
        ...item,
        stats: undefined, // Remove stats from budget object
      }));

      // Create new budgetDetails map
      const newBudgetDetails: { [budgetId: string]: BudgetDetails } = {};
      newBudgetsWithDetails.forEach((budgetWithDetails) => {
        if (budgetWithDetails?.stats) {
          newBudgetDetails[budgetWithDetails.id] = budgetWithDetails.stats;
        }
      });

      set((state) => ({
        budgets: [...state.budgets, ...newBudgets],
        budgetDetails: { ...state.budgetDetails, ...newBudgetDetails },
        pagination: {
          page: budgetsResponse.meta?.page || currentPagination.page,
          limit: budgetsResponse.meta?.limit || currentPagination.limit,
          total: budgetsResponse.meta?.total || currentPagination.total,
          totalPages:
            budgetsResponse.meta?.totalPages || currentPagination.totalPages,
        },
        hasMore:
          (budgetsResponse.meta?.page || currentPagination.page) <
          (budgetsResponse.meta?.totalPages || currentPagination.totalPages),
        isLoadingMore: false,
      }));
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Error loading more budgets:", errorMessage);
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

      // Add safety check for budget
      if (!budget) {
        set({ isLoading: false });
        return null;
      }

      set({ isLoading: false });
      return budget;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Error getting budget by ID:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  getBudgetWithStats: async (
    id: string
  ): Promise<(Budget & { budgetDetails: BudgetDetails }) | null> => {
    try {
      set({ isLoading: true, error: null });

      const budgetWithDetails = await budgetService.getBudgetById(id);

      // Add safety check for budgetWithDetails
      if (!budgetWithDetails) {
        set({ isLoading: false });
        return null;
      }

      set({ isLoading: false });
      return budgetWithDetails;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Error getting budget with stats:", errorMessage);
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

  getBudgetStats: async (id: string): Promise<BudgetDetails | null> => {
    try {
      set({ isLoading: true, error: null });

      const stats = await budgetService.getBudgetStats(id);

      // Add safety check for stats
      if (!stats) {
        set({ isLoading: false });
        return null;
      }

      set({ isLoading: false });
      return stats;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Error getting budget stats:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  getBudgetTransactions: async (
    id: string,
    filters?: {
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<{
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  } | null> => {
    try {
      set({ isLoading: true, error: null });

      const transactions = await budgetService.getBudgetTransactions(
        id,
        filters
      );

      // Add safety check for transactions response
      if (!transactions) {
        set({ isLoading: false });
        return null;
      }

      set({ isLoading: false });
      return transactions;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Error getting budget transactions:", errorMessage);
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
