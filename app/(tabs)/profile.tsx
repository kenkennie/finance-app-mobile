import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/shared/components/ui/Header";
import { UserProfileCard } from "@/shared/components/ui/UserProfileCard";
import { MenuItem } from "@/shared/components/ui/MenuItem";
import { ConfirmationModal } from "@/shared/components/ui/ConfirmationModal";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";

const ProfileScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { showSuccess, showError } = useToastStore();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoggingOut) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoggingOut]);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      setLogoutModalVisible(false);
      await logout();
      showSuccess("Logged out successful!");
      // Navigate to login after logout
      router.replace("/(auth)/login");
    } catch (error: any) {
      // ✅ Show error toast if logout fails
      showError(error.message || "Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setLogoutModalVisible(false);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Profile"
        isDark={isDark}
        rightIcons={[
          {
            icon: "edit-3",
            onPress: () => router.back(),
          },
        ]}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <UserProfileCard
          name={user?.fullName || "Unknown User"}
          email={user?.email || "No email provided"}
          isDark={isDark}
          avatarUri={user?.avatar}
          userId={user?.id}
          onEditPress={() => router.push("/screens/profile/EditProfileScreen")}
        />

        <View style={styles.section}>
          <MenuItem
            icon="tag"
            title="Categories"
            onPress={() => router.push("/screens/Categories/AllCategories")}
            isDark={isDark}
          />
          <MenuItem
            icon="credit-card"
            title="Accounts"
            onPress={() => router.push("/screens/Accounts/AccountsScreen")}
            isDark={isDark}
          />
          <MenuItem
            icon="repeat"
            title="Switch Account"
            subtitle={user?.email}
            onPress={() => console.log("Switch Account")}
            isDark={isDark}
          />
          <MenuItem
            icon="settings"
            title="Settings"
            onPress={() => console.log("Settings")}
            isDark={isDark}
          />
          <MenuItem
            icon="log-out"
            title="Log Out"
            onPress={handleLogout}
            iconColor="#FEE2E2"
            danger
            isDark={isDark}
          />
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={logoutModalVisible}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        isDark={isDark}
        destructive
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  containerDark: {
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
});

export default ProfileScreen;
