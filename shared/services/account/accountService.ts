import { ApiSuccessResponse } from "@/shared/types/auth.types";
import { Account } from "@/shared/types/account.types";
import { apiClient } from "@/config/api.config";
import {
  extractResponseData,
  handleApiResponse,
} from "@/shared/utils/api/responseHandler";
import { CreateAccountDto, UpdateAccountDto } from "@/schemas/account.schema";

export const accountService = {
  async createAccount(accountData: CreateAccountDto): Promise<{
    data: Account;
    message: string;
  }> {
    const response = await apiClient.post<ApiSuccessResponse<Account>>(
      "/account",
      accountData
    );

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Account created successfully",
    };
  },

  async getAccounts(): Promise<Account[]> {
    const response = await apiClient.get<ApiSuccessResponse<Account[]>>(
      "/account"
    );
    return extractResponseData(response);
  },

  async getAccountById(id: string): Promise<Account> {
    const response = await apiClient.get<ApiSuccessResponse<Account>>(
      `/account/${id}`
    );
    return extractResponseData(response);
  },

  async getAccountDetails(id: string): Promise<{
    account: Account;
    transactions: any[];
  }> {
    const response = await apiClient.get<
      ApiSuccessResponse<{ account: Account; transactions: any[] }>
    >(`/account/${id}/details`);
    return extractResponseData(response);
  },

  async updateAccount(
    id: string,
    accountData: UpdateAccountDto
  ): Promise<{
    data: Account;
    message: string;
  }> {
    const response = await apiClient.put<ApiSuccessResponse<Account>>(
      `/account/${id}`,
      accountData
    );

    const result = handleApiResponse(response);
    if (!result.success || !result.data) {
      throw new Error(result.message);
    }

    return {
      data: result.data,
      message: result.message || "Account updated successfully",
    };
  },

  async deleteAccount(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiSuccessResponse<null>>(
      `/account/${id}`
    );

    const result = handleApiResponse(response);
    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      message: result.message || "Account deleted successfully",
    };
  },
};
