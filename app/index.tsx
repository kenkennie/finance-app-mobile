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

interface OnboardingStatus {
  needsOnboarding: boolean;
  hasCategories: boolean;
  hasAccounts: boolean;
}

export default function Index() {
  const { isAuthenticated, isLoading, checkOnboardingStatus, user } =
    useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // ✅ Check if navigation is ready
  const navigationState = useRootNavigationState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [onboardingStatus, setOnboardingStatus] =
    useState<OnboardingStatus | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  // ✅ Wait for navigation to be ready
  useEffect(() => {
    if (navigationState?.key) {
      setIsNavigationReady(true);
      console.log("Navigation is ready:", navigationState.key);
    }
  }, [navigationState]);

  // ✅ Check onboarding status for authenticated users
  useEffect(() => {
    if (
      !isNavigationReady ||
      isLoading ||
      !isAuthenticated ||
      checkingOnboarding
    ) {
      console.log("==========return==========================");
      console.log("return");
      console.log("===========return=========================");
      console.log("====================================");
      console.log(
        isNavigationReady,
        isLoading,
        isAuthenticated,
        checkingOnboarding
      );
      console.log("====================================");
      return; // Don't check yet
    }

    const checkOnboarding = async () => {
      setCheckingOnboarding(true);
      try {
        const status = await checkOnboardingStatus();
        console.log("====================================");
        console.log(status);
        console.log("====================================");
        setOnboardingStatus(status);
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
        // Default to main app if check fails
        setOnboardingStatus({
          needsOnboarding: false,
          hasCategories: true,
          hasAccounts: true,
        });
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [
    isNavigationReady,
    isAuthenticated,
    isLoading,
    checkingOnboarding,
    checkOnboardingStatus,
  ]);

  // ✅ Handle navigation only when ready
  useEffect(() => {
    if (
      !isNavigationReady ||
      isLoading ||
      checkingOnboarding ||
      (isAuthenticated && !onboardingStatus)
    ) {
      return; // Don't navigate yet
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inOnboardingGroup = segments[0] === "onboarding";

    console.log("🧭 Navigation check:", {
      isNavigationReady,
      isAuthenticated,
      isLoading,
      checkingOnboarding,
      onboardingStatus,
      segments,
      inAuthGroup,
      inTabsGroup,
      inOnboardingGroup,
    });

    // Redirect logic
    if (!isAuthenticated && !inAuthGroup) {
      console.log("→ Redirecting to auth/welcome");
      setTimeout(() => router.replace("/(auth)/welcome"), 0);
    } else if (
      isAuthenticated &&
      onboardingStatus?.needsOnboarding &&
      !inOnboardingGroup
    ) {
      console.log("→ Redirecting to onboarding/welcome");
      setTimeout(() => router.replace("/onboarding/welcome"), 0);
    } else if (
      isAuthenticated &&
      !onboardingStatus?.needsOnboarding &&
      !inTabsGroup
    ) {
      console.log("→ Redirecting to tabs (dashboard)");
      setTimeout(() => router.replace("/(tabs)"), 0);
    }
  }, [
    isNavigationReady,
    isAuthenticated,
    isLoading,
    checkingOnboarding,
    onboardingStatus,
    segments,
    user,
    router,
  ]);

  // Show loading while navigation is mounting, auth is loading, or checking onboarding
  if (!isNavigationReady || isLoading || checkingOnboarding) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  // Default redirect based on auth state and onboarding status
  if (isAuthenticated) {
    if (onboardingStatus?.needsOnboarding) {
      return <Redirect href="/onboarding/welcome" />;
    }
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
