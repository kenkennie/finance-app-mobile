import { Header } from "@/shared/components/ui/Header";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { View, StyleSheet, useColorScheme } from "react-native";
import { useToastStore } from "@/store/toastStore";
import { useTransactionStore } from "@/store/transactionStore";
import TransactionForm from "./TransactionForm";

const AddTransactionScreen = () => {
  const { showSuccess, showError } = useToastStore();
  const router = useRouter();
  const { createTransaction, isLoading, clearError, successMessage } =
    useTransactionStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    return () => clearError();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await createTransaction(data);
      showSuccess(successMessage || "Transaction created successfully!");

      setTimeout(() => {
        router.replace("/(tabs)/transactions");
      }, 100);
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Create New Transaction"
        showBack
        onBackPress={() => router.back()}
        isDark={isDark}
      />

      <TransactionForm
        mode="create"
        onSubmit={onSubmit}
        isLoading={isLoading}
        submitButtonText="Save Transaction"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
});

export default AddTransactionScreen;
