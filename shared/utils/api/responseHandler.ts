import {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
} from "@/shared/types/auth.types";
import { AxiosResponse, AxiosError } from "axios";

/**
 * Check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Check if response is an error
 */
export function isErrorResponse(
  response: ApiResponse
): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Extract success message from response
 */
export function extractSuccessMessage(response: any): string {
  // Direct response
  if (response?.message) {
    return response.message;
  }

  // Axios response
  if (response?.data?.message) {
    return response.data.message;
  }

  // Default success message
  return "Operation completed successfully";
}

/**
 * Extract error message from response or error
 */
export function extractErrorMessage(error: any): string {
  // Axios error with response
  if (error.response?.data) {
    const data = error.response.data;

    // Backend structured error (success: false)
    if (data.success === false) {
      // Use message field
      if (data.message) {
        return data.message;
      }

      // Use first error from errors array
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors[0];
      }
    }

    // Backend structured success with error in data (edge case)
    if (
      data.success === true &&
      data.data?.message &&
      !data.data.access_token
    ) {
      return data.data.message;
    }

    // Generic message from response
    if (data.message) {
      return data.message;
    }
  }

  // HTTP status errors
  if (error.response) {
    const status = error.response.status;

    switch (status) {
      case 400:
        return "Bad request. Please check your input.";
      case 401:
        return "Unauthorized. Please login again.";
      case 403:
        return "Access denied.";
      case 404:
        return "Resource not found.";
      case 409:
        return "Conflict. Resource already exists.";
      case 422:
        return "Validation error. Please check your input.";
      case 500:
        return "Server error. Please try again later.";
      case 502:
        return "Bad gateway. Server is down.";
      case 503:
        return "Service unavailable. Please try again later.";
      default:
        return `Request failed with status ${status}`;
    }
  }

  // Network error (no response from server)
  if (error.request && !error.response) {
    return "Network error. Please check your internet connection.";
  }

  // Generic error
  if (error.message) {
    return error.message;
  }

  return "An unexpected error occurred";
}

/**
 * Extract data from success response
 */
export function extractResponseData<T>(
  response: AxiosResponse<ApiSuccessResponse<T>>
): T {
  return response.data.data;
}

/**
 * Handle API response (checks success/error and extracts accordingly)
 */
export function handleApiResponse<T>(response: AxiosResponse<ApiResponse<T>>): {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
} {
  const responseData = response.data;

  if (isSuccessResponse(responseData)) {
    return {
      success: true,
      message: responseData.message,
      data: responseData.data,
    };
  }

  if (isErrorResponse(responseData)) {
    return {
      success: false,
      message: responseData.message,
      errors: responseData.errors,
    };
  }

  // Fallback
  return {
    success: false,
    message: "Invalid response format",
  };
}

/**
 * Type guard to check if error is Axios error
 */
export function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError === true;
}

/**
 * Check if error is network error
 */
export function isNetworkError(error: any): boolean {
  return isAxiosError(error) && !error.response && !!error.request;
}

/**
 * Check if error is auth error (401, 403)
 */
export function isAuthError(error: any): boolean {
  return (
    isAxiosError(error) && [401, 403].includes(error.response?.status || 0)
  );
}

/**
 * Check if error is validation error (400, 422)
 */
export function isValidationError(error: any): boolean {
  return (
    isAxiosError(error) && [400, 422].includes(error.response?.status || 0)
  );
}
