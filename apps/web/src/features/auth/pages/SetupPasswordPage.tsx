import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError, authApi } from "../api/auth.api";
import {
  setupPasswordSchema,
  type SetupPasswordFormValues,
} from "../schemas/auth.schemas";
import type { CheckAccountFormValues } from "../schemas/auth.schemas";

function getStrength(pwd: string): number {
  let score = 0;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["", "#e57373", "#ffa726", "#aed581", "#66bb6a"];

export function SetupPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const accountData = location.state as CheckAccountFormValues | null;
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetupPasswordFormValues>({
    resolver: zodResolver(setupPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password") ?? "";
  const strength = getStrength(passwordValue);

  const submit = handleSubmit(async (values) => {
    if (!accountData) {
      navigate("/activate-account");
      return;
    }
    setServerError("");
    try {
      const flow = await authApi.register({
        firstName: accountData.firstName,
        lastName: accountData.lastName,
        email: accountData.email,
        password: values.password,
        invitationToken: accountData.companyCode,
      });
      navigate("/otp-verification", { state: flow });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errors && error.errors.length > 0) {
          // Show field-level validation errors from backend
          const details = error.errors
            .map((e) => e.field !== "_form" ? `${e.field}: ${e.message}` : e.message)
            .join(" • ");
          setServerError(`${error.message} — ${details}`);
        } else {
          setServerError(error.message);
        }
      } else {
        setServerError("Unable to set up your account. Please try again.");
      }
    }
  });

  if (!accountData) {
    navigate("/activate-account");
    return null;
  }

  return (
    <main className="setup-page">
      {/* Left panel */}
      <aside className="setup-left">
        <Link className="setup-brand" to="/login">
          <span className="auth-brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>Orbix HRMS</strong>
            <small>People operations, clearly managed.</small>
          </span>
        </Link>

        <div className="setup-left-body">
          <h2>Secure your workspace</h2>
          <p>
            Create a strong password to protect your Orbix HRMS account and all
            your team data.
          </p>
          <div className="setup-tips">
            <div className="setup-tip">
              <span className="setup-tip-icon">
                <CheckCircle2 size={13} />
              </span>
              At least 12 characters long
            </div>
            <div className="setup-tip">
              <span className="setup-tip-icon">
                <CheckCircle2 size={13} />
              </span>
              Mix uppercase, numbers &amp; symbols
            </div>
            <div className="setup-tip">
              <span className="setup-tip-icon">
                <CheckCircle2 size={13} />
              </span>
              Avoid common phrases or names
            </div>
          </div>

          {/* Account summary */}
          <div className="setup-account-summary">
            <ShieldCheck size={15} />
            <span>
              Setting up for <strong>{accountData.email}</strong>
            </span>
          </div>
        </div>
      </aside>

      {/* Right panel */}
      <section className="setup-right">
        <div className="setup-card">
          {/* Step indicator */}
          <div className="act-step-indicator setup-steps">
            <div className="act-step-dot act-step-done">
              <CheckCircle2 size={14} />
            </div>
            <div className="act-step-line act-step-line-done" />
            <div className="act-step-dot act-step-active">
              <span>2</span>
            </div>
            <div className="act-step-line" />
            <div className="act-step-dot">
              <span>3</span>
            </div>
          </div>

          {/* Back */}
          <button
            type="button"
            className="setup-back-btn"
            onClick={() =>
              navigate("/activate-account", { state: accountData })
            }
          >
            <ArrowLeft size={14} />
            Back to account check
          </button>

          {/* Icon + heading */}
          <div className="setup-lock-icon">
            <Lock size={26} strokeWidth={1.8} />
          </div>
          <h1 className="setup-heading">Setup Account Password</h1>
          <p className="setup-desc">
            Choose a strong, unique password to secure your account.
          </p>

          {/* Error */}
          {serverError && <div className="form-alert">{serverError}</div>}

          <form onSubmit={submit} className="setup-form">
            {/* Password */}
            <div className="setup-field">
              <label htmlFor="setup-password">Create Password</label>
              <div className="setup-field-input">
                <input
                  id="setup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 12 characters"
                  autoComplete="new-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="setup-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {passwordValue.length > 0 && (
                <>
                  <div className="strength-bar">
                    {[1, 2, 3, 4].map((seg) => (
                      <div
                        key={seg}
                        className="strength-seg"
                        style={{
                          background:
                            seg <= strength
                              ? strengthColors[strength]
                              : "#e4e8e0",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="strength-label"
                    style={{ color: strengthColors[strength] }}
                  >
                    {strengthLabels[strength]}
                  </span>
                </>
              )}
              {errors.password && <small className="setup-field-error">{errors.password.message}</small>}
            </div>

            {/* Confirm Password */}
            <div className="setup-field">
              <label htmlFor="setup-confirm">Confirm Password</label>
              <div className="setup-field-input">
                <input
                  id="setup-confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  className="setup-eye-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <small className="setup-field-error">{errors.confirmPassword.message}</small>
              )}
            </div>

            <button
              type="submit"
              className="setup-submit-btn"
              disabled={isSubmitting}
            >
              <Send size={16} />
              {isSubmitting ? "Sending OTP…" : "Send Verification OTP"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
