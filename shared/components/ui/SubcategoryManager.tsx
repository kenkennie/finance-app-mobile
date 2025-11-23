import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/context/ThemeContext";
import { Card } from "./Card";
import { Input } from "./Input";
import { Button } from "./Button";
import { Typography } from "./Typography";
import { Subcategory } from "@/shared/types/category.types";

interface SubcategoryManagerProps {
  subcategories: Subcategory[];
  onSubcategoriesChange: (subcategories: Subcategory[]) => void;
  maxSubcategories?: number;
}

const SubcategoryManager: React.FC<SubcategoryManagerProps> = ({
  subcategories,
  onSubcategoriesChange,
  maxSubcategories = 10,
}) => {
  const { isDark } = useTheme();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategoryDescription, setNewSubcategoryDescription] =
    useState("");

  const handleAddSubcategory = () => {
    if (!newSubcategoryName.trim()) {
      Alert.alert("Error", "Subcategory name is required");
      return;
    }

    if (subcategories.length >= maxSubcategories) {
      Alert.alert(
        "Limit Reached",
        `You can only add up to ${maxSubcategories} subcategories`
      );
      return;
    }

    const newSubcategory: Subcategory = {
      id: Date.now().toString(),
      name: newSubcategoryName.trim(),
      description: newSubcategoryDescription.trim() || undefined,
      icon: "circle",
    };

    onSubcategoriesChange([...subcategories, newSubcategory]);
    setNewSubcategoryName("");
    setNewSubcategoryDescription("");
    setShowAddForm(false);
  };

  const handleRemoveSubcategory = (index: number) => {
    Alert.alert(
      "Remove Subcategory",
      "Are you sure you want to remove this subcategory?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const updatedSubcategories = subcategories.filter(
              (_, i) => i !== index
            );
            onSubcategoriesChange(updatedSubcategories);
          },
        },
      ]
    );
  };

  const handleEditSubcategory = (
    index: number,
    field: keyof Subcategory,
    value: string
  ) => {
    const updatedSubcategories = subcategories.map((sub, i) =>
      i === index ? { ...sub, [field]: value || undefined } : sub
    );
    onSubcategoriesChange(updatedSubcategories);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography
          style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
        >
          Subcategories ({subcategories.length}/{maxSubcategories})
        </Typography>
        {subcategories.length < maxSubcategories && (
          <TouchableOpacity
            style={[styles.addButton, isDark && styles.addButtonDark]}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Feather
              name={showAddForm ? "minus" : "plus"}
              size={20}
              color={isDark ? "#FFF" : "#374151"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Add Subcategory Form */}
      {showAddForm && (
        <Card
          isDark={isDark}
          style={styles.addForm}
        >
          <Input
            label="Subcategory Name"
            placeholder="e.g., Groceries, Dining Out"
            value={newSubcategoryName}
            onChangeText={setNewSubcategoryName}
            maxLength={100}
          />
          <Input
            label="Description (Optional)"
            placeholder="Brief description"
            value={newSubcategoryDescription}
            onChangeText={setNewSubcategoryDescription}
            maxLength={200}
          />
          <View style={styles.formActions}>
            <Button
              onPress={() => setShowAddForm(false)}
              variant="outline"
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              onPress={handleAddSubcategory}
              style={styles.addButtonForm}
            >
              Add Subcategory
            </Button>
          </View>
        </Card>
      )}

      {/* Subcategories List */}
      {subcategories.length > 0 && (
        <Card
          isDark={isDark}
          style={styles.subcategoriesList}
        >
          {subcategories.map((subcategory, index) => (
            <View
              key={subcategory.id || index}
              style={styles.subcategoryItem}
            >
              <View style={styles.subcategoryContent}>
                <View style={styles.subcategoryHeader}>
                  <View style={styles.subcategoryIcon}>
                    <Feather
                      name="circle"
                      size={16}
                      color="#6B7280"
                    />
                  </View>
                  <View style={styles.subcategoryInfo}>
                    <Typography
                      style={[
                        styles.subcategoryName,
                        isDark && styles.subcategoryNameDark,
                      ]}
                    >
                      {subcategory.name}
                    </Typography>
                    {subcategory.description && (
                      <Typography
                        style={[
                          styles.subcategoryDescription,
                          isDark && styles.subcategoryDescriptionDark,
                        ]}
                      >
                        {subcategory.description}
                      </Typography>
                    )}
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.removeButton, isDark && styles.removeButtonDark]}
                onPress={() => handleRemoveSubcategory(index)}
              >
                <Feather
                  name="trash-2"
                  size={16}
                  color="#EF4444"
                />
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      )}

      {subcategories.length === 0 && !showAddForm && (
        <Card
          isDark={isDark}
          style={styles.emptyState}
        >
          <Typography
            style={[styles.emptyText, isDark && styles.emptyTextDark]}
          >
            No subcategories added yet. Tap the + button to add your first
            subcategory.
          </Typography>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sectionTitleDark: {
    color: "#FFF",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDark: {
    backgroundColor: "#374151",
  },
  addForm: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  addButtonForm: {
    flex: 1,
  },
  subcategoriesList: {
    marginHorizontal: 16,
  },
  subcategoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  subcategoryContent: {
    flex: 1,
  },
  subcategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  subcategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  subcategoryInfo: {
    flex: 1,
  },
  subcategoryName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  subcategoryNameDark: {
    color: "#FFF",
  },
  subcategoryDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  subcategoryDescriptionDark: {
    color: "#9CA3AF",
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonDark: {
    backgroundColor: "#451A1A",
  },
  emptyState: {
    marginHorizontal: 16,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyTextDark: {
    color: "#9CA3AF",
  },
});

export default SubcategoryManager;
