import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/shared/components/ui/Button";
import { colors } from "@/theme/colors";
import { borderRadius, fontSize, spacing } from "@/theme/spacing";

export default function WelcomeScreen() {
  const router = useRouter();

  const features = [
    {
      icon: "📊",
      title: "Track Expenses",
      description: "Monitor your spending",
    },
    { icon: "🎯", title: "Set Budgets", description: "Stay on track" },
    { icon: "💵", title: "Manage Income", description: "Track your earnings" },
    { icon: "💼", title: "Track Projects", description: "Organize your work" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>💰</Text>
          </View>
          <Text style={styles.title}>ExpenseFlow</Text>
          <Text style={styles.subtitle}>
            Manage your finances with ease. Track expenses, income, budgets, and
            more.
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureGrid}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={styles.featureCard}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={() => router.push("/(auth)/login" as any)}
            fullWidth
          >
            Get Started
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.background,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: "bold",
    color: colors.background,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.background,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 24,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: "center",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.background,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: fontSize.sm,
    color: colors.background,
    opacity: 0.8,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
});
