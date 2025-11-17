import { useTheme } from "@/theme/context/ThemeContext";
import React from "react";
import { TouchableOpacity, StyleSheet, Animated } from "react-native";

interface SwitchButtonProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  title?: string;
  description?: string;
}

export const SwitchButton: React.FC<SwitchButtonProps> = ({
  value,
  onValueChange,
  disabled = false,
  title,
  description,
}) => {
  const { isDark } = useTheme();

  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#D1D5DB", "#2563EB"],
  });

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View
        style={[styles.track, { backgroundColor }, disabled && styles.disabled]}
      >
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX }] }]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default SwitchButton;
