export interface Subcategory {
  id?: string;
  name: string;
  description?: string;
  icon: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  transactionType: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
  parentId?: string;
  level: number;
  orderIndex: number;
  isActive: boolean;
  isSystem: boolean;
  description?: string;
  subcategories?: Subcategory[];
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  icon: string;
  color: string;
  transactionType: "INCOME" | "EXPENSE";
  parentId?: string;
  orderIndex?: number;
  subcategories?: Subcategory[];
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  transactionType?: "INCOME" | "EXPENSE";
  parentId?: string;
  orderIndex?: number;
  subcategories?: Subcategory[];
  isActive?: boolean;
}
