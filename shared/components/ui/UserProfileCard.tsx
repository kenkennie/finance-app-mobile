// UserProfileCard.tsx
import { colors } from "@/theme/colors";
import { borderRadius, fontSize, spacing } from "@/theme/spacing";
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

interface UserProfileCardProps {
  name: string;
  email: string;
  avatarUri: string;
  onEditPress: () => void; // Part 3: Button implementation
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  email,
  avatarUri,
  onEditPress,
}) => (
  <View style={styles.container}>
    <Image
      source={{ uri: avatarUri }}
      style={styles.avatar}
    />
    <View style={styles.info}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>
    </View>
    <TouchableOpacity
      style={styles.editButton}
      onPress={onEditPress} // Implement the click
      activeOpacity={0.7}
    >
      <Text style={styles.editButtonText}>Edit Profile</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    // Add a separator line below the card if needed
  },
  avatar: {
    width: 95,
    height: 95,
    borderRadius: spacing.xxl,
    marginBottom: spacing.sm,
  },
  info: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: 700,
    color: colors.text.primary,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  editButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  editButtonText: {
    color: colors.primary,
    fontWeight: 600,
    fontSize: fontSize.md,
  },
});
