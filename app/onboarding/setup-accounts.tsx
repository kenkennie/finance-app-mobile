import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Typography } from "@/shared/components/ui/Typography";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Header } from "@/shared/components/ui/Header";
import { useTheme } from "@/theme/context/ThemeContext";
import { useAccountStore } from "@/store/accountStore";
import { useAuthStore } from "@/store/authStore";
import { Feather } from "@expo/vector-icons";

export default function SetupAccountsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { createAccount, getAccounts, accounts, isLoading } = useAccountStore();
  const { completeOnboarding } = useAuthStore();

  const [mpesaNumber, setMpesaNumber] = useState("");
  const [skipMpesa, setSkipMpesa] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleSetupMpesa = async () => {
    if (!mpesaNumber.trim()) {
      Alert.alert("Error", "Please enter your M-Pesa number");
      return;
    }

    try {
      await createAccount({
        accountName: "M-Pesa",
        accountNumber: mpesaNumber,
        description: "Mobile money account",
        icon: "smartphone",
        color: "#059669",
        isSystemAccount: false,
        openingBalance: 0,
        balance: 0,
        currency: "KES",
      });

      handleComplete();
    } catch (error) {
      Alert.alert("Error", "Failed to create M-Pesa account");
    }
  };

  const handleSkipMpesa = () => {
    setSkipMpesa(true);
    handleComplete();
  };

  const handleComplete = async () => {
    console.log("🎯 handleComplete called");
    try {
      setIsCompleting(true);
      console.log("🚀 Calling completeOnboarding...");
      await completeOnboarding();
      console.log("✅ completeOnboarding finished successfully");
      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("❌ Failed to complete onboarding:", error);
      Alert.alert("Error", "Failed to complete setup. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Setup Accounts"
        showBack={false}
        isDark={isDark}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Typography
            variant="h2"
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            Your accounts are ready!
          </Typography>
          <Typography
            variant="body1"
            style={[
              styles.sectionDescription,
              isDark && styles.sectionDescriptionDark,
            ]}
          >
            We&apos;ve set up a Cash account for you. You can also add your
            M-Pesa account now.
          </Typography>
        </View>

        {/* Cash Account - Already Created */}
        <Card
          isDark={isDark}
          style={styles.accountCard}
        >
          <View style={styles.accountHeader}>
            <View
              style={[
                styles.accountIcon,
                { backgroundColor: "#8B5CF6" + "20" },
              ]}
            >
              <Feather
                name="dollar-sign"
                size={24}
                color="#8B5CF6"
              />
            </View>
            <View style={styles.accountInfo}>
              <Typography
                variant="h3"
                style={[styles.accountName, isDark && styles.accountNameDark]}
              >
                Cash
              </Typography>
              <Typography
                variant="body2"
                style={[
                  styles.accountDescription,
                  isDark && styles.accountDescriptionDark,
                ]}
              >
                Physical cash on hand
              </Typography>
            </View>
            <View style={styles.statusBadge}>
              <Feather
                name="check-circle"
                size={20}
                color="#10B981"
              />
            </View>
          </View>
        </Card>

        {/* M-Pesa Account Setup */}
        <Card
          isDark={isDark}
          style={styles.accountCard}
        >
          <View style={styles.accountHeader}>
            <View
              style={[
                styles.accountIcon,
                { backgroundColor: "#059669" + "20" },
              ]}
            >
              <Feather
                name="smartphone"
                size={24}
                color="#059669"
              />
            </View>
            <View style={styles.accountInfo}>
              <Typography
                variant="h3"
                style={[styles.accountName, isDark && styles.accountNameDark]}
              >
                M-Pesa (Optional)
              </Typography>
              <Typography
                variant="body2"
                style={[
                  styles.accountDescription,
                  isDark && styles.accountDescriptionDark,
                ]}
              >
                Add your mobile money account
              </Typography>
            </View>
          </View>

          <View style={styles.mpesaSetup}>
            <Input
              label="M-Pesa Phone Number"
              placeholder="e.g., 0712345678"
              value={mpesaNumber}
              onChangeText={setMpesaNumber}
              keyboardType="phone-pad"
              isDark={isDark}
              style={styles.mpesaInput}
            />
          </View>
        </Card>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Feather
              name="info"
              size={20}
              color={isDark ? "#60A5FA" : "#3B82F6"}
            />
            <Typography
              variant="body2"
              style={[styles.infoText, isDark && styles.infoTextDark]}
            >
              You can add more accounts later from the Accounts section
            </Typography>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        {mpesaNumber.trim() ? (
          <Button
            onPress={handleSetupMpesa}
            variant="primary"
            style={styles.actionButton}
            disabled={isLoading || isCompleting}
          >
            {isLoading || isCompleting
              ? "Setting up..."
              : "Setup M-Pesa & Continue"}
          </Button>
        ) : null}

        <Button
          onPress={handleSkipMpesa}
          variant={mpesaNumber.trim() ? "secondary" : "primary"}
          style={styles.actionButton}
          disabled={isCompleting}
        >
          {isCompleting
            ? "Completing..."
            : mpesaNumber.trim()
            ? "Skip M-Pesa"
            : "Continue"}
        </Button>
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
    paddingHorizontal: 16,
    paddingTop: 80, // Increased from 16 to 80 for status bar
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  sectionTitleDark: {
    color: "#FFF",
  },
  sectionDescription: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  sectionDescriptionDark: {
    color: "#9CA3AF",
  },
  accountCard: {
    marginBottom: 16,
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  accountNameDark: {
    color: "#FFF",
  },
  accountDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  accountDescriptionDark: {
    color: "#9CA3AF",
  },
  statusBadge: {
    marginLeft: 8,
  },
  mpesaSetup: {
    marginTop: 8,
  },
  mpesaInput: {
    marginBottom: 0,
  },
  infoCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: 14,
    color: "#1E40AF",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  infoTextDark: {
    color: "#60A5FA",
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
});
