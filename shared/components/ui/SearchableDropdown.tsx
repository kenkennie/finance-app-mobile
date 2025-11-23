import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/context/ThemeContext";

interface DropdownOption {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  subtitle?: string;
  fontWeight?:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  style?: ViewStyle;
  addNewLabel?: string;
  onAddNew?: () => void;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onSelect,
  placeholder = "Select an option",
  label,
  error,
  disabled = false,
  style,
  addNewLabel,
  onAddNew,
}) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredOptions, setFilteredOptions] =
    useState<DropdownOption[]>(options);

  const selectedOption = options.find((option) => option.id === value);

  useEffect(() => {
    let filtered = options;
    if (searchText.trim() !== "") {
      filtered = options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchText.toLowerCase()) ||
          (option.subtitle &&
            option.subtitle.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Add "Add New" option if provided
    if (addNewLabel && onAddNew) {
      filtered = [
        ...filtered,
        {
          id: "__add_new__",
          label: addNewLabel,
          icon: "plus",
          color: "#10B981",
        },
      ];
    }

    setFilteredOptions(filtered);
  }, [searchText, options, addNewLabel, onAddNew]);

  const handleSelect = (option: DropdownOption) => {
    if (option.id === "__add_new__" && onAddNew) {
      onAddNew();
    } else {
      onSelect(option.id);
    }
    setIsVisible(false);
    setSearchText("");
  };

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        isDark && styles.optionItemDark,
        value === item.id && styles.optionItemSelected,
      ]}
      onPress={() => handleSelect(item)}
    >
      {item.icon && (
        <View
          style={[
            styles.optionIcon,
            { backgroundColor: (item.color || "#3B82F6") + "20" },
          ]}
        >
          <Feather
            name={item.icon as any}
            size={16}
            color={item.color || "#3B82F6"}
          />
        </View>
      )}
      <View style={styles.optionTextContainer}>
        <Text
          style={[
            styles.optionLabel,
            isDark && styles.optionLabelDark,
            value === item.id && styles.optionLabelSelected,
            item.fontWeight && { fontWeight: item.fontWeight },
          ]}
        >
          {item.label}
        </Text>
        {item.subtitle && (
          <Text
            style={[styles.optionSubtitle, isDark && styles.optionSubtitleDark]}
          >
            {item.subtitle}
          </Text>
        )}
      </View>
      {value === item.id && (
        <Feather
          name="check"
          size={20}
          color="#10B981"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      )}

      <TouchableOpacity
        style={[
          styles.dropdownButton,
          isDark && styles.dropdownButtonDark,
          error && styles.dropdownButtonError,
          disabled && styles.dropdownButtonDisabled,
        ]}
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
      >
        <View style={styles.dropdownContent}>
          {selectedOption?.icon && (
            <View
              style={[
                styles.selectedIcon,
                { backgroundColor: (selectedOption.color || "#3B82F6") + "20" },
              ]}
            >
              <Feather
                name={selectedOption.icon as any}
                size={16}
                color={selectedOption.color || "#3B82F6"}
              />
            </View>
          )}
          <Text
            style={[
              styles.dropdownText,
              isDark && styles.dropdownTextDark,
              !selectedOption && styles.dropdownPlaceholder,
            ]}
            numberOfLines={1}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>
        <Feather
          name="chevron-down"
          size={20}
          color={isDark ? "#9CA3AF" : "#6B7280"}
        />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View
            style={[styles.modalContent, isDark && styles.modalContentDark]}
          >
            <View
              style={[
                styles.searchContainer,
                isDark && styles.searchContainerDark,
              ]}
            >
              <Feather
                name="search"
                size={20}
                color={isDark ? "#9CA3AF" : "#6B7280"}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, isDark && styles.searchInputDark]}
                placeholder="Search..."
                placeholderTextColor={isDark ? "#666" : "#9CA3AF"}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <Feather
                  name="x"
                  size={20}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.id}
              renderItem={renderOption}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text
                    style={[styles.emptyText, isDark && styles.emptyTextDark]}
                  >
                    No options found
                  </Text>
                </View>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
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
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  dropdownButtonDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "#374151",
  },
  dropdownButtonError: {
    borderColor: "#EF4444",
  },
  dropdownButtonDisabled: {
    opacity: 0.5,
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: "#111827",
    flex: 1,
  },
  dropdownTextDark: {
    color: "#FFF",
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    width: "90%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalContentDark: {
    backgroundColor: "#1C1C1E",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchContainerDark: {
    borderBottomColor: "#374151",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 8,
  },
  searchInputDark: {
    color: "#FFF",
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionItemDark: {
    borderBottomColor: "#374151",
  },
  optionItemSelected: {
    backgroundColor: "#F0FDF4",
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  optionLabelDark: {
    color: "#FFF",
  },
  optionLabelSelected: {
    color: "#065F46",
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  optionSubtitleDark: {
    color: "#9CA3AF",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyTextDark: {
    color: "#9CA3AF",
  },
});

export default SearchableDropdown;
