import React from "react";
import { useLocalSearchParams } from "expo-router";
import BudgetForm from "./BudgetForm";

export default function EditBudgetScreen() {
  const { budgetId } = useLocalSearchParams<{ budgetId: string }>();

  return (
    <BudgetForm
      mode="edit"
      budgetId={budgetId}
    />
  );
}
