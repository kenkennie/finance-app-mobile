import { Header } from "@/shared/components/ui/Header";
import { LoadingIndicator } from "@/shared/components/ui/LoadingIndicator";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useToastStore } from "@/store/toastStore";
import { UpdateAccountDto } from "@/schemas/account.schema";
import { useAccountStore } from "@/store/accountStore";
import AccountForm from "./AccountForm";
import { Account } from "@/shared/types/account.types";

const EditAccountScreen = ({}) => {
  const { showSuccess, showError } = useToastStore();
  const router = useRouter();
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const {
    updateAccount,
    getAccountById,
    isLoading,
    clearError,
    successMessage,
  } = useAccountStore();

  const [account, setAccount] = useState<Account | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(true);

  useEffect(() => {
    loadAccount();
  }, [accountId]);

  useEffect(() => {
    return () => clearError();
  }, []);

  const loadAccount = async () => {
    if (!accountId) return;

    try {
      setLoadingAccount(true);
      const accountData = await getAccountById(accountId);
      setAccount(accountData);
    } catch (error: any) {
      showError("Failed to load account");
      router.back();
    } finally {
      setLoadingAccount(false);
    }
  };

  const onSubmit = async (data: UpdateAccountDto) => {
    if (!accountId) return;

    try {
      const updatedAccount = await updateAccount(accountId, data);
      setAccount(updatedAccount);
      showSuccess(successMessage || "Account updated successfully!");
      setTimeout(() => {
        router.replace(
          `/screens/Accounts/AccountDetails?accountId=${accountId}` as any
        );
      }, 100);
    } catch (error: any) {
      showError(error.message);
    }
  };

  if (loadingAccount || !account) {
    return (
      <View style={styles.container}>
        <Header
          title="Edit Account"
          showBack
          onBackPress={() => router.back()}
        />
        <LoadingIndicator
          size="large"
          message="Loading account..."
          style={styles.loadingContainer}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Edit Account"
        showBack
        onBackPress={() => router.back()}
      />

      <AccountForm
        mode="edit"
        initialData={account}
        onSubmit={onSubmit as (data: UpdateAccountDto | any) => Promise<void>}
        isLoading={isLoading}
        submitButtonText="Update Account"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditAccountScreen;
