import React from "react";
import { View, StyleSheet } from "react-native";
import { Input } from "./Input";
import { Button } from "./Button";
import { spacing } from "@/theme/spacing";

interface SearchProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isDark: boolean;
  showFilterButton?: boolean;
  onFilterPress?: () => void;
  filterButtonText?: string;
}

export const SearchBar: React.FC<SearchProps> = ({
  placeholder,
  value,
  onChangeText,
  isDark = false,
  showFilterButton = false,
  onFilterPress,
  filterButtonText = "Filter",
}) => {
  if (showFilterButton) {
    return (
      <View style={styles.searchWithFilter}>
        <View style={styles.searchInput}>
          <Input
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            leftIcon="search"
            isDark={isDark}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
        <View style={styles.filterButton}>
          <Button
            onPress={onFilterPress}
            variant="outline"
            style={styles.filterBtn}
          >
            {filterButtonText}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      leftIcon="search"
      isDark={isDark}
      containerStyle={{ marginBottom: 0 }}
    />
  );
};

const styles = StyleSheet.create({
  searchWithFilter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    minWidth: 80,
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
  },
});
