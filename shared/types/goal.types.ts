export interface GoalStatus {
  id: string;
  name: string;
  isDefault: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  formattedAmount?: string;
  formattedDate?: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount?: number;
  targetDate?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: GoalStatus;
  statusId: string;
  isRecurring: boolean;
  recurringPeriodId?: string;
  recurringPeriod?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  // Frontend computed fields
  progressPercentage?: number;
  daysRemaining?: number;
  isCompleted?: boolean;
  isOverdue?: boolean;
  formattedTargetDate?: string;
  formattedCreatedAt?: string;
  formattedCurrentAmount?: string;
  formattedTargetAmount?: string;
  formattedRemainingAmount?: string;
}

export interface GoalDetails extends Goal {
  contributions: GoalContribution[];
  totalContributions: number;
  recentContributions: GoalContribution[];
}

export interface OverallGoalStats {
  currency?: string;
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  averageProgress: number;
  goalsOnTrack: number;
  goalsBehind: number;
  goalsCompleted: number;
}

export interface GoalState {
  goals: Goal[];
  currentGoal: Goal | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  successMessage: string | null;
}

// Comprehensive store state interface
export interface GoalStoreState extends GoalState {
  goalDetails: { [goalId: string]: GoalDetails };
  overallStats: OverallGoalStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    activeCount?: number;
    completedCount?: number;
  };
}

export interface CreateGoalData {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate?: Date;
  priority: "LOW" | "MEDIUM" | "HIGH";
  isRecurring: boolean;
  recurringPeriodId?: string;
}

export interface UpdateGoalData {
  name?: string;
  description?: string;
  targetAmount?: number;
  targetDate?: Date;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  isRecurring?: boolean;
  recurringPeriodId?: string;
}

export interface AddContributionData {
  amount: number;
  description?: string;
  date?: Date;
}
