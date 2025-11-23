import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { Header } from "@/shared/components/ui/Header";
import { Typography } from "@/shared/components/ui/Typography";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useAccountStore } from "@/store/accountStore";
import { useTransactionItemsStore } from "@/store/transactionItemsStore";
import { Transaction } from "@/shared/types/filter.types";

const TransactionDetailsScreen = () => {
  const router = useRouter();
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const { getTransactionById, deleteTransaction } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { accounts } = useAccountStore();
  const { getTransactionItemsByTransactionId, transactionItems } =
    useTransactionItemsStore();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [transactionId]);

  const loadTransaction = async () => {
    if (!transactionId) return;

    try {
      setIsLoading(true);
      const txn = await getTransactionById(transactionId);
      setTransaction(txn);

      // Load transaction items if not included in transaction
      if (txn && !txn.TransactionItems) {
        await getTransactionItemsByTransactionId(transactionId);
      }
    } catch (error) {
      console.error("Failed to load transaction:", error);
      Alert.alert("Error", "Failed to load transaction details");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (transaction) {
      router.push(
        `/screens/Transactions/EditTransaction?transactionId=${transaction.id}`
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!transaction) return;

    try {
      setIsDeleting(true);
      await deleteTransaction(transaction.id);
      router.back();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      Alert.alert("Error", "Failed to delete transaction");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "cleared":
        return "success";
      case "pending":
        return "warning";
      case "reconciled":
        return "info";
      default:
        return "neutral";
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Header
          title="Transaction Details"
          showBack
          onBackPress={() => router.back()}
          isDark={isDark}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={isDark ? "#FFF" : "#000"}
          />
          <Typography
            style={[styles.loadingText, isDark ? styles.loadingTextDark : {}]}
          >
            Loading transaction details...
          </Typography>
        </View>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Header
          title="Transaction Details"
          showBack
          onBackPress={() => router.back()}
          isDark={isDark}
        />
        <View style={styles.errorContainer}>
          <Typography
            style={[styles.errorText, isDark ? styles.errorTextDark : {}]}
          >
            Transaction not found
          </Typography>
        </View>
      </View>
    );
  }

  const items = transaction.TransactionItems || transactionItems;
  const transactionType = transaction.transactionType.toLowerCase();
  const currency = items[0]?.Account.currency;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Transaction Details"
        showBack
        onBackPress={() => router.back()}
        isDark={isDark}
        rightIcons={[
          {
            icon: "edit-3",
            onPress: handleEdit,
          },
        ]}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Transaction Header Card */}
        <Card
          isDark={isDark}
          style={styles.headerCard}
        >
          <View style={styles.transactionHeader}>
            <View
              style={[
                styles.transactionIcon,
                {
                  backgroundColor:
                    transactionType === "income" ? "#10B98120" : "#EF444420",
                },
              ]}
            >
              <Feather
                name={transactionType === "income" ? "arrow-up" : "arrow-down"}
                size={32}
                color={transactionType === "income" ? "#10B981" : "#EF4444"}
              />
            </View>
            <View style={styles.transactionInfo}>
              <Typography
                variant="h2"
                style={[
                  styles.transactionDescription,
                  isDark ? styles.transactionDescriptionDark : {},
                ]}
              >
                {transaction.title}
              </Typography>
              <Typography
                style={[
                  styles.transactionType,
                  isDark ? styles.transactionTypeDark : {},
                ]}
              >
                {transactionType === "income" ? "Income" : "Expense"}
              </Typography>
            </View>
          </View>

          <View style={styles.amountSection}>
            <Typography
              style={[styles.amountLabel, isDark ? styles.amountLabelDark : {}]}
            >
              Amount
            </Typography>
            <Typography
              variant="h1"
              style={[
                styles.amount,
                transactionType === "income"
                  ? styles.amountIncome
                  : styles.amountExpense,
                isDark ? styles.amountDark : {},
              ]}
            >
              {transactionType === "income" ? "+" : "-"}
              {currency}
              {transaction.totalAmount}
            </Typography>
            <Badge
              variant={getStatusColor(transaction.status)}
              size="medium"
            >
              {transaction.status.toLowerCase()}
            </Badge>
          </View>
        </Card>

        {/* Transaction Information */}
        <Card
          isDark={isDark}
          style={styles.infoCard}
        >
          <Typography
            variant="h3"
            style={[styles.sectionTitle, isDark ? styles.sectionTitleDark : {}]}
          >
            Transaction Information
          </Typography>

          <View style={styles.infoRow}>
            <Typography
              style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
            >
              Date
            </Typography>
            <Typography
              style={[styles.infoValue, isDark ? styles.infoValueDark : {}]}
            >
              {formatDate(transaction.date)}
            </Typography>
          </View>

          {transaction.notes && (
            <View style={styles.infoRow}>
              <Typography
                style={[styles.infoLabel, isDark ? styles.infoLabelDark : {}]}
              >
                Notes
              </Typography>
              <Typography
                style={[styles.notes, isDark ? styles.notesDark : {}]}
              >
                {transaction.notes}
              </Typography>
            </View>
          )}
        </Card>

        {/* Transaction Items */}
        {items.length > 0 && (
          <Card
            isDark={isDark}
            style={styles.itemsCard}
          >
            <Typography
              variant="h3"
              style={[
                styles.sectionTitle,
                isDark ? styles.sectionTitleDark : {},
              ]}
            >
              Transaction Items
            </Typography>

            {items.map((item, index) => (
              <View
                key={item.id}
                style={styles.itemRow}
              >
                <View style={styles.itemInfo}>
                  <View style={styles.itemDetails}>
                    <View style={styles.itemCategoryRow}>
                      <Feather
                        name={item.Category.icon as any}
                        size={14}
                        color={isDark ? "#9CA3AF" : "#6B7280"}
                      />
                      <Typography
                        style={[
                          styles.itemCategory,
                          isDark ? styles.itemCategoryDark : {},
                        ]}
                      >
                        {item.Category.name.toUpperCase()}
                      </Typography>
                    </View>
                    <Typography
                      style={[
                        styles.itemAccount,
                        isDark ? styles.itemAccountDark : {},
                      ]}
                    >
                      {item.Account.accountName} ({item.Account.accountNumber})
                    </Typography>
                    <Typography
                      style={[
                        styles.itemDescription,
                        isDark ? styles.itemDescriptionDark : {},
                      ]}
                    >
                      {item.description}
                    </Typography>
                  </View>
                </View>
                <Typography
                  style={[
                    styles.itemAmount,
                    transactionType === "income"
                      ? styles.itemAmountIncome
                      : styles.itemAmountExpense,
                    isDark ? styles.itemAmountDark : {},
                  ]}
                >
                  {item.formattedItemAmount ||
                    `${transactionType === "income" ? "+" : "-"}${
                      item.Account.currency
                    }${Math.abs(item.amount).toFixed(2)}`}
                </Typography>
              </View>
            ))}
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            onPress={handleEdit}
            variant="primary"
            style={styles.editButton}
          >
            Edit Transaction
          </Button>

          <Button
            onPress={handleDelete}
            variant="danger"
            style={styles.deleteButton}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Transaction"}
          </Button>
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
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  transactionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  transactionDescriptionDark: {
    color: "#FFF",
  },
  transactionType: {
    fontSize: 16,
    color: "#6B7280",
    textTransform: "capitalize",
  },
  transactionTypeDark: {
    color: "#9CA3AF",
  },
  amountSection: {
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  amountLabelDark: {
    color: "#9CA3AF",
  },
  amount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  amountDark: {
    color: "#FFF",
  },
  amountIncome: {
    color: "#10B981",
  },
  amountExpense: {
    color: "#EF4444",
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
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
    flex: 1,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
    flex: 1,
  },
  notes: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginTop: 4,
  },
  notesDark: {
    color: "#D1D5DB",
  },
  itemsCard: {
    marginBottom: 24,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  itemInfo: {
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  itemDescriptionDark: {
    color: "#9CA3AF",
  },
  itemDetails: {
    flexDirection: "column",
    gap: 4,
  },
  itemCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemCategoryIcon: {
    fontSize: 14,
  },
  itemCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  itemCategoryDark: {
    color: "#9CA3AF",
  },
  itemAccount: {
    fontSize: 14,
    color: "#6B7280",
  },
  itemAccountDark: {
    color: "#9CA3AF",
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  itemAmountDark: {
    color: "#FFF",
  },
  itemAmountIncome: {
    color: "#10B981",
  },
  itemAmountExpense: {
    color: "#EF4444",
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

export default TransactionDetailsScreen;
