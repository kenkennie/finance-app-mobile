import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Typography } from "./Typography";

interface FilterTab {
  id: string;
  label: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isDark?: boolean;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  isDark = false,
}) => {
  return (
    <View style={styles.filterButtons}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.filterButton,
            ...(activeTab === tab.id ? [styles.filterButtonActive] : []),
            ...(isDark ? [styles.filterButtonDark] : []),
            ...(activeTab === tab.id && isDark
              ? [styles.filterButtonActiveDark]
              : []),
          ]}
          onPress={() => onTabChange(tab.id)}
        >
          <Typography
            style={[
              styles.filterButtonText,
              ...(activeTab === tab.id ? [styles.filterButtonTextActive] : []),
              ...(isDark ? [styles.filterButtonTextDark] : []),
            ]}
          >
            {tab.label}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  filterButtonDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  filterButtonActiveDark: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  filterButtonTextActive: {
    color: "#FFF",
  },
  filterButtonTextDark: {
    color: "#D1D5DB",
  },
});

export default FilterTabs;
