import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/context/ThemeContext";
import { Typography } from "../Typography";
import { Button } from "../Button";
import DatePicker from "../pickers/DatePicker";
import { useCategoryStore } from "@/store/categoryStore";
import { useAccountStore } from "@/store/accountStore";
import { Checkbox } from "../Checkbox";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SimpleFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  initialFilters?: any;
}

const DATE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "thisWeek", label: "This Week" },
  { key: "lastWeek", label: "Last Week" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "custom", label: "Custom Date Range" },
];

const STATUS_OPTIONS = [
  { key: "PENDING", label: "Pending" },
  { key: "CLEARED", label: "Cleared" },
  { key: "RECONCILED", label: "Reconciled" },
];

const SimpleFilterBottomSheet: React.FC<SimpleFilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}) => {
  const { isDark } = useTheme();
  const { categories, getCategories } = useCategoryStore();
  const { accounts, getAccounts } = useAccountStore();

  const [selectedDatePreset, setSelectedDatePreset] = useState<string | null>(
    initialFilters.datePreset || null
  );
  const [startDate, setStartDate] = useState<Date | null>(
    initialFilters.startDate || null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialFilters.endDate || null
  );
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    initialFilters.statuses || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters.categories || []
  );
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
    initialFilters.accounts || []
  );
  const [categorySearch, setCategorySearch] = useState("");
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set()
  );
  const [accountSearch, setAccountSearch] = useState("");

  useEffect(() => {
    if (visible) {
      if (categories.length === 0) {
        getCategories();
      }
      if (accounts.length === 0) {
        getAccounts();
      }
    }
  }, [visible, categories.length, accounts.length, getCategories, getAccounts]);

  // Process categories into hierarchical tree structure
  const categoryTree = React.useMemo(() => {
    // Remove duplicates by ID
    const uniqueCategories = categories.filter(
      (cat, index, arr) => arr.findIndex((c) => c.id === cat.id) === index
    );

    const categoryMap = new Map(uniqueCategories.map((cat) => [cat.id, cat]));

    // Group categories by parent
    const parents: any[] = [];
    const childrenByParent = new Map<string, any[]>();

    uniqueCategories.forEach((category) => {
      if (!category.parentId) {
        // This is a parent category
        parents.push({
          ...category,
          level: 0,
          hasChildren: false,
          children: [],
        });
      } else {
        // This is a child category
        const parentId = category.parentId;
        if (!childrenByParent.has(parentId)) {
          childrenByParent.set(parentId, []);
        }
        childrenByParent.get(parentId)!.push({
          ...category,
          level: 1,
          parentName: categoryMap.get(parentId)?.name,
        });
      }
    });

    // Attach children to parents and sort
    parents.forEach((parent) => {
      const children = childrenByParent.get(parent.id) || [];
      parent.hasChildren = children.length > 0;
      parent.children = children.sort((a, b) => a.name.localeCompare(b.name));
    });

    // Sort parents alphabetically
    return parents.sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!categorySearch.trim()) return categoryTree;

    const search = categorySearch.toLowerCase();
    return categoryTree
      .map((parent) => {
        // Check if parent matches
        const parentMatches = parent.name.toLowerCase().includes(search);

        // Filter children that match
        const matchingChildren = parent.children.filter(
          (child: any) =>
            child.name.toLowerCase().includes(search) ||
            (child.parentName &&
              child.parentName.toLowerCase().includes(search))
        );

        // Include parent if it matches or has matching children
        if (parentMatches || matchingChildren.length > 0) {
          return {
            ...parent,
            children: parentMatches ? parent.children : matchingChildren,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [categoryTree, categorySearch]);

  // Filter accounts based on search
  const filteredAccounts = React.useMemo(() => {
    if (!accountSearch.trim()) return accounts;
    const search = accountSearch.toLowerCase();
    return accounts.filter((acc) =>
      acc.accountName.toLowerCase().includes(search)
    );
  }, [accounts, accountSearch]);

  const handleDatePresetSelect = (preset: string) => {
    setSelectedDatePreset(preset);
    if (preset !== "custom") {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  const toggleParentExpansion = (parentId: string) => {
    setExpandedParents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  const handleApply = () => {
    const filters: any = {};

    if (selectedDatePreset) {
      filters.datePreset = selectedDatePreset;
      if (selectedDatePreset === "custom") {
        filters.startDate = startDate;
        filters.endDate = endDate;
      }
    }

    if (selectedStatuses.length > 0) {
      filters.statuses = selectedStatuses;
    }

    if (selectedCategories.length > 0) {
      filters.categories = selectedCategories;
    }

    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setSelectedDatePreset(null);
    setStartDate(null);
    setEndDate(null);
    setSelectedStatuses([]);
    setSelectedCategories([]);
    setSelectedAccounts([]);
    setCategorySearch("");
    setAccountSearch("");
    setExpandedParents(new Set());
  };

  const getDateRangeFromPreset = (preset: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case "today":
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        };
      case "yesterday":
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday,
          end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
        };
      case "thisWeek":
        // Start of week (Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        // End of week (Saturday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { start: startOfWeek, end: endOfWeek };
      case "lastWeek":
        // Start of last week (Sunday of previous week)
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        // End of last week (Saturday of previous week)
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        endOfLastWeek.setHours(23, 59, 59, 999);
        return { start: startOfLastWeek, end: endOfLastWeek };
      case "thisMonth":
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        return { start: firstDayOfMonth, end: lastDayOfMonth };
      case "lastMonth":
        const firstDayOfLastMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const lastDayOfLastMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999
        );
        return { start: firstDayOfLastMonth, end: lastDayOfLastMonth };
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalContent, isDark && styles.modalContentDark]}
          >
            {/* Handle Bar */}
            <View style={[styles.handleBar, isDark && styles.handleBarDark]} />

            {/* Header */}
            <View style={[styles.header, isDark && styles.headerDark]}>
              <Typography
                variant="h3"
                style={[styles.title, isDark && styles.titleDark]}
              >
                Filter Transactions
              </Typography>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
              >
                <Feather
                  name="x"
                  size={24}
                  color={isDark ? "#FFF" : "#000"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Date Filters */}
              <View style={styles.section}>
                <Typography
                  variant="body1"
                  weight="semibold"
                  style={[
                    styles.sectionTitle,
                    isDark && styles.sectionTitleDark,
                  ]}
                >
                  Date Range
                </Typography>
                <View style={styles.datePresets}>
                  {DATE_PRESETS.map((preset) => (
                    <TouchableOpacity
                      key={preset.key}
                      style={[
                        styles.presetButton,
                        selectedDatePreset === preset.key &&
                          styles.presetButtonSelected,
                        isDark && styles.presetButtonDark,
                        selectedDatePreset === preset.key &&
                          isDark &&
                          styles.presetButtonSelectedDark,
                      ]}
                      onPress={() => handleDatePresetSelect(preset.key)}
                    >
                      <Typography
                        variant="body2"
                        style={[
                          styles.presetText,
                          selectedDatePreset === preset.key &&
                            styles.presetTextSelected,
                          isDark && styles.presetTextDark,
                        ]}
                      >
                        {preset.label}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>

                {selectedDatePreset === "custom" && (
                  <View style={styles.customDateContainer}>
                    <DatePicker
                      value={startDate || ""}
                      onChange={setStartDate}
                      label="Start Date"
                    />
                    <DatePicker
                      value={endDate || ""}
                      onChange={setEndDate}
                      label="End Date"
                    />
                  </View>
                )}
              </View>

              {/* Status Filters */}
              <View style={styles.section}>
                <Typography
                  variant="body1"
                  weight="semibold"
                  style={[
                    styles.sectionTitle,
                    isDark && styles.sectionTitleDark,
                  ]}
                >
                  Status
                </Typography>
                <View style={styles.statusOptions}>
                  {STATUS_OPTIONS.map((status) => (
                    <TouchableOpacity
                      key={status.key}
                      style={styles.statusOption}
                      onPress={() => handleStatusToggle(status.key)}
                    >
                      <Checkbox
                        checked={selectedStatuses.includes(status.key)}
                        onPress={() => handleStatusToggle(status.key)}
                      />
                      <Typography
                        variant="body2"
                        style={[
                          styles.statusLabel,
                          isDark && styles.statusLabelDark,
                        ]}
                      >
                        {status.label}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category Filters */}
              <View style={styles.section}>
                <Typography
                  variant="body1"
                  weight="semibold"
                  style={[
                    styles.sectionTitle,
                    isDark && styles.sectionTitleDark,
                  ]}
                >
                  Categories
                </Typography>
                <View
                  style={[
                    styles.searchContainer,
                    isDark && styles.searchContainerDark,
                  ]}
                >
                  <Feather
                    name="search"
                    size={16}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={[
                      styles.searchInput,
                      isDark && styles.searchInputDark,
                    ]}
                    placeholder="Search categories..."
                    placeholderTextColor={isDark ? "#666" : "#9CA3AF"}
                    value={categorySearch}
                    onChangeText={setCategorySearch}
                  />
                </View>
                <ScrollView
                  style={styles.optionsScroll}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.categoryTree}>
                    {filteredCategories.map((parent) => (
                      <View key={parent.id}>
                        {/* Parent Category */}
                        <TouchableOpacity
                          style={[
                            styles.categoryItem,
                            isDark && styles.categoryItemDark,
                          ]}
                          onPress={() => {
                            if (parent.hasChildren) {
                              toggleParentExpansion(parent.id);
                            } else {
                              handleCategoryToggle(parent.id);
                            }
                          }}
                        >
                          <View style={styles.categoryLeft}>
                            <Checkbox
                              checked={selectedCategories.includes(parent.id)}
                              onPress={() => handleCategoryToggle(parent.id)}
                            />
                            <Feather
                              name={(parent.icon || "folder") as any}
                              size={18}
                              color={parent.color || "#3B82F6"}
                            />
                            <Typography
                              variant="body1"
                              weight="medium"
                              style={[
                                styles.categoryLabel,
                                isDark && styles.categoryLabelDark,
                              ]}
                            >
                              {parent.name}
                            </Typography>
                            {parent.hasChildren && (
                              <Feather
                                name={
                                  expandedParents.has(parent.id)
                                    ? "chevron-down"
                                    : "chevron-right"
                                }
                                size={16}
                                color={isDark ? "#9CA3AF" : "#6B7280"}
                                style={styles.expandIcon}
                              />
                            )}
                          </View>
                        </TouchableOpacity>

                        {/* Child Categories */}
                        {parent.hasChildren &&
                          (expandedParents.has(parent.id) ||
                            !!categorySearch.trim()) && (
                            <View style={styles.childrenContainer}>
                              {parent.children.map((child: any) => (
                                <TouchableOpacity
                                  key={child.id}
                                  style={[
                                    styles.categoryItem,
                                    styles.childItem,
                                    isDark && styles.categoryItemDark,
                                  ]}
                                  onPress={() => handleCategoryToggle(child.id)}
                                >
                                  <View
                                    style={[
                                      styles.categoryLeft,
                                      styles.childLeft,
                                    ]}
                                  >
                                    <Checkbox
                                      checked={selectedCategories.includes(
                                        child.id
                                      )}
                                      onPress={() =>
                                        handleCategoryToggle(child.id)
                                      }
                                    />
                                    <Feather
                                      name={(child.icon || "circle") as any}
                                      size={16}
                                      color={child.color || "#3B82F6"}
                                    />
                                    <Typography
                                      variant="body2"
                                      style={[
                                        styles.categoryLabel,
                                        styles.childLabel,
                                        isDark && styles.categoryLabelDark,
                                        isDark && styles.childLabelDark,
                                      ]}
                                    >
                                      {child.name}
                                    </Typography>
                                  </View>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Account Filters */}
              <View style={styles.section}>
                <Typography
                  variant="body1"
                  weight="semibold"
                  style={[
                    styles.sectionTitle,
                    isDark && styles.sectionTitleDark,
                  ]}
                >
                  Accounts
                </Typography>
                <View
                  style={[
                    styles.searchContainer,
                    isDark && styles.searchContainerDark,
                  ]}
                >
                  <Feather
                    name="search"
                    size={16}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={[
                      styles.searchInput,
                      isDark && styles.searchInputDark,
                    ]}
                    placeholder="Search accounts..."
                    placeholderTextColor={isDark ? "#666" : "#9CA3AF"}
                    value={accountSearch}
                    onChangeText={setAccountSearch}
                  />
                </View>
                <ScrollView
                  style={styles.optionsScroll}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.accountOptions}>
                    {filteredAccounts.slice(0, 15).map((account) => (
                      <TouchableOpacity
                        key={account.id}
                        style={styles.accountOption}
                        onPress={() => handleAccountToggle(account.id)}
                      >
                        <Checkbox
                          checked={selectedAccounts.includes(account.id)}
                          onPress={() => handleAccountToggle(account.id)}
                        />
                        <View style={styles.accountInfo}>
                          <View
                            style={[
                              styles.accountIcon,
                              {
                                backgroundColor:
                                  (account.color || "#3B82F6") + "20",
                              },
                            ]}
                          >
                            <Feather
                              name={(account.icon as any) || "credit-card"}
                              size={16}
                              color={account.color || "#3B82F6"}
                            />
                          </View>
                          <View style={styles.accountTextContainer}>
                            <Typography
                              variant="body2"
                              style={[
                                styles.accountLabel,
                                isDark && styles.accountLabelDark,
                              ]}
                            >
                              {account.accountName}
                            </Typography>
                            <Typography
                              variant="caption"
                              style={[
                                styles.accountBalance,
                                isDark && styles.accountBalanceDark,
                              ]}
                            >
                              {account.currency} {account.balance || "0.00"}
                            </Typography>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, isDark && styles.footerDark]}>
              <Button
                onPress={handleClear}
                variant="outline"
                style={styles.clearButton}
              >
                Clear All
              </Button>
              <Button
                onPress={handleApply}
                style={styles.applyButton}
              >
                Apply Filters
              </Button>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.8,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  modalContentDark: {
    backgroundColor: "#1C1C1E",
  },
  handleBar: {
    width: 36,
    height: 5,
    backgroundColor: "#D1D5DB",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  handleBarDark: {
    backgroundColor: "#4B5563",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerDark: {
    borderBottomColor: "#374151",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  titleDark: {
    color: "#FFF",
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: "#D1D5DB",
  },
  datePresets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  presetButtonSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  presetButtonDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  presetButtonSelectedDark: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  presetText: {
    fontSize: 14,
    color: "#6B7280",
  },
  presetTextSelected: {
    color: "#FFF",
  },
  presetTextDark: {
    color: "#9CA3AF",
  },
  customDateContainer: {
    marginTop: 16,
  },
  statusOptions: {
    gap: 12,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: "#374151",
  },
  statusLabelDark: {
    color: "#D1D5DB",
  },
  categoryTree: {
    gap: 4,
  },
  childrenContainer: {
    marginLeft: 20,
  },
  expandIcon: {
    marginLeft: "auto",
  },
  childItem: {
    paddingLeft: 16,
  },
  childLeft: {
    gap: 10,
  },
  childLabel: {
    color: "#6B7280",
  },
  childLabelDark: {
    color: "#9CA3AF",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  categoryItemDark: {
    borderBottomColor: "#374151",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  categoryLabel: {
    fontSize: 14,
    color: "#374151",
  },
  categoryLabelDark: {
    color: "#D1D5DB",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchContainerDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  searchInputDark: {
    color: "#FFF",
    backgroundColor: "#374151",
  },
  optionsScroll: {
    maxHeight: 200,
  },
  accountOptions: {
    gap: 12,
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  accountIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  accountTextContainer: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 14,
    color: "#374151",
  },
  accountLabelDark: {
    color: "#D1D5DB",
  },
  accountBalance: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  accountBalanceDark: {
    color: "#9CA3AF",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerDark: {
    borderTopColor: "#374151",
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});

export default SimpleFilterBottomSheet;
