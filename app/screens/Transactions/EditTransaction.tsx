import { Header } from "@/shared/components/ui/Header";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useToastStore } from "@/store/toastStore";
import { useTransactionStore } from "@/store/transactionStore";
import TransactionForm from "./TransactionForm";
import { Transaction } from "@/shared/types/filter.types";

const EditTransactionScreen = ({}) => {
  const { showSuccess, showError } = useToastStore();
  const router = useRouter();
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const { updateTransaction, getTransactionById, isLoading } =
    useTransactionStore();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [initialData, setInitialData] = useState<Transaction | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransaction();
  }, [transactionId]);

  const loadTransaction = async () => {
    if (!transactionId) return;

    try {
      const transaction = await getTransactionById(transactionId);
      if (transaction) {
        setInitialData(transaction);
      }
    } catch (error: any) {
      showError("Failed to load transaction");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!transactionId) return;

    try {
      await updateTransaction(transactionId, data);
      showSuccess("Transaction updated successfully!");
      router.back();
    } catch (error: any) {
      showError(error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Header
          title="Edit Transaction"
          showBack
          onBackPress={() => router.back()}
          isDark={isDark}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={isDark ? "#FFF" : "#000"}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Edit Transaction"
        showBack
        onBackPress={() => router.back()}
        isDark={isDark}
      />

      <TransactionForm
        mode="edit"
        initialData={initialData}
        onSubmit={onSubmit}
        isLoading={isLoading}
        submitButtonText="Update Transaction"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  containerDark: {
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditTransactionScreen;
