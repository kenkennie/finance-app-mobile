import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Typography } from "../Typography";
import { borderRadius, spacing, typography } from "@/theme/spacing";
import { colors } from "@/theme/colors";
import { FilterState } from "@/shared/types/filter.types";

interface Category {
  id: string;
  name: string;
  icon: string;
  type: "expense" | "income";
  count: number;
}

interface CategoryMultiSelectProps {
  filters: FilterState;
  onUpdate: (updates: Partial<FilterState>) => void;
  categories: Category[];
}

export const CategoryMultiSelect: React.FC<CategoryMultiSelectProps> =
  // eslint-disable-next-line react/display-name
  React.memo(({ filters, onUpdate, categories }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCategories = useMemo(() => {
      if (!searchQuery) return categories;
      const query = searchQuery.toLowerCase();
      return categories.filter((cat) => cat.name.toLowerCase().includes(query));
    }, [categories, searchQuery]);

    const handleToggle = useCallback(
      (categoryId: string) => {
        const selected = filters.categories.selected.includes(categoryId)
          ? filters.categories.selected.filter((id) => id !== categoryId)
          : [...filters.categories.selected, categoryId];

        onUpdate({
          categories: {
            selected,
            selectAll: selected.length === categories.length,
          },
        });
      },
      [filters.categories.selected, categories.length, onUpdate]
    );

    const handleSelectAll = useCallback(() => {
      if (filters.categories.selectAll) {
        onUpdate({ categories: { selected: [], selectAll: false } });
      } else {
        onUpdate({
          categories: {
            selected: categories.map((c) => c.id),
            selectAll: true,
          },
        });
      }
    }, [filters.categories.selectAll, categories, onUpdate]);

    const renderItem = useCallback(
      ({ item }: { item: Category }) => {
        const isSelected = filters.categories.selected.includes(item.id);
        return (
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => handleToggle(item.id)}
          >
            <View style={styles.categoryLeft}>
              <View
                style={[styles.checkbox, isSelected && styles.checkboxActive]}
              >
                {isSelected && (
                  <Typography
                    variant="body2"
                    color={colors.text.white}
                  >
                    ✓
                  </Typography>
                )}
              </View>
              <Typography variant="h4">{item.icon}</Typography>
              <Typography
                variant="body1"
                weight="medium"
              >
                {item.name}
              </Typography>
            </View>
            <Typography
              variant="caption"
              color={colors.gray[500]}
            >
              ({item.count})
            </Typography>
          </TouchableOpacity>
        );
      },
      [filters.categories.selected, handleToggle]
    );

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography
            variant="body1"
            weight="semibold"
          >
            Categories ({filters.categories.selected.length})
          </Typography>
          <TouchableOpacity onPress={handleSelectAll}>
            <Typography
              variant="body2"
              color={colors.primary}
            >
              {filters.categories.selectAll ? "Deselect All" : "Select All"}
            </Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Typography
            variant="body1"
            color={colors.gray[400]}
          >
            🔍
          </Typography>
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor={colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <BottomSheetFlatList
          data={filteredCategories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      </View>
    );
  });

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    maxHeight: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.primary,
    paddingVertical: spacing.sm,
  },
  list: {
    maxHeight: 300,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
