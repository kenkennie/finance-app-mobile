// components/MessageBox.tsx
import React from "react";
import { View, Text } from "react-native";

interface MessageBoxProps {
  message?: string | null;
  type?: "success" | "error";
}

export default function MessageBox({
  message,
  type = "success",
}: MessageBoxProps) {
  if (!message) return null;

  const backgroundColor = type === "success" ? "#D1FAE5" : "#FECACA";
  const textColor = type === "success" ? "#065F46" : "#991B1B";

  return (
    <View
      style={{
        backgroundColor,
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
      }}
    >
      <Text style={{ color: textColor, textAlign: "center" }}>{message}</Text>
    </View>
  );
}
