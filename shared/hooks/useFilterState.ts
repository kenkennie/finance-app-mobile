import { useState, useCallback, useMemo } from "react";
import { FilterState, Transaction } from "../types/filter.types";

const initialFilterState: FilterState = {
  dateRange: {
    preset: null,
    startDate: null,
    endDate: null,
  },
  amountRange: {
    min: null,
    max: null,
  },
  categories: {
    selected: [],
    selectAll: false,
  },
  accounts: {
    selected: [],
    selectAll: false,
  },
  status: [],
  tags: [],
  type: {
    expense: true,
    income: true,
    recurringOnly: false,
    splitOnly: false,
  },
  searchQuery: "",
  quickFilter: null,
};

export const useFilterState = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [tempFilters, setTempFilters] =
    useState<FilterState>(initialFilterState);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange.preset || filters.dateRange.startDate) count++;
    if (filters.amountRange.min !== null || filters.amountRange.max !== null)
      count++;
    if (filters.categories.selected.length > 0 && !filters.categories.selectAll)
      count++;
    if (filters.accounts.selected.length > 0 && !filters.accounts.selectAll)
      count++;
    if (filters.status.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (!filters.type.expense || !filters.type.income) count++;
    if (filters.type.recurringOnly || filters.type.splitOnly) count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  const applyFilters = useCallback(() => {
    setFilters(tempFilters);
  }, [tempFilters]);

  const clearAllFilters = useCallback(() => {
    setTempFilters(initialFilterState);
    setFilters(initialFilterState);
  }, []);

  const updateTempFilters = useCallback((updates: Partial<FilterState>) => {
    setTempFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetTempFilters = useCallback(() => {
    setTempFilters(filters);
  }, [filters]);

  return {
    filters,
    tempFilters,
    activeFilterCount,
    applyFilters,
    clearAllFilters,
    updateTempFilters,
    resetTempFilters,
    setFilters,
  };
};
