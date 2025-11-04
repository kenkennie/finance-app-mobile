import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AccountType = "Personal" | "Business";

interface AccountState {
  accountType: AccountType;
  switchAccount: (type: AccountType) => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      accountType: "Personal",
      switchAccount: (accountType) => set({ accountType }),
    }),
    {
      name: "account-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
