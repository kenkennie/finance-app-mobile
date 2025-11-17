import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

interface RightIconItem {
  icon: FeatherIconName;
  onPress: () => void;
}

interface HeaderProps {
  title: React.ReactNode;
  onPress?: () => void;
  leftIcon?: FeatherIconName;
  onLeftPress?: () => void;
  onBackPress?: () => void;
  rightIcons?: RightIconItem[];
  showBack?: boolean;
  isDark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  leftIcon,
  onLeftPress,
  rightIcons = [],
  isDark = false,
}) => {
  return (
    <View style={[styles.header, isDark && styles.headerDark]}>
      {/* Left Side */}
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.iconButton}
          >
            <Feather
              name="arrow-left"
              size={24}
              color={isDark ? "#FFF" : "#000"}
            />
          </TouchableOpacity>
        )}
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftPress}
            style={styles.iconButton}
          >
            <Feather
              name={leftIcon}
              size={24}
              color={isDark ? "#FFF" : "#000"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>

      {/* Right Side */}
      <View style={styles.rightContainer}>
        {rightIcons?.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            style={[styles.iconButton, index > 0 && styles.iconSpacing]}
          >
            <Feather
              name={item.icon}
              size={24}
              color={isDark ? "#FFF" : "#000"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerDark: {
    backgroundColor: "#1C1C1E",
    borderBottomColor: "#2C2C2E",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 80,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 80,
    justifyContent: "flex-end",
  },
  iconButton: {
    paddingRight: 8,
  },
  iconSpacing: {
    marginLeft: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    flex: 1,
  },
  titleDark: {
    color: "#FFF",
  },
});
