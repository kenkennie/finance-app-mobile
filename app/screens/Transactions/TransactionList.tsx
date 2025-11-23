import React from "react";
import { View, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { Typography } from "@/shared/components/ui/Typography";
import { TransactionCard } from "./TransactionCard";
import { Transaction } from "@/shared/types/filter.types";

interface HeaderItem {
  type: "header";
  dateString: string;
  displayDate: string;
}

interface TransactionItem {
  type: "transaction";
  transaction: Transaction;
}

type FlatDataItem = HeaderItem | TransactionItem;

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  isDark: boolean;
  onTransactionPress: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading,
  isLoadingMore,
  error,
  onLoadMore,
  isDark,
  onTransactionPress,
}) => {
  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

  // Sort dates in descending order (most recent first)
  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Create flat data for FlatList
  const flatData = sortedDates.flatMap((dateString) => {
    const transactionsForDate = groupedTransactions[dateString];
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let displayDate: string;
    if (date.toDateString() === today.toDateString()) {
      displayDate = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      displayDate = "Yesterday";
    } else {
      displayDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return [
      { type: "header", dateString, displayDate },
      ...transactionsForDate.map((transaction) => ({
        type: "transaction",
        transaction,
      })),
    ];
  });

  return (
    <FlatList
      data={
        (isLoading || error || transactions.length === 0
          ? []
          : flatData) as FlatDataItem[]
      }
      keyExtractor={(item: FlatDataItem) =>
        item.type === "header"
          ? `header-${item.dateString}`
          : `transaction-${item.transaction.id}`
      }
      renderItem={({ item }) => {
        if (item.type === "header") {
          const headerItem = item as HeaderItem;
          return (
            <View
              style={[styles.dateHeader, isDark ? styles.dateHeaderDark : {}]}
            >
              <Typography
                variant="body2"
                weight="semibold"
                style={[
                  styles.dateHeaderText,
                  isDark ? styles.dateHeaderTextDark : {},
                ]}
              >
                {headerItem.displayDate}
              </Typography>
            </View>
          );
        } else {
          const transactionItem = item as TransactionItem;
          return (
            <TransactionCard
              transaction={transactionItem.transaction}
              isDark={isDark}
              onPress={() => onTransactionPress(transactionItem.transaction)}
            />
          );
        }
      }}
      ListEmptyComponent={() => {
        if (isLoading) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={isDark ? "#FFF" : "#000"}
              />
              <Typography
                style={[
                  styles.loadingText,
                  isDark ? styles.loadingTextDark : {},
                ]}
              >
                Loading transactions...
              </Typography>
            </View>
          );
        } else if (error) {
          return (
            <View style={styles.errorContainer}>
              <Typography
                style={[styles.errorText, isDark ? styles.errorTextDark : {}]}
              >
                {error}
              </Typography>
            </View>
          );
        } else {
          return (
            <View style={styles.emptyContainer}>
              <Typography
                style={[styles.emptyText, isDark ? styles.emptyTextDark : {}]}
              >
                No transactions found. Create your first transaction!
              </Typography>
            </View>
          );
        }
      }}
      showsVerticalScrollIndicator={false}
      style={styles.content}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={isDark ? "#FFF" : "#000"}
            />
            <Typography
              style={[styles.loadingText, isDark ? styles.loadingTextDark : {}]}
            >
              Loading more transactions...
            </Typography>
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 16,
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
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  errorTextDark: {
    color: "#F87171",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  emptyTextDark: {
    color: "#9CA3AF",
  },
  dateHeader: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateHeaderDark: {
    // borderBottomColor: "#374151",
  },
  dateHeaderText: {
    fontSize: 12,
    color: "#374151",
    textTransform: "none",
    letterSpacing: 0.5,
  },
  dateHeaderTextDark: {
    // color: "#D1D5DB",
    // backgroundColor: "#1F2937",
  },
});

export default TransactionList;
