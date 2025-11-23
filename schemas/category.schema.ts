import { z } from "zod";

// --- Zod Schema for Runtime Validation ---

// Subcategory schema for form handling
export const SubcategorySchema = z.object({
  name: z
    .string()
    .min(1, "Subcategory name is required")
    .max(100, "Name must not exceed 100 characters"),
  description: z.string().max(500).optional(),
  icon: z.string().default("circle"),
});

export type SubcategoryDto = z.infer<typeof SubcategorySchema>;

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must not exceed 100 characters"),
  description: z.string().max(500).optional(),
  icon: z.string(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
    .default("#1976D2"),
  transactionType: z.enum(["INCOME", "EXPENSE"]),
  parentId: z.string().optional(),
  orderIndex: z.number().int().min(0).default(0),
  subcategories: z.array(SubcategorySchema).default([]),
});

// --- Type/Interface Definition (Inferred from Zod) ---
export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must not exceed 100 characters")
    .optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
    .optional(),
  transactionType: z.enum(["INCOME", "EXPENSE"]).optional(),
  parentId: z.string().optional(),
  orderIndex: z.number().int().min(0).optional(),
  subcategories: z.array(SubcategorySchema).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
