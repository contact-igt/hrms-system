import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError, authApi } from "../api/auth.api";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { SubmitButton } from "../components/SubmitButton";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/auth.schemas";

export function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const resetTicket = (
    location.state as { resetTicket?: string } | null
  )?.resetTicket;
  const [serverError, setServerError] = useState("");
  const [completed, setCompleted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!resetTicket) {
    return (
      <AuthLayout
        eyebrow="Password reset"
        title="Reset session expired"
        description="Request a new password reset OTP to continue."
      >
        <Link className="auth-secondary-action" to="/forgot-password">
          Request a new OTP
        </Link>
      </AuthLayout>
    );
  }

  const submit = handleSubmit(async ({ password }) => {
    setServerError("");
    try {
      await authApi.resetPassword({ resetTicket, password });
      setCompleted(true);
      window.setTimeout(() => navigate("/login", { replace: true }), 1300);
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Unable to reset the password.",
      );
    }
  });

  return (
    <AuthLayout
      eyebrow="Secure password"
      title="Create a new password"
      description="Your new password will revoke all existing HRMS sessions."
    >
      {completed ? (
        <div className="completion-state">
          <CheckCircle2 size={34} />
          <h3>Password updated</h3>
          <p>Redirecting you to secure sign in…</p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          {serverError && <div className="form-alert">{serverError}</div>}
          <FormField
            label="New password"
            type="password"
            placeholder="Minimum 12 characters"
            autoComplete="new-password"
            registration={register("password")}
            error={errors.password}
          />
          <FormField
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword}
          />
          <SubmitButton loading={isSubmitting}>Reset password</SubmitButton>
        </form>
      )}
    </AuthLayout>
  );
}
