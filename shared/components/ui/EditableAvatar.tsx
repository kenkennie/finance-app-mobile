import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { generateAvatarData } from "../../utils/avatarUtils";

interface EditableAvatarProps {
  fullName: string;
  userId: string;
  imageUri?: string;
  onChangePhoto: () => void;
  isDark?: boolean;
  size?: number;
}
export const EditableAvatar: React.FC<EditableAvatarProps> = ({
  fullName,
  userId,
  imageUri,
  onChangePhoto,
  isDark = false,
  size = 120,
}) => {
  const avatarData = useMemo(() => {
    return generateAvatarData(fullName, userId);
  }, [fullName, userId]);

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        {imageUri && imageUri.trim() ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.avatar, { width: size, height: size }]}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              { width: size, height: size, backgroundColor: avatarData.color },
            ]}
          >
            <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
              {avatarData.initials}
            </Text>
          </View>
        )}
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
  initials: {
    color: "white",
    fontWeight: "600",
  },
});
