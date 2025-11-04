import { create } from "zustand";

interface ToastState {
  visible: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration: number;

  showToast: (
    message: string,
    type?: "success" | "error" | "warning" | "info",
    duration?: number
  ) => void;
  hideToast: () => void;

  // Shortcuts
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: "",
  type: "info",
  duration: 3000,

  showToast: (message, type = "info", duration = 3000) => {
    set({ visible: true, message, type, duration });
  },

  hideToast: () => {
    set({ visible: false });
  },

  showSuccess: (message) => {
    set({ visible: true, message, type: "success", duration: 3000 });
  },

  showError: (message) => {
    set({ visible: true, message, type: "error", duration: 4000 });
  },

  showWarning: (message) => {
    set({ visible: true, message, type: "warning", duration: 3500 });
  },

  showInfo: (message) => {
    set({ visible: true, message, type: "info", duration: 3000 });
  },
}));
