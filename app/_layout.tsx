import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import * as SplashScreen from "expo-splash-screen";
import { Toast } from "@/shared/components/ui/Toast";
import { ThemeProvider } from "@/theme/context/ThemeContext";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const loadPersistedState = useAuthStore((state) => state.loadPersistedState);
  const { visible, message, type, hideToast } = useToastStore();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // ✅ Load persisted auth state
        await loadPersistedState();

        // ✅ Add small delay to ensure everything is ready
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error("Error preparing app:", error);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // ✅ Don't render until app is ready
  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>

            {/* Global Toast Component */}
            <Toast
              visible={visible}
              message={message}
              type={type}
              onHide={hideToast}
            />
          </QueryClientProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
