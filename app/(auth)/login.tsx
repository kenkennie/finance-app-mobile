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
import { useToastStore } from "@/store/toastStore";
import { loginSchema, type LoginDto } from "@/schemas/auth.schema";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { colors } from "@/theme/colors";
import { fontSize, spacing } from "@/theme/spacing";
import { Button } from "@/shared/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { authService } from "@/shared/services/auth/authService";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const {
    login,
    loginWithGoogle,
    isLoading,
    clearError,
    checkOnboardingStatus,
  } = useAuthStore();
  const { showSuccess, showError } = useToastStore();

  // Component initialization
  useEffect(() => {
    // Any initialization logic can go here
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ✅ Clear error when leaving screen
  useEffect(() => {
    return () => clearError();
  }, []);

  const onSubmit = async (data: LoginDto) => {
    try {
      const successMessage = await login(data.email, data.password);
      showSuccess(successMessage);

      // Check onboarding status after successful login
      setTimeout(async () => {
        try {
          const onboardingStatus = await checkOnboardingStatus();

          if (onboardingStatus.needsOnboarding) {
            router.replace("/onboarding/welcome");
          } else {
            router.replace("/(tabs)");
          }
        } catch (error) {
          // If onboarding check fails, go to main app
          router.replace("/(tabs)");
        }
      }, 100);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const onGoogleLogin = async () => {
    try {
      const successMessage = await loginWithGoogle();
      showSuccess(successMessage);

      // Check onboarding status after successful login
      setTimeout(async () => {
        try {
          const onboardingStatus = await checkOnboardingStatus();

          if (onboardingStatus.needsOnboarding) {
            router.replace("/onboarding/welcome");
          } else {
            router.replace("/(tabs)");
          }
        } catch (error) {
          // If onboarding check fails, go to main app
          router.replace("/(tabs)");
        }
      }, 100);
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            {/* <View style={styles.logoContainer}>
              <Text style={styles.logo}>💰</Text>
            </View> */}
            <Text style={[styles.title, isDark && styles.titleDark]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Sign in to continue to ExpenseFlow
            </Text>
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
                    leftIcon="email"
                    isDark={isDark}
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
                    autoCapitalize="none"
                    secureTextEntry
                    error={errors.password?.message}
                    leftIcon="password"
                    showPasswordToggle
                    isDark={isDark}
                  />
                )}
              />

              <View style={styles.options}>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/forgot-password")}
                >
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <Button
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text
                  style={[styles.dividerText, isDark && styles.dividerTextDark]}
                >
                  or
                </Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                onPress={onGoogleLogin}
                disabled={isLoading}
                style={[
                  styles.googleButton,
                  isDark && styles.googleButtonDark,
                  isLoading && styles.googleButtonDisabled,
                ]}
              >
                <Ionicons
                  name="logo-google"
                  size={20}
                  color={isDark ? "#FFF" : colors.primary}
                  style={styles.googleIcon}
                />
                <Text
                  style={[
                    styles.googleButtonText,
                    isDark && styles.googleButtonTextDark,
                  ]}
                >
                  {isLoading ? "Signing In..." : "Continue with Google"}
                </Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Don&apos;t have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/register")}
                >
                  <Text style={styles.link}>Sign up</Text>
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
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
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
  subtitleDark: {
    color: "#9CA3AF",
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
  link: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[300],
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  dividerTextDark: {
    color: "#9CA3AF",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  googleButtonDark: {
    borderColor: "#374151",
    backgroundColor: "#1F2937",
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    marginRight: spacing.sm,
  },
  googleButtonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text.primary,
  },
  googleButtonTextDark: {
    color: "#FFF",
  },

  bottomPadding: {
    height: 20,
  },
});
