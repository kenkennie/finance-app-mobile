import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface EditableAvatarProps {
  fullName: string;
  imageUri: string;
  onChangePhoto: () => void;
  isDark: boolean;
}
export const EditableAvatar: React.FC<EditableAvatarProps> = ({
  fullName,
  imageUri,
  onChangePhoto,
  isDark = false,
}) => {
  const getInitial = () => fullName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <View style={[styles.avatar, isDark && styles.avatarDark]}>
          <Feather
            name="user"
            size={60}
            color="#9CA3AF"
          />
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={onChangePhoto}
          activeOpacity={0.8}
        >
          <Feather
            name="edit-2"
            size={16}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={onChangePhoto}
        activeOpacity={0.7}
      >
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FED7AA",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarDark: {
    backgroundColor: "#EA580C",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },
});
