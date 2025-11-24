import { TransactionItem } from "./transaction.types";

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

export interface TransactionStatus {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  transactionType: "EXPENSE" | "INCOME";
  title: string;
  description: string;
  date: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  status: TransactionStatus | string;
  TransactionItems?: TransactionItem[];
  totalAmount?: number;
  formattedAmount?: string;
}
