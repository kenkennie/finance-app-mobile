import React, { useState } from "react";
import { View, StyleSheet, useColorScheme } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { Typography } from "@/shared/components/ui/Typography";
import DatePicker from "@/shared/components/ui/pickers/DatePicker";
import { useGoalStore } from "@/store/goalStore";
import { AddContributionData } from "@/shared/types/goal.types";
import { AddContributionSchema } from "@/schemas/goal.schema";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useToastStore } from "@/store/toastStore";

interface AddContributionModalProps {
  visible: boolean;
  onClose: () => void;
  goalId: string;
  goalName: string;
}

export default function AddContributionModal({
  visible,
  onClose,
  goalId,
  goalName,
}: AddContributionModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { showSuccess, showError } = useToastStore();
  const { addContribution, isLoading } = useGoalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddContributionData>({
    resolver: zodResolver(AddContributionSchema as any),
    defaultValues: {
      amount: 0,
      description: "",
      date: new Date(),
    },
  });

  const handleFormSubmit = async (data: AddContributionData) => {
    setIsSubmitting(true);
    try {
      // Convert date to ISO string if present
      const processedData = {
        ...data,
        date: data.date,
      };

      await addContribution(goalId, processedData);
      showSuccess("Contribution added successfully");
      reset();
      onClose();
    } catch (error: any) {
      showError(error.message || "Failed to add contribution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={`Add Contribution to ${goalName}`}
      isDark={isDark}
    >
      <View style={styles.container}>
        <Typography
          variant="body2"
          style={[
            styles.description,
            ...(isDark ? [styles.descriptionDark] : []),
          ]}
        >
          Add money towards your goal. This will update your progress and help
          you reach your target faster.
        </Typography>

        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Contribution Amount"
              placeholder="0.00"
              value={value.toString()}
              onChangeText={(text) => {
                const amount = parseFloat(text) || 0;
                onChange(amount);
              }}
              onBlur={onBlur}
              error={errors.amount?.message}
              keyboardType="numeric"
              leftIcon="dollar"
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
              placeholder="e.g. Monthly savings, Bonus payment"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.description?.message}
              multiline
              numberOfLines={2}
              isDark={isDark}
            />
          )}
        />

        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, onBlur, value } }) => (
            <DatePicker
              label="Contribution Date"
              value={value || new Date()}
              onChange={onChange}
              error={errors.date?.message}
            />
          )}
        />

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting || isLoading}
            style={styles.submitButton}
          >
            {isSubmitting ? "Adding..." : "Add Contribution"}
          </Button>

          <Button
            onPress={handleClose}
            variant="outline"
            disabled={isSubmitting}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    paddingBottom: spacing.md,
  },
  description: {
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  descriptionDark: {
    color: "#9CA3AF",
  },
  buttonContainer: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  submitButton: {
    marginBottom: spacing.sm,
  },
  cancelButton: {
    marginBottom: spacing.sm,
  },
});
