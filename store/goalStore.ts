import { create } from "zustand";
import {
  Goal,
  GoalStoreState,
  GoalDetails,
  CreateGoalData,
  UpdateGoalData,
  AddContributionData,
  GoalContribution,
} from "@/shared/types/goal.types";
import { extractErrorMessage } from "@/shared/utils/api/responseHandler";
import { goalService } from "@/shared/services/goal/goalService";

interface GoalStore extends GoalStoreState {
  // Actions
  createGoal: (data: CreateGoalData) => Promise<Goal>;
  getGoals: (filters?: {
    status?: string[];
    priority?: string[];
    search?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  loadMoreGoals: (filters?: {
    status?: string[];
    priority?: string[];
    search?: string;
  }) => Promise<void>;
  getGoalById: (id: string) => Promise<Goal | null>;
  getGoalIncludingDetails: (id: string) => Promise<GoalDetails | null>;
  updateGoal: (id: string, data: UpdateGoalData) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (goalId: string, data: AddContributionData) => Promise<Goal>;
  updateContribution: (
    goalId: string,
    contributionId: string,
    data: Partial<AddContributionData>
  ) => Promise<Goal>;
  deleteContribution: (goalId: string, contributionId: string) => Promise<Goal>;
  getContributions: (
    goalId: string,
    filters?: {
      limit?: number;
      page?: number;
    }
  ) => Promise<{
    data: GoalContribution[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  } | null>;
  pauseGoal: (id: string) => Promise<Goal>;
  resumeGoal: (id: string) => Promise<Goal>;
  setCurrentGoal: (goal: Goal | null) => void;

  // Utility actions
  clearError: () => void;
  clearSuccess: () => void;
  resetPagination: () => void;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  // Initial state
  goals: [],
  currentGoal: null,
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  error: null,
  successMessage: null,
  goalDetails: {},
  overallStats: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  createGoal: async (data: CreateGoalData): Promise<Goal> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { data: goal, message } = await goalService.createGoal(data);

      // Refresh the goals list to ensure proper ordering and pagination
      await get().getGoals();

      set({
        isLoading: false,
        successMessage: message,
      });

      return goal;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  getGoals: async (filters = {}): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      const goalsResponse = await goalService.getGoals(filters);

      if (!goalsResponse?.data || !Array.isArray(goalsResponse.data)) {
        set({
          goals: [],
          goalDetails: {},
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            activeCount: 0,
            completedCount: 0,
          },
          hasMore: false,
          isLoading: false,
        });
        return;
      }

      set({
        goals: goalsResponse.data,
        goalDetails: {}, // Clear details when loading new list
        pagination: {
          page: goalsResponse.meta?.page || 1,
          limit: goalsResponse.meta?.limit || 20,
          total: goalsResponse.meta?.total || 0,
          totalPages: goalsResponse.meta?.totalPages || 0,
          activeCount: (goalsResponse.meta as any)?.activeCount || 0,
          completedCount: (goalsResponse.meta as any)?.completedCount || 0,
        },
        hasMore:
          (goalsResponse.meta?.page || 1) <
          (goalsResponse.meta?.totalPages || 0),
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Error loading goals:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  loadMoreGoals: async (filters = {}): Promise<void> => {
    const currentPagination = get().pagination;
    if (currentPagination.page >= currentPagination.totalPages) {
      return;
    }

    try {
      set({ isLoadingMore: true, error: null });

      const nextPage = currentPagination.page + 1;
      const goalsResponse = await goalService.getGoals({
        ...filters,
        page: nextPage,
        limit: currentPagination.limit,
      });

      if (!goalsResponse?.data || !Array.isArray(goalsResponse.data)) {
        console.warn(
          "Load more goals response data is invalid:",
          goalsResponse
        );
        set({ isLoadingMore: false });
        return;
      }

      set((state) => ({
        goals: [...state.goals, ...goalsResponse.data],
        pagination: {
          page: goalsResponse.meta?.page || currentPagination.page,
          limit: goalsResponse.meta?.limit || currentPagination.limit,
          total: goalsResponse.meta?.total || currentPagination.total,
          totalPages:
            goalsResponse.meta?.totalPages || currentPagination.totalPages,
          activeCount:
            (goalsResponse.meta as any)?.activeCount ||
            currentPagination.activeCount,
          completedCount:
            (goalsResponse.meta as any)?.completedCount ||
            currentPagination.completedCount,
        },
        hasMore:
          (goalsResponse.meta?.page || currentPagination.page) <
          (goalsResponse.meta?.totalPages || currentPagination.totalPages),
        isLoadingMore: false,
      }));
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Error loading more goals:", errorMessage);
      set({
        error: errorMessage,
        isLoadingMore: false,
      });
      throw error;
    }
  },

  getGoalById: async (id: string): Promise<Goal | null> => {
    try {
      set({ isLoading: true, error: null });

      const goal = await goalService.getGoalById(id);

      if (!goal) {
        set({ isLoading: false });
        return null;
      }

      set({ isLoading: false });
      return goal;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Error getting goal by ID:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  getGoalIncludingDetails: async (id: string): Promise<GoalDetails | null> => {
    try {
      set({ isLoading: true, error: null });

      const [goal, contributions] = await Promise.all([
        goalService.getGoalById(id),
        goalService.getContributions(id),
      ]);

      if (!goal) {
        set({ isLoading: false });
        return null;
      }

      const goalDetails: GoalDetails = {
        ...goal,
        contributions: contributions?.data || [],
        totalContributions: contributions?.meta?.total || 0,
        recentContributions: (contributions?.data || []).slice(0, 5), // Last 5 contributions
      };

      set((state) => ({
        goalDetails: { ...state.goalDetails, [id]: goalDetails },
        isLoading: false,
      }));

      return goalDetails;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Error getting goal with details:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  updateGoal: async (id: string, data: UpdateGoalData): Promise<Goal> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { data: updatedGoal, message } = await goalService.updateGoal(
        id,
        data
      );

      const updatedGoals = get().goals.map((goal) =>
        goal.id === id ? updatedGoal : goal
      );

      // Refresh goal details for the updated goal
      await get().getGoalIncludingDetails(id);

      set({
        goals: updatedGoals,
        currentGoal:
          get().currentGoal?.id === id ? updatedGoal : get().currentGoal,
        isLoading: false,
        successMessage: message,
      });

      return updatedGoal;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Update Goal Error:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  deleteGoal: async (id: string): Promise<void> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { message } = await goalService.deleteGoal(id);

      const { goals } = get();
      const filteredGoals = goals.filter((goal) => goal.id !== id);

      set({
        goals: filteredGoals,
        currentGoal: get().currentGoal?.id === id ? null : get().currentGoal,
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

  addContribution: async (
    goalId: string,
    data: AddContributionData
  ): Promise<Goal> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { data: updatedGoal, message } = await goalService.addContribution(
        goalId,
        data
      );
      console.log(
        "Store addContribution: updatedGoal.currentAmount:",
        updatedGoal.currentAmount
      );

      // Update the goal in the list
      const updatedGoals = get().goals.map((goal) =>
        goal.id === goalId ? updatedGoal : goal
      );

      // Update goal details if they exist
      const currentDetails = get().goalDetails[goalId];
      if (currentDetails) {
        // Refresh contributions for this goal
        const contributions = await goalService.getContributions(goalId);
        const updatedDetails: GoalDetails = {
          ...currentDetails,
          ...updatedGoal,
          contributions: contributions?.data || [],
          totalContributions: contributions?.meta?.total || 0,
          recentContributions: (contributions?.data || []).slice(0, 5),
        };
        console.log(
          "Store addContribution: updated goalDetails currentAmount:",
          updatedDetails.currentAmount
        );
        set((state) => ({
          goalDetails: { ...state.goalDetails, [goalId]: updatedDetails },
        }));
      }

      console.log(
        "Store addContribution: updated goals array, goal",
        goalId,
        "currentAmount:",
        updatedGoal.currentAmount
      );
      set({
        goals: updatedGoals,
        currentGoal:
          get().currentGoal?.id === goalId ? updatedGoal : get().currentGoal,
        isLoading: false,
        successMessage: message,
      });

      return updatedGoal;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Add Contribution Error:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  updateContribution: async (
    goalId: string,
    contributionId: string,
    data: Partial<AddContributionData>
  ): Promise<Goal> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { data: updatedGoal, message } =
        await goalService.updateContribution(goalId, contributionId, data);

      // Update the goal in the list
      const updatedGoals = get().goals.map((goal) =>
        goal.id === goalId ? updatedGoal : goal
      );

      // Update goal details if they exist
      const currentDetails = get().goalDetails[goalId];
      if (currentDetails) {
        // Refresh contributions for this goal
        const contributions = await goalService.getContributions(goalId);
        const updatedDetails: GoalDetails = {
          ...currentDetails,
          ...updatedGoal,
          contributions: contributions?.data || [],
          totalContributions: contributions?.meta?.total || 0,
          recentContributions: (contributions?.data || []).slice(0, 5),
        };
        set((state) => ({
          goalDetails: { ...state.goalDetails, [goalId]: updatedDetails },
        }));
      }

      set({
        goals: updatedGoals,
        currentGoal:
          get().currentGoal?.id === goalId ? updatedGoal : get().currentGoal,
        isLoading: false,
        successMessage: message,
      });

      return updatedGoal;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Update Contribution Error:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  deleteContribution: async (
    goalId: string,
    contributionId: string
  ): Promise<Goal> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { data: updatedGoal, message } =
        await goalService.deleteContribution(goalId, contributionId);

      // Update the goal in the list
      const updatedGoals = get().goals.map((goal) =>
        goal.id === goalId ? updatedGoal : goal
      );

      // Update goal details if they exist
      const currentDetails = get().goalDetails[goalId];
      if (currentDetails) {
        // Refresh contributions for this goal
        const contributions = await goalService.getContributions(goalId);
        const updatedDetails: GoalDetails = {
          ...currentDetails,
          ...updatedGoal,
          contributions: contributions?.data || [],
          totalContributions: contributions?.meta?.total || 0,
          recentContributions: (contributions?.data || []).slice(0, 5),
        };
        set((state) => ({
          goalDetails: { ...state.goalDetails, [goalId]: updatedDetails },
        }));
      }

      set({
        goals: updatedGoals,
        currentGoal:
          get().currentGoal?.id === goalId ? updatedGoal : get().currentGoal,
        isLoading: false,
        successMessage: message,
      });

      return updatedGoal;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Delete Contribution Error:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  getContributions: async (
    goalId: string,
    filters?: {
      limit?: number;
      page?: number;
    }
  ): Promise<{
    data: GoalContribution[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  } | null> => {
    try {
      set({ isLoading: true, error: null });

      const contributions = await goalService.getContributions(goalId, filters);

      if (!contributions) {
        set({ isLoading: false });
        return null;
      }

      set({ isLoading: false });
      return contributions;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Error getting contributions:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  pauseGoal: async (id: string): Promise<Goal> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { data: updatedGoal, message } = await goalService.pauseGoal(id);

      // Update the goal in the list
      const updatedGoals = get().goals.map((goal) =>
        goal.id === id ? updatedGoal : goal
      );

      // Update goal details if they exist
      const currentDetails = get().goalDetails[id];
      if (currentDetails) {
        const updatedDetails: GoalDetails = {
          ...currentDetails,
          ...updatedGoal,
        };
        set((state) => ({
          goalDetails: { ...state.goalDetails, [id]: updatedDetails },
        }));
      }

      set({
        goals: updatedGoals,
        currentGoal:
          get().currentGoal?.id === id ? updatedGoal : get().currentGoal,
        isLoading: false,
        successMessage: message,
      });

      return updatedGoal;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Pause Goal Error:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  resumeGoal: async (id: string): Promise<Goal> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { data: updatedGoal, message } = await goalService.resumeGoal(id);

      // Update the goal in the list
      const updatedGoals = get().goals.map((goal) =>
        goal.id === id ? updatedGoal : goal
      );

      // Update goal details if they exist
      const currentDetails = get().goalDetails[id];
      if (currentDetails) {
        const updatedDetails: GoalDetails = {
          ...currentDetails,
          ...updatedGoal,
        };
        set((state) => ({
          goalDetails: { ...state.goalDetails, [id]: updatedDetails },
        }));
      }

      set({
        goals: updatedGoals,
        currentGoal:
          get().currentGoal?.id === id ? updatedGoal : get().currentGoal,
        isLoading: false,
        successMessage: message,
      });

      return updatedGoal;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      console.error("Resume Goal Error:", errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  setCurrentGoal: (goal: Goal | null) => {
    set({ currentGoal: goal });
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
        activeCount: 0,
        completedCount: 0,
      },
      hasMore: true,
    }),
}));
