import { z } from "zod";

export const transactionTypeEnum = z.enum(["EXPENSE", "INCOME"]);

export const TransactionItemSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  accountId: z.string().min(1, "Account ID is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().max(500, "Description too long").optional(),
});

export const CreateTransactionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  transactionType: transactionTypeEnum,
  date: z.coerce.date(),
  description: z.string().optional(),
  status: z.string().default("Cleared"),
  notes: z.string().max(1000, "Notes too long").optional(),
  items: z.array(TransactionItemSchema).min(1, "At least one item is required"),
});

export const UpdateTransactionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .optional(),
  transactionType: transactionTypeEnum.optional(),
  date: z.coerce.date().optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description too long")
    .optional(),
  status: z.string().optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
  items: z
    .array(TransactionItemSchema)
    .min(1, "At least one item is required")
    .optional(),
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
export type TransactionItemDto = z.infer<typeof TransactionItemSchema>;
