import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface IconPickerProps {
  visible: boolean;
  selectedIcon: string;
  selectedColor?: string;
  onIconSelect: (icon: string) => void;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  { name: "smartphone", label: "Phone" },
  { name: "home", label: "Home" },
  { name: "dollar-sign", label: "Money" },
  { name: "trending-up", label: "Trending" },
  { name: "credit-card", label: "Card" },
  { name: "briefcase", label: "Briefcase" },
  { name: "shopping-bag", label: "Shopping" },
  { name: "shopping-cart", label: "Cart" },
  { name: "gift", label: "Gift" },
  { name: "heart", label: "Heart" },
  { name: "star", label: "Star" },
  { name: "bookmark", label: "Bookmark" },
  { name: "flag", label: "Flag" },
  { name: "target", label: "Target" },
  { name: "award", label: "Award" },
  { name: "coffee", label: "Coffee" },
  { name: "book", label: "Book" },
  { name: "music", label: "Music" },
  { name: "film", label: "Film" },
  { name: "camera", label: "Camera" },
  { name: "image", label: "Image" },
  { name: "umbrella", label: "Umbrella" },
  { name: "sun", label: "Sun" },
  { name: "cloud", label: "Cloud" },
  { name: "zap", label: "Zap" },
  { name: "activity", label: "Activity" },
  { name: "droplet", label: "Droplet" },
  { name: "feather", label: "Feather" },
  { name: "globe", label: "Globe" },
  { name: "map", label: "Map" },
  { name: "navigation", label: "Navigation" },
  { name: "compass", label: "Compass" },
  { name: "anchor", label: "Anchor" },
  { name: "truck", label: "Truck" },
  { name: "package", label: "Package" },
  { name: "inbox", label: "Inbox" },
  { name: "send", label: "Send" },
  { name: "mail", label: "Mail" },
] as const;

const IconPicker: React.FC<IconPickerProps> = ({
  visible,
  selectedIcon,
  selectedColor = "#2563EB",
  onIconSelect,
  onClose,
}) => {
  // Simple theme detection - you can replace this with your actual theme logic
  const isDark = false; // or use your theme context if available

  const handleIconSelect = (icon: string) => {
    onIconSelect(icon);
    onClose();
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
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, isDark && styles.titleDark]}>
                Select Icon
              </Text>
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

            {/* Icon Grid */}
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.iconGrid}>
                {AVAILABLE_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    style={styles.iconItemWrapper}
                    onPress={() => handleIconSelect(icon.name)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.iconItem,
                        isDark && styles.iconItemDark,
                        selectedIcon === icon.name && styles.iconItemSelected,
                        selectedIcon === icon.name && {
                          backgroundColor: selectedColor + "20",
                          borderColor: selectedColor,
                        },
                      ]}
                    >
                      <Feather
                        name={icon.name as any}
                        size={28}
                        color={
                          selectedIcon === icon.name
                            ? selectedColor
                            : isDark
                            ? "#FFF"
                            : "#111827"
                        }
                      />
                    </View>
                    <Text
                      style={[styles.iconLabel, isDark && styles.iconLabelDark]}
                    >
                      {icon.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
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
    height: SCREEN_HEIGHT * 0.7,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    gap: 16,
  },
  iconItemWrapper: {
    alignItems: "center",
    width: (Dimensions.get("window").width - 88) / 4, // 4 columns
  },
  iconItem: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconItemDark: {
    backgroundColor: "#2C2C2E",
  },
  iconItemSelected: {
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
  },
  iconLabelDark: {
    color: "#9CA3AF",
  },
});

export default IconPicker;
