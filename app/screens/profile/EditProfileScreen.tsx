import { updateUserDto, updateUserSchema } from "@/schemas/auth.schema";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Button } from "@/shared/components/ui/Button";
import { EditableAvatar } from "@/shared/components/ui/EditableAvatar";
import { Header } from "@/shared/components/ui/Header";
import { Input } from "@/shared/components/ui/Input";
import {} from "@/shared/components/ui/UserProfileCard";
import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme/colors";
import { borderRadius, fontSize } from "@/theme/spacing";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useToastStore } from "@/store/toastStore";

const EditProfileScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updatedUser = useAuthStore((state) => state.editUser);
  const { showSuccess, showError } = useToastStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<updateUserDto>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      avatarUrl: user?.avatar || "",
    },
  });

  const onSubmit = async (data: updateUserDto) => {
    try {
      const successMessage = await updatedUser(data);
      showSuccess(successMessage);
      router.back();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleChangePhoto = () => {
    console.log("Change photo pressed");
    // Implement image picker logic here
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header
        title="Edit Profile"
        showBack
        onBackPress={() => router.back()}
        isDark={isDark}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <EditableAvatar
            imageUri={user?.avatar || ""}
            fullName={user?.fullName || ""}
            onChangePhoto={handleChangePhoto}
            isDark={isDark}
          />

          <View style={styles.form}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fullName?.message}
                  isDark={isDark}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="john@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                  isDark={isDark}
                />
              )}
            />

            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="07123456789"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  error={errors.phoneNumber?.message}
                  isDark={isDark}
                />
              )}
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, isDark && styles.footerDark]}>
          <Button
            variant="primary"
            fullWidth
            style={{ borderRadius: borderRadius.lg }}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          >
            Edit profile
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  containerDark: {
    backgroundColor: "#000",
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  form: {
    paddingHorizontal: 16,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerDark: {
    backgroundColor: "#1C1C1E",
    borderTopColor: "#2C2C2E",
  },
  saveButton: {
    width: "100%",
  },
});
export default EditProfileScreen;
