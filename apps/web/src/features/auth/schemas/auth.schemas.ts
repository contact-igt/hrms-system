import { z } from "zod";

const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(64, "Use no more than 64 characters.");

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  organizationCode: z
    .string()
    .trim()
    .min(2, "Organization code is required.")
    .max(20),
});

export const platformLoginSchema = z.object({
  email: z.email("Enter a valid platform email address."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "Enter your first name."),
    lastName: z.string().trim().min(2, "Enter your last name."),
    email: z.email("Enter a valid work email."),
    invitationToken: z.string().trim().min(1, "Invitation token is required."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

// ---- Step 1: Check Your Account ----
export const checkAccountSchema = z.object({
  firstName: z.string().trim().min(2, "Enter your first name."),
  lastName: z.string().trim().min(2, "Enter your last name."),
  email: z.email("Enter a valid work email."),
  companyCode: z.string().trim().min(20, "Paste the full invitation token from your email (at least 20 characters)."),
});

// ---- Step 2: Setup Account Password ----
export const setupPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid work email."),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the six-digit OTP."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type PlatformLoginFormValues = z.infer<typeof platformLoginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type CheckAccountFormValues = z.infer<typeof checkAccountSchema>;
export type SetupPasswordFormValues = z.infer<typeof setupPasswordSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;

