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
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useToastStore } from "@/store/toastStore";

const EditProfileScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updatedUser = useAuthStore((state) => state.editUser);
  const { showSuccess, showError } = useToastStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
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
      // If user selected a new image, we need to upload it first
      // In a real app, you'd upload to your server/cloud storage and get back a URL
      let avatarUrl = data.avatarUrl;

      if (selectedImage) {
        // TODO: Implement image upload logic here
        // Example: const uploadedUrl = await uploadImageToServer(selectedImage);
        // avatarUrl = uploadedUrl;

        // For now, we'll just use the local URI (this won't persist across app restarts)
        avatarUrl = selectedImage;
      }

      const updateData = {
        ...data,
        avatarUrl,
      };

      const successMessage = await updatedUser(updateData);
      showSuccess(successMessage);
      router.back();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleChangePhoto = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need access to your photo library to change your profile picture.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Settings",
              onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
            },
          ]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for avatars
        quality: 0.8, // Good quality but not too large
        base64: false, // We'll handle the URI
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);

        // Update form data
        // Note: In a real app, you'd upload to a server and get back a URL
        // For now, we'll just store the local URI
        // You might want to implement actual upload logic here
      }
    } catch (error) {
      console.error("Image picker error:", error);
      showError("Failed to select image. Please try again.");
    }
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
            imageUri={selectedImage || user?.avatar}
            fullName={user?.fullName || ""}
            userId={user?.id || ""}
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
