import { z } from "zod";

export const budgetSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(50, "Name is too long"),
    amount: z.number().positive("Amount must be positive"),
    category: z.string().min(1, "Category is required"),
    period: z.enum(["daily", "weekly", "monthly", "yearly"]),
    startDate: z.date(),
    endDate: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export type BudgetFormData = z.infer<typeof budgetSchema>;
