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
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";

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
  // Configure Google OAuth with expo-auth-session
  configureGoogleSignIn: () => {
    // Configuration is handled in the loginWithGoogle method
  },

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

  async loginWithGoogle(): Promise<{
    data: AuthResponseData;
    message: string;
  }> {
    try {
      console.log("🔍 Starting Google OAuth login");
      // Configure Google OAuth request with expo-auth-session
      // Use backend callback URL for OAuth redirect
      const backendUrl = env.apiUrl.replace(/\/api\/v1\/?$/, ""); // Remove /api/v1 to get base URL
      const redirectUri = `${backendUrl}/api/v1/auth/google/callback`;

      console.log("🔍 Backend URL:", backendUrl);
      console.log("🔍 Redirect URI:", redirectUri);

      const request = new AuthSession.AuthRequest({
        clientId: Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID,
        clientSecret: Constants.expoConfig?.extra?.GOOGLE_CLIENT_SECRET,
        scopes: ["openid", "profile", "email"],
        responseType: AuthSession.ResponseType.Token,
        redirectUri,
        prompt: AuthSession.Prompt.SelectAccount, // Shows account selection popup
        extraParams: {
          access_type: "offline",
        },
      });

      console.log("====================================");
      console.log("🔍 AuthRequest config:", request);
      console.log("====================================");

      // This will open a native popup/modal for account selection
      console.log("🔍 Prompting for Google auth...");
      const result = await request.promptAsync({
        authorizationEndpoint: "https://accounts.google.com/oauth/v2/auth",
      });

      console.log("🔍 Auth result type:", result.type);
      if (result.type === "success") {
        console.log(
          "🔍 Auth result params keys:",
          Object.keys(result.params || {})
        );
      }

      if (result.type === "success" && result.params.id_token) {
        console.log("✅ Got ID token, sending to backend for verification");
        // Send the Google ID token to our backend for verification
        const response = await apiClient.post<
          ApiSuccessResponse<AuthResponseData>
        >(
          "/auth/google/verify-token",
          {
            idToken: result.params.id_token,
          },
          {
            headers: {
              "X-Skip-Token-Refresh": "true",
              "X-Client-Type": "mobile",
            },
          }
        );

        const apiResult = handleApiResponse(response);
        if (!apiResult.success || !apiResult.data) {
          console.error("❌ Backend verification failed:", apiResult.message);
          throw new Error(apiResult.message);
        }

        const { data } = apiResult;

        if (!data.access_token || !data.refresh_token || !data.user) {
          console.error("❌ Invalid response data from backend");
          throw new Error(data.message || "Google login failed");
        }

        console.log("✅ Google login successful");
        return {
          data,
          message: apiResult.message,
        };
      } else {
        console.log("❌ Auth cancelled or failed, result:", result);
        throw new Error("Google authentication was cancelled");
      }
    } catch (error: any) {
      console.error("❌ Google OAuth error:", error);
      throw new Error(error.message || "Google login failed");
    }
  },

  async registerWithGoogle(): Promise<{
    data: AuthResponseData;
    message: string;
  }> {
    try {
      // Configure Google OAuth request with expo-auth-session
      // Use backend callback URL for OAuth redirect
      const backendUrl = env.apiUrl.replace("/api/v1", ""); // Remove /api/v1 to get base URL
      const redirectUri = `${backendUrl}/auth/google/callback`;

      const request = new AuthSession.AuthRequest({
        clientId:
          Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID || "your-web-client-id",
        scopes: ["openid", "profile", "email"],
        responseType: AuthSession.ResponseType.Token,
        redirectUri,
        prompt: AuthSession.Prompt.SelectAccount, // Shows account selection popup
        extraParams: {
          access_type: "offline",
        },
      });

      // This will open a native popup/modal for account selection
      const result = await request.promptAsync({
        authorizationEndpoint: "https://accounts.google.com/oauth/v2/auth",
      });

      if (result.type === "success" && result.params.id_token) {
        // Send the Google ID token to our backend for verification
        const response = await apiClient.post<
          ApiSuccessResponse<AuthResponseData>
        >(
          "/auth/google/verify-token",
          {
            idToken: result.params.id_token,
          },
          {
            headers: {
              "X-Skip-Token-Refresh": "true",
              "X-Client-Type": "mobile",
            },
          }
        );

        const apiResult = handleApiResponse(response);
        if (!apiResult.success || !apiResult.data) {
          throw new Error(apiResult.message);
        }

        const { data } = apiResult;

        if (!data.access_token || !data.refresh_token || !data.user) {
          throw new Error(data.message || "Google registration failed");
        }

        return {
          data,
          message: apiResult.message,
        };
      } else {
        throw new Error("Google authentication was cancelled");
      }
    } catch (error: any) {
      console.error("Google OAuth error:", error);
      throw new Error(error.message || "Google registration failed");
    }
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
    const response = await apiClient.post<
      ApiSuccessResponse<{
        hasCategories: boolean;
        hasAccounts: boolean;
      }>
    >("/user/complete-onboarding");
    const result = extractResponseData(response);
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
