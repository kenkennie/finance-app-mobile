import {
  View,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/shared/components/ui/Header";
import { FAB } from "@/shared/components/ui/FAB";
import { useRouter } from "expo-router";
import { SearchBar } from "@/shared/components/ui/SearchBar";
import { Typography } from "@/shared/components/ui/Typography";
import { Card } from "@/shared/components/ui/Card";
import { TabBar } from "@/shared/components/ui/TabBar";
import { GoalCard } from "@/app/screens/Goals/GoalCard";
import { useGoalStore } from "@/store/goalStore";
import { Goal } from "@/shared/types/goal.types";
import { colors } from "@/theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const Goals = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const {
    goals,
    goalDetails,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    getGoals,
    loadMoreGoals,
  } = useGoalStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const statusMap = {
    active: "Active",
    completed: "Completed",
    paused: "Paused",
  } as const;

  // Refs for request deduplication
  const currentRequestRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Calculate tab bar height to ensure content isn't hidden
  const tabBarHeight = (Platform.OS === "ios" ? 100 : 82) + insets.bottom;
  const contentPaddingBottom = tabBarHeight + 20; // Extra 20px for better spacing

  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch goals when filters change
  useEffect(() => {
    // Create request identifier for deduplication
    const requestId = `${activeTab}-${debouncedSearchQuery}`;

    // Cancel previous request if it's still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Skip if this request is already in progress
    if (currentRequestRef.current === requestId) {
      return;
    }

    currentRequestRef.current = requestId;
    abortControllerRef.current = new AbortController();

    const fetchGoals = async () => {
      try {
        const params: any = {};

        // Add status filter
        if (activeTab !== "all") {
          params.status = [statusMap[activeTab as keyof typeof statusMap]];
        }

        // Add search filter
        if (debouncedSearchQuery.trim()) {
          params.search = debouncedSearchQuery.trim();
        }

        // Call getGoals with the params
        await getGoals(params);
      } catch (error: any) {
        // Don't log abort errors
        if (error.name !== "AbortError") {
          console.error("Failed to fetch goals:", error);
        }
      } finally {
        // Clear request tracking
        if (currentRequestRef.current === requestId) {
          currentRequestRef.current = "";
          abortControllerRef.current = null;
        }
      }
    };

    fetchGoals();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [activeTab, debouncedSearchQuery, getGoals]);

  // Handle load more goals
  const handleLoadMore = () => {
    if (isLoadingMore || pagination.page >= pagination.totalPages) return;

    const params: any = {};
    if (activeTab !== "all") {
      params.status = [statusMap[activeTab as keyof typeof statusMap]];
    }
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery.trim();
    }

    loadMoreGoals(params);
  };

  const handleRefresh = async () => {
    const params: any = {};
    if (activeTab !== "all") {
      params.status = [statusMap[activeTab as keyof typeof statusMap]];
    }
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery.trim();
    }

    await getGoals(params);
  };

  const renderGoalCard = ({ item: goal }: { item: Goal }) => {
    return (
      <GoalCard
        goal={goal}
        onPress={() => router.push(`/screens/Goals/${goal.id}` as any)}
        isDark={isDark}
      />
    );
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          isDark && styles.containerDark,
        ]}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? colors.text.white : colors.text.primary}
        />
        <Typography
          style={
            isDark
              ? [styles.loadingText, styles.loadingTextDark]
              : styles.loadingText
          }
        >
          Loading goals...
        </Typography>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Goals"
        onBackPress={() => router.back()}
        isDark={isDark}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          placeholder="Search goals"
          value={searchQuery}
          onChangeText={setSearchQuery}
          isDark={isDark}
        />
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={isDark ? colors.text.white : colors.text.primary}
          />
        }
        renderItem={renderGoalCard}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator
                size="small"
                color={isDark ? colors.text.white : colors.text.primary}
              />
              <Typography
                variant="caption"
                style={[
                  styles.loadMoreText,
                  isDark ? styles.loadMoreTextDark : {},
                ]}
              >
                Loading more goals...
              </Typography>
            </View>
          ) : null
        }
        ListHeaderComponent={() => (
          <>
            {/* Overview Card */}
            <Card
              isDark={isDark}
              style={styles.summaryCard}
            >
              <View style={styles.summaryHeader}>
                <Typography
                  variant="h3"
                  style={[
                    styles.summaryTitle,
                    isDark ? styles.summaryTitleDark : {},
                  ]}
                >
                  Goal Overview
                </Typography>
              </View>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Typography
                    variant="caption"
                    style={[
                      styles.summaryLabel,
                      isDark ? styles.summaryLabelDark : {},
                    ]}
                  >
                    Total Goals
                  </Typography>
                  <Typography
                    variant="h2"
                    style={styles.summaryValue}
                  >
                    {pagination.total}
                  </Typography>
                </View>

                <View style={styles.summaryItem}>
                  <Typography
                    variant="caption"
                    style={[
                      styles.summaryLabel,
                      isDark ? styles.summaryLabelDark : {},
                    ]}
                  >
                    Active Goals
                  </Typography>
                  <Typography
                    variant="h2"
                    style={styles.summaryValue}
                  >
                    {pagination.activeCount || 0}
                  </Typography>
                </View>

                <View style={styles.summaryItem}>
                  <Typography
                    variant="caption"
                    style={[
                      styles.summaryLabel,
                      isDark ? styles.summaryLabelDark : {},
                    ]}
                  >
                    Completed
                  </Typography>
                  <Typography
                    variant="h2"
                    style={styles.summaryValue}
                  >
                    {pagination.completedCount || 0}
                  </Typography>
                </View>
              </View>
            </Card>

            {/* Filters Section */}
            <Card
              isDark={isDark}
              style={styles.filtersCard}
            >
              <TabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isDark={isDark}
                tabs={[
                  { id: "all", label: "All" },
                  { id: "active", label: "Active" },
                  { id: "completed", label: "Completed" },
                  { id: "paused", label: "Paused" },
                ]}
              />
            </Card>

            <View style={styles.sectionHeader}>
              <Typography
                variant="h3"
                weight="semibold"
                style={
                  isDark
                    ? [styles.sectionTitle, styles.sectionTitleDark]
                    : styles.sectionTitle
                }
              >
                Your Goals ({goals.length}
                {pagination.total > goals.length
                  ? ` of ${pagination.total}`
                  : ""}
                )
              </Typography>
            </View>
          </>
        )}
        ListEmptyComponent={() => {
          if (error) {
            return (
              <View style={[styles.centered, styles.errorContainer]}>
                <Typography
                  style={
                    isDark
                      ? [styles.errorText, styles.errorTextDark]
                      : styles.errorText
                  }
                >
                  {error}
                </Typography>
              </View>
            );
          }

          return (
            <View style={[styles.centered, styles.emptyContainer]}>
              <Typography
                variant="h2"
                style={
                  isDark
                    ? [styles.emptyTitle, styles.emptyTitleDark]
                    : styles.emptyTitle
                }
              >
                {debouncedSearchQuery ? "No goals found" : "No goals yet"}
              </Typography>
              <Typography
                variant="body1"
                style={[
                  styles.emptySubtitle,
                  ...(isDark ? [styles.emptySubtitleDark] : []),
                ]}
              >
                {debouncedSearchQuery
                  ? "Try adjusting your search or filters"
                  : "Create your first goal to start saving for what matters most"}
              </Typography>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={
          goals.length === 0
            ? [styles.fullHeight, { paddingBottom: contentPaddingBottom }]
            : { paddingBottom: contentPaddingBottom }
        }
      />

      <FAB
        icon="plus"
        onPress={() => router.push("/screens/Goals/AddGoal")}
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  fullHeight: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryHeader: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  summaryTitleDark: {
    color: "#FFF",
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    textAlign: "center",
  },
  summaryLabelDark: {
    color: "#9CA3AF",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
    textAlign: "center",
  },
  filtersCard: {
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  loadingTextDark: {
    color: "#9CA3AF",
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.text.primary,
  },
  sectionTitleDark: {
    color: colors.text.white,
  },
  errorContainer: {
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
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  emptyTitle: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyTitleDark: {
    color: "#9CA3AF",
  },
  emptySubtitle: {
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  emptySubtitleDark: {
    color: "#9CA3AF",
  },
  loadMoreContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loadMoreText: {
    marginTop: 8,
    color: colors.text.secondary,
  },
  loadMoreTextDark: {
    color: colors.text.white,
  },
});

export default Goals;
