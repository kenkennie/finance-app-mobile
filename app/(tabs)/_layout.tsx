import { colors } from "@/theme/colors";
import { fontSize } from "@/theme/spacing";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home,
  DollarSign,
  Target,
  User,
  TrendingUp,
  BarChart,
  ArrowRightLeft,
  PiggyBank,
} from "lucide-react-native";
import { useTheme } from "@/theme/context/ThemeContext";

export default function TabsLayout() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? "#3385FF" : colors.primary,
        tabBarInactiveTintColor: isDark ? "#94a3b8" : colors.gray[400],
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2C2C2E" : colors.border,
          paddingTop: 8,
          paddingBottom: insets.bottom + (Platform.OS === "ios" ? 25 : 12),
          height: (Platform.OS === "ios" ? 100 : 82) + insets.bottom,
          backgroundColor: isDark ? "#1C1C1E" : colors.background,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: "300",
          marginTop: 0,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home
              color={color}
              size={size || 24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, size }) => (
            <ArrowRightLeft
              color={color}
              size={size || 24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: "Budgets",
          tabBarIcon: ({ color, size }) => (
            <PiggyBank
              color={color}
              size={size || 24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color, size }) => (
            <TrendingUp
              color={color}
              size={size || 24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User
              color={color}
              size={size || 24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
