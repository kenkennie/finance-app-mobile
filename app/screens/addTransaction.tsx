import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
} from "react-native";

import { IconButton } from "@/shared/components/ui/IconButton";
import { Typography } from "@/shared/components/ui/Typography";
import { colors } from "@/theme/colors";
import { borderRadius, shadows, spacing, typography } from "@/theme/spacing";

interface FormData {
  type: "expense" | "income";
  amount: string;
  description: string;
  category: string;
  categoryIcon: string;
  account: string;
  date: string;
  notes: string;
  tags: string[];
  isRecurring: boolean;
  frequency?: "daily" | "weekly" | "monthly" | "yearly";
}

const categories = [
  { id: "1", name: "Groceries", icon: "🛒", type: "expense" },
  { id: "2", name: "Food & Dining", icon: "🍽️", type: "expense" },
  { id: "3", name: "Shopping", icon: "🛍️", type: "expense" },
  { id: "4", name: "Transportation", icon: "🚗", type: "expense" },
  { id: "5", name: "Bills & Utilities", icon: "💡", type: "expense" },
  { id: "6", name: "Entertainment", icon: "🎬", type: "expense" },
  { id: "7", name: "Healthcare", icon: "⚕️", type: "expense" },
  { id: "8", name: "Salary", icon: "💰", type: "income" },
  { id: "9", name: "Freelance", icon: "💼", type: "income" },
  { id: "10", name: "Investment", icon: "📈", type: "income" },
];

const accounts = [
  { id: "1", name: "Chase Checking", balance: 5420.5 },
  { id: "2", name: "Chase Sapphire", balance: 2150.0 },
  { id: "3", name: "Savings Account", balance: 15000.0 },
  { id: "4", name: "Cash", balance: 250.0 },
];

