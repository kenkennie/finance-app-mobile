import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { authService } from "@/shared/services/auth/authService";
import { extractErrorMessage } from "@/shared/utils/api/responseHandler";
import { User } from "@/shared/types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;

  login: (email: string, password: string) => Promise<string>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<string>;
  editUser: (updatedUser: Partial<User>) => Promise<string>;

  logout: () => Promise<void>;
  forgotPassoword(email: string): Promise<string>;
  loadPersistedState: () => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  successMessage: null,

  loadPersistedState: async () => {
    try {
      set({ isLoading: true });

      const userString = await SecureStore.getItemAsync("user");
      const accessToken = await SecureStore.getItemAsync("access_token");

      if (userString && accessToken) {
        const user = JSON.parse(userString);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to load persisted state:", error);
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { data, message } = await authService.login({ email, password });

      if (data.user) {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          successMessage: message,
        });
        await SecureStore.setItemAsync("access_token", data.access_token);
        await SecureStore.setItemAsync("refresh_token", data.refresh_token);
        await SecureStore.setItemAsync("user", JSON.stringify(data.user));

        return message;
      } else {
        throw new Error("Login failed - no user data received");
      }
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);

      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });

      throw new Error(errorMessage);
    }
  },

  register: async (fullName, email, password) => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const { data, message } = await authService.register({
        fullName,
        email,
        password,
      });

      if (data.user) {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          successMessage: message,
        });

        return message;
      } else {
        throw new Error("Registration failed - no user data received");
      }
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);

      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });

      throw new Error(errorMessage);
    }
  },

  forgotPassoword: async (email: string) => {
    try {
      set({ isLoading: true, error: null, successMessage: null });
      const { message } = await authService.forgotPassword({ email });
      set({
        isLoading: false,
        successMessage: message,
      });
      return message;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        successMessage: null,
      });
    }
  },

  editUser: async (updatedUser: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    try {
      set({ isLoading: true, error: null, successMessage: null });
      const { data, message } = await authService.updateProfile({
        ...updatedUser,
      });
      if (data) {
        set({
          user: data.user,
          successMessage: message,
          isLoading: false,
          error: null,
        });
      }

      await SecureStore.setItemAsync("user", JSON.stringify(data.user));

      return message;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ successMessage: null }),
}));
