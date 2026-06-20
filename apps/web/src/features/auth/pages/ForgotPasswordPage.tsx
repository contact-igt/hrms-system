import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, authApi } from "../api/auth.api";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { SubmitButton } from "../components/SubmitButton";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/auth.schemas";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const submit = handleSubmit(async ({ email }) => {
    setServerError("");
    try {
      const flow = await authApi.forgotPassword(email);
      navigate("/verify-otp", {
        state: {
          ...flow,
          email,
          purpose: "PASSWORD_RESET",
        },
      });
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Unable to start password recovery.",
      );
    }
  });

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Forgot your password?"
      description="Enter your work email. We will send an OTP if an eligible account exists."
      footer={
        <Link className="inline-back-link" to="/login">
          <ArrowLeft size={14} /> Return to sign in
        </Link>
      }
    >
      <form className="auth-form" onSubmit={submit}>
        {serverError && <div className="form-alert">{serverError}</div>}
        <div className="field-with-icon">
          <Mail size={16} />
          <FormField
            label="Work email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            registration={register("email")}
            error={errors.email}
          />
        </div>
        <SubmitButton loading={isSubmitting}>Send recovery OTP</SubmitButton>
      </form>
    </AuthLayout>
  );
}