export default function AddTransactionScreen() {
  const [formData, setFormData] = useState<FormData>({
    type: "expense",
    amount: "",
    description: "",
    category: "",
    categoryIcon: "",
    account: "Chase Checking",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    tags: [],
    isRecurring: false,
  });

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const handleTypeChange = (type: "expense" | "income") => {
    setFormData({ ...formData, type, category: "", categoryIcon: "" });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const isFormValid = () => {
    return (
      formData.amount.length > 0 &&
      parseFloat(formData.amount) > 0 &&
      formData.description.trim().length > 0 &&
      formData.category.length > 0
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.text.white}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton onPress={() => {}}>
            <Typography variant="h4">←</Typography>
          </IconButton>
          <Typography
            variant="h3"
            weight="bold"
            style={styles.headerTitle}
          >
            New Transaction
          </Typography>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Form */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type Selector */}
        <View style={styles.section}>
          <Typography
            variant="body2"
            weight="semibold"
            color={colors.gray[600]}
            style={styles.label}
          >
            Transaction Type
          </Typography>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                formData.type === "expense" && styles.typeOptionActive,
              ]}
              onPress={() => handleTypeChange("expense")}
            >
              <Typography
                variant="h4"
                style={styles.typeIcon}
              >
                📤
              </Typography>
              <Typography
                variant="body1"
                weight="semibold"
                color={
                  formData.type === "expense"
                    ? colors.text.white
                    : colors.gray[700]
                }
              >
                Expense
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeOption,
                formData.type === "income" && styles.typeOptionActive,
              ]}
              onPress={() => handleTypeChange("income")}
            >
              <Typography
                variant="h4"
                style={styles.typeIcon}
              >
                📥
              </Typography>
              <Typography
                variant="body1"
                weight="semibold"
                color={
                  formData.type === "income"
                    ? colors.text.white
                    : colors.gray[700]
                }
              >
                Income
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Typography
            variant="body2"
            weight="semibold"
            color={colors.gray[600]}
            style={styles.label}
          >
            Amount *
          </Typography>
          <View style={styles.inputContainer}>
            <View style={styles.currencySymbol}>
              <Typography
                variant="h3"
                weight="semibold"
                color={colors.gray[500]}
              >
                $
              </Typography>
            </View>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.gray[300]}
              keyboardType="decimal-pad"
              value={formData.amount}
              onChangeText={(text) =>
                setFormData({ ...formData, amount: text })
              }
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Typography
            variant="body2"
            weight="semibold"
            color={colors.gray[600]}
            style={styles.label}
          >
            Description *
          </Typography>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="What was this for?"
              placeholderTextColor={colors.gray[400]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Typography
            variant="body2"
            weight="semibold"
            color={colors.gray[600]}
            style={styles.label}
          >
            Category *
          </Typography>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCategoryPicker(true)}
          >
            {formData.category ? (
              <View style={styles.pickerSelected}>
                <Typography variant="h4">{formData.categoryIcon}</Typography>
                <Typography
                  variant="body1"
                  weight="medium"
                >
                  {formData.category}
                </Typography>
              </View>
            ) : (
              <Typography
                variant="body1"
                color={colors.gray[400]}
              >
                Select category
              </Typography>
            )}
            <Typography
              variant="body1"
              color={colors.gray[400]}
            >
              ›
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Typography
            variant="body2"
            weight="semibold"
            color={colors.gray[600]}
            style={styles.label}
          >
            Account
          </Typography>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowAccountPicker(true)}
          >
            <Typography
              variant="body1"
              weight="medium"
            >
              {formData.account}
            </Typography>
            <Typography
              variant="body1"
              color={colors.gray[400]}
            >
              ›
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Typography
            variant="body2"
            weight="semibold"
            color={colors.gray[600]}
            style={styles.label}
          >
            Date
          </Typography>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <Typography variant="body1">📅</Typography>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.gray[400]}
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
            />
          </View>
        </View>

        {/* Recurring Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Typography
                variant="body1"
                weight="semibold"
              >
                Recurring Transaction
              </Typography>
              <Typography
                variant="caption"
                color={colors.gray[500]}
              >
                Set up automatic future transactions
              </Typography>
            </View>
            <Switch
              value={formData.isRecurring}
              onValueChange={(value) =>
                setFormData({ ...formData, isRecurring: value })
              }
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={colors.text.white}
            />
          </View>

          {formData.isRecurring && (
            <View style={styles.frequencySelector}>
              {["daily", "weekly", "monthly", "yearly"].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyOption,
                    formData.frequency === freq && styles.frequencyOptionActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, frequency: freq as any })
                  }
                >
                  <Typography
                    variant="body2"
                    weight="medium"
                    color={
                      formData.frequency === freq
                        ? colors.text.white
                        : colors.gray[700]
                    }
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Typography
            variant="body2"
            weight="semibold"
            color={colors.gray[600]}
            style={styles.label}
          >
            Tags (Optional)
          </Typography>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <Typography variant="body1">#</Typography>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Add a tag"
              placeholderTextColor={colors.gray[400]}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
              returnKeyType="done"
            />
            {tagInput.length > 0 && (
              <TouchableOpacity
                onPress={handleAddTag}
                style={styles.addTagButton}
              >
                <Typography
                  variant="body2"
                  weight="semibold"
                  color={colors.primary}
                >
                  Add
                </Typography>
              </TouchableOpacity>
            )}
          </View>
          {formData.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {formData.tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tag}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Typography
                    variant="caption"
                    color={colors.gray[700]}
                  >
                    #{tag}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={colors.gray[500]}
                  >
                    {" "}
                    ✕
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Typography
            variant="body2"
            weight="semibold"
            color={colors.gray[600]}
            style={styles.label}
          >
            Notes (Optional)
          </Typography>
          <View style={[styles.inputWrapper, styles.notesWrapper]}>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              placeholder="Add additional notes..."
              placeholderTextColor={colors.gray[400]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !isFormValid() && styles.saveButtonDisabled,
          ]}
          disabled={!isFormValid()}
          activeOpacity={0.8}
        >
          <Typography
            variant="body1"
            weight="bold"
            color={colors.text.white}
          >
            Save Transaction
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography
                variant="h4"
                weight="bold"
              >
                Select Category
              </Typography>
              <IconButton onPress={() => setShowCategoryPicker(false)}>
                <Typography variant="h4">✕</Typography>
              </IconButton>
            </View>
            <ScrollView style={styles.modalScroll}>
              {categories
                .filter((cat) => cat.type === formData.type)
                .map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryOption}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        category: category.name,
                        categoryIcon: category.icon,
                      });
                      setShowCategoryPicker(false);
                    }}
                  >
                    <View style={styles.categoryOptionLeft}>
                      <View style={styles.categoryOptionIcon}>
                        <Typography variant="h4">{category.icon}</Typography>
                      </View>
                      <Typography
                        variant="body1"
                        weight="medium"
                      >
                        {category.name}
                      </Typography>
                    </View>
                    {formData.category === category.name && (
                      <Typography
                        variant="body1"
                        color={colors.primary}
                      >
                        ✓
                      </Typography>
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Account Picker Modal */}
      <Modal
        visible={showAccountPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAccountPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography
                variant="h4"
                weight="bold"
              >
                Select Account
              </Typography>
              <IconButton onPress={() => setShowAccountPicker(false)}>
                <Typography variant="h4">✕</Typography>
              </IconButton>
            </View>
            <ScrollView style={styles.modalScroll}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={styles.accountOption}
                  onPress={() => {
                    setFormData({ ...formData, account: account.name });
                    setShowAccountPicker(false);
                  }}
                >
                  <View style={styles.accountOptionInfo}>
                    <Typography
                      variant="body1"
                      weight="medium"
                    >
                      {account.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={colors.gray[500]}
                    >
                      {formatCurrency(account.balance)}
                    </Typography>
                  </View>
                  {formData.account === account.name && (
                    <Typography
                      variant="body1"
                      color={colors.primary}
                    >
                      ✓
                    </Typography>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.text.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
  },
  typeSelector: {
    flexDirection: "row",
    gap: spacing.md,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.base,
    backgroundColor: colors.text.white,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  typeOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeIcon: {
    marginTop: -2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.text.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  currencySymbol: {
    paddingLeft: spacing.base,
    paddingRight: spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    paddingVertical: spacing.base,
    paddingRight: spacing.base,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.text.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.primary,
    paddingVertical: spacing.md,
  },
  notesWrapper: {
    alignItems: "flex-start",
    minHeight: 100,
  },
  notesInput: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.text.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    ...shadows.sm,
  },
  pickerSelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.text.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    ...shadows.sm,
  },
  toggleLabel: {
    flex: 1,
    marginRight: spacing.base,
  },
  frequencySelector: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
  },
  frequencyOptionActive: {
    backgroundColor: colors.primary,
  },
  addTagButton: {
    paddingLeft: spacing.md,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomBar: {
    backgroundColor: colors.text.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.base,
    ...shadows.lg,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.text.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalScroll: {
    maxHeight: 400,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  categoryOptionIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accountOptionInfo: {
    flex: 1,
  },
});
