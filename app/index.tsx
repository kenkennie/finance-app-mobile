import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import {
  Redirect,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme/colors";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // ✅ Check if navigation is ready
  const navigationState = useRootNavigationState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // ✅ Wait for navigation to be ready
  useEffect(() => {
    if (navigationState?.key) {
      setIsNavigationReady(true);
    }
  }, [navigationState]);

  // ✅ Handle navigation only when ready
  useEffect(() => {
    if (!isNavigationReady || isLoading) {
      return; // Don't navigate yet
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    console.log("🧭 Navigation check:", {
      isNavigationReady,
      isAuthenticated,
      isLoading,
      segments,
      inAuthGroup,
      inTabsGroup,
    });

    // Redirect logic
    if (!isAuthenticated && !inAuthGroup) {
      console.log("→ Redirecting to auth/welcome");
      setTimeout(() => router.replace("/(auth)/welcome"), 0);
    } else if (isAuthenticated && !inTabsGroup) {
      console.log("→ Redirecting to tabs (dashboard)");
      setTimeout(() => router.replace("/(tabs)"), 0);
    }
  }, [isNavigationReady, isAuthenticated, isLoading, segments]);

  // Show loading while navigation is mounting or auth is loading
  if (!isNavigationReady || isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  // Default redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
