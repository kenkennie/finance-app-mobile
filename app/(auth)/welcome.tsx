import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    key: "1",
    title: "Welcome to ExpenseFlow",
    text: "Take control of your finances with intelligent expense tracking and beautiful insights.",
    image: require("@/assets/images/icon.png"),
    backgroundColor: colors.primary,
  },
  {
    key: "2",
    title: "Multi-Account Tracking",
    text: "Manage bank accounts, credit cards, and cash accounts all in one place.",
    image: require("@/assets/images/icon.png"),
    backgroundColor: colors.primary,
  },
  {
    key: "3",
    title: "Expense & Income Tracking",
    text: "Record transactions with detailed categorization for better financial management.",
    image: require("@/assets/images/icon.png"),
    backgroundColor: colors.primary,
  },
  {
    key: "4",
    title: "Budget Management",
    text: "Set spending limits and monitor budget performance to stay on track.",
    image: require("@/assets/images/icon.png"),
    backgroundColor: colors.primary,
  },
  {
    key: "5",
    title: "Financial Insights",
    text: "Visualize spending patterns with interactive charts and reports.",
    image: require("@/assets/images/icon.png"),
    backgroundColor: colors.primary,
  },
];

export default function WelcomeScreen() {
  const router = useRouter();

  const renderSlide = ({ item }: any) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <Image
          source={item.image}
          style={styles.image}
        />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  const onDone = () => {
    // Navigate to login screen after onboarding
    router.push("/(auth)/login");
  };

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderSlide}
      onDone={onDone}
      showSkipButton={true}
      onSkip={onDone}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    lineHeight: 24,
  },
});
