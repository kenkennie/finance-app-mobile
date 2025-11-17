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
import { useTheme } from "@/theme/context/ThemeContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ColorPickerProps {
  visible: boolean;
  selectedColor: string;
  onColorSelect: (color: string) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  { hex: "#EF4444", name: "Red" },
  { hex: "#F59E0B", name: "Orange" },
  { hex: "#EAB308", name: "Yellow" },
  { hex: "#84CC16", name: "Lime" },
  { hex: "#10B981", name: "Green" },
  { hex: "#14B8A6", name: "Teal" },
  { hex: "#06B6D4", name: "Cyan" },
  { hex: "#3B82F6", name: "Blue" },
  { hex: "#6366F1", name: "Indigo" },
  { hex: "#8B5CF6", name: "Purple" },
  { hex: "#A855F7", name: "Violet" },
  { hex: "#EC4899", name: "Pink" },
  { hex: "#F43F5E", name: "Rose" },
  { hex: "#64748B", name: "Slate" },
  { hex: "#6B7280", name: "Gray" },
  { hex: "#78716C", name: "Stone" },
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  visible,
  selectedColor,
  onColorSelect,
  onClose,
}) => {
  const { isDark } = useTheme();

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
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
                Select Color
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

            {/* Color Grid */}
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.colorGrid}>
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color.hex}
                    style={styles.colorItemWrapper}
                    onPress={() => handleColorSelect(color.hex)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.colorItem,
                        { backgroundColor: color.hex },
                        selectedColor === color.hex && styles.colorItemSelected,
                      ]}
                    >
                      {selectedColor === color.hex && (
                        <Feather
                          name="check"
                          size={28}
                          color="#FFF"
                        />
                      )}
                    </View>
                    <Text
                      style={[styles.colorName, isDark && styles.colorNameDark]}
                    >
                      {color.name}
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
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    gap: 16,
  },
  colorItemWrapper: {
    alignItems: "center",
    width: (Dimensions.get("window").width - 88) / 4, // 4 columns
  },
  colorItem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorItemSelected: {
    borderColor: "#FFF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  colorName: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  colorNameDark: {
    color: "#9CA3AF",
  },
});

export default ColorPicker;
