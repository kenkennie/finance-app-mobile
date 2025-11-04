import { updateUserDto, updateUserSchema } from "@/schemas/auth.schema";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { MenuItem } from "@/shared/components/ui/MenuItem";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { SwitchButton } from "@/shared/components/ui/SwitchButton";
import { useAccountStore } from "@/store/accountStore";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { colors } from "@/theme/colors";
import { borderRadius, fontSize, spacing } from "@/theme/spacing";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { BellIcon, Info, PhoneCall, Settings2Icon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
  Alert,
} from "react-native";

export default function ProfileSettingsApp() {
  const user = useAuthStore((state) => state.user);
  const updatedUser = useAuthStore((state) => state.editUser);
  const logout = useAuthStore((state) => state.logout);
  const accountType = useAccountStore((state) => state.accountType);
  const { showSuccess, showError } = useToastStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(true);

  // Modal visibility state
  const [editModalVisible, setEditModalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<updateUserDto>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    // When user data is loaded, reset form with values
    const userData = {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      avatarUrl: user?.avatar || "",
    };
    reset(userData);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated]);

  const onSubmit = async (data: updateUserDto) => {
    try {
      const successMessage = await updatedUser(data);
      showSuccess(successMessage);
      setEditModalVisible(false);
    } catch (error: any) {
      showError(error.message);
      setEditModalVisible(false);
    }
  };

  // useEffect(() => {
  //   if (editModalVisible && user) {
  //     setProfileData({
  //       fullName: user.fullName || "",
  //       email: user.email,
  //       phoneNumber: user.phoneNumber || "",
  //       avatarUrl: user.avatar || "",
  //     });
  //   }
  // }, [editModalVisible, user]);

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();

              showSuccess("Logged out successful!");
            } catch (error: any) {
              // ✅ Show error toast if logout fails
              showError(error.message || "Logout failed");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
        >
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
          <BellIcon size={30} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Avatar
            // uri={data.avatarUrl}
            size={70}
            onPress={() =>
              Alert.alert("Change Photo", "Photo picker would open here")
            }
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName}</Text>
            <Text style={styles.profileContact}>{user?.email}</Text>
            <Text style={styles.profileContact}>{user?.phoneNumber}</Text>
          </View>
        </View>
        <Button
          onPress={() => setEditModalVisible(true)}
          variant="outline"
          fullWidth
          style={{ borderRadius: borderRadius.full }}
        >
          <Text>Edit profile</Text>
        </Button>

        {/* Notification Preferences Section */}
        <SectionHeader title="Notification Preferences" />

        <View style={styles.section}>
          <SwitchButton
            title="Email Notifications"
            description="Receive updates and promotional emails."
            value={emailNotifications}
            onToggle={setEmailNotifications}
          />

          <View style={styles.divider} />

          <SwitchButton
            title="Push Notifications"
            description="Get instant alerts on your device."
            value={pushNotifications}
            onToggle={setPushNotifications}
          />

          <View style={styles.divider} />

          <SwitchButton
            title="SMS Notifications"
            description="Receive important alerts via text message."
            value={smsNotifications}
            onToggle={setSmsNotifications}
          />
        </View>

        {/* Account Section */}
        <SectionHeader title="Account" />

        <View style={styles.section}>
          <MenuItem
            title={`${accountType} (Switch account)`}
            subtitle="Current Account"
            onPress={() =>
              Alert.alert("Account", "Account management would open here")
            }
          />
        </View>

        {/* Legal Section */}
        <SectionHeader title="Legal" />

        <View style={styles.section}>
          <MenuItem
            title="Privacy Policy"
            onPress={() =>
              Alert.alert("Privacy Policy", "Privacy policy would open here")
            }
          />
        </View>

        {/* Additional Settings */}
        <SectionHeader title="More" />

        <View style={styles.section}>
          <MenuItem
            icon={
              <Settings2Icon
                size={20}
                color={colors.primary}
              />
            }
            title="App Settings"
            onPress={() =>
              Alert.alert("Settings", "App settings would open here")
            }
          />

          <View style={styles.divider} />

          <MenuItem
            icon={
              <PhoneCall
                size={20}
                color={colors.primary}
              />
            }
            title="Help & Support"
            onPress={() => Alert.alert("Help", "Support page would open here")}
          />

          <View style={styles.divider} />

          <MenuItem
            icon={
              <Info
                size={20}
                color={colors.primary}
              />
            }
            title="About"
            subtitle="Version 1.0.0"
            onPress={() => Alert.alert("About", "App version 1.0.0")}
          />
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleCancelEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalAvatarSection}>
              <Avatar
                // uri={setProfileData.avatarUrl}
                size={100}
              />
              <TouchableOpacity
                style={styles.changePhotoButton}
                activeOpacity={0.7}
              >
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fullName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="john@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="07123456789"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  error={errors.phoneNumber?.message}
                />
              )}
            />

            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
    paddingHorizontal: 20,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 600,
    color: colors.text.primary,
  },
  notificationButton: {
    position: "relative",
  },

  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  notificationBadgeText: {
    color: colors.background,
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.background,
    marginTop: 1,
  },
  avatarContainer: {
    borderRadius: borderRadius.full,
    overflow: "hidden",
    backgroundColor: colors.gray[200],
  },
  avatar: {
    borderRadius: borderRadius.full,
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: 600,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  profileContact: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },

  section: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },

  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.md,
  },

  logoutButton: {
    marginHorizontal: spacing.lg,
    marginTop: 32,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: fontSize.md,
    fontWeight: 600,
    color: colors.error,
  },
  bottomPadding: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalCancel: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  modalSave: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.primary,
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.gray[100],
    paddingHorizontal: 25,
    paddingTop: 24,
  },
  modalAvatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  changePhotoButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    fontSize: fontSize.md,
    color: "#3B82F6",
    fontWeight: "500",
  },
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: fontSize.md,
    color: "#111827",
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
});
