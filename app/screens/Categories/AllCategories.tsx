import {
  View,
  StyleSheet,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Header } from "@/shared/components/ui/Header";
import { FAB } from "@/shared/components/ui/FAB";
import { useRouter } from "expo-router";
import { CategoryCard } from "./CategoryCard";
import { SearchBar } from "@/shared/components/ui/SearchBar";
import { useCategoryStore } from "@/store/categoryStore";
import { Typography } from "@/shared/components/ui/Typography";
import { FilterTabs } from "@/shared/components/ui/FilterTabs";
import { Category } from "@/shared/types/category.types";

const AllCategories = ({}) => {
  const router = useRouter();
  const { categories, isLoading, error, getCategories } = useCategoryStore();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<
    "EXPENSE" | "INCOME" | "ALL"
  >("ALL");
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories when filters change
  useEffect(() => {
    getCategories({
      type: selectedType === "ALL" ? undefined : selectedType,
      search: debouncedSearch || undefined,
    });
  }, [selectedType, debouncedSearch]);

  const handleTypeFilter = (type: string) => {
    setSelectedType(type as "EXPENSE" | "INCOME" | "ALL");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getCategories({
      type: selectedType === "ALL" ? undefined : selectedType,
      search: debouncedSearch || undefined,
    });
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="All Categories"
        showBack
        onBackPress={() => router.back()}
        isDark={isDark}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          placeholder="Search categories"
          value={searchQuery}
          onChangeText={setSearchQuery}
          isDark={isDark}
        />
      </View>

      <View style={styles.filterWrapper}>
        <FilterTabs
          tabs={[
            { id: "ALL", label: "ALL" },
            { id: "EXPENSE", label: "EXPENSE" },
            { id: "INCOME", label: "INCOME" },
          ]}
          activeTab={selectedType}
          onTabChange={handleTypeFilter}
          isDark={isDark}
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
            Loading categories...
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? "#FFF" : "#000"}
            />
          }
        >
          {categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Typography
                style={[styles.emptyText, isDark ? styles.emptyTextDark : {}]}
              >
                {searchQuery || selectedType !== "ALL"
                  ? "No categories found matching your criteria."
                  : "No categories found. Create your first category!"}
              </Typography>
            </View>
          ) : (
            categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={() =>
                  router.push(`/screens/Categories/${category.id}` as any)
                }
                isDark={isDark}
              />
            ))
          )}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        onPress={() => router.push("/screens/Categories/AddCategory")}
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
  filterWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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

export default AllCategories;
