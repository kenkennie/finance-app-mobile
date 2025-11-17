export interface FilterState {
  dateRange: {
    preset:
      | "today"
      | "yesterday"
      | "thisWeek"
      | "thisMonth"
      | "lastMonth"
      | "last3Months"
      | "thisYear"
      | "lastYear"
      | "custom"
      | null;
    startDate: Date | null;
    endDate: Date | null;
  };
  amountRange: {
    min: number | null;
    max: number | null;
  };
  categories: {
    selected: string[];
    selectAll: boolean;
  };
  accounts: {
    selected: string[];
    selectAll: boolean;
  };
  status: ("pending" | "cleared" | "reconciled")[];
  tags: string[];
  type: {
    expense: boolean;
    income: boolean;
    recurringOnly: boolean;
    splitOnly: boolean;
  };
  searchQuery: string;
  quickFilter: "all" | "today" | "thisWeek" | "thisMonth" | null;
}

export interface Transaction {
  id: string;
  type: "expense" | "income";
  amount: number;
  description: string;
  category: string;
  categoryIcon: string;
  categoryId: string;
  account: string;
  accountId: string;
  date: string;
  status: "pending" | "cleared" | "reconciled";
  tags?: string[];
  notes?: string;
  isRecurring?: boolean;
}
