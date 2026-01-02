import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useLocalSearchParams } from "expo-router";

import { Header } from "@/shared/components/ui/Header";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { Typography } from "@/shared/components/ui/Typography";
import DatePicker from "@/shared/components/ui/pickers/DatePicker";
import SearchableDropdown from "@/shared/components/ui/SearchableDropdown";
import SettingRow from "../Accounts/SettingRow";
import { useGoalStore } from "@/store/goalStore";
import { CreateGoalData, UpdateGoalData } from "@/shared/types/goal.types";
import { CreateGoalSchema, UpdateGoalSchema } from "@/schemas/goal.schema";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useToastStore } from "@/store/toastStore";

interface GoalFormProps {
  mode: "create" | "edit";
}

export default function GoalForm({ mode }: GoalFormProps) {
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { showSuccess, showError } = useToastStore();

  const { createGoal, updateGoal, getGoalById, isLoading } = useGoalStore();

  const [isLoadingGoal, setIsLoadingGoal] = useState(mode === "edit");

  // Create mode form
  const createForm = useForm<CreateGoalData>({
    resolver: zodResolver(CreateGoalSchema as any),
    defaultValues: {
      name: "",
      description: "",
      targetAmount: 0,
      targetDate: undefined,
      priority: "MEDIUM",
      isRecurring: false,
      recurringPeriodId: undefined,
    },
  });

  // Edit mode form
  const editForm = useForm<UpdateGoalData>({
    resolver: zodResolver(UpdateGoalSchema as any),
    defaultValues: {
      name: "",
      description: "",
      targetAmount: 0,
      targetDate: undefined,
      priority: "MEDIUM",
      isRecurring: false,
      recurringPeriodId: undefined,
    },
  });

  useEffect(() => {
    if (mode === "edit" && goalId) {
      loadGoal();
    }
  }, [goalId, mode]);

  const loadGoal = async () => {
    if (!goalId) return;

    try {
      setIsLoadingGoal(true);
      const goal = await getGoalById(goalId);

      if (goal) {
        editForm.reset({
          name: goal.name,
          description: goal.description || "",
          targetAmount: goal.targetAmount,
          targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
          priority: goal.priority,
          isRecurring: goal.isRecurring,
          recurringPeriodId: goal.recurringPeriodId || undefined,
        });
      }
    } catch (error) {
      console.error("Failed to load goal:", error);
      showError("Failed to load goal data");
      router.back();
    } finally {
      setIsLoadingGoal(false);
    }
  };

  const handleFormSubmit = async (data: CreateGoalData | UpdateGoalData) => {
    try {
      // Convert date to ISO string if present
      const processedData = {
        ...data,
        targetDate: data.targetDate,
        recurringPeriodId:
          data.recurringPeriodId === "" ? undefined : data.recurringPeriodId,
      };

      if (mode === "create") {
        const goal = await createGoal(processedData as CreateGoalData);
        showSuccess("Goal created successfully");
        setTimeout(() => {
          router.replace(`/screens/Goals/${goal.id}` as any);
        }, 100);
      } else if (mode === "edit" && goalId) {
        await updateGoal(goalId, processedData as UpdateGoalData);
        showSuccess("Goal updated successfully");
        setTimeout(() => {
          router.replace(`/screens/Goals/${goalId}` as any);
        }, 100);
      }
    } catch (error: any) {
      showError(error.message || `Failed to ${mode} goal`);
    }
  };

  const priorityOptions = [
    { id: "LOW", label: "Low Priority" },
    { id: "MEDIUM", label: "Medium Priority" },
    { id: "HIGH", label: "High Priority" },
  ];

  const periodOptions = [
    { id: "", label: "None" },
    { id: "1", label: "Weekly" },
    { id: "2", label: "Monthly" },
    { id: "3", label: "Quarterly" },
    { id: "4", label: "Yearly" },
  ];

  if (isLoadingGoal) {
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
          Loading goal...
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
      setValue,
    } = createForm;

    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Header
          title="Add Goal"
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
                label="Goal Name"
                placeholder="e.g. Emergency Fund, Vacation Savings"
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
                placeholder="Describe your goal..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
                numberOfLines={3}
                isDark={isDark}
              />
            )}
          />

          <Controller
            control={control}
            name="targetAmount"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Target Amount"
                placeholder="0.00"
                value={value.toString()}
                onChangeText={(text) => {
                  const amount = parseFloat(text) || 0;
                  onChange(amount);
                }}
                onBlur={onBlur}
                error={errors.targetAmount?.message}
                keyboardType="numeric"
                leftIcon="dollar"
                isDark={isDark}
              />
            )}
          />

          <Controller
            control={control}
            name="priority"
            render={({ field: { onChange, value } }) => (
              <SearchableDropdown
                label="Priority"
                options={priorityOptions}
                value={value}
                onSelect={onChange}
                placeholder="Select priority"
                error={errors.priority?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="targetDate"
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={value}
                onChange={onChange}
                label="Target Date (Optional)"
                error={errors.targetDate?.message}
                showTime={false}
              />
            )}
          />

          <Card
            isDark={isDark}
            style={styles.settingsCard}
          >
            <Controller
              control={control}
              name="isRecurring"
              render={({ field: { onChange, value } }) => (
                <SettingRow
                  label="Recurring Goal"
                  description="Set this goal as recurring to track ongoing savings"
                  value={value || false}
                  onValueChange={onChange}
                />
              )}
            />

            {watch("isRecurring") && (
              <Controller
                control={control}
                name="recurringPeriodId"
                render={({ field: { onChange, value } }) => (
                  <SearchableDropdown
                    label="Recurring Period"
                    options={periodOptions}
                    value={value || ""}
                    onSelect={(selectedValue) =>
                      onChange(selectedValue === "" ? undefined : selectedValue)
                    }
                    placeholder="Select recurring period"
                    error={errors.recurringPeriodId?.message}
                  />
                )}
              />
            )}
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
              ) : (
                "Create Goal"
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
      setValue,
    } = editForm;

    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Header
          title="Edit Goal"
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
                label="Goal Name"
                placeholder="e.g. Emergency Fund, Vacation Savings"
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
                placeholder="Describe your goal..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
                numberOfLines={3}
                isDark={isDark}
              />
            )}
          />

          <Controller
            control={control}
            name="targetAmount"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Target Amount"
                placeholder="0.00"
                value={value?.toString() || ""}
                onChangeText={(text) => {
                  const amount = parseFloat(text) || 0;
                  onChange(amount);
                }}
                onBlur={onBlur}
                error={errors.targetAmount?.message}
                keyboardType="numeric"
                leftIcon="dollar"
                isDark={isDark}
              />
            )}
          />

          <Controller
            control={control}
            name="priority"
            render={({ field: { onChange, value } }) => (
              <SearchableDropdown
                label="Priority"
                options={priorityOptions}
                value={value}
                onSelect={onChange}
                placeholder="Select priority"
                error={errors.priority?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="targetDate"
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={value}
                onChange={onChange}
                label="Target Date (Optional)"
                error={errors.targetDate?.message}
                showTime={false}
              />
            )}
          />

          <Card
            isDark={isDark}
            style={styles.settingsCard}
          >
            <Controller
              control={control}
              name="isRecurring"
              render={({ field: { onChange, value } }) => (
                <SettingRow
                  label="Recurring Goal"
                  description="Set this goal as recurring to track ongoing savings"
                  value={value || false}
                  onValueChange={onChange}
                />
              )}
            />

            {watch("isRecurring") && (
              <Controller
                control={control}
                name="recurringPeriodId"
                render={({ field: { onChange, value } }) => (
                  <SearchableDropdown
                    label="Recurring Period"
                    options={periodOptions}
                    value={value || ""}
                    onSelect={(selectedValue) =>
                      onChange(selectedValue === "" ? undefined : selectedValue)
                    }
                    placeholder="Select recurring period"
                    error={errors.recurringPeriodId?.message}
                  />
                )}
              />
            )}
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
              ) : (
                "Update Goal"
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
  settingsCard: {
    marginTop: spacing.lg,
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
});
