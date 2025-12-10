import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { Typography } from "@/shared/components/ui/Typography";
import { useTheme } from "@/theme/context/ThemeContext";
import { useRouter } from "expo-router";
import TransactionTypeSelector from "@/shared/components/ui/TransactionTypeSelector";
import DatePicker from "@/shared/components/ui/pickers/DatePicker";
import {
  SearchableDropdown,
  QuickAddCategoryModal,
  QuickAddAccountModal,
} from "@/shared/components/ui";
import { useCategoryStore } from "@/store/categoryStore";
import { useAccountStore } from "@/store/accountStore";
import {
  CreateTransactionSchema,
  UpdateTransactionSchema,
  CreateTransactionDto,
  UpdateTransactionDto,
} from "@/schemas/transaction.schema";
import { Transaction } from "@/shared/types/filter.types";
import { formatNumber } from "@/shared/utils/formatUtils";

interface TransactionFormProps {
  mode: "create" | "edit";
  initialData?: Transaction;
  onSubmit: (
    data: CreateTransactionDto | UpdateTransactionDto
  ) => Promise<void>;
  isLoading: boolean;
  submitButtonText?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  mode,
  initialData,
  onSubmit,
  isLoading,
  submitButtonText,
}) => {
  const { isDark } = useTheme();
  const router = useRouter();
  const { categories, getCategories } = useCategoryStore();
  const { accounts, getAccounts } = useAccountStore();

  // State to store removed items when switching transaction types
  const [removedItems, setRemovedItems] = useState<any[]>([]);

  // State for account balances
  const [accountBalances, setAccountBalances] = useState<
    Record<string, number>
  >({});
  const [balanceLoading, setBalanceLoading] = useState<Record<string, boolean>>(
    {}
  );

  // State for quick add category modal
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);

  // State for quick add account modal
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [currentAccountItemIndex, setCurrentAccountItemIndex] = useState<
    number | null
  >(null);

  // Create mode form
  const createForm = useForm<CreateTransactionDto>({
    resolver: zodResolver(CreateTransactionSchema as any),
    mode: "onBlur",
    defaultValues: {
      title: "",
      date: new Date(),
      notes: "",
      items: [
        {
          categoryId: "",
          accountId: "",
          amount: 0,
          description: "",
        },
      ],
    },
  });

  // Edit mode form
  const editForm = useForm<UpdateTransactionDto>({
    resolver: zodResolver(UpdateTransactionSchema as any),
    mode: "onBlur",
    defaultValues: {
      title: initialData?.title || "",
      transactionType: initialData?.transactionType || "EXPENSE",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      notes: initialData?.notes || "",
      items:
        initialData?.TransactionItems?.map((item) => ({
          categoryId: item.categoryId,
          accountId: item.accountId,
          amount: item.amount,
          description: item.description,
        })) || [],
    },
  });

  // Field arrays for items
  const createItemsArray = useFieldArray({
    control: createForm.control,
    name: "items",
  });

  const editItemsArray = useFieldArray({
    control: editForm.control,
    name: "items",
  });

  // Get current items array based on mode
  const currentItemsArray =
    mode === "create" ? createItemsArray : editItemsArray;
  const { fields, append, remove } = currentItemsArray;

  // Handle transaction type changes - preserve/restore items
  const selectedTransactionType =
    mode === "create"
      ? createForm.watch("transactionType")
      : editForm.watch("transactionType");

  useEffect(() => {
    if (selectedTransactionType === "INCOME" && fields.length > 1) {
      // Store the extra items
      const extraItems = fields.slice(1);
      setRemovedItems(extraItems);

      // Remove all items except the first
      for (let i = fields.length - 1; i > 0; i--) {
        remove(i);
      }
    } else if (
      selectedTransactionType === "EXPENSE" &&
      removedItems.length > 0
    ) {
      // Restore the removed items
      removedItems.forEach((item) => {
        append(item);
      });
      setRemovedItems([]);
    }
  }, [selectedTransactionType, fields, remove, append, removedItems]);

  // Load categories and accounts on mount
  useEffect(() => {
    getCategories();
    getAccounts();
  }, []);

  // Fetch account balances for existing transaction items when editing
  useEffect(() => {
    if (mode === "edit" && initialData?.TransactionItems) {
      initialData.TransactionItems.forEach((item) => {
        if (item.accountId) {
          fetchAccountBalance(item.accountId);
        }
      });
    }
  }, [mode, initialData]);

  // Function to fetch account balance
  const fetchAccountBalance = async (accountId: string) => {
    if (!accountId || balanceLoading[accountId]) return;

    try {
      setBalanceLoading((prev) => ({ ...prev, [accountId]: true }));

      // Find account from existing accounts list first
      const account = accounts.find((acc) => acc.id === accountId);
      if (account) {
        setAccountBalances((prev) => ({
          ...prev,
          [accountId]: account.balance || 0,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch account balance:", error);
    } finally {
      setBalanceLoading((prev) => ({ ...prev, [accountId]: false }));
    }
  };

  // Function to calculate effective available balance for an account considering current transaction items
  const getEffectiveBalance = (
    accountId: string,
    currentItemIndex?: number
  ): number => {
    const staticBalance = accountBalances[accountId] || 0;

    // For expense transactions, subtract amounts of completed items using the same account
    if (selectedTransactionType === "EXPENSE") {
      const currentItems =
        mode === "create" ? createForm.watch("items") : editForm.watch("items");
      const completedItemsAmount = (currentItems || [])
        .filter(
          (item, index) =>
            item.accountId === accountId &&
            (currentItemIndex === undefined || index < currentItemIndex)
        )
        .reduce((sum, item) => sum + (item.amount || 0), 0);

      return staticBalance - completedItemsAmount;
    }

    return staticBalance;
  };

  // Function to check if account has sufficient balance for expense
  const hasSufficientBalance = (
    accountId: string,
    amount: number,
    currentItemIndex?: number
  ): boolean => {
    const effectiveBalance = getEffectiveBalance(accountId, currentItemIndex);
    return effectiveBalance >= amount;
  };

  // Function to get balance display text
  const getBalanceText = (accountId: string, currentItemIndex?: number) => {
    const balance = accountBalances[accountId];
    if (balance === undefined) return null;

    const effectiveBalance = getEffectiveBalance(accountId, currentItemIndex);
    const account = accounts.find((acc) => acc.id === accountId);
    const currency = account?.currency;
    return `${currency}${effectiveBalance}`;
  };

  // Handler for when a new category is created
  const handleCategoryCreated = (categoryId: string) => {
    // The category is already added to the store by the modal
    // We just need to refresh categories to get the latest list
    getCategories();

    // Auto-select the newly created category for the current item
    if (currentItemIndex !== null) {
      if (mode === "create") {
        createForm.setValue(`items.${currentItemIndex}.categoryId`, categoryId);
      } else {
        editForm.setValue(`items.${currentItemIndex}.categoryId`, categoryId);
      }
      setCurrentItemIndex(null);
    }
  };

  // Handler for when a new account is created
  const handleAccountCreated = (accountId: string) => {
    // The account is already added to the store by the modal
    // We just need to refresh accounts to get the latest list
    getAccounts();

    // Auto-select the newly created account for the current item
    if (currentAccountItemIndex !== null) {
      if (mode === "create") {
        createForm.setValue(
          `items.${currentAccountItemIndex}.accountId`,
          accountId
        );
      } else {
        editForm.setValue(
          `items.${currentAccountItemIndex}.accountId`,
          accountId
        );
      }
      setCurrentAccountItemIndex(null);
    }
  };

  // Reset edit form when initialData changes
  useEffect(() => {
    if (mode === "edit" && initialData) {
      editForm.reset({
        title: initialData.title || "",
        transactionType: initialData.transactionType || "EXPENSE",
        date: initialData.date ? new Date(initialData.date) : new Date(),
        notes: initialData.notes || "",
        items:
          initialData.TransactionItems?.map((item) => ({
            categoryId: item.categoryId,
            accountId: item.accountId,
            amount: Number(item.amount) || 0,
            description: item.description,
          })) || [],
      });
    }
  }, [initialData, editForm, mode]);

  const handleFormSubmit = async (
    data: CreateTransactionDto | UpdateTransactionDto
  ) => {
    // Validate balance for expense transactions
    if (data.transactionType === "EXPENSE" && data.items) {
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        if (item.accountId && item.amount) {
          if (!hasSufficientBalance(item.accountId, item.amount, i)) {
            const account = accounts.find((acc) => acc.id === item.accountId);
            const balanceText = getBalanceText(item.accountId, i);
            throw new Error(
              `Insufficient funds in ${
                account?.accountName || "selected account"
              }. Available: ${balanceText}`
            );
          }
        }
      }
    }

    await onSubmit(data);
  };

  if (mode === "create") {
    const {
      control,
      handleSubmit,
      formState: { errors },
      watch,
    } = createForm;

    const selectedTransactionType = watch("transactionType");

    // Filter categories based on transaction type
    const filteredCategories = categories.filter(
      (cat) => cat.transactionType === selectedTransactionType
    );

    const addButton =
      selectedTransactionType === "EXPENSE" ? (
        <TouchableOpacity
          style={[styles.addButton, isDark && styles.addButtonDark]}
          onPress={() =>
            append({
              categoryId: "",
              accountId: "",
              amount: 0,
              description: "",
            })
          }
        >
          <Feather
            name="plus"
            size={16}
            color={isDark ? "#D1D5DB" : "#374151"}
          />
          <Typography
            style={[styles.addButtonText, isDark && styles.addButtonTextDark]}
          >
            Add Item
          </Typography>
        </TouchableOpacity>
      ) : null;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.keyboardAvoid, isDark && styles.keyboardAvoidDark]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <ScrollView
          style={[styles.content, isDark && styles.contentDark]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.section}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Title"
                  placeholder="e.g. Freelance Payment, Dinner with Friends"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                  isDark={isDark}
                />
              )}
            />
          </View>

          {/* Transaction Type Selector */}
          <View style={styles.section}>
            <Controller
              control={control}
              name="transactionType"
              render={({ field: { onChange, value } }) => (
                <TransactionTypeSelector
                  value={value}
                  onChange={onChange}
                  error={errors.transactionType?.message}
                />
              )}
            />
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  value={value}
                  onChange={onChange}
                  label="Date"
                  error={errors.date?.message}
                />
              )}
            />
          </View>

          {/* Transaction Items */}
          <View style={styles.section}>
            <Typography
              style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
            >
              {selectedTransactionType === "INCOME"
                ? "Income Details"
                : "Expense Items"}
            </Typography>

            <Card
              style={styles.itemsCard}
              isDark={isDark}
            >
              {fields.map((field, index) => (
                <View
                  key={field.id}
                  style={[
                    styles.itemContainer,
                    isDark && styles.itemContainerDark,
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <Typography
                      style={[styles.itemTitle, isDark && styles.itemTitleDark]}
                    >
                      Item {index + 1}
                    </Typography>
                    {selectedTransactionType === "EXPENSE" &&
                      fields.length > 1 && (
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
                      )}
                  </View>

                  <Controller
                    control={control}
                    name={`items.${index}.categoryId`}
                    render={({ field: { onChange, value } }) => (
                      <SearchableDropdown
                        options={filteredCategories.map((category) => ({
                          id: category.id,
                          label: category.name,
                          icon: category.icon,
                          color: category.color,
                        }))}
                        value={value}
                        onSelect={onChange}
                        placeholder="Select category"
                        label="Category"
                        error={errors.items?.[index]?.categoryId?.message}
                        addNewLabel="+ Add New Category"
                        onAddNew={() => {
                          setCurrentItemIndex(index);
                          setShowAddCategoryModal(true);
                        }}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={`items.${index}.accountId`}
                    render={({ field: { onChange, value } }) => (
                      <View>
                        <SearchableDropdown
                          options={accounts.map((account) => ({
                            id: account.id,
                            label: account.accountName,
                            subtitle: account.accountNumber,
                            icon: account.icon,
                            color: account.color,
                          }))}
                          value={value}
                          onSelect={(accountId) => {
                            onChange(accountId);
                            // Fetch balance when account is selected
                            if (accountId) {
                              fetchAccountBalance(accountId);
                            }
                          }}
                          placeholder="Select account"
                          label="Account"
                          error={errors.items?.[index]?.accountId?.message}
                          addNewLabel="+ Add New Account"
                          onAddNew={() => {
                            setCurrentAccountItemIndex(index);
                            setShowAddAccountModal(true);
                          }}
                        />
                        {/* Show account balance for expense transactions */}
                        {selectedTransactionType === "EXPENSE" &&
                          value &&
                          getBalanceText(value) && (
                            <View style={styles.balanceContainer}>
                              <Typography
                                style={[
                                  styles.balanceText,
                                  isDark && styles.balanceTextDark,
                                ]}
                              >
                                Available Balance:{" "}
                                {getBalanceText(value, index)}
                              </Typography>
                            </View>
                          )}
                      </View>
                    )}
                  />

                  <Controller
                    control={control}
                    name={`items.${index}.amount`}
                    render={({ field: { onChange, onBlur, value } }) => {
                      const accountId = watch(`items.${index}.accountId`);
                      const hasInsufficientFunds =
                        selectedTransactionType === "EXPENSE" &&
                        accountId &&
                        value &&
                        !hasSufficientBalance(accountId, value, index);

                      return (
                        <View>
                          <Input
                            label="Amount"
                            placeholder="0.00"
                            value={value?.toString() || ""}
                            onChangeText={(text) => {
                              const numValue = parseFloat(
                                text.replace(/[^0-9.]/g, "")
                              );
                              onChange(isNaN(numValue) ? 0 : numValue);
                            }}
                            onBlur={onBlur}
                            keyboardType="numeric"
                            error={errors.items?.[index]?.amount?.message}
                            isDark={isDark}
                          />
                          {/* Insufficient funds warning */}
                          {hasInsufficientFunds && (
                            <View style={styles.insufficientFundsContainer}>
                              <Typography
                                style={[
                                  styles.insufficientFundsText,
                                  isDark && styles.insufficientFundsTextDark,
                                ]}
                              >
                                ⚠️ Insufficient funds. Available:{" "}
                                {getBalanceText(accountId, index)}
                              </Typography>
                            </View>
                          )}
                        </View>
                      );
                    }}
                  />

                  <Controller
                    control={control}
                    name={`items.${index}.description`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Description (Optional)"
                        placeholder="Item description"
                        value={value || ""}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.items?.[index]?.description?.message}
                        isDark={isDark}
                      />
                    )}
                  />
                </View>
              ))}

              {addButton}
            </Card>

            {/* Total Amount */}
            {fields.length > 0 && (
              <View style={styles.totalContainer}>
                <View style={styles.totalRow}>
                  <Typography
                    style={[styles.totalLabel, isDark && styles.totalLabelDark]}
                  >
                    Total Amount:
                  </Typography>
                  <Typography
                    style={[
                      styles.totalAmount,
                      isDark && styles.totalAmountDark,
                    ]}
                  >
                    {formatNumber(
                      fields.reduce((sum, field, index) => {
                        const amount = watch(`items.${index}.amount`) || 0;
                        return sum + (typeof amount === "number" ? amount : 0);
                      }, 0)
                    )}{" "}
                    {fields[0] && watch(`items.0.accountId`)
                      ? accounts.find(
                          (acc) => acc.id === watch(`items.0.accountId`)
                        )?.currency
                      : ""}
                  </Typography>
                </View>
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Notes (Optional)"
                  placeholder="Additional notes"
                  value={value || ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  style={{ minHeight: 120 }}
                  error={errors.notes?.message}
                  isDark={isDark}
                />
              )}
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, isDark && styles.footerDark]}>
          <Button
            onPress={handleSubmit(handleFormSubmit)}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            {isLoading
              ? "Creating..."
              : submitButtonText || "Create Transaction"}
          </Button>
        </View>

        {/* Quick Add Category Modal */}
        <QuickAddCategoryModal
          visible={showAddCategoryModal}
          onClose={() => {
            setShowAddCategoryModal(false);
            setCurrentItemIndex(null);
          }}
          transactionType={selectedTransactionType || "EXPENSE"}
          onCategoryCreated={handleCategoryCreated}
        />

        {/* Quick Add Account Modal */}
        <QuickAddAccountModal
          visible={showAddAccountModal}
          onClose={() => {
            setShowAddAccountModal(false);
            setCurrentAccountItemIndex(null);
          }}
          onAccountCreated={handleAccountCreated}
        />
      </KeyboardAvoidingView>
    );
  }

  // Edit mode
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = editForm;

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(
    (cat) => cat.transactionType === selectedTransactionType
  );

  // Debug: Check for duplicate category IDs in options
  const categoryOptions = filteredCategories.map((category) => ({
    id: category.id,
    label: category.name,
    icon: category.icon,
    color: category.color,
  }));
  const ids = categoryOptions.map((opt) => opt.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    console.log("Duplicate category IDs found:", duplicates);
    console.log("Category options:", categoryOptions);
    console.log("Filtered categories:", filteredCategories);
  }

  // Filter categories based on transaction type (for edit mode)
  const editFilteredCategories = categories.filter(
    (cat) => cat.transactionType === selectedTransactionType
  );

  const addButton =
    selectedTransactionType === "EXPENSE" ? (
      <TouchableOpacity
        style={[styles.addButton, isDark && styles.addButtonDark]}
        onPress={() =>
          append({
            categoryId: "",
            accountId: "",
            amount: 0,
            description: "",
          })
        }
      >
        <Feather
          name="plus"
          size={16}
          color={isDark ? "#D1D5DB" : "#374151"}
        />
        <Typography
          style={[styles.addButtonText, isDark && styles.addButtonTextDark]}
        >
          Add Item
        </Typography>
      </TouchableOpacity>
    ) : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.keyboardAvoid, isDark && styles.keyboardAvoidDark]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        style={[styles.content, isDark && styles.contentDark]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Title"
                placeholder="e.g. Grocery Shopping"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
                isDark={isDark}
              />
            )}
          />
        </View>

        {/* Transaction Type Selector */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="transactionType"
            render={({ field: { onChange, value } }) => (
              <TransactionTypeSelector
                value={value}
                onChange={onChange}
                error={errors.transactionType?.message}
              />
            )}
          />
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={value ?? new Date()}
                onChange={onChange}
                label="Date"
                error={errors.date?.message}
              />
            )}
          />
        </View>

        {/* Transaction Items */}
        <View style={styles.section}>
          <Typography
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            {selectedTransactionType === "INCOME"
              ? "Income Details"
              : "Transaction Items"}
          </Typography>

          <Card
            style={styles.itemsCard}
            isDark={isDark}
          >
            {fields.map((field, index) => (
              <View
                key={field.id}
                style={[
                  styles.itemContainer,
                  isDark && styles.itemContainerDark,
                ]}
              >
                <View style={styles.itemHeader}>
                  <Typography
                    style={[styles.itemTitle, isDark && styles.itemTitleDark]}
                  >
                    Item {index + 1}
                  </Typography>
                  {selectedTransactionType === "EXPENSE" &&
                    fields.length > 1 && (
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
                    )}
                </View>

                <Controller
                  control={control}
                  name={`items.${index}.categoryId`}
                  render={({ field: { onChange, value } }) => (
                    <SearchableDropdown
                      options={filteredCategories.map((category) => ({
                        id: category.id,
                        label: category.name,
                        icon: category.icon,
                        color: category.color,
                      }))}
                      value={value}
                      onSelect={onChange}
                      placeholder="Select category"
                      label="Category"
                      error={errors.items?.[index]?.categoryId?.message}
                      addNewLabel="+ Add New Category"
                      onAddNew={() => {
                        setCurrentItemIndex(index);
                        setShowAddCategoryModal(true);
                      }}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`items.${index}.accountId`}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <SearchableDropdown
                        options={accounts.map((account) => ({
                          id: account.id,
                          label: account.accountName,
                          subtitle: account.accountNumber,
                          icon: account.icon,
                          color: account.color,
                        }))}
                        value={value}
                        onSelect={(accountId) => {
                          onChange(accountId);
                          // Fetch balance when account is selected
                          if (accountId) {
                            fetchAccountBalance(accountId);
                          }
                        }}
                        placeholder="Select account"
                        label="Account"
                        error={errors.items?.[index]?.accountId?.message}
                        addNewLabel="+ Add New Account"
                        onAddNew={() => {
                          setCurrentAccountItemIndex(index);
                          setShowAddAccountModal(true);
                        }}
                      />
                      {/* Show account balance for expense transactions */}
                      {selectedTransactionType === "EXPENSE" &&
                        value &&
                        getBalanceText(value, index) && (
                          <View style={styles.balanceContainer}>
                            <Typography
                              style={[
                                styles.balanceText,
                                isDark && styles.balanceTextDark,
                              ]}
                            >
                              Available Balance: {getBalanceText(value, index)}
                            </Typography>
                          </View>
                        )}
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name={`items.${index}.amount`}
                  render={({ field: { onChange, onBlur, value } }) => {
                    const accountId = watch(`items.${index}.accountId`);
                    const hasInsufficientFunds =
                      selectedTransactionType === "EXPENSE" &&
                      accountId &&
                      value &&
                      !hasSufficientBalance(accountId, value, index);

                    return (
                      <View>
                        <Input
                          label="Amount"
                          placeholder="0.00"
                          value={value?.toString() || ""}
                          onChangeText={(text) => {
                            const numValue = parseFloat(
                              text.replace(/[^0-9.]/g, "")
                            );
                            onChange(isNaN(numValue) ? 0 : numValue);
                          }}
                          onBlur={onBlur}
                          keyboardType="numeric"
                          error={errors.items?.[index]?.amount?.message}
                          isDark={isDark}
                        />
                        {/* Insufficient funds warning */}
                        {hasInsufficientFunds && (
                          <View style={styles.insufficientFundsContainer}>
                            <Typography
                              style={[
                                styles.insufficientFundsText,
                                isDark && styles.insufficientFundsTextDark,
                              ]}
                            >
                              ⚠️ Insufficient funds. Available:{" "}
                              {getBalanceText(accountId, index)}
                            </Typography>
                          </View>
                        )}
                      </View>
                    );
                  }}
                />

                <Controller
                  control={control}
                  name={`items.${index}.description`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Description (Optional)"
                      placeholder="Item description"
                      value={value || ""}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.items?.[index]?.description?.message}
                      isDark={isDark}
                    />
                  )}
                />
              </View>
            ))}

            {addButton}
          </Card>

          {/* Total Amount */}
          {fields.length > 0 && (
            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Typography
                  style={[styles.totalLabel, isDark && styles.totalLabelDark]}
                >
                  Total Amount:
                </Typography>
                <Typography
                  style={[styles.totalAmount, isDark && styles.totalAmountDark]}
                >
                  {formatNumber(
                    fields.reduce((sum, field, index) => {
                      const amount = watch(`items.${index}.amount`) || 0;
                      return sum + (typeof amount === "number" ? amount : 0);
                    }, 0)
                  )}{" "}
                  {fields[0] && watch(`items.0.accountId`)
                    ? accounts.find(
                        (acc) => acc.id === watch(`items.0.accountId`)
                      )?.currency
                    : ""}
                </Typography>
              </View>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Notes (Optional)"
                placeholder="Additional notes"
                value={value || ""}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{ minHeight: 120 }}
                error={errors.notes?.message}
                isDark={isDark}
              />
            )}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, isDark && styles.footerDark]}>
        <Button
          onPress={handleSubmit(handleFormSubmit)}
          loading={isLoading}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? "Updating..." : submitButtonText || "Update Transaction"}
        </Button>
      </View>

      {/* Quick Add Category Modal */}
      <QuickAddCategoryModal
        visible={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setCurrentItemIndex(null);
        }}
        transactionType={selectedTransactionType || "EXPENSE"}
        onCategoryCreated={handleCategoryCreated}
      />

      {/* Quick Add Account Modal */}
      <QuickAddAccountModal
        visible={showAddAccountModal}
        onClose={() => {
          setShowAddAccountModal(false);
          setCurrentAccountItemIndex(null);
        }}
        onAccountCreated={handleAccountCreated}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  keyboardAvoidDark: {
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  contentDark: {
    backgroundColor: "#000",
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 120,
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 2,
  },
  pickerContainer: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  labelDark: {
    color: "#D1D5DB",
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryItem: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryItemSelected: {
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6",
  },
  categoryItemDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  categoryItemSelectedDark: {
    backgroundColor: "#1E3A8A",
    borderColor: "#3B82F6",
  },
  categoryText: {
    fontSize: 14,
    color: "#374151",
  },
  categoryTextSelected: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  accountScroll: {
    marginBottom: 8,
  },
  accountItem: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  accountItemSelected: {
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6",
  },
  accountItemDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  accountItemSelectedDark: {
    backgroundColor: "#1E3A8A",
    borderColor: "#3B82F6",
  },
  accountText: {
    fontSize: 14,
    color: "#374151",
  },
  accountTextSelected: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  accountContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
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
  splitToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  splitToggleLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  splitToggleLabelDark: {
    color: "#D1D5DB",
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
  splitInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  splitInfoDark: {
    color: "#9CA3AF",
  },
  splitItemContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  splitItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  splitItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  splitItemTitleDark: {
    color: "#FFF",
  },
  removeButton: {
    padding: 4,
  },
  addSplitButton: {
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
  addSplitButtonDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  addSplitButtonText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  addSplitButtonTextDark: {
    color: "#D1D5DB",
  },
  splitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  splitItemsCard: {
    marginHorizontal: 0,
  },
  splitDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    textAlign: "center",
  },
  splitDescriptionDark: {
    color: "#9CA3AF",
  },
  splitSummary: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  splitSummaryDark: {
    color: "#9CA3AF",
  },
  splitError: {
    color: "#EF4444",
  },
  splitEmptyState: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 16,
  },
  splitEmptyStateDark: {
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
  totalContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  totalLabelDark: {
    color: "#9CA3AF",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  totalAmountDark: {
    color: "#FFF",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  balanceContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F0F9FF",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#0EA5E9",
  },
  balanceText: {
    fontSize: 12,
    color: "#0C4A6E",
    fontWeight: "500",
  },
  balanceTextDark: {
    color: "#7DD3FC",
  },
  insufficientFundsContainer: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  insufficientFundsText: {
    fontSize: 12,
    color: "#991B1B",
    fontWeight: "500",
  },
  insufficientFundsTextDark: {
    color: "#FECACA",
  },
  // Read-only view styles
  readOnlyCard: {
    padding: 20,
    alignItems: "center",
  },
  readOnlyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  readOnlyTitleDark: {
    color: "#FFF",
  },
  readOnlyMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  readOnlyMessageDark: {
    color: "#9CA3AF",
  },
});

export default TransactionForm;
