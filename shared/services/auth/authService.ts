import * as SecureStore from "expo-secure-store";
import {
  ApiSuccessResponse,
  LoginCredentials,
  RefreshTokenResponse,
  RegisterCredentials,
  User,
} from "@/shared/types/auth.types";
import { apiClient } from "@/config/api.config";
import {
  extractResponseData,
  handleApiResponse,
} from "@/shared/utils/api/responseHandler";
import env from "@/config/env";
import axios from "axios";
import { ForgotPasswordDto } from "@/schemas/auth.schema";

interface AuthResponseData {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    fullName?: string;
  };
  expires: string;
  message?: string;
}

interface RegisterResponseData {
  userId: string;
  email: string;
  fullName: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{
    data: AuthResponseData;
    message: string;
  }> {
    const response = await apiClient.post<ApiSuccessResponse<AuthResponseData>>(
      "/auth/login",
      credentials,
      {
        headers: {
          "X-Skip-Token-Refresh": "true",
        },
      }
    );

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    const { data } = result;

    if (!data.access_token || !data.refresh_token || !data.user) {
      throw new Error(data.message);
    }

    return {
      data,
      message: result.message,
    };
  },

  async register(credentials: RegisterCredentials): Promise<{
    data: AuthResponseData;
    message: string;
  }> {
    const response = await apiClient.post<
      ApiSuccessResponse<RegisterResponseData>
    >("/auth/register", credentials);
    const result = handleApiResponse(response);

    if (!result.success || !result.data) {
      throw new Error(result.errors?.join(", ") || result.message);
    }

    const { data } = result;

    // Transform registration response to match expected AuthResponseData format
    const transformedData: AuthResponseData = {
      access_token: "", // Registration doesn't return tokens
      refresh_token: "",
      user: {
        id: data.userId,
        email: data.email,
        fullName: data.fullName,
      },
      expires: "",
      message: result.message,
    };

    return {
      data: transformedData,
      message: result.message,
    };
  },

  async logout(): Promise<{ message: string }> {
    const refreshToken = await SecureStore.getItemAsync("refresh_token");

    const response = await apiClient.post("/auth/logout", {
      refresh_token: refreshToken,
    });

    const result = handleApiResponse(response);

    if (!refreshToken) {
      throw new Error(result.message || "Registration failed!");
    }

    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    await SecureStore.deleteItemAsync("user");

    return {
      message: result.message,
    };
  },

  async forgotPassword(email: ForgotPasswordDto): Promise<{ message: string }> {
    const response = await apiClient.post<ApiSuccessResponse<null>>(
      "/auth/forgot-password",
      email,
      {
        headers: {
          "X-Skip-Token-Refresh": "true",
        },
      }
    );
    const result = handleApiResponse(response);

    if (!result.success) {
      throw new Error(result.message);
    }
    return {
      message: result.message,
    };
  },

  async updateProfile(updateUser: Partial<User>): Promise<{
    data: { user: User };
    message: string;
  }> {
    const response = await apiClient.put<ApiSuccessResponse<{ user: User }>>(
      "/user/me/update-profile",
      updateUser
    );
    const result = handleApiResponse(response);

    if (!result.success || !result.data) {
      throw new Error(result.message);
    }
    const { data } = result;
    return {
      data,
      message: result.message,
    };
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiSuccessResponse<User>>("/auth/me");
    return extractResponseData(response);
  },

  async checkOnboardingStatus(): Promise<{
    needsOnboarding: boolean;
    hasCategories: boolean;
    hasAccounts: boolean;
  }> {
    const response = await apiClient.get<
      ApiSuccessResponse<{
        needsOnboarding: boolean;
        hasCategories: boolean;
        hasAccounts: boolean;
      }>
    >("/user/onboarding-status");
    return extractResponseData(response);
  },

  async completeOnboarding(): Promise<{
    hasCategories: boolean;
    hasAccounts: boolean;
  }> {
    console.log("🌐 Auth service: completeOnboarding called");
    console.log("📡 Making API call to /user/complete-onboarding");
    const response = await apiClient.post<
      ApiSuccessResponse<{
        hasCategories: boolean;
        hasAccounts: boolean;
      }>
    >("/user/complete-onboarding");
    console.log("🌐 Auth service: API response received", response);
    const result = extractResponseData(response);
    console.log("🌐 Auth service: extracted result", result);
    return result;
  },

  async verifyEmail(
    email: string,
    code: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>(
      "/user/verify-email",
      { email, code },
      {
        headers: {
          "X-Skip-Token-Refresh": "true",
        },
      }
    );

    return response.data;
  },

  async handleTokenRefresh(): Promise<string> {
    const refreshToken = await SecureStore.getItemAsync("refresh_token");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      // Don't use interceptor for refresh request
      const response = await axios.post<RefreshTokenResponse>(
        `${env.apiUrl}/auth/refresh`,
        { refreshToken }, // Match backend DTO
        {
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "mobile",
            Authorization: `Bearer ${refreshToken}`, // Some backends expect this
          },
        }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      if (!accessToken) {
        throw new Error("No access token in refresh response");
      }

      // Store new tokens
      await SecureStore.setItemAsync("access_token", accessToken);

      if (newRefreshToken) {
        await SecureStore.setItemAsync("refresh_token", newRefreshToken);
      }

      return accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  },
};
