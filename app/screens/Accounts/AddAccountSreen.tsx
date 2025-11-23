import { Header } from "@/shared/components/ui/Header";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/theme/context/ThemeContext";
import { useToastStore } from "@/store/toastStore";
import { CreateAccountDto, UpdateAccountDto } from "@/schemas/account.schema";
import { useAccountStore } from "@/store/accountStore";
import AccountForm from "./AccountForm";

const CreateAccountScreen = ({}) => {
  const { showSuccess, showError } = useToastStore();
  const router = useRouter();
  const { isDark } = useTheme();
  const { createAccount, isLoading, clearError, successMessage } =
    useAccountStore();

  useEffect(() => {
    return () => clearError();
  }, []);

  const onSubmit = async (data: CreateAccountDto) => {
    try {
      await createAccount(data);
      showSuccess(successMessage || "Account created successfully!");

      setTimeout(() => {
        router.replace("/screens/Accounts/AccountsScreen");
      }, 100);
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Create New Account"
        showBack
        onBackPress={() => router.back()}
        isDark={isDark}
      />

      <AccountForm
        mode="create"
        onSubmit={
          onSubmit as (
            data: CreateAccountDto | UpdateAccountDto
          ) => Promise<void>
        }
        isLoading={isLoading}
        submitButtonText="Save Account"
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
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: "#FFF",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerDark: {
    backgroundColor: "#1C1C1E",
    borderTopColor: "#2C2C2E",
  },
  saveButton: {
    width: "100%",
  },
});

export default CreateAccountScreen;
