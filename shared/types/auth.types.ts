export interface User {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  avatar?: string;
  emailVerifiedAt?: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}
export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    path: string;
    duration?: number;
    [key: string]: any;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  meta?: {
    timestamp: string;
    path: string;
    [key: string]: any;
  };
}

export interface RefreshTokenResponse {
  message: string;
  accessToken: string;
  refreshToken?: string; // For mobile
  user: User;
}

/**
 * Combined API Response Type
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
