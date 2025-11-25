import { colors } from "@/theme/colors";
import { borderRadius, fontSize, spacing } from "@/theme/spacing";
import {
  Eye,
  EyeOff,
  Search,
  Calendar,
  DollarSign,
  Tag,
  CheckCircle,
  Circle,
  X,
  Filter,
  User,
  Mail,
  Lock,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  isDark?: boolean;
  style?: TextStyle | TextStyle[];
  containerStyle?: ViewStyle | ViewStyle[];
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "search":
      return Search;
    case "calendar":
      return Calendar;
    case "dollar":
      return DollarSign;
    case "tag":
      return Tag;
    case "check":
      return CheckCircle;
    case "circle":
      return Circle;
    case "x":
      return X;
    case "filter":
      return Filter;
    case "user":
      return User;
    case "email":
      return Mail;
    case "password":
      return Lock;
    default:
      return null;
  }
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  showPasswordToggle = false,
  isDark = false,
  style,
  containerStyle,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isSecure = showPasswordToggle ? !isPasswordVisible : secureTextEntry;

  const LeftIconComponent = leftIcon ? getIconComponent(leftIcon) : null;
  const RightIconComponent = rightIcon ? getIconComponent(rightIcon) : null;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputContainer,
          isDark && styles.inputContainerDark,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && LeftIconComponent && (
          <View style={styles.leftIcon}>
            <LeftIconComponent
              size={20}
              color={error ? "#EF4444" : isDark ? "#9CA3AF" : "#6B7280"}
            />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
            isDark && styles.inputDark,
            error ? styles.inputError : null,
            style,
          ]}
          placeholderTextColor={isDark ? "#666" : "#9CA3AF"}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <EyeOff
                size={20}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
            ) : (
              <Eye
                size={20}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
            )}
          </TouchableOpacity>
        )}
        {rightIcon && !showPasswordToggle && RightIconComponent && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            activeOpacity={0.7}
            disabled={!onRightIconPress}
          >
            <RightIconComponent
              size={20}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  labelDark: {
    color: "#F9FAFB",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputContainerDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "#374151",
  },
  inputContainerFocused: {
    borderColor: "#2563EB",
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: "#EF4444",
  },
  inputDark: {
    color: "#FFF",
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
    padding: 4,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
