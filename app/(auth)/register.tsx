import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { registerSchema, type RegisterDto } from "@/schemas/auth.schema";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { colors } from "@/theme/colors";
import { fontSize, spacing } from "@/theme/spacing";
import { useToastStore } from "@/store/toastStore";

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { register, isLoading, isAuthenticated, clearError } = useAuthStore();
  const { showSuccess, showError } = useToastStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      // confirmPassword: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    return () => clearError();
  }, []);

  const onSubmit = async (data: RegisterDto) => {
    try {
      // Clean the data before sending
      const cleanedData = {
        ...data,
        email: data.email.toLowerCase().trim(),
        fullName: data.fullName.trim().replace(/\s{2,}/g, " "),
      };

      // ✅ Get success message from register
      const successMessage = await register(
        cleanedData.fullName,
        cleanedData.email,
        cleanedData.password
      );

      // ✅ Show success toast with backend message
      showSuccess(successMessage || "Account created successfully!");
      reset();
    } catch (error: any) {
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>💰</Text>
            </View>
            <Text style={[styles.title, isDark && styles.titleDark]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Join ExpenseFlow today
            </Text>
          </View>

          <Card
            style={styles.card}
            isDark={isDark}
          >
            <View style={styles.form}>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.fullName?.message}
                    isDark={isDark}
                    leftIcon="user"
                  />
                )}
              />

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

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    error={errors.password?.message}
                    isDark={isDark}
                    leftIcon="password"
                    showPasswordToggle
                  />
                )}
              />

              <Button
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <View style={styles.footer}>
                <Text
                  style={[styles.footerText, isDark && styles.footerTextDark]}
                >
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text style={styles.linkBold}>Sign in</Text>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
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
  subtitleDark: {
    color: "#9CA3AF",
  },
  card: {
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.sm,
  },
  terms: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    textAlign: "center",
  },
  link: {
    color: colors.primary,
    fontWeight: "500",
  },
  linkBold: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: "600",
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
  footerTextDark: {
    color: "#9CA3AF",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.text.secondary,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.background,
    fontSize: fontSize.sm,
    fontWeight: "bold",
  },
  checkboxText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    padding: spacing.md,
    borderRadius: 8,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
