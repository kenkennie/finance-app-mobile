export interface BudgetType {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
}

export interface BudgetPhilosophy {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
}

export interface BudgetStatus {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
}

export interface BudgetCategoryStatus {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  transactionType: "EXPENSE" | "INCOME";
  icon: string;
  color: string;
  parentId?: string;
  level: number;
  orderIndex: number;
  isActive: boolean;
  isSystem: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  budgetId: string;
  categoryId: string;
  category: Category;
  allocatedAmount: number;
  rolloverAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetEntry {
  id: string;
  categoryId: string;
  category: BudgetCategory;
  transactionItemId: string;
  transactionItem: any; // Would need TransactionItem type
  amount: number;
  date: string;
  createdAt: string;
}

export interface BudgetPermission {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
}

export interface BudgetShare {
  id: string;
  budgetId: string;
  sharedUserId: string;
  sharedUser: {
    id: string;
    fullName: string;
    email: string;
  };
  permissionId: string;
  permission: BudgetPermission;
  spendingLimit?: number;
  categoriesLimit: string[];
  approvalRequired: boolean;
  approvalLimit?: number;
  invitedAt: string;
  acceptedAt?: string;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  recuringPeriodId?: string;
  recuringPeriod?: {
    id: string;
    name: string;
  };
  rolloverEnabled: boolean;
  budgetCategories?: BudgetCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBudgetStats {
  categoryId: string;
  categoryName: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export interface BudgetStats {
  budgetId: string;
  budgetName: string;
  startDate: string;
  endDate: string | null;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentageUsed: number;
  isOverBudget: boolean;
  categoryStats: CategoryBudgetStats[];
}

export interface OverallBudgetStats {
  totalBudgets: number;
  activeBudgets: number;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  utilizationPercentage: number;
  totalCategories: number;
  categoriesOnTrack: number;
  categoriesWarning: number;
  categoriesExceeded: number;
}

export interface BudgetState {
  budgets: Budget[];
  currentBudget: Budget | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  successMessage: string | null;
}

export interface CreateBudgetData {
  name: string;
  amount: number;
  startDate: string;
  endDate?: string;
  recuringPeriodId?: string;
  rolloverEnabled: boolean;
  isActive: boolean;
  categories: {
    categoryId: string;
    allocatedAmount: number;
  }[];
}

export interface UpdateBudgetData {
  name?: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  recuringPeriodId?: string;
  rolloverEnabled?: boolean;
  isActive?: boolean;
  categories?: {
    categoryId: string;
    allocatedAmount: number;
  }[];
}
