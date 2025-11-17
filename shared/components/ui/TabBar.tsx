import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

interface TabBarProps {
  activeTab: string;
  onTabChange?: (tabId: string) => void;
  isDark?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
  isDark,
}) => {
  const tabs = [
    { id: "all", label: "All" },
    { id: "income", label: "Income" },
    { id: "expenses", label: "Expenses" },
  ];

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => onTabChange?.(tab.id)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.label,
              activeTab === tab.id && styles.labelActive,
              isDark && styles.labelDark,
              activeTab === tab.id && isDark && styles.labelActiveDark,
            ]}
          >
            {tab.label}
          </Text>
          {activeTab === tab.id && <View style={styles.indicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  containerDark: {
    backgroundColor: "#1C1C1E",
    borderBottomColor: "#2C2C2E",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    position: "relative",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  labelDark: {
    color: "#9CA3AF",
  },
  labelActive: {
    color: "#2563EB",
    fontWeight: "700",
  },
  labelActiveDark: {
    color: "#3B82F6",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#2563EB",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});
