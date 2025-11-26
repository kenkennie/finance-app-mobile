import React from "react";
import { View, StyleSheet, Image, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Typography } from "@/shared/components/ui/Typography";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { useTheme } from "@/theme/context/ThemeContext";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const handleGetStarted = () => {
    router.push("/onboarding/setup-accounts");
  };

  const features = [
    {
      icon: "🎯",
      title: "Smart Expense Tracking",
      description:
        "Track every penny with intelligent categorization and insights",
    },
    {
      icon: "📊",
      title: "35+ Categories Ready",
      description:
        "Pre-configured expense and income categories for instant setup",
    },
    {
      icon: "💳",
      title: "Multi-Account Support",
      description: "Manage cash, M-Pesa, bank accounts all in one place",
    },
    {
      icon: "📈",
      title: "Visual Analytics",
      description:
        "Beautiful charts and reports to understand your spending patterns",
    },
    {
      icon: "🎨",
      title: "Fully Customizable",
      description:
        "Personalize colors, icons, and categories to match your style",
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      description: "Your financial data is encrypted and stored securely",
    },
  ];

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.logoGlow} />
          </View>

          <Typography
            variant="h1"
            style={[styles.title, isDark && styles.titleDark]}
          >
            Master Your Money
          </Typography>

          <Typography
            variant="body1"
            style={[styles.subtitle, isDark && styles.subtitleDark]}
          >
            Take control of your finances with intelligent expense tracking,
            beautiful insights, and powerful budgeting tools.
          </Typography>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Typography
            variant="h2"
            style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
          >
            Everything You Need
          </Typography>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Card
                key={index}
                isDark={isDark}
                style={styles.featureCard}
              >
                <View style={styles.featureIconContainer}>
                  <Typography
                    variant="h2"
                    style={styles.featureIcon}
                  >
                    {feature.icon}
                  </Typography>
                </View>

                <Typography
                  variant="h3"
                  style={[
                    styles.featureTitle,
                    isDark && styles.featureTitleDark,
                  ]}
                >
                  {feature.title}
                </Typography>

                <Typography
                  variant="body2"
                  style={[
                    styles.featureDescription,
                    isDark && styles.featureDescriptionDark,
                  ]}
                >
                  {feature.description}
                </Typography>
              </Card>
            ))}
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Typography
            variant="body1"
            style={[styles.ctaText, isDark && styles.ctaTextDark]}
          >
            Join thousands of users who have taken control of their finances
          </Typography>

          <Button
            onPress={handleGetStarted}
            variant="primary"
            style={styles.getStartedButton}
          >
            Start Your Journey
          </Button>

          <Typography
            variant="body2"
            style={[styles.setupTime, isDark && styles.setupTimeDark]}
          >
            ⚡ Setup takes less than 2 minutes
          </Typography>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  containerDark: {
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  logoGlow: {
    position: "absolute",
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 25,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    zIndex: -1,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 40,
  },
  titleDark: {
    color: "#FFF",
  },
  subtitle: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 320,
  },
  subtitleDark: {
    color: "#9CA3AF",
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 32,
  },
  sectionTitleDark: {
    color: "#FFF",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: (width - 48 - 16) / 2, // Two cards per row with padding
    marginBottom: 16,
    padding: 20,
    alignItems: "center",
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 22,
  },
  featureTitleDark: {
    color: "#FFF",
  },
  featureDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  featureDescriptionDark: {
    color: "#9CA3AF",
  },
  ctaSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  ctaText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  ctaTextDark: {
    color: "#9CA3AF",
  },
  getStartedButton: {
    minWidth: 200,
    marginBottom: 16,
  },
  setupTime: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  setupTimeDark: {
    color: "#34D399",
  },
});
