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
  checkOnboardingStatus: () => Promise<{
    needsOnboarding: boolean;
    hasCategories: boolean;
    hasAccounts: boolean;
  }>;
  completeOnboarding: () => Promise<{
    hasCategories: boolean;
    hasAccounts: boolean;
  }>;
  verifyEmail: (email: string, code: string) => Promise<string>;
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
        if (user.emailVerifiedAt) {
          user.emailVerifiedAt = new Date(user.emailVerifiedAt);
        }
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

  checkOnboardingStatus: async () => {
    try {
      const status = await authService.checkOnboardingStatus();
      return status;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  completeOnboarding: async () => {
    console.log("📱 Auth store: completeOnboarding called");
    try {
      console.log("📡 Calling authService.completeOnboarding...");
      const result = await authService.completeOnboarding();
      console.log("📱 Auth store: completeOnboarding result:", result);
      return result;
    } catch (error) {
      console.log("❌ Auth store: completeOnboarding error:", error);
      const errorMessage = extractErrorMessage(error);
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  verifyEmail: async (email: string, code: string) => {
    try {
      set({ isLoading: true, error: null, successMessage: null });

      const result = await authService.verifyEmail(email, code);

      // Update user with verified email
      const currentUser = get().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, emailVerifiedAt: new Date() };
        set({ user: updatedUser });
        await SecureStore.setItemAsync("user", JSON.stringify(updatedUser));
      }

      set({
        isLoading: false,
        successMessage: result.message,
      });

      return result.message;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ successMessage: null }),
}));
