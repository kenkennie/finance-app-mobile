import React, { useMemo } from "react";
import { TouchableOpacity, Image, View, Text, StyleSheet } from "react-native";
import { generateAvatarData } from "../../utils/avatarUtils";

interface AvatarProps {
  uri?: string;
  name?: string;
  userId?: string;
  size?: number;
  onPress?: () => void;
}
export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  userId,
  size = 60,
  onPress,
}) => {
  const avatarData = useMemo(() => {
    if (name && userId) {
      return generateAvatarData(name, userId);
    }
    return null;
  }, [name, userId]);

  if (uri && uri.trim()) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.avatarContainer, { width: size, height: size }]}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri }}
          style={[styles.avatar, { width: size, height: size }]}
        />
      </TouchableOpacity>
    );
  }

  if (avatarData) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.avatarContainer,
          { width: size, height: size, backgroundColor: avatarData.color },
        ]}
        activeOpacity={0.7}
      >
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
          {avatarData.initials}
        </Text>
      </TouchableOpacity>
    );
  }

  // Fallback
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.avatarContainer, { width: size, height: size }]}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.avatar,
          { width: size, height: size, backgroundColor: "#E5E7EB" },
        ]}
      >
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>?</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  avatar: {
    borderRadius: 50,
  },
  initials: {
    color: "white",
    fontWeight: "600",
  },
});
