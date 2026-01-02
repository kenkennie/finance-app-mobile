import { z } from "zod";

export const CreateGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(100, "Name is too long"),
  description: z.string().optional(),
  targetAmount: z.number().positive("Target amount must be positive"),
  targetDate: z.coerce.date().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  isRecurring: z.boolean().default(false),
  recurringPeriodId: z.string().optional(),
});

export const UpdateGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  targetAmount: z.number().positive().optional(),
  targetDate: z.coerce.date().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  isRecurring: z.boolean().optional(),
  recurringPeriodId: z.string().optional(),
});

export const AddContributionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
});

export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
export type AddContributionDto = z.infer<typeof AddContributionSchema>;
