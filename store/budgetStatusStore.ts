import { create } from "zustand";
import { BudgetStatus } from "@/shared/types/budget.types";
import { extractErrorMessage } from "@/shared/utils/api/responseHandler";

interface BudgetStatusState {
  budgetStatuses: BudgetStatus[];
  isLoading: boolean;
  error: string | null;
}

interface BudgetStatusStore extends BudgetStatusState {
  // Actions
  getBudgetStatuses: () => Promise<void>;
  clearError: () => void;
}

export const useBudgetStatusStore = create<BudgetStatusStore>((set, get) => ({
  // Initial state
  budgetStatuses: [],
  isLoading: false,
  error: null,

  getBudgetStatuses: async (): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      // For now, return hardcoded data since we don't have an API endpoint for budget statuses
      // In a real app, this would make an API call
      const mockBudgetStatuses: BudgetStatus[] = [
        {
          id: "active",
          name: "ACTIVE",
          color: "#10B981",
          description: "Budget is currently active",
          isActive: true,
        },
        {
          id: "draft",
          name: "DRAFT",
          color: "#F59E0B",
          description: "Budget is being created",
          isActive: true,
        },
        {
          id: "archived",
          name: "ARCHIVED",
          color: "#6B7280",
          description: "Budget is archived",
          isActive: true,
        },
        {
          id: "template",
          name: "TEMPLATE",
          color: "#3B82F6",
          description: "Budget template for reuse",
          isActive: true,
        },
      ];

      set({
        budgetStatuses: mockBudgetStatuses,
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

  clearError: () => set({ error: null }),
}));
