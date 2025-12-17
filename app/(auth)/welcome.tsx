import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    key: "1",
    title: "Welcome to ExpenseFlow",
    text: "Take control of your finances with intelligent expense tracking and beautiful insights.",
    image: require("../../assets/images/icon.png"),
    backgroundColor: "#59b2ab",
  },
  {
    key: "2",
    title: "Smart Expense Tracking",
    text: "Track every penny with intelligent categorization and powerful budgeting tools.",
    image: require("../../assets/images/icon.png"),
    backgroundColor: "#febe29",
  },
  {
    key: "3",
    title: "Visual Analytics",
    text: "Beautiful charts and reports to understand your spending patterns.",
    image: require("../../assets/images/icon.png"),
    backgroundColor: "#22bcb5",
  },
  {
    key: "4",
    title: "Get Started",
    text: "Join thousands of users who have taken control of their finances.",
    image: require("../../assets/images/icon.png"),
    backgroundColor: "#59b2ab",
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
