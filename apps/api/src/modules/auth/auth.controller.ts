import type { Request, Response } from "express";
import { sendSuccess } from "../../common/utils/response.js";
import { env } from "../../config/env.js";
import {
  logout,
  logoutAll,
  organizationLogin,
  platformLogin,
  refreshSession,
  registerFromInvitation,
  requestOtpLogin,
  requestPasswordReset,
  resendOtpChallenge,
  resetPassword,
  verifyEmailOtp,
  verifyOtpLogin,
  verifyPasswordResetOtp,
  getInvitationByToken,
} from "./auth.service.js";

export const authController = {
  async platformLogin(request: Request, response: Response) {
    const data = await platformLogin(request.body, request, response);
    sendSuccess(response, data, "Platform login successful.");
  },

  async organizationLogin(request: Request, response: Response) {
    const data = await organizationLogin(request.body, request, response);
    sendSuccess(response, data, "Organization login successful.");
  },

  async register(request: Request, response: Response) {
    const data = await registerFromInvitation(request.body);
    sendSuccess(response, data, "Verification OTP sent.", 201);
  },

  async verifyOtp(request: Request, response: Response) {
    const { challengeId, purpose, otp } = request.body;
    if (purpose !== "EMAIL_VERIFICATION") {
      const { AppError } = await import("../../common/errors/app-error.js");
      throw new AppError(
        400,
        "Use the purpose-specific OTP verification endpoint.",
        "AUTH_OTP_PURPOSE_INVALID",
      );
    }
    const data = await verifyEmailOtp({ challengeId, otp }, request, response);
    sendSuccess(response, data, "Email verified successfully.");
  },

  async resendOtp(request: Request, response: Response) {
    const data = await resendOtpChallenge(
      request.body.challengeId,
      request.body.purpose,
    );
    sendSuccess(response, data, "A new OTP was sent.");
  },

  async requestOtpLogin(request: Request, response: Response) {
    const data = await requestOtpLogin(
      request.body.email,
      request.body.organizationCode,
    );
    sendSuccess(
      response,
      data,
      "If an eligible account exists, a login OTP has been sent.",
    );
  },

  async verifyOtpLogin(request: Request, response: Response) {
    const data = await verifyOtpLogin(request.body, request, response);
    sendSuccess(response, data, "OTP login successful.");
  },

  async forgotPassword(request: Request, response: Response) {
    const data = await requestPasswordReset(request.body.email);
    sendSuccess(
      response,
      data,
      "If an eligible account exists, a recovery OTP has been sent.",
    );
  },

  async verifyResetOtp(request: Request, response: Response) {
    const data = await verifyPasswordResetOtp(
      request.body.challengeId,
      request.body.otp,
    );
    sendSuccess(response, data, "OTP verified.");
  },

  async resetPassword(request: Request, response: Response) {
    const data = await resetPassword(
      request.body.resetTicket,
      request.body.password,
    );
    sendSuccess(response, data, "Password reset successfully.");
  },

  async refresh(request: Request, response: Response) {
    const data = await refreshSession(
      request.cookies[env.REFRESH_COOKIE_NAME],
      response,
    );
    if (!data) {
      response.clearCookie(env.REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/v1/auth",
      });
      sendSuccess(response, null, "No active session.");
      return;
    }
    sendSuccess(response, data, "Session refreshed.");
  },

  async logout(request: Request, response: Response) {
    const data = await logout(
      request.cookies[env.REFRESH_COOKIE_NAME],
      response,
    );
    sendSuccess(response, data, "Logged out.");
  },

  async logoutAll(request: Request, response: Response) {
    const data = await logoutAll(request.auth!.userId, response);
    sendSuccess(response, data, "All sessions were revoked.");
  },

  async me(request: Request, response: Response) {
    sendSuccess(response, request.auth, "Current access context.");
  },

  async getInvitation(request: Request, response: Response) {
    const data = await getInvitationByToken(request.params.token as string);
    sendSuccess(response, data, "Invitation retrieved successfully.");
  },

  providers(_request: Request, response: Response) {
    sendSuccess(response, {
      microsoft: false,
      google: false,
    });
  },
};
