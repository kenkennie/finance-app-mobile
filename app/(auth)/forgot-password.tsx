import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  useColorScheme,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import {
  ForgotPasswordDto,
  forgotPasswordSchema,
  loginSchema,
  type LoginDto,
} from "@/schemas/auth.schema";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { colors } from "@/theme/colors";
import { fontSize, spacing } from "@/theme/spacing";
import { Button } from "@/shared/components/ui/Button";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { forgotPassoword, isLoading, clearError } = useAuthStore();
  const { showSuccess, showError } = useToastStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordDto>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // ✅ Clear error when leaving screen
  useEffect(() => {
    return () => clearError();
  }, []);

  const onSubmit = async (data: ForgotPasswordDto) => {
    try {
      console.log("🔐 Attempting login...");
      const successMessage = await forgotPassoword(data.email);
      showSuccess(
        successMessage || "Forgot password successful. Please check your email."
      );
    } catch (error: any) {
      console.error("❌ Error occurred:", error.message);
      showError(error.message);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}></Text>
            </View>
            <Text style={[styles.title, isDark && styles.titleDark]}>
              Forgot Passowrd
            </Text>
            {/* <Text style={styles.subtitle}>
              Sign in to continue to ExpenseFlow
            </Text> */}
          </View>

          <Card
            style={styles.card}
            isDark={isDark}
          >
            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="john@example.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email?.message}
                    isDark={isDark}
                    leftIcon="email"
                  />
                )}
              />

              <Button
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
              >
                {isLoading ? "Submiting..." : "Submit"}
              </Button>
              <View style={styles.options}>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text
                    style={[
                      styles.forgotPassword,
                      isDark && styles.forgotPasswordDark,
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  containerDark: {
    backgroundColor: "#000",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 80, // Increased from spacing.xl (32) to 80 for status bar
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  titleDark: {
    color: "#FFF",
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: "center",
  },
  card: {
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  options: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  forgotPassword: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: "500",
  },
  forgotPasswordDark: {
    color: colors.primary, // keep as is
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  link: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: "600",
  },
});
