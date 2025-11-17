import React, { useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/shared/components/ui/Header";
import { UserProfileCard } from "@/shared/components/ui/UserProfileCard";
import { MenuItem } from "@/shared/components/ui/MenuItem";
import { useAuthStore } from "@/store/authStore";
import { useAccountStore } from "@/store/accountStore";
import { useToastStore } from "@/store/toastStore";

const ProfileScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated]);

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
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Profile"
        isDark={isDark}
        rightIcons={[
          {
            icon: "edit-3",
            onPress: () =>
              router.navigate("/screens/profile/EditProfileScreen"),
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
          avatarUri={user?.avatar || "https://via.placeholder.com/150"}
          onEditPress={() => router.push("/screens/profile/EditProfileScreen")}
        />

        <View style={styles.section}>
          <MenuItem
            icon="tag"
            title="Categories"
            onPress={() => console.log("Categories")}
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
