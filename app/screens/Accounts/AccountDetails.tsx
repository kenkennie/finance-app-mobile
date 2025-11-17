import {
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Header } from "@/shared/components/ui/Header";
import { Typography } from "@/shared/components/ui/Typography";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { useAccountStore } from "@/store/accountStore";
import { Account } from "@/shared/types/account.types";

const AccountDetailsScreen = () => {
  const router = useRouter();
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const { getAccountById, deleteAccount, isLoading } = useAccountStore();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [account, setAccount] = useState<Account | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(true);

  useEffect(() => {
    loadAccount();
  }, [accountId]);

  const loadAccount = async () => {
    if (!accountId) return;

    try {
      setLoadingAccount(true);
      const accountData = await getAccountById(accountId);
      setAccount(accountData);
    } catch (error) {
      console.error("Error loading account:", error);
    } finally {
      setLoadingAccount(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `KSh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditAccount = () => {
    if (account) {
      router.replace(
        `/screens/Accounts/EditAccountScreen?accountId=${account.id}` as any
      );
    }
  };

  const handleDeleteAccount = () => {
    if (!account) return;

    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete "${account.accountName}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount(account.id);
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ]
    );
  };

  if (loadingAccount) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Header
          title="Account Details"
          showBack
          onBackPress={() => router.back()}
          isDark={isDark}
        />
        <View style={styles.loadingContainer}>
          <Typography
            style={[styles.loadingText, isDark ? styles.loadingTextDark : {}]}
          >
            Loading account details...
          </Typography>
        </View>
      </View>
    );
  }

  if (!account) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Header
          title="Account Details"
          showBack
          onBackPress={() => router.back()}
          isDark={isDark}
        />
        <View style={styles.errorContainer}>
          <Typography
            style={[styles.errorText, isDark ? styles.errorTextDark : {}]}
          >
            Account not found
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Account Details"
        showBack
        onBackPress={() => router.back()}
        isDark={isDark}
        rightIcons={[
          {
            icon: "edit-3",
            onPress: handleEditAccount,
          },
        ]}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Header Card */}
        <Card
          isDark={isDark}
          style={styles.headerCard}
        >
          <View style={styles.accountHeader}>
            <View
              style={[
                styles.accountIcon,
                { backgroundColor: account.color + "20" },
              ]}
            >
              <Feather
                name={account.icon as any}
                size={32}
                color={account.color}
              />
            </View>
            <View style={styles.accountInfo}>
              <Typography
                variant="h2"
                style={[
                  styles.accountName,
                  isDark ? styles.accountNameDark : {},
                ]}
              >
                {account.accountName}
              </Typography>
              {account.accountNumber && (
                <Typography
                  style={[
                    styles.accountNumber,
                    isDark ? styles.accountNumberDark : {},
                  ]}
                >
                  {account.accountNumber || "N/A"}
                </Typography>
              )}
            </View>
          </View>

          <View style={styles.balanceSection}>
            <Typography
              style={[
                styles.balanceLabel,
                isDark ? styles.balanceLabelDark : {},
              ]}
            >
              Current Balance
            </Typography>
            <Typography
              variant="h1"
              style={[styles.balance, isDark ? styles.balanceDark : {}]}
            >
              {formatCurrency(account.balance)}
            </Typography>
          </View>
        </Card>

        {/* Account Information */}
        <Card
          isDark={isDark}
          style={styles.infoCard}
        >
          <Typography
            variant="h3"
            style={[styles.sectionTitle, isDark ? styles.sectionTitleDark : {}]}
          >
            Account Information
          </Typography>

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Description
            </Typography>
            <Typography
              style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
            >
              {account.description}
            </Typography>
          </View>

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Currency
            </Typography>
            <Typography
              style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
            >
              {account.currency}
            </Typography>
          </View>

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Status
            </Typography>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: account.isActive ? "#10B981" : "#EF4444" },
                ]}
              />
              <Typography
                style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
              >
                {account.isActive ? "Active" : "Inactive"}
              </Typography>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Created
            </Typography>
            <Typography
              style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
            >
              {formatDate(account.createdAt)}
            </Typography>
          </View>

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Last Updated
            </Typography>
            <Typography
              style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
            >
              {formatDate(account.updatedAt)}
            </Typography>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            onPress={handleEditAccount}
            variant="primary"
            style={styles.editButton}
          >
            Edit Account
          </Button>

          {!account.isSystem && (
            <Button
              onPress={handleDeleteAccount}
              variant="danger"
              style={styles.deleteButton}
              disabled={isLoading}
            >
              Delete Account
            </Button>
          )}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  loadingTextDark: {
    color: "#9CA3AF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
  },
  errorTextDark: {
    color: "#F87171",
  },
  headerCard: {
    marginBottom: 16,
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  accountIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  accountNameDark: {
    color: "#FFF",
  },
  accountNumber: {
    fontSize: 16,
    color: "#6B7280",
  },
  accountNumberDark: {
    color: "#9CA3AF",
  },
  balanceSection: {
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  balanceLabelDark: {
    color: "#9CA3AF",
  },
  balance: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },
  balanceDark: {
    color: "#FFF",
  },
  infoCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: "#FFF",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  infoLabel: {
    fontSize: 16,
    color: "#6B7280",
    flex: 1,
  },
  infoLabelDark: {
    color: "#9CA3AF",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    textAlign: "right",
    flex: 1,
  },
  infoValueDark: {
    color: "#FFF",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  actionButtons: {
    paddingBottom: 32,
  },
  editButton: {
    marginBottom: 12,
  },
  deleteButton: {
    marginBottom: 12,
  },
});

export default AccountDetailsScreen;
