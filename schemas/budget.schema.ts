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
    carryOverEnabled: z.boolean().default(false),
    isActive: z.boolean().default(true),
    categories: z
      .array(BudgetCategoryItemSchema)
      .min(1, "At least one category is required"),
    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
      .default("#10B981"),
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
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    recuringPeriodId: z.string().optional(),
    carryOverEnabled: z.boolean().optional(),
    isActive: z.boolean().optional(),
    categories: z
      .array(BudgetCategoryItemSchema)
      .min(1, "At least one category is required")
      .optional(),
    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
      .default("#10B981")
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
