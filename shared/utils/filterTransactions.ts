import { FilterState, Transaction } from "../types/filter.types";

export const filterTransactions = (
  transactions: Transaction[],
  filters: FilterState
): Transaction[] => {
  return transactions.filter((transaction) => {
    // Date range filter
    if (filters.dateRange.startDate || filters.dateRange.endDate) {
      const transactionDate = new Date(transaction.date);
      if (
        filters.dateRange.startDate &&
        transactionDate < filters.dateRange.startDate
      ) {
        return false;
      }
      if (
        filters.dateRange.endDate &&
        transactionDate > filters.dateRange.endDate
      ) {
        return false;
      }
    }

    // Amount range filter
    const absAmount = Math.abs(transaction.amount);
    if (
      filters.amountRange.min !== null &&
      absAmount < filters.amountRange.min
    ) {
      return false;
    }
    if (
      filters.amountRange.max !== null &&
      absAmount > filters.amountRange.max
    ) {
      return false;
    }

    // Category filter
    if (
      filters.categories.selected.length > 0 &&
      !filters.categories.selectAll
    ) {
      if (!filters.categories.selected.includes(transaction.categoryId)) {
        return false;
      }
    }

    // Account filter
    if (filters.accounts.selected.length > 0 && !filters.accounts.selectAll) {
      if (!filters.accounts.selected.includes(transaction.accountId)) {
        return false;
      }
    }

    // Status filter
    if (
      filters.status.length > 0 &&
      !filters.status.includes(transaction.status)
    ) {
      return false;
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const transactionTags = transaction.tags || [];
      const hasMatchingTag = filters.tags.some((tag) =>
        transactionTags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    // Type filter
    if (!filters.type.expense && transaction.type === "expense") return false;
    if (!filters.type.income && transaction.type === "income") return false;
    if (filters.type.recurringOnly && !transaction.isRecurring) return false;

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesDescription = transaction.description
        .toLowerCase()
        .includes(query);
      const matchesCategory = transaction.category
        .toLowerCase()
        .includes(query);
      const matchesAccount = transaction.account.toLowerCase().includes(query);
      if (!matchesDescription && !matchesCategory && !matchesAccount) {
        return false;
      }
    }

    return true;
  });
};

export const getDateRangeFromPreset = (
  preset: string
): { start: Date; end: Date } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  let start = new Date(today);

  switch (preset) {
    case "today":
      break;
    case "yesterday":
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;
    case "thisWeek":
      start.setDate(start.getDate() - start.getDay());
      break;
    case "thisMonth":
      start.setDate(1);
      break;
    case "lastMonth":
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      end.setDate(0);
      break;
    case "last3Months":
      start.setMonth(start.getMonth() - 3);
      break;
    case "thisYear":
      start.setMonth(0);
      start.setDate(1);
      break;
    case "lastYear":
      start.setFullYear(start.getFullYear() - 1);
      start.setMonth(0);
      start.setDate(1);
      end.setFullYear(end.getFullYear() - 1);
      end.setMonth(11);
      end.setDate(31);
      break;
  }

  return { start, end };
};
