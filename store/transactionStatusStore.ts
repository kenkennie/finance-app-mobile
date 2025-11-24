import { create } from "zustand";
import { transactionStatusService } from "@/shared/services/transaction-status/transactionStatusService";

interface TransactionStatus {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface TransactionStatusStore {
  statuses: TransactionStatus[];
  loading: boolean;
  error: string | null;
  getStatuses: () => Promise<void>;
}

export const useTransactionStatusStore = create<TransactionStatusStore>(
  (set, get) => ({
    statuses: [],
    loading: false,
    error: null,

    getStatuses: async () => {
      try {
        set({ loading: true, error: null });
        const response = await transactionStatusService.getAll();
        set({ statuses: response.data, loading: false });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch transaction statuses",
          loading: false,
        });
      }
    },
  })
);
