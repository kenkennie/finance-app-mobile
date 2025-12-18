import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { DeviceEventEmitter } from "react-native";
import * as SecureStore from "expo-secure-store";
import ENV from "./env";

export const apiClient = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "X-Client-Type": "mobile",
  },
});

// ============================================
// REQUEST INTERCEPTOR - Add access token
// ============================================
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // ✅ Optional: Log successful responses in dev
    if (__DEV__) {
      console.log("✅ API Success:", response.config.url);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ✅ Log errors in dev
    if (__DEV__) {
      console.log("❌ API Error:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data,
      });
    }

    // ✅ Check if this is a 401 error
    if (error.response?.status === 401) {
      // console.log("🔍 401 Error Debug:", {
      //   url: originalRequest.url,
      //   shouldSkip: shouldSkipTokenRefresh(originalRequest.url),
      //   hasRefreshToken: !!(await SecureStore.getItemAsync("refresh_token")),
      //   retry: originalRequest._retry,
      // });

      // ✅ IMPORTANT: Skip token refresh for public/auth endpoints
      if (shouldSkipTokenRefresh(originalRequest)) {
        return Promise.reject(error); // Return error immediately
      }

      // ✅ Check if we haven't retried yet
      if (!originalRequest._retry) {
        // ✅ Check if refresh token exists before attempting refresh
        const refreshToken = await SecureStore.getItemAsync("refresh_token");

        if (!refreshToken) {
          // Clear any stale tokens
          await SecureStore.deleteItemAsync("access_token");
          await SecureStore.deleteItemAsync("user");
          return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call refresh endpoint
          const response = await axios.post(
            `${ENV.apiUrl}/auth/refresh`,
            { token: refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
                "X-Client-Type": "mobile",
              },
            }
          );

          // ✅ Extract nested data
          const responseData = response.data;
          let accessToken: string;
          let newRefreshToken: string | undefined;

          if (responseData.success && responseData.data) {
            // Nested structure: { success, data: { access_token, refresh_token } }
            accessToken = responseData.data.access_token;
            newRefreshToken = responseData.data.refresh_token;
          } else {
            // Flat structure: { access_token, refresh_token }
            accessToken = responseData.access_token;
            newRefreshToken = responseData.refresh_token;
          }

          if (!accessToken) {
            throw new Error("No access token in refresh response");
          }

          // Store new tokens
          await SecureStore.setItemAsync("access_token", accessToken);
          if (newRefreshToken) {
            await SecureStore.setItemAsync("refresh_token", newRefreshToken);
          }

          console.log("✅ Token refreshed successfully");

          // Update authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          // Process queued requests
          processQueue(null, accessToken);
          isRefreshing = false;

          // Retry original request
          return apiClient(originalRequest);
        } catch (refreshError: any) {
          console.error("❌ Token refresh failed:", refreshError.message);

          // Refresh failed - clear tokens and logout
          processQueue(refreshError, null);
          isRefreshing = false;

          await SecureStore.deleteItemAsync("access_token");
          await SecureStore.deleteItemAsync("refresh_token");
          await SecureStore.deleteItemAsync("user");

          // ✅ Trigger logout in Zustand store via event
          DeviceEventEmitter.emit("tokenRefreshFailed");

          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

function shouldSkipTokenRefresh(config?: InternalAxiosRequestConfig): boolean {
  if (!config) return false;

  // Check custom header
  if (config.headers?.["X-Skip-Token-Refresh"] === "true") {
    return true;
  }

  // Check URL
  const publicEndpoints = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-token",
    "/auth/refresh",
    "/auth/google/exchange-code",
    "/auth/google/callback",
    "/auth/google/mobile-callback",
  ];
  return publicEndpoints.some((endpoint) => config.url?.includes(endpoint));
}
