import { z } from "zod";

// --- Zod Schema for Runtime Validation ---

export const CreateAccountSchema = z.object({
  accountName: z
    .string()
    .min(2, "Account name is required")
    .max(100, "Account name must not exceed 100 characters"),
  accountNumber: z
    .string()
    .min(5, "Account number must be minimum of 5 characters")
    .max(100, "Account name must not exceed 100 characters"),
  icon: z.string().default("credit-card"),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
    .default("#1976D2"),
  balance: z.number().default(0),
  currency: z.string().length(3),
  description: z.string().max(500).optional(),
  isSystemAccount: z.boolean().default(false),
});

// --- Type/Interface Definition (Inferred from Zod) ---
export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;

export const UpdateAccountSchema = z.object({
  accountName: z
    .string()
    .min(2, "Account name is required")
    .max(100, "Account name must not exceed 100 characters")
    .optional(),
  accountNumber: z
    .string()
    .min(5, "Account number must be minimum of 5 characters")
    .max(100, "Account number must not exceed 100 characters")
    .optional(),
  icon: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
    .optional(),
  accountType: z.string().min(1).max(100).optional(),
  balance: z.number().optional(),
  currency: z.string().length(3).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;
