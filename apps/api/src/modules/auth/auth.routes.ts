import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validate } from "../../common/middleware/validate.js";
import { authController } from "./auth.controller.js";
import {
  forgotPasswordSchema,
  organizationLoginSchema,
  otpResendSchema,
  otpLoginRequestSchema,
  otpLoginVerifySchema,
  otpVerifySchema,
  platformLoginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyResetOtpSchema,
  getInvitationSchema,
} from "./auth.validation.js";

const sensitiveLimit = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const authRouter = Router();

authRouter.post(
  "/platform/login",
  sensitiveLimit,
  validate(platformLoginSchema),
  authController.platformLogin,
);
authRouter.post(
  "/organization/login",
  sensitiveLimit,
  validate(organizationLoginSchema),
  authController.organizationLogin,
);
authRouter.post(
  "/register",
  sensitiveLimit,
  validate(registerSchema),
  authController.register,
);
authRouter.post(
  "/otp/verify",
  sensitiveLimit,
  validate(otpVerifySchema),
  authController.verifyOtp,
);
authRouter.post(
  "/otp/resend",
  sensitiveLimit,
  validate(otpResendSchema),
  authController.resendOtp,
);
authRouter.post(
  "/login/otp/request",
  sensitiveLimit,
  validate(otpLoginRequestSchema),
  authController.requestOtpLogin,
);
authRouter.post(
  "/login/otp/verify",
  sensitiveLimit,
  validate(otpLoginVerifySchema),
  authController.verifyOtpLogin,
);
authRouter.post(
  "/forgot-password",
  sensitiveLimit,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  "/forgot-password/verify-otp",
  sensitiveLimit,
  validate(verifyResetOtpSchema),
  authController.verifyResetOtp,
);
authRouter.post(
  "/reset-password",
  sensitiveLimit,
  validate(resetPasswordSchema),
  authController.resetPassword,
);
authRouter.get(
  "/invitations/:token",
  sensitiveLimit,
  validate(getInvitationSchema),
  authController.getInvitation,
);
authRouter.post("/refresh", sensitiveLimit, authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.post("/logout-all", authenticate, authController.logoutAll);
authRouter.get("/me", authenticate, authController.me);
authRouter.get("/sso/providers", authController.providers);
