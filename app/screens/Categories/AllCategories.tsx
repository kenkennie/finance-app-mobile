import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Header } from "@/shared/components/ui/Header";
import { FAB } from "@/shared/components/ui/FAB";
import { useRouter } from "expo-router";
import { SearchBar } from "@/shared/components/ui/SearchBar";
import { useCategoryStore } from "@/store/categoryStore";
import { Typography } from "@/shared/components/ui/Typography";
import { TabBar } from "@/shared/components/ui/TabBar";
import { Card } from "@/shared/components/ui/Card";
import { Feather } from "@expo/vector-icons";
import { Category } from "@/shared/types/category.types";
import { useTheme } from "@/theme/context/ThemeContext";

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AllCategories = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { categories, isLoading, error, getCategories, deleteCategory } =
    useCategoryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch categories on mount and when filters change
  useEffect(() => {
    const filters: any = {};
    if (activeTab === "income") {
      filters.type = "INCOME";
    } else if (activeTab === "expenses") {
      filters.type = "EXPENSE";
    }
    if (debouncedSearchQuery.trim()) {
      filters.search = debouncedSearchQuery.trim();
    }

    getCategories(filters);
  }, [activeTab, debouncedSearchQuery, getCategories]);

  // Filter categories based on search (tab filtering is done server-side)
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      !debouncedSearchQuery.trim() ||
      category.name
        .toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase()) ||
      (category.description &&
        category.description
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Group categories by type for display
  const groupedCategories = filteredCategories.reduce((groups, category) => {
    const type = category.transactionType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(category);
    return groups;
  }, {} as Record<string, Category[]>);

  const handleEditCategory = (category: Category) => {
    router.push({
      pathname: "/screens/Categories/EditCategory",
      params: { categoryId: category.id },
    });
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(category.id);
            } catch (error) {
              Alert.alert("Error", "Failed to delete category");
            }
          },
        },
      ]
    );
  };

  const renderCategoryItem = ({ item: category }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.categoryItem, isDark && styles.categoryItemDark]}
      onPress={() => handleEditCategory(category)}
      onLongPress={() => handleDeleteCategory(category)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: category.color + "20" },
          ]}
        >
          <Feather
            name={category.icon as any}
            size={20}
            color={category.color}
          />
        </View>
        <View style={styles.categoryInfo}>
          <Typography
            variant="body1"
            weight="semibold"
            style={[styles.categoryName, isDark && styles.categoryNameDark]}
          >
            {category.name}
          </Typography>
          {category.description && (
            <Typography
              variant="caption"
              style={[
                styles.categoryDescription,
                isDark && styles.categoryDescriptionDark,
              ]}
            >
              {category.description}
            </Typography>
          )}
          <View style={styles.categoryMeta}>
            <Typography
              variant="caption"
              style={[styles.categoryType, isDark && styles.categoryTypeDark]}
            >
              {category.transactionType}
            </Typography>
            {category.children && category.children.length > 0 && (
              <Typography
                variant="caption"
                style={[
                  styles.subcategoriesCount,
                  isDark && styles.subcategoriesCountDark,
                ]}
              >
                {category.children.length} subcategories
              </Typography>
            )}
          </View>
        </View>
      </View>
      <Feather
        name="chevron-right"
        size={20}
        color={isDark ? "#9CA3AF" : "#6B7280"}
      />
    </TouchableOpacity>
  );

  const renderSection = (type: string, categories: Category[]) => (
    <View
      key={type}
      style={styles.section}
    >
      <Typography
        variant="h4"
        weight="semibold"
        style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
      >
        {type} Categories ({categories.length})
      </Typography>
      {categories.map((category) => (
        <View key={category.id}>{renderCategoryItem({ item: category })}</View>
      ))}
    </View>
  );

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

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Card
          isDark={isDark}
          style={styles.filtersCard}
        >
          <TabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isDark={isDark}
          />
        </Card>

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
        ) : Object.keys(groupedCategories).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography
              style={[styles.emptyText, isDark ? styles.emptyTextDark : {}]}
            >
              {debouncedSearchQuery
                ? "No categories found matching your search."
                : "No categories found. Create your first category!"}
            </Typography>
          </View>
        ) : (
          Object.keys(groupedCategories).map((type) =>
            renderSection(type, groupedCategories[type])
          )
        )}
      </ScrollView>

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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  filtersCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#111827",
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: "#FFF",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryItemDark: {
    backgroundColor: "#1C1C1E",
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 2,
  },
  categoryNameDark: {
    color: "#FFF",
  },
  categoryDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  categoryDescriptionDark: {
    color: "#9CA3AF",
  },
  categoryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryType: {
    fontSize: 12,
    color: "#10B981",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  categoryTypeDark: {
    color: "#34D399",
  },
  subcategoriesCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  subcategoriesCountDark: {
    color: "#9CA3AF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
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
