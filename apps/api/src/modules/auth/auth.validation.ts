import { z } from "zod";

const email = z.email().transform((value) => value.trim().toLowerCase());
const password = z.string().min(12).max(64);

export const platformLoginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const organizationLoginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1),
    organizationCode: z.string().trim().min(2).max(30).transform((value) => value.toUpperCase()),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(90),
    lastName: z.string().trim().min(2).max(90),
    email,
    password,
    invitationToken: z.string().min(20),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const otpVerifySchema = z.object({
  body: z.object({
    challengeId: z.uuid(),
    purpose: z.enum(["EMAIL_VERIFICATION", "LOGIN", "PASSWORD_RESET"]),
    otp: z.string().regex(/^\d{6}$/),
    organizationCode: z.string().trim().max(30).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const otpResendSchema = z.object({
  body: z.object({
    challengeId: z.uuid(),
    purpose: z.enum(["EMAIL_VERIFICATION", "LOGIN", "PASSWORD_RESET"]),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email }),
  params: z.object({}),
  query: z.object({}),
});

export const verifyResetOtpSchema = z.object({
  body: z.object({
    challengeId: z.uuid(),
    otp: z.string().regex(/^\d{6}$/),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    resetTicket: z.string().min(20),
    password,
  }),
  params: z.object({}),
  query: z.object({}),
});

export const otpLoginRequestSchema = z.object({
  body: z.object({
    email,
    organizationCode: z.string().trim().min(2).max(30).transform((value) => value.toUpperCase()),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const otpLoginVerifySchema = z.object({
  body: z.object({
    challengeId: z.uuid(),
    otp: z.string().regex(/^\d{6}$/),
    organizationCode: z.string().trim().min(2).max(30).transform((value) => value.toUpperCase()),
  }),
  params: z.object({}),
  query: z.object({}),
});
