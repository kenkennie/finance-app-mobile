// UserProfileCard.tsx
import { colors } from "@/theme/colors";
import { borderRadius, fontSize, spacing } from "@/theme/spacing";
import React, { useMemo } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { generateAvatarData } from "../../utils/avatarUtils";

interface UserProfileCardProps {
  name: string;
  email: string;
  avatarUri?: string;
  userId?: string;
  onEditPress?: () => void; // Part 3: Button implementation
  isDark: boolean;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  email,
  avatarUri,
  userId,
  onEditPress,
  isDark = false,
}) => {
  const avatarData = useMemo(() => {
    if (userId) {
      return generateAvatarData(name, userId);
    }
    return null;
  }, [name, userId]);

  return (
    <View style={styles.container}>
      {avatarUri && avatarUri.trim() ? (
        <Image
          source={{ uri: avatarUri }}
          style={styles.avatarImage}
        />
      ) : avatarData ? (
        <View style={[styles.avatar, { backgroundColor: avatarData.color }]}>
          <Text style={styles.initial}>{avatarData.initials}</Text>
        </View>
      ) : (
        <View style={[styles.avatar, isDark && styles.avatarDark]}>
          <Text style={styles.initial}>{name.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <Text style={[styles.name, isDark && styles.nameDark]}>{name}</Text>
      <Text style={[styles.email, isDark && styles.emailDark]}>{email}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FED7AA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarDark: {
    backgroundColor: "#EA580C",
  },
  initial: {
    fontSize: 40,
    fontWeight: "600",
    color: "#FFF",
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  nameDark: {
    color: "#FFF",
  },
  email: {
    fontSize: 16,
    color: "#6B7280",
  },
  emailDark: {
    color: "#9CA3AF",
  },
});
