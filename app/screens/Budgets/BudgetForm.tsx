import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";

import { Header } from "@/shared/components/ui/Header";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import SearchableDropdown from "@/shared/components/ui/SearchableDropdown";
import DateRangeSelector from "@/shared/components/ui/pickers/DateRangeSelector";
import { Typography } from "@/shared/components/ui/Typography";
import { budgetService } from "@/shared/services/budget/budgetService";
import { categoryService } from "@/shared/services/category/categoryService";
import {
  UpdateBudgetData,
  CreateBudgetData,
  Category,
} from "@/shared/types/budget.types";
import {
  CreateBudgetSchema,
  UpdateBudgetSchema,
} from "@/schemas/budget.schema";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import SettingRow from "../Accounts/SettingRow";
import { useToastStore } from "@/store/toastStore";

interface BudgetFormProps {
  mode: "create" | "edit";
  budgetId?: string;
}

export default function BudgetForm({ mode, budgetId }: BudgetFormProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { showSuccess, showError } = useToastStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingBudget, setIsLoadingBudget] = useState(mode === "edit");

  const [isLoading, setIsLoading] = useState(false);

  // Create mode form
  const createForm = useForm<CreateBudgetData>({
    resolver: zodResolver(CreateBudgetSchema as any),
    defaultValues: {
      name: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      recuringPeriodId: undefined,
      carryOverEnabled: false,
      categories: [{ categoryId: "", allocatedAmount: 0 }],
    },
  });

  // Edit mode form
  const editForm = useForm<UpdateBudgetData>({
    resolver: zodResolver(UpdateBudgetSchema as any),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      recuringPeriodId: undefined,
      carryOverEnabled: false,
      categories: [],
    },
  });

  // Field arrays for categories
  const createCategoriesArray = useFieldArray({
    control: createForm.control,
    name: "categories",
  });

  const editCategoriesArray = useFieldArray({
    control: editForm.control,
    name: "categories",
  });

  // Get current form and categories array based on mode
  const currentCategoriesArray =
    mode === "create" ? createCategoriesArray : editCategoriesArray;
  const { fields, append, remove, update } = currentCategoriesArray;

  useEffect(() => {
    loadCategories();
    if (mode === "edit" && budgetId) {
      loadBudget();
    }
  }, [budgetId, mode]);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const result = await categoryService.getCategories("EXPENSE", false);
      setCategories(result.data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
      showError("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadBudget = async () => {
    if (!budgetId) return;

    try {
      setIsLoadingBudget(true);
      const budget = await budgetService.getBudgetById(budgetId);

      editForm.reset({
        name: budget.name,
        startDate: budget.startDate.split("T")[0],
        endDate: budget.endDate ? budget.endDate.split("T")[0] : "",
        recuringPeriodId: budget.recuringPeriodId || undefined,
        carryOverEnabled: budget.carryOverEnabled,
        categories:
          budget.budgetCategories?.map((cat) => ({
            categoryId: cat.categoryId,
            allocatedAmount: cat.allocatedAmount,
          })) || [],
      });
    } catch (error) {
      console.error("Failed to load budget:", error);
      showError("Failed to load budget data");
      router.back();
    } finally {
      setIsLoadingBudget(false);
    }
  };

  const handleFormSubmit = async (
    data: CreateBudgetData | UpdateBudgetData
  ) => {
    setIsLoading(true);
    try {
      // Convert empty string to undefined for recuringPeriodId
      const processedData = {
        ...data,
        recuringPeriodId:
          data.recuringPeriodId === "" ? undefined : data.recuringPeriodId,
      };

      if (mode === "create") {
        const response = await budgetService.createBudget(
          processedData as CreateBudgetData
        );
        showSuccess(response.message);
        setTimeout(() => {
          router.replace("/(tabs)/budgets");
        }, 100);
      } else if (mode === "edit" && budgetId) {
        const response = await budgetService.updateBudget(
          budgetId,
          processedData as UpdateBudgetData
        );
        showSuccess(response.message);
        setTimeout(() => {
          router.replace(`/screens/Budgets/BudgetDetails?budgetId=${budgetId}`);
        }, 100);
      }
    } catch (error: any) {
      showError(error.message || `Failed to ${mode} budget`);
    } finally {
      setIsLoading(false);
    }
  };

  const availableCategories = categories.filter((cat) => {
    // Filter out categories that are already selected in the current form
    const currentCategories =
      mode === "create"
        ? createForm.watch("categories")
        : editForm.watch("categories");
    return !currentCategories?.find(
      (selected) => selected.categoryId === cat.id
    );
  });

  const categoryOptions = availableCategories.map((category) => ({
    id: category.id,
    label: category.name,
    subtitle: category.description,
    color: category.color,
    icon: category.icon,
  }));

  const periodOptions = [
    { id: "", label: "None" },
    { id: "1", label: "Weekly" },
    { id: "2", label: "Monthly" },
    { id: "3", label: "Quarterly" },
    { id: "4", label: "Yearly" },
  ];

  if (isLoadingCategories || isLoadingBudget) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContainer,
          isDark && styles.containerDark,
        ]}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? colors.text.white : colors.text.primary}
        />
        <Typography
          style={[styles.loadingText, isDark ? styles.loadingTextDark : {}]}
        >
          {isLoadingBudget ? "Loading budget..." : "Loading categories..."}
        </Typography>
      </View>
    );
  }

  if (mode === "create") {
    const {
      control,
      handleSubmit,
      formState: { errors },
      watch,
      clearErrors,
      setValue,
    } = createForm;

    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Header
          title="Add Budget"
          showBack
          onBackPress={() => router.back()}
          isDark={isDark}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Budget Name"
                placeholder="e.g. January Budget 2025, Monthly Groceries"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                isDark={isDark}
              />
            )}
          />

          <DateRangeSelector
            startDate={watch("startDate")}
            endDate={watch("endDate")}
            onStartDateChange={(date) => setValue("startDate", date)}
            onEndDateChange={(date) => setValue("endDate", date)}
            startError={errors.startDate?.message}
            endError={errors.endDate?.message}
          />

          <Controller
            control={control}
            name="recuringPeriodId"
            render={({ field: { onChange, value } }) => (
              <SearchableDropdown
                label="Recurring Period"
                options={periodOptions}
                value={value || ""}
                onSelect={(selectedValue) =>
                  onChange(selectedValue === "" ? undefined : selectedValue)
                }
                placeholder="Select recurring period"
              />
            )}
          />

          {/* Budget Items */}
          <View style={styles.section}>
            <Typography
              variant="h3"
              weight="semibold"
              style={[
                styles.sectionTitle,
                isDark ? styles.sectionTitleDark : {},
              ]}
            >
              Budget Items
            </Typography>

            <Card
              style={styles.itemsCard}
              isDark={isDark}
            >
              {fields.length === 0 && (
                <Typography
                  variant="body2"
                  style={[styles.hintText, isDark ? styles.hintTextDark : {}]}
                >
                  Add categories to allocate budget amounts
                </Typography>
              )}

              {/* Selected Categories */}
              {fields.map((item, index) => {
                const category = categories.find(
                  (cat) => cat.id === item.categoryId
                );
                return (
                  <View
                    key={index}
                    style={[
                      styles.itemContainer,
                      isDark && styles.itemContainerDark,
                    ]}
                  >
                    <View style={styles.itemHeader}>
                      <Typography
                        style={[
                          styles.itemTitle,
                          ...(isDark ? [styles.itemTitleDark] : []),
                        ]}
                      >
                        Item {index + 1}
                      </Typography>
                      <TouchableOpacity
                        onPress={() => remove(index)}
                        style={styles.removeButton}
                      >
                        <Feather
                          name="x"
                          size={16}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>

                    <SearchableDropdown
                      options={[
                        ...availableCategories.map((cat) => ({
                          id: cat.id,
                          label: cat.name,
                          subtitle: cat.description,
                          color: cat.color,
                          icon: cat.icon,
                        })),
                        ...(category
                          ? [
                              {
                                id: category.id,
                                label: category.name,
                                subtitle: category.description,
                                color: category.color,
                                icon: category.icon,
                              },
                            ]
                          : []),
                      ]}
                      value={item.categoryId}
                      onSelect={(newCategoryId) => {
                        update(index, { ...item, categoryId: newCategoryId });
                        clearErrors(`categories.${index}.categoryId`);
                      }}
                      placeholder="Select category"
                      label="Category"
                      error={errors.categories?.[index]?.categoryId?.message}
                    />

                    <View style={styles.amountInputs}>
                      <Input
                        label="Amount"
                        value={item.allocatedAmount.toString()}
                        onChangeText={(value) => {
                          const amount = parseFloat(value) || 0;
                          update(index, { ...item, allocatedAmount: amount });
                          clearErrors(`categories.${index}.allocatedAmount`);
                        }}
                        placeholder="0.00"
                        keyboardType="numeric"
                        leftIcon="dollar"
                        isDark={isDark}
                        error={
                          errors.categories?.[index]?.allocatedAmount?.message
                        }
                      />
                    </View>
                  </View>
                );
              })}

              {/* Add Category Button */}
              <TouchableOpacity
                style={[styles.addButton, isDark && styles.addButtonDark]}
                onPress={() => {
                  if (
                    fields.length > 0 &&
                    (!fields[fields.length - 1].categoryId ||
                      fields[fields.length - 1].allocatedAmount <= 0)
                  ) {
                    showError("Please fill the current category first");
                    return;
                  }
                  append({ categoryId: "", allocatedAmount: 0 });
                }}
              >
                <Feather
                  name="plus"
                  size={16}
                  color={isDark ? "#D1D5DB" : "#374151"}
                />
                <Typography
                  style={[
                    styles.addButtonText,
                    ...(isDark ? [styles.addButtonTextDark] : []),
                  ]}
                >
                  Add Category
                </Typography>
              </TouchableOpacity>
            </Card>

            {errors.categories &&
              typeof errors.categories === "object" &&
              "message" in errors.categories && (
                <Typography style={styles.errorText}>
                  {errors.categories.message}
                </Typography>
              )}
            {errors.categories &&
              Array.isArray(errors.categories) &&
              errors.categories.map(
                (error, index) =>
                  error && (
                    <Typography
                      key={index}
                      style={styles.errorText}
                    >
                      Item {index + 1}:{" "}
                      {error.categoryId?.message ||
                        error.allocatedAmount?.message ||
                        "Invalid category"}
                    </Typography>
                  )
              )}
          </View>

          <Card isDark={isDark}>
            <Controller
              control={control}
              name="carryOverEnabled"
              render={({ field: { onChange, value } }) => (
                <SettingRow
                  label="Enable Carry Over"
                  description="Automatically carry unused budget amounts to the next period"
                  value={value ?? true}
                  onValueChange={onChange}
                />
              )}
            />
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleSubmit(handleFormSubmit)}
              disabled={isLoading}
              style={styles.submitButton}
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.background}
                />
              ) : mode === "create" ? (
                "Create Budget"
              ) : (
                "Update Budget"
              )}
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  } else {
    const {
      control,
      handleSubmit,
      formState: { errors },
      watch,
      clearErrors,
      setValue,
    } = editForm;

    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Header
          title="Edit Budget"
          showBack
          onBackPress={() => router.back()}
          isDark={isDark}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Budget Name"
                placeholder="e.g. January Budget 2025, Monthly Groceries"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                isDark={isDark}
              />
            )}
          />

          <DateRangeSelector
            startDate={watch("startDate") || ""}
            endDate={watch("endDate") || ""}
            onStartDateChange={(date) => setValue("startDate", date)}
            onEndDateChange={(date) => setValue("endDate", date)}
            startError={errors.startDate?.message}
            endError={errors.endDate?.message}
          />

          <Controller
            control={control}
            name="recuringPeriodId"
            render={({ field: { onChange, value } }) => (
              <SearchableDropdown
                label="Recurring Period"
                options={periodOptions}
                value={value || ""}
                onSelect={(selectedValue) =>
                  onChange(selectedValue === "" ? undefined : selectedValue)
                }
                placeholder="Select recurring period"
              />
            )}
          />

          {/* Budget Items */}
          <View style={styles.section}>
            <Typography
              variant="h3"
              weight="semibold"
              style={[
                styles.sectionTitle,
                isDark ? styles.sectionTitleDark : {},
              ]}
            >
              Budget Items
            </Typography>

            <Card
              style={styles.itemsCard}
              isDark={isDark}
            >
              {fields.length === 0 && (
                <Typography
                  variant="body2"
                  style={[styles.hintText, isDark ? styles.hintTextDark : {}]}
                >
                  Add categories to allocate budget amounts
                </Typography>
              )}

              {/* Selected Categories */}
              {fields.map((item, index) => {
                const category = categories.find(
                  (cat) => cat.id === item.categoryId
                );
                return (
                  <View
                    key={index}
                    style={[
                      styles.itemContainer,
                      isDark && styles.itemContainerDark,
                    ]}
                  >
                    <View style={styles.itemHeader}>
                      <Typography
                        style={[
                          styles.itemTitle,
                          ...(isDark ? [styles.itemTitleDark] : []),
                        ]}
                      >
                        Item {index + 1}
                      </Typography>
                      <TouchableOpacity
                        onPress={() => remove(index)}
                        style={styles.removeButton}
                      >
                        <Feather
                          name="x"
                          size={16}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>

                    <SearchableDropdown
                      options={[
                        ...availableCategories.map((cat) => ({
                          id: cat.id,
                          label: cat.name,
                          subtitle: cat.description,
                          color: cat.color,
                          icon: cat.icon,
                        })),
                        ...(category
                          ? [
                              {
                                id: category.id,
                                label: category.name,
                                subtitle: category.description,
                                color: category.color,
                                icon: category.icon,
                              },
                            ]
                          : []),
                      ]}
                      value={item.categoryId}
                      onSelect={(newCategoryId) => {
                        update(index, { ...item, categoryId: newCategoryId });
                        clearErrors(`categories.${index}.categoryId`);
                      }}
                      placeholder="Select category"
                      label="Category"
                      error={errors.categories?.[index]?.categoryId?.message}
                    />

                    <View style={styles.amountInputs}>
                      <Input
                        label="Amount"
                        value={item.allocatedAmount.toString()}
                        onChangeText={(value) => {
                          const amount = parseFloat(value) || 0;
                          update(index, { ...item, allocatedAmount: amount });
                          clearErrors(`categories.${index}.allocatedAmount`);
                        }}
                        placeholder="0.00"
                        keyboardType="numeric"
                        leftIcon="dollar"
                        isDark={isDark}
                        error={
                          errors.categories?.[index]?.allocatedAmount?.message
                        }
                      />
                    </View>
                  </View>
                );
              })}

              {/* Add Category Button */}
              <TouchableOpacity
                style={[styles.addButton, isDark && styles.addButtonDark]}
                onPress={() => {
                  if (
                    fields.length > 0 &&
                    (!fields[fields.length - 1].categoryId ||
                      fields[fields.length - 1].allocatedAmount <= 0)
                  ) {
                    showError("Please fill the current category first");
                    return;
                  }
                  append({ categoryId: "", allocatedAmount: 0 });
                }}
              >
                <Feather
                  name="plus"
                  size={16}
                  color={isDark ? "#D1D5DB" : "#374151"}
                />
                <Typography
                  style={[
                    styles.addButtonText,
                    ...(isDark ? [styles.addButtonTextDark] : []),
                  ]}
                >
                  Add Category
                </Typography>
              </TouchableOpacity>
            </Card>

            {errors.categories &&
              typeof errors.categories === "object" &&
              "message" in errors.categories && (
                <Typography style={styles.errorText}>
                  {errors.categories.message}
                </Typography>
              )}
            {errors.categories &&
              Array.isArray(errors.categories) &&
              errors.categories.map(
                (error, index) =>
                  error && (
                    <Typography
                      key={index}
                      style={styles.errorText}
                    >
                      Item {index + 1}:{" "}
                      {error.categoryId?.message ||
                        error.allocatedAmount?.message ||
                        "Invalid category"}
                    </Typography>
                  )
              )}
          </View>

          <Card isDark={isDark}>
            <Controller
              control={control}
              name="carryOverEnabled"
              render={({ field: { onChange, value } }) => (
                <SettingRow
                  label="Enable Carry Over"
                  description="Automatically carry unused budget amounts to the next period"
                  value={value ?? true}
                  onValueChange={onChange}
                />
              )}
            />
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleSubmit(handleFormSubmit)}
              disabled={isLoading}
              style={styles.submitButton}
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.background}
                />
              ) : mode === "create" ? (
                "Create Budget"
              ) : (
                "Update Budget"
              )}
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  containerDark: {
    backgroundColor: "#000",
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionTitleDark: {
    color: colors.text.white,
  },
  hintText: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  hintTextDark: {
    color: colors.text.white,
  },
  categoryItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  categoryName: {
    color: colors.text.primary,
    flex: 1,
  },
  categoryNameDark: {
    color: colors.text.white,
  },
  removeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  removeText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: "500",
  },
  amountInputs: {
    gap: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  submitButton: {
    marginBottom: spacing.xl,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  loadingTextDark: {
    color: "#9CA3AF",
  },
  itemsCard: {
    marginHorizontal: 0,
  },
  itemContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  itemContainerDark: {
    backgroundColor: "#1d1e20ff",
    borderColor: "#292b2fff",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  itemTitleDark: {
    color: "#FFF",
  },
  categoryDisplay: {
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addButtonDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  addButtonText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  addButtonTextDark: {
    color: "#D1D5DB",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
});
