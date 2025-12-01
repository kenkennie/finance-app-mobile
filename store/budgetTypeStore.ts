import { create } from "zustand";
import { BudgetType } from "@/shared/types/budget.types";
import { extractErrorMessage } from "@/shared/utils/api/responseHandler";

interface BudgetTypeState {
  budgetTypes: BudgetType[];
  isLoading: boolean;
  error: string | null;
}

interface BudgetTypeStore extends BudgetTypeState {
  // Actions
  getBudgetTypes: () => Promise<void>;
  clearError: () => void;
}

export const useBudgetTypeStore = create<BudgetTypeStore>((set, get) => ({
  // Initial state
  budgetTypes: [],
  isLoading: false,
  error: null,

  getBudgetTypes: async (): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      // For now, return hardcoded data since we don't have an API endpoint for budget types
      // In a real app, this would make an API call
      const mockBudgetTypes: BudgetType[] = [
        {
          id: "flexible",
          name: "FLEXIBLE",
          color: "#10B981",
          description: "Set targets but allow flexibility",
          isActive: true,
        },
        {
          id: "zero-based",
          name: "ZERO_BASED",
          color: "#3B82F6",
          description: "Every dollar is assigned a purpose",
          isActive: true,
        },
        {
          id: "envelope",
          name: "ENVELOPE",
          color: "#F59E0B",
          description: "Digital envelopes with hard limits",
          isActive: true,
        },
        {
          id: "percentage-based",
          name: "PERCENTAGE_BASED",
          color: "#8B5CF6",
          description: "50/30/20 rule or custom ratios",
          isActive: true,
        },
      ];

      set({
        budgetTypes: mockBudgetTypes,
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
