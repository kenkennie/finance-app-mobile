import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Typography } from "@/shared/components/ui/Typography";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Header } from "@/shared/components/ui/Header";
import { useTheme } from "@/theme/context/ThemeContext";
import { useAuthStore } from "@/store/authStore";

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const { verifyEmail, isLoading } = useAuthStore();

  const [code, setCode] = useState("");

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }

    if (!email) {
      Alert.alert("Error", "Email is required");
      return;
    }

    try {
      const message = await verifyEmail(email, code);

      Alert.alert("Success", message, [
        {
          text: "Continue",
          onPress: () => {
            // Redirect to main app after successful verification
            router.replace("/");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Verification failed");
    }
  };

  const handleResendCode = () => {
    // TODO: Implement resend verification code
    Alert.alert("Info", "Resend functionality will be implemented");
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Verify Email"
        showBack
        onBackPress={() => router.back()}
        isDark={isDark}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Typography
            variant="h2"
            style={[styles.title, isDark && styles.titleDark]}
          >
            Check your email
          </Typography>
          <Typography
            variant="body1"
            style={[styles.subtitle, isDark && styles.subtitleDark]}
          >
            We sent a 6-digit verification code to
          </Typography>
          <Typography
            variant="body1"
            weight="semibold"
            style={[styles.email, isDark && styles.emailDark]}
          >
            {email}
          </Typography>
        </View>

        <View style={styles.form}>
          <Input
            label="Verification Code"
            placeholder="000000"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={6}
            isDark={isDark}
            style={styles.codeInput}
            textAlign="center"
          />

          <Button
            onPress={handleVerifyCode}
            variant="primary"
            style={styles.verifyButton}
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>

          <Button
            onPress={handleResendCode}
            variant="ghost"
            style={styles.resendButton}
          >
            Didn&apos;t receive the code? Resend
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  containerDark: {
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  titleDark: {
    color: "#FFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitleDark: {
    color: "#9CA3AF",
  },
  email: {
    fontSize: 16,
    color: "#3B82F6",
    textAlign: "center",
  },
  emailDark: {
    color: "#60A5FA",
  },
  form: {
    flex: 1,
  },
  codeInput: {
    marginBottom: 24,
    fontSize: 24,
  },
  verifyButton: {
    marginBottom: 16,
  },
  resendButton: {
    marginBottom: 16,
  },
});
