import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError, authApi } from "../api/auth.api";
import { AuthLayout } from "../components/AuthLayout";
import { SubmitButton } from "../components/SubmitButton";
import { useAuth } from "../context/AuthContext";
import { otpSchema, type OtpFormValues } from "../schemas/auth.schemas";
import type {
  AuthSession,
  OtpFlowState,
} from "../types/auth.types";

function isAuthSession(value: unknown): value is AuthSession {
  return Boolean(
    value &&
      typeof value === "object" &&
      "accessToken" in value &&
      "user" in value,
  );
}

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { acceptSession } = useAuth();
  const flow = location.state as OtpFlowState | null;
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const [seconds, setSeconds] = useState(60);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  if (!flow) {
    return (
      <AuthLayout
        eyebrow="Verification"
        title="OTP session expired"
        description="Restart the authentication flow to request a new OTP."
      >
        <Link className="auth-secondary-action" to="/login">
          <ArrowLeft size={16} /> Return to sign in
        </Link>
      </AuthLayout>
    );
  }

  const submit = handleSubmit(async ({ otp }) => {
    setServerError("");
    setMessage("");
    try {
      if (flow.purpose === "PASSWORD_RESET") {
        const result = await authApi.verifyResetOtp({
          challengeId: flow.challengeId,
          otp,
        });
        navigate("/reset-password", {
          replace: true,
          state: { resetTicket: result.resetTicket },
        });
        return;
      }

      const result = await authApi.verifyOtp({
        challengeId: flow.challengeId,
        purpose: flow.purpose,
        otp,
      });

      if (isAuthSession(result)) {
        acceptSession(result);
        navigate(
          result.user.scopeType === "PLATFORM"
            ? "/platform/organizations"
            : "/projects",
          { replace: true },
        );
      } else {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      setServerError(
        error instanceof ApiError ? error.message : "The OTP could not be verified.",
      );
    }
  });

  const resend = async () => {
    if (seconds > 0) return;
    setServerError("");
    try {
      await authApi.resendOtp({
        challengeId: flow.challengeId,
        purpose: flow.purpose,
      });
      setSeconds(60);
      setMessage("A new OTP has been sent.");
      setValue("otp", "");
    } catch (error) {
      setServerError(
        error instanceof ApiError ? error.message : "Unable to resend OTP.",
      );
    }
  };

  return (
    <AuthLayout
      eyebrow="Identity verification"
      title="Enter your OTP"
      description={`We sent a six-digit code to ${flow.maskedDestination}.`}
      footer={
        <p>
          Wrong account? <Link to="/login">Return to sign in</Link>
        </p>
      }
    >
      <div className="otp-icon">
        <MailCheck size={25} />
      </div>
      <form className="auth-form" onSubmit={submit}>
        {serverError && <div className="form-alert">{serverError}</div>}
        {message && <div className="form-success">{message}</div>}

        <label className="otp-field">
          <span>Six-digit OTP</span>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            {...register("otp")}
          />
          {errors.otp && <small>{errors.otp.message}</small>}
        </label>

        <SubmitButton loading={isSubmitting}>Verify and continue</SubmitButton>
      </form>

      <button
        className="resend-button"
        type="button"
        onClick={resend}
        disabled={seconds > 0}
      >
        {seconds > 0 ? `Resend OTP in ${seconds}s` : "Resend OTP"}
      </button>
    </AuthLayout>
  );
}
