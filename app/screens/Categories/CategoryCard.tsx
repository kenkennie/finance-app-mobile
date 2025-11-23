import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "@/shared/components/ui/Card";
import { Category } from "@/shared/types/category.types";

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
  isDark: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  onPress,
  isDark = false,
  category,
}) => {
  return (
    <Card
      onPress={onPress}
      isDark={isDark}
    >
      <View style={styles.container}>
        <View style={[styles.icon, { backgroundColor: category.color + "20" }]}>
          <Feather
            name={category.icon as any}
            size={24}
            color={category.color}
          />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, isDark && styles.nameDark]}>
            {category.name}
          </Text>
          <Text style={[styles.type, isDark && styles.typeDark]}>
            {category.transactionType}
          </Text>
          {category.description && (
            <Text
              style={[styles.description, isDark && styles.descriptionDark]}
              numberOfLines={1}
            >
              {category.description}
            </Text>
          )}
        </View>
        {category.children && category.children.length > 0 && (
          <View style={styles.subcategoryBadge}>
            <Text style={styles.subcategoryText}>
              {category.children.length}
            </Text>
          </View>
        )}
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
    textTransform: "capitalize",
    marginBottom: 2,
  },
  typeDark: {
    color: "#9CA3AF",
  },
  description: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  descriptionDark: {
    color: "#6B7280",
  },
  subcategoryBadge: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  subcategoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
});
