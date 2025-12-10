import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/context/ThemeContext";
import IconColorSelector from "./IconColorSelector";
import SettingRow from "./SettingRow";
import { Button } from "@/shared/components/ui/Button";
import { Typography } from "@/shared/components/ui/Typography";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ColorPicker from "@/shared/components/ui/pickers/ColorPicker";
import IconPicker from "@/shared/components/ui/pickers/IconPicker";
import {
  CreateAccountDto,
  CreateAccountSchema,
  UpdateAccountDto,
  UpdateAccountSchema,
} from "@/schemas/account.schema";
import { Account } from "@/shared/types/account.types";

interface AccountFormProps {
  mode: "create" | "edit";
  initialData?: Account;
  onSubmit: (data: CreateAccountDto | UpdateAccountDto) => Promise<void>;
  isLoading: boolean;
  submitButtonText?: string;
}

const AccountForm: React.FC<AccountFormProps> = ({
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
  const createForm = useForm<CreateAccountDto>({
    resolver: zodResolver(CreateAccountSchema as any),
    defaultValues: {
      accountName: "",
      accountNumber: "",
      openingBalance: 0,
      currency: "KSh",
      description: "",
      icon: "credit-card",
      color: "#1976D2",
      isSystemAccount: false,
    },
  });

  // Edit mode form
  const editForm = useForm<UpdateAccountDto>({
    resolver: zodResolver(UpdateAccountSchema as any),
    defaultValues: {
      accountName: initialData?.accountName || "",
      accountNumber: initialData?.accountNumber || "",
      icon: initialData?.icon || "credit-card",
      color: initialData?.color || "#1976D2",
      openingBalance: initialData?.openingBalance
        ? Number(initialData.openingBalance)
        : 0,
      balance: initialData?.balance ? Number(initialData.balance) : 0,
      currency: initialData?.currency || "KSh",
      description: initialData?.description || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (mode === "edit" && initialData) {
      editForm.reset({
        accountName: initialData.accountName || "",
        accountNumber: initialData.accountNumber || "",
        icon: initialData.icon || "credit-card",
        color: initialData.color || "#1976D2",
        openingBalance: initialData.openingBalance
          ? Number(initialData.openingBalance)
          : 0,
        balance: initialData.balance ? Number(initialData.balance) : 0,
        currency: initialData.currency || "KSh",
        description: initialData.description || "",
        isActive: initialData.isActive ?? true,
      });
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

    // Watch form values for UI updates
    const selectedIcon = watch("icon");
    const selectedColor = watch("color");

    const handleColorSelect = (color: string) => {
      setValue("color", color);
      setShowColorPicker(false);
    };

    const handleIconSelect = (icon: string) => {
      setValue("icon", icon);
      setShowIconPicker(false);
    };

    const handleFormSubmit = async (data: CreateAccountDto) => {
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
              name="accountName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Account Name"
                  placeholder="e.g., Savings, M-Pesa"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.accountName?.message}
                  isDark={isDark}
                />
              )}
            />

            <Controller
              control={control}
              name="accountNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Account Number"
                  placeholder="e.g., 0712345678, 01213 1231 12321312"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.accountNumber?.message}
                  isDark={isDark}
                />
              )}
            />

            <Controller
              control={control}
              name="openingBalance"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Opening Balance"
                  placeholder="Enter initial account balance"
                  value={value?.toString() || ""}
                  keyboardType="decimal-pad"
                  onChangeText={(text) => {
                    const numericValue = text === "" ? 0 : parseFloat(text);
                    onChange(isNaN(numericValue) ? 0 : numericValue);
                  }}
                  onBlur={onBlur}
                  error={errors.openingBalance?.message}
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
                  numberOfLines={4}
                  onBlur={onBlur}
                  error={errors.description?.message}
                  isDark={isDark}
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
                  (selectedIcon || "credit-card") as React.ComponentProps<
                    typeof Feather
                  >["name"]
                }
                color={selectedColor || "#1976D2"}
                type="icon"
                onPress={() => setShowIconPicker(true)}
              />
            </Card>
          </View>
        </ScrollView>

        <View style={[styles.footer, isDark && styles.footerDark]}>
          <Button
            onPress={handleSubmit(handleFormSubmit)}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? "Submitting..." : submitButtonText || "Save Account"}
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
          selectedIcon={selectedIcon || "credit-card"}
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

  const handleColorSelect = (color: string) => {
    setValue("color", color);
    setShowColorPicker(false);
  };

  const handleIconSelect = (icon: string) => {
    setValue("icon", icon);
    setShowIconPicker(false);
  };

  const handleFormSubmit = async (data: UpdateAccountDto) => {
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
            name="accountName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Account Name"
                placeholder="e.g., Savings, M-Pesa"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.accountName?.message}
                isDark={isDark}
              />
            )}
          />

          <Controller
            control={control}
            name="accountNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Account Number"
                placeholder="e.g., 0712345678, 01213 1231 12321312"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.accountNumber?.message}
                isDark={isDark}
              />
            )}
          />

          <View>
            <Controller
              control={control}
              name="openingBalance"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Opening Balance"
                  placeholder="Enter initial account balance"
                  value={value?.toString() || ""}
                  keyboardType="decimal-pad"
                  onChangeText={(text) => {
                    const numericValue = text === "" ? 0 : parseFloat(text);
                    onChange(isNaN(numericValue) ? 0 : numericValue);
                  }}
                  onBlur={onBlur}
                  error={errors.openingBalance?.message}
                  isDark={isDark}
                />
              )}
            />
            <Typography
              variant="caption"
              style={[styles.warningText, isDark && styles.warningTextDark]}
            >
              ⚠️ Changing opening balance will recalculate all historical
              balances
            </Typography>
          </View>

          <Controller
            control={control}
            name="balance"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Current Balance (Read-only)"
                placeholder="Auto-calculated from opening balance + transactions"
                value={value?.toString() || ""}
                keyboardType="decimal-pad"
                editable={false}
                onBlur={onBlur}
                error={errors.balance?.message}
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
                numberOfLines={4}
                onBlur={onBlur}
                error={errors.description?.message}
                isDark={isDark}
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
                (selectedIcon || "credit-card") as React.ComponentProps<
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
                  label="Account is active"
                  value={value ?? true}
                  onValueChange={onChange}
                />
              )}
            />
          </Card>
        </View>
      </ScrollView>

      <View style={[styles.footer, isDark && styles.footerDark]}>
        <Button
          onPress={handleSubmit(handleFormSubmit)}
          loading={isLoading}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? "Submitting..." : submitButtonText || "Update Account"}
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
        selectedIcon={selectedIcon || "credit-card"}
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
  warningText: {
    fontSize: 12,
    color: "#F59E0B",
    marginTop: 4,
    marginBottom: 8,
  },
  warningTextDark: {
    color: "#FCD34D",
  },
});

export default AccountForm;
