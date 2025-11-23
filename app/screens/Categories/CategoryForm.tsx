import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/context/ThemeContext";
import IconColorSelector from "../Accounts/IconColorSelector";
import SettingRow from "../Accounts/SettingRow";
import { Button } from "@/shared/components/ui/Button";
import { Typography } from "@/shared/components/ui/Typography";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ColorPicker from "@/shared/components/ui/pickers/ColorPicker";
import IconPicker from "@/shared/components/ui/pickers/IconPicker";
import TransactionTypeSelector from "@/shared/components/ui/TransactionTypeSelector";
import SubcategoryManager from "@/shared/components/ui/SubcategoryManager";
import {
  CreateCategoryDto,
  CreateCategorySchema,
  UpdateCategoryDto,
  UpdateCategorySchema,
} from "@/schemas/category.schema";
import { Category } from "@/shared/types/category.types";

interface CategoryFormProps {
  mode: "create" | "edit";
  initialData?: Category;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
  isLoading: boolean;
  submitButtonText?: string;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  mode,
  initialData,
  onSubmit,
  isLoading,
  submitButtonText,
}) => {
  const { isDark } = useTheme();

  // State for modals only
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Create mode form
  const createForm = useForm<CreateCategoryDto>({
    resolver: zodResolver(CreateCategorySchema as any),
    defaultValues: {
      name: "",
      description: "",
      icon: "target",
      color: "#1976D2",
      transactionType: "EXPENSE",
      orderIndex: 0,
      subcategories: [],
    },
  });

  // Edit mode form
  const editForm = useForm<UpdateCategoryDto>({
    resolver: zodResolver(UpdateCategorySchema as any),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      icon: initialData?.icon || "💰",
      color: initialData?.color || "#1976D2",
      transactionType: initialData?.transactionType || "EXPENSE",
      parentId: initialData?.parentId,
      orderIndex: initialData?.orderIndex || 0,
      subcategories: initialData?.subcategories || [],
      isActive: initialData?.isActive ?? true,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (mode === "edit" && initialData) {
      console.log("Resetting edit form with initialData:", initialData);
      // Map children to subcategories if subcategories not present
      const subcategories =
        initialData.subcategories ||
        (initialData.children || []).map((child) => ({
          id: child.id,
          name: child.name,
          description: child.description,
          icon: child.icon,
        }));
      editForm.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        icon: initialData.icon || "💰",
        color: initialData.color || "#1976D2",
        transactionType: initialData.transactionType || "EXPENSE",
        parentId: initialData.parentId,
        orderIndex: initialData.orderIndex || 0,
        subcategories,
        isActive: initialData.isActive ?? true,
      });
      console.log("Form reset complete");
    }
  }, [initialData, editForm, mode]);

  if (mode === "create") {
    const {
      control,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
    } = createForm;

    const handleColorSelect = (color: string) => {
      setValue("color", color);
      setShowColorPicker(false);
    };

    const handleIconSelect = (icon: string) => {
      setValue("icon", icon);
      setShowIconPicker(false);
    };

    const handleFormSubmit = async (data: CreateCategoryDto) => {
      await onSubmit(data);
    };

    // Watch form values for UI updates
    const selectedIcon = watch("icon");
    const selectedColor = watch("color");
    const selectedTransactionType = watch("transactionType");
    const watchedSubcategories = watch("subcategories") || [];

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Category Name"
                  placeholder="e.g., Food, Transportation"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  isDark={isDark}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Description (Optional)"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Add a short description"
                  multiline
                  numberOfLines={3}
                  onBlur={onBlur}
                  error={errors.description?.message}
                  isDark={isDark}
                />
              )}
            />

            <Controller
              control={control}
              name="transactionType"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <TransactionTypeSelector
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />
          </View>

          {/* Customization Section */}
          <View style={styles.section}>
            <Typography
              style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
            >
              Customization
            </Typography>
            <Card isDark={isDark}>
              <IconColorSelector
                label="Color"
                color={selectedColor || "#1976D2"}
                type="color"
                onPress={() => setShowColorPicker(true)}
              />
              <IconColorSelector
                label="Icon"
                icon={
                  (selectedIcon || "💰") as React.ComponentProps<
                    typeof Feather
                  >["name"]
                }
                color={selectedColor || "#1976D2"}
                type="icon"
                onPress={() => setShowIconPicker(true)}
              />
            </Card>
          </View>

          {/* Subcategories Section */}
          <SubcategoryManager
            subcategories={watchedSubcategories}
            onSubcategoriesChange={(newSubcategories) =>
              setValue("subcategories", newSubcategories)
            }
          />
        </ScrollView>

        <View style={[styles.footer, isDark && styles.footerDark]}>
          <Button
            onPress={handleSubmit(handleFormSubmit)}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? "Submitting..." : submitButtonText || "Save Category"}
          </Button>
        </View>

        {/* Color Picker Modal */}
        <ColorPicker
          visible={showColorPicker}
          selectedColor={selectedColor || "#1976D2"}
          onColorSelect={handleColorSelect}
          onClose={() => setShowColorPicker(false)}
        />

        {/* Icon Picker Modal */}
        <IconPicker
          visible={showIconPicker}
          selectedIcon={selectedIcon || "💰"}
          selectedColor={selectedColor || "#1976D2"}
          onIconSelect={handleIconSelect}
          onClose={() => setShowIconPicker(false)}
        />
      </KeyboardAvoidingView>
    );
  }

  // Edit mode
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = editForm;

  // Watch form values for UI updates
  const selectedIcon = watch("icon");
  const selectedColor = watch("color");
  const selectedTransactionType = watch("transactionType");
  const watchedSubcategories = watch("subcategories") || [];

  const handleColorSelect = (color: string) => {
    setValue("color", color);
    setShowColorPicker(false);
  };

  const handleIconSelect = (icon: string) => {
    setValue("icon", icon);
    setShowIconPicker(false);
  };

  const handleFormSubmit = async (data: UpdateCategoryDto) => {
    console.log("=========ddddddddddddddddddddd===========================");
    console.log(
      "CategoryForm handleFormSubmit (edit mode) called with data:",
      JSON.stringify(data, null, 2)
    );
    console.log("Form errors:", editForm.formState.errors);
    console.log("====================================");
    await onSubmit(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoid}
    >
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Category Name"
                placeholder="e.g., Food, Transportation"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                isDark={isDark}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Description (Optional)"
                value={value}
                onChangeText={onChange}
                placeholder="Add a short description"
                multiline
                numberOfLines={3}
                onBlur={onBlur}
                error={errors.description?.message}
                isDark={isDark}
              />
            )}
          />

          <Controller
            control={control}
            name="transactionType"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TransactionTypeSelector
                value={value}
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
        </View>

        {/* Customization Section */}
        <View style={styles.section}>
          <Typography
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            Customization
          </Typography>
          <Card isDark={isDark}>
            <IconColorSelector
              label="Color"
              color={selectedColor || "#1976D2"}
              type="color"
              onPress={() => setShowColorPicker(true)}
            />
            <IconColorSelector
              label="Icon"
              icon={
                (selectedIcon || "💰") as React.ComponentProps<
                  typeof Feather
                >["name"]
              }
              color={selectedColor || "#1976D2"}
              type="icon"
              onPress={() => setShowIconPicker(true)}
            />
          </Card>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Typography
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            Settings
          </Typography>
          <Card isDark={isDark}>
            <Controller
              control={control}
              name="isActive"
              render={({ field: { onChange, value } }) => (
                <SettingRow
                  label="Category is active"
                  value={value ?? true}
                  onValueChange={onChange}
                />
              )}
            />
          </Card>
        </View>

        {/* Subcategories Section */}
        <SubcategoryManager
          subcategories={watchedSubcategories}
          onSubcategoriesChange={(newSubcategories) =>
            setValue("subcategories", newSubcategories)
          }
        />
      </ScrollView>

      <View style={[styles.footer, isDark && styles.footerDark]}>
        <Button
          onPress={handleSubmit(handleFormSubmit)}
          loading={isLoading}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? "Updating..." : submitButtonText || "Update Category"}
        </Button>
      </View>

      {/* Color Picker Modal */}
      <ColorPicker
        visible={showColorPicker}
        selectedColor={selectedColor || "#1976D2"}
        onColorSelect={handleColorSelect}
        onClose={() => setShowColorPicker(false)}
      />

      {/* Icon Picker Modal */}
      <IconPicker
        visible={showIconPicker}
        selectedIcon={selectedIcon || "💰"}
        selectedColor={selectedColor || "#1976D2"}
        onIconSelect={handleIconSelect}
        onClose={() => setShowIconPicker(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: "#FFF",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerDark: {
    backgroundColor: "#1C1C1E",
    borderTopColor: "#2C2C2E",
  },
});

export default CategoryForm;
