import { create } from "zustand";
import { BudgetPhilosophy } from "@/shared/types/budget.types";
import { extractErrorMessage } from "@/shared/utils/api/responseHandler";

interface BudgetPhilosophyState {
  budgetPhilosophies: BudgetPhilosophy[];
  isLoading: boolean;
  error: string | null;
}

interface BudgetPhilosophyStore extends BudgetPhilosophyState {
  // Actions
  getBudgetPhilosophies: () => Promise<void>;
  clearError: () => void;
}

export const useBudgetPhilosophyStore = create<BudgetPhilosophyStore>(
  (set, get) => ({
    // Initial state
    budgetPhilosophies: [],
    isLoading: false,
    error: null,

    getBudgetPhilosophies: async (): Promise<void> => {
      try {
        set({ isLoading: true, error: null });

        // For now, return hardcoded data since we don't have an API endpoint for budget philosophies
        // In a real app, this would make an API call
        const mockBudgetPhilosophies: BudgetPhilosophy[] = [
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
            id: "fifty-thirty-twenty",
            name: "FIFTY_THIRTY_TWENTY",
            color: "#F59E0B",
            description: "50% needs, 30% wants, 20% savings",
            isActive: true,
          },
          {
            id: "envelope",
            name: "ENVELOPE",
            color: "#8B5CF6",
            description: "Digital envelopes with hard limits",
            isActive: true,
          },
        ];

        set({
          budgetPhilosophies: mockBudgetPhilosophies,
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
  })
);
