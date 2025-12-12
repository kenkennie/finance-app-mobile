import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "@/shared/components/ui/Card";
import { Account } from "@/shared/types/account.types";

interface AccountCardProps {
  account: Account;
  onPress?: () => void;
  isDark: boolean;
}

const formatCurrency = (amount: number): string => {
  return `KSh ${amount.toLocaleString()}`;
};

const AccountCard: React.FC<AccountCardProps> = ({
  onPress,
  isDark = false,
  account,
}) => {
  return (
    <Card
      onPress={onPress}
      isDark={isDark}
    >
      <View style={styles.container}>
        <View style={[styles.icon, { backgroundColor: account.color + "20" }]}>
          <Feather
            name={account.icon as any}
            size={24}
            color={account.color}
          />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, isDark && styles.nameDark]}>
            {account.accountName}
          </Text>
          <Text style={[styles.type, isDark && styles.typeDark]}>
            {account.accountNumber}
          </Text>
        </View>
        <Text style={[styles.balance, isDark && styles.balanceDark]}>
          {formatCurrency(account.balance)}
        </Text>
      </View>
    </Card>
  );
};

export { AccountCard };
export default AccountCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  nameDark: {
    color: "#FFF",
  },
  type: {
    fontSize: 14,
    color: "#6B7280",
  },
  typeDark: {
    color: "#9CA3AF",
  },
  balance: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  balanceDark: {
    color: "#FFF",
  },
});
