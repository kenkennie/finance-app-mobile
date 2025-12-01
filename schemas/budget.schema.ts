import { z } from "zod";

export const BudgetCategoryItemSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  allocatedAmount: z.number().positive("Allocated amount must be positive"),
});

export const CreateBudgetSchema = z
  .object({
    name: z
      .string()
      .min(1, "Budget name is required")
      .max(100, "Name is too long"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    recuringPeriodId: z.string().optional(),
    rolloverEnabled: z.boolean().default(false),
    isActive: z.boolean().default(true),
    categories: z
      .array(BudgetCategoryItemSchema)
      .min(1, "At least one category is required"),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export const UpdateBudgetSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    recuringPeriodId: z.string().optional(),
    rolloverEnabled: z.boolean().optional(),
    isActive: z.boolean().optional(),
    categories: z
      .array(BudgetCategoryItemSchema)
      .min(1, "At least one category is required")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>;
export type UpdateBudgetDto = z.infer<typeof UpdateBudgetSchema>;
