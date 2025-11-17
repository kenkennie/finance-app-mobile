export interface Account {
  id: string;
  accountName: string;
  accountNumber?: string;
  icon?: string;
  color: string;
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountState {
  accounts: Account[];
  currentAccount: Account | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

export interface CreateAccountData {
  accountName: string;
  accountNumber: string;
  icon: string;
  color: string;
  balance: number;
  currency: string;
  description?: string;
  isSystemAccount: boolean;
}

export interface UpdateAccountData {
  accountName?: string;
  accountNumber?: string;
  icon?: string;
  color?: string;
  balance?: number;
  currency?: string;
  description?: string;
  isActive?: boolean;
  isSystem?: boolean;
}
