import { create } from "zustand";
import {
  Account,
  AccountState,
  CreateAccountData,
  UpdateAccountData,
} from "@/shared/types/account.types";
import { extractErrorMessage } from "@/shared/utils/api/responseHandler";
import { accountService } from "@/shared/services/account/accountService";

interface AccountStore extends AccountState {
  // Actions
  createAccount: (data: CreateAccountData) => Promise<Account>;
  getAccounts: () => Promise<void>;
  getAccountById: (id: string) => Promise<Account | null>;
  updateAccount: (id: string, data: UpdateAccountData) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  setCurrentAccount: (account: Account | null) => void;

  // Utility actions
  clearError: () => void;
  clearSuccess: () => void;
}

export const useAccountStore = create<AccountStore>((set, get) => ({
  // Initial state
  accounts: [],
  currentAccount: null,
  isLoading: false,
  error: null,
  successMessage: null,

  createAccount: async (data: CreateAccountData): Promise<Account> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      // Convert CreateAccountData to CreateAccountDto format
      const accountDto = {
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        icon: data.icon,
        color: data.color,
        balance: data.balance,
        currency: data.currency,
        description: data.description,
        isSystemAccount: data.isSystemAccount,
      };

      const { data: account, message } = await accountService.createAccount(
        accountDto
      );

      set((state) => ({
        accounts: [...state.accounts, account],
        isLoading: false,
        successMessage: message,
      }));

      return account;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  getAccounts: async (): Promise<void> => {
    try {
      set({ isLoading: true, error: null });

      const accounts = await accountService.getAccounts();

      set({
        accounts,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  getAccountById: async (id: string): Promise<Account | null> => {
    try {
      set({ isLoading: true, error: null });

      const account = await accountService.getAccountById(id);

      set({ isLoading: false });
      return account;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  updateAccount: async (
    id: string,
    data: UpdateAccountData
  ): Promise<Account> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      // Convert UpdateAccountData to UpdateAccountDto format
      const updateDto = {
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        icon: data.icon,
        color: data.color,
        balance: data.balance || 0,
        currency: data.currency,
        description: data.description,
        isActive: data.isActive,
      };

      const { data: updatedAccount, message } =
        await accountService.updateAccount(id, updateDto);

      // Update the account in the local state
      const { accounts } = get();
      const updatedAccounts = accounts.map((acc) =>
        acc.id === id ? updatedAccount : acc
      );

      set({
        accounts: updatedAccounts,
        currentAccount:
          get().currentAccount?.id === id
            ? updatedAccount
            : get().currentAccount,
        isLoading: false,
        successMessage: message,
      });

      return updatedAccount;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  deleteAccount: async (id: string): Promise<void> => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { message } = await accountService.deleteAccount(id);

      // Remove the account from local state
      const { accounts } = get();
      const filteredAccounts = accounts.filter((acc) => acc.id !== id);

      set({
        accounts: filteredAccounts,
        currentAccount:
          get().currentAccount?.id === id ? null : get().currentAccount,
        isLoading: false,
        successMessage: message,
      });
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  setCurrentAccount: (account: Account | null) => {
    set({ currentAccount: account });
  },

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ successMessage: null }),
}));
