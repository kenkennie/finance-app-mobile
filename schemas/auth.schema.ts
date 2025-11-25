import { z } from "zod";

// Base validation schemas
export const emailSchema = z
  .string()
  .email("Please provide a valid email address")
  .max(255, "Email must not exceed 255 characters")
  .transform((email) => email.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must not exceed 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
  );

export const createPasswordSchema = (fullName: string, email: string) => {
  const emailLocalPart = email.toLowerCase().split("@")[0];
  const fName = fullName.toLowerCase();

  return z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    )
    .superRefine((password, ctx) => {
      const lower = password.toLowerCase();

      if (lower.includes(fName) || lower.includes(emailLocalPart)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Password must not contain your personal information (name or email).",
        });
      }
    });
};

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters long")
  .max(50, "Name must not exceed 50 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  )
  .transform((name) => name.trim().replace(/\s{2,}/g, " ")); // removes extra spaces

export const phoneSchema = z
  .string()
  // 1. Basic format validation
  // This regex allows for a common international or North American format,
  // including optional leading '+', parentheses, spaces, and hyphens.
  // It ensures there are at least 7 to 15 digits (a reasonable range for phone numbers).
  .regex(
    /^(\+\d{1,3}[\s-]?)?(\(\d{1,4}\)[\s-]?)?[\d\s-]{7,15}$/,
    "Invalid phone number format. Please include at least 7 digits and use standard characters (numbers, spaces, hyphens, and parentheses)."
  )
  // 2. Max length for security/sanity check (adjust as needed)
  .max(30, "Phone number is too long")
  // 3. Transformation to clean the number for storage
  // This removes everything that isn't a digit (0-9) or a plus sign (+)
  // and then ensures the remaining string has at least 7 characters.
  .transform((val, ctx) => {
    // Keep the leading '+' if it exists, otherwise remove all non-digits
    const cleaned = val.startsWith("+")
      ? "+" + val.slice(1).replace(/[^\d]/g, "")
      : val.replace(/[^\d]/g, "");

    if (cleaned.length < 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number must contain at least 7 digits.",
      });
      // The transform will fail if an issue is added
      return z.NEVER;
    }

    return cleaned; // Returns the clean, digits-only (or +digits) string
  });

export const deviceIdSchema = z
  .string()
  .min(10, "Device ID too short")
  .max(255, "Device ID too long")
  .regex(
    /^[a-zA-Z0-9-_]+$/,
    "Device ID can only contain letters, numbers, hyphens, and underscores"
  );

export const deviceNameSchema = z
  .string()
  .min(1, "Device name is required")
  .max(100, "Device name too long")
  .transform((name) => name.trim());

export const platformSchema = z.enum(["iOS", "Android", "Web", "Desktop"], {
  message: "Platform must be one of: iOS, Android, Web, Desktop",
});

export const pushTokenSchema = z
  .string()
  .min(10, "Push token too short")
  .max(500, "Push token too long")
  .optional();

// Device info schema
export const deviceInfoSchema = z.object({
  deviceId: deviceIdSchema.optional(),
  deviceName: deviceNameSchema.optional(),
  platform: platformSchema.optional(),
  pushToken: pushTokenSchema.optional(),
});

// Auth DTOs with Zod
export const registerSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .max(255, "Email must not exceed 255 characters"),
  password: passwordSchema,
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    ),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .max(255, "Email must not exceed 255 characters"),
  password: z.string().min(1, "Password is required"),

  // Device information
  // deviceInfo: deviceInfoSchema,
});

export const forgotPasswordSchema = z
  .object({
    email: z
      .string()
      .email("Please provide a valid email address")
      .max(255, "Email must not exceed 255 characters"),
  })
  .strict();

export const updateUserSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .max(255, "Email must not exceed 255 characters")
    .optional(),
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .optional(),
  phoneNumber: z
    .string()
    .regex(
      /^(\+\d{1,3}[\s-]?)?(\(\d{1,4}\)[\s-]?)?[\d\s-]{7,15}$/,
      "Invalid phone number format. Please include at least 7 digits and use standard characters (numbers, spaces, hyphens, and parentheses)."
    )
    .max(30, "Phone number is too long")
    .optional(),
  avatarUrl: z
    .string()
    .url("Please provide a valid image URL")
    .optional()
    .or(z.literal("")),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const tokenSchema = z
  .object({
    token: z.string().min(32, "Invalid reset token format"),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
  })
  .strict()
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const resendVerificationSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export const twoFactorCodeSchema = z
  .object({
    code: z
      .string()
      .length(6, "Code must be exactly 6 digits")
      .regex(/^\d{6}$/, "Code must contain only digits"),
  })
  .strict();

// Device management schemas
export const updateDeviceSchema = z
  .object({
    deviceName: deviceNameSchema.optional(),
    pushToken: pushTokenSchema,
    pushEnabled: z.boolean().optional(),
    isTrusted: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const deviceQuerySchema = z
  .object({
    includeInactive: z.boolean().optional().default(false),
  })
  .strict();

// Response schemas for validation
export const authResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  user: z
    .object({
      id: z.string().uuid(),
      email: z.string().email(),
      firstName: z.string(),
      twoFactorEnabled: z.boolean(),
    })
    .optional(),
  twoFactorRequired: z.boolean().optional(),
  emailVerificationRequired: z.boolean().optional(),
  accountLocked: z
    .object({
      until: z.string(),
      reason: z.string(),
    })
    .optional(),
});

// Refresh Token
export const refreshTokenSchema = z
  .object({
    sub: z.string(),
    email: emailSchema,
    jti: z.string,
  })
  .strict();

export const tokenPairSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .strict();

// Type inference
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type updateUserDto = z.infer<typeof updateUserSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type TokenSchema = z.infer<typeof tokenSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type ResendVerificationDto = z.infer<typeof resendVerificationSchema>;
export type TwoFactorCodeDto = z.infer<typeof twoFactorCodeSchema>;
export type UpdateDeviceDto = z.infer<typeof updateDeviceSchema>;
export type DeviceQueryDto = z.infer<typeof deviceQuerySchema>;
export type DeviceInfoDto = z.infer<typeof deviceInfoSchema>;
export type AuthResponseDto = z.infer<typeof authResponseSchema>;

// Validation helpers
export const validateRegister = (data: unknown): RegisterDto => {
  return registerSchema.parse(data);
};

export const validateLogin = (data: unknown): LoginDto => {
  return loginSchema.parse(data);
};

export const validateDeviceInfo = (data: unknown): DeviceInfoDto => {
  return deviceInfoSchema.parse(data);
};
