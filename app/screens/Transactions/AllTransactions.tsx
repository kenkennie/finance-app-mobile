import {
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Header } from "@/shared/components/ui/Header";
import { FAB } from "@/shared/components/ui/FAB";
import { useRouter } from "expo-router";
import { TransactionCard } from "./TransactionCard";
import { SearchBar } from "@/shared/components/ui/SearchBar";
import { useTransactionStore } from "@/store/transactionStore";
import { Typography } from "@/shared/components/ui/Typography";
import { useFilterState } from "@/shared/hooks/useFilterState";
import { AdvancedFilterBottomSheet } from "@/shared/components/ui/filters/advancedFilterBottomSheet";
import { filterTransactions } from "@/shared/utils/filterTransactions";

const AllTransactions = ({}) => {
  const router = useRouter();
  const { transactions, isLoading, error, getTransactions } =
    useTransactionStore();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const {
    filters,
    tempFilters,
    activeFilterCount,
    applyFilters,
    clearAllFilters,
    updateTempFilters,
    resetTempFilters,
  } = useFilterState();

  useEffect(() => {
    getTransactions();
  }, []);

  // Update search query in filters
  useEffect(() => {
    updateTempFilters({ searchQuery });
  }, [searchQuery, updateTempFilters]);

  const handleFilterPress = () => {
    resetTempFilters();
    setShowFilterSheet(true);
  };

  const handleApplyFilters = () => {
    applyFilters();
    setShowFilterSheet(false);
  };

  const handleClearFilters = () => {
    clearAllFilters();
    setShowFilterSheet(false);
  };

  // Apply client-side filtering
  const filteredTransactions = filterTransactions(transactions, filters);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="All Transactions"
        showBack
        onBackPress={() => router.back()}
        isDark={isDark}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          placeholder="Search transactions"
          value={searchQuery}
          onChangeText={setSearchQuery}
          isDark={isDark}
          showFilterButton={true}
          onFilterPress={handleFilterPress}
          filterButtonText={
            activeFilterCount > 0 ? `Filter (${activeFilterCount})` : "Filter"
          }
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={isDark ? "#FFF" : "#000"}
          />
          <Typography
            style={[styles.loadingText, isDark ? styles.loadingTextDark : {}]}
          >
            Loading transactions...
          </Typography>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Typography
            style={[styles.errorText, isDark ? styles.errorTextDark : {}]}
          >
            {error}
          </Typography>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Typography
                style={[styles.emptyText, isDark ? styles.emptyTextDark : {}]}
              >
                {searchQuery
                  ? "No transactions found matching your search."
                  : "No transactions found. Create your first transaction!"}
              </Typography>
            </View>
          ) : (
            filteredTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onPress={() =>
                  router.push(
                    `/screens/Transactions/TransactionDetails?transactionId=${transaction.id}`
                  )
                }
                isDark={isDark}
              />
            ))
          )}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        onPress={() => router.push("/screens/Transactions/addTransaction")}
      />

      <AdvancedFilterBottomSheet
        isVisible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        filters={tempFilters}
        onUpdate={updateTempFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        transactionCount={filteredTransactions.length}
      />
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
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
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
});

export default AllTransactions;
