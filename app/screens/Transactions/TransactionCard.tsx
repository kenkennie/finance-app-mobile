import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "@/shared/components/ui/Card";
import { Transaction } from "@/shared/types/filter.types";

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
  onLongPress?: () => void;
  isDark: boolean;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  onPress,
  onLongPress,
  isDark = false,
  transaction,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get first transaction item for category and account display
  const firstItem = transaction.TransactionItems?.[0];

  const isIncome = transaction.transactionType === "INCOME";

  return (
    <Card
      onPress={onPress}
      onLongPress={onLongPress}
      isDark={isDark}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.icon,
            {
              backgroundColor: "#3B82F620",
            },
          ]}
        >
          <Feather
            name={isIncome ? "arrow-up" : "arrow-down"}
            size={20}
            color={isIncome ? "#10B981" : "#EF4444"}
          />
        </View>

        <View style={styles.info}>
          <View style={styles.header}>
            <Text
              style={[styles.title, isDark && styles.titleDark]}
              numberOfLines={1}
            >
              {transaction.title}
            </Text>
            <Text
              style={[
                styles.amount,
                isIncome ? styles.amountIncome : styles.amountExpense,
                isDark && styles.amountDark,
              ]}
            >
              {isIncome ? "+" : "-"}
              {transaction.formattedAmount || "0.00"}
            </Text>
          </View>

          <View style={styles.details}>
            <Text style={[styles.category, isDark && styles.categoryDark]}>
              {firstItem?.Category?.name || "Unknown Category"}
            </Text>
            <Text style={[styles.account, isDark && styles.accountDark]}>
              {firstItem?.Account?.accountName || "Unknown Account"}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.date, isDark && styles.dateDark]}>
              {formatDate(transaction.date)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  titleDark: {
    color: "#FFF",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  amountIncome: {
    color: "#10B981",
  },
  amountExpense: {
    color: "#EF4444",
  },
  amountDark: {
    opacity: 0.9,
  },
  details: {
    flexDirection: "row",
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 12,
  },
  categoryDark: {
    color: "#9CA3AF",
  },
  account: {
    fontSize: 14,
    color: "#6B7280",
  },
  accountDark: {
    color: "#9CA3AF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  dateDark: {
    color: "#6B7280",
  },
});
