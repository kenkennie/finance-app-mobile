import React from "react";
import { TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FABProps {
  icon: "plus";
  onPress?: () => void;
  color?: string;
  isDark?: false;
}

export const FAB: React.FC<FABProps> = ({
  icon,
  onPress,
  color = "#2563EB",
  isDark,
}) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = (Platform.OS === "ios" ? 100 : 82) + insets.bottom;
  return (
    <TouchableOpacity
      style={[
        styles.fab,
        { backgroundColor: color, bottom: tabBarHeight + 20 },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Feather
        name={icon}
        size={24}
        color="#FFF"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 24,
    bottom: 90,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
