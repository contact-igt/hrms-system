import type {
  ApiFailure,
  ApiSuccess,
  AuthSession,
  LoginInput,
  OtpFlowState,
  OtpPurpose,
  RegisterInput,
} from "../types/auth.types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1";

export class ApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const payload = (await response.json().catch(() => ({
    success: false,
    message: "The server returned an invalid response.",
  }))) as ApiSuccess<T> | ApiFailure;

  if (!response.ok || !payload.success) {
    throw new ApiError(payload.message, "code" in payload ? payload.code : undefined);
  }

  return payload.data;
}

export const authApi = {
  login(input: LoginInput) {
    return apiRequest<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  register(input: RegisterInput) {
    return apiRequest<OtpFlowState>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  verifyOtp(input: {
    challengeId: string;
    purpose: OtpPurpose;
    otp: string;
  }) {
    return apiRequest<AuthSession | { resetTicket: string }>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  resendOtp(input: { challengeId: string; purpose: OtpPurpose }) {
    return apiRequest<OtpFlowState>("/auth/otp/resend", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  forgotPassword(email: string) {
    return apiRequest<OtpFlowState>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  verifyResetOtp(input: { challengeId: string; otp: string }) {
    return apiRequest<{ resetTicket: string }>(
      "/auth/forgot-password/verify-otp",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },

  resetPassword(input: { resetTicket: string; password: string }) {
    return apiRequest<{ completed: true }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  refresh() {
    return apiRequest<AuthSession>("/auth/refresh", { method: "POST" });
  },

  logout(accessToken: string | null) {
    return apiRequest<{ completed: true }>(
      "/auth/logout",
      { method: "POST" },
      accessToken,
    );
  },
};
