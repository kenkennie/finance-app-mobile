import { z } from "zod";

export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(1000000, "Amount is too large"),
  category: z.enum(["food", "transport", "bills", "entertainment", "other"]),
  date: z.date(),
  description: z.string().max(500, "Description is too long").optional(),
  tags: z.array(z.string()).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
