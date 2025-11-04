import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";
interface AvatarPropos {
  uri?: string;
  size?: number;
  onPress?: () => void;
}
export const Avatar: React.FC<AvatarPropos> = ({ uri, size = 60, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.avatarContainer, { width: size, height: size }]}
    activeOpacity={0.7}
  >
    <Image
      source={{ uri: uri || "https://via.placeholder.com/150" }}
      style={[styles.avatar, { width: size, height: size }]}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  avatarContainer: {
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  avatar: {
    borderRadius: 50,
  },
});
