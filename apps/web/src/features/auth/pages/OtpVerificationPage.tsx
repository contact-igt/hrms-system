import { CheckCircle2, MailCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError, authApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import type { AuthSession, OtpFlowState } from "../types/auth.types";

function isAuthSession(value: unknown): value is AuthSession {
  return Boolean(
    value &&
      typeof value === "object" &&
      "accessToken" in value &&
      "user" in value,
  );
}

export function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { acceptSession } = useAuth();
  const flow = location.state as OtpFlowState | null;

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  if (!flow) {
    return (
      <main className="otp-ver-page">
        <div className="otp-ver-card otp-ver-card--expired">
          <div className="otp-ver-icon otp-ver-icon--error">
            <MailCheck size={28} />
          </div>
          <h1>OTP Session Expired</h1>
          <p>Restart the activation process to request a new OTP code.</p>
          <Link to="/activate-account" className="otp-ver-restart-btn">
            Restart Account Activation
          </Link>
        </div>
      </main>
    );
  }

  const otp = digits.join("");

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newDigits = [
      ...pasted.split(""),
      ...Array(6).fill(""),
    ].slice(0, 6);
    setDigits(newDigits);
    const nextEmpty = newDigits.findIndex((d) => d === "");
    const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setSubmitting(true);
    setServerError("");
    setMessage("");
    try {
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
        error instanceof ApiError
          ? error.message
          : "The OTP could not be verified. Please try again.",
      );
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (seconds > 0) return;
    setServerError("");
    try {
      await authApi.resendOtp({
        challengeId: flow.challengeId,
        purpose: flow.purpose,
      });
      setSeconds(60);
      setMessage("A new OTP has been sent to your email.");
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (error) {
      setServerError(
        error instanceof ApiError ? error.message : "Unable to resend OTP.",
      );
    }
  };

  return (
    <main className="otp-ver-page">
      <div className="otp-ver-card">
        {/* Brand */}
        <Link className="otp-ver-brand" to="/login">
          <span className="auth-brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          <strong>Orbix HRMS</strong>
        </Link>

        {/* Step indicator */}
        <div className="act-step-indicator otp-steps">
          <div className="act-step-dot act-step-done">
            <CheckCircle2 size={14} />
          </div>
          <div className="act-step-line act-step-line-done" />
          <div className="act-step-dot act-step-done">
            <CheckCircle2 size={14} />
          </div>
          <div className="act-step-line act-step-line-done" />
          <div className="act-step-dot act-step-active">
            <span>3</span>
          </div>
        </div>

        {/* Icon */}
        <div className="otp-ver-icon">
          <MailCheck size={32} strokeWidth={1.7} />
        </div>

        <h1>OTP Verification</h1>
        <p className="otp-ver-desc">
          We sent a 6-digit code to{" "}
          <strong>{flow.maskedDestination}</strong>.<br />
          Enter it below to complete your account setup.
        </p>

        {/* Alerts */}
        {serverError && <div className="form-alert otp-ver-alert">{serverError}</div>}
        {message && <div className="form-success otp-ver-alert">{message}</div>}

        {/* 6-box OTP input */}
        <form onSubmit={handleSubmit}>
          <div className="otp-boxes" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                className={`otp-digit-box${digit ? " otp-digit-filled" : ""}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                autoComplete="one-time-code"
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            className="otp-complete-btn"
            disabled={otp.length < 6 || submitting}
          >
            {submitting ? (
              <>
                <span className="otp-spinner" />
                Verifying…
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Complete Setup
              </>
            )}
          </button>
        </form>

        {/* Resend */}
        <div className="otp-ver-resend">
          {seconds > 0 ? (
            <span className="otp-ver-timer">
              <span className="otp-timer-ring" />
              Resend OTP in {seconds}s
            </span>
          ) : (
            <button
              type="button"
              className="otp-resend-btn"
              onClick={resend}
            >
              Resend OTP
            </button>
          )}
        </div>

        <p className="otp-ver-footer">
          Wrong account?{" "}
          <Link to="/login">Return to sign in</Link>
        </p>
      </div>
    </main>
  );
}
