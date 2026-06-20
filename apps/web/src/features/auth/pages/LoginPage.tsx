import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api/auth.api";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { SsoButtons } from "../components/SsoButtons";
import { SubmitButton } from "../components/SubmitButton";
import { useAuth } from "../context/AuthContext";
import {
  loginSchema,
  type LoginFormValues,
} from "../schemas/auth.schemas";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      organizationCode: "",
    },
  });

  const submit = handleSubmit(async (values) => {
    setServerError("");
    try {
      const user = await login({
        ...values,
        organizationCode: values.organizationCode || undefined,
      });
      const requestedPath = (
        location.state as { from?: string } | null
      )?.from;
      const destination =
        requestedPath ??
        (user.scopeType === "PLATFORM"
          ? "/platform/organizations"
          : "/projects");
      navigate(destination, { replace: true });
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    }
  });

  return (
    <AuthLayout
      eyebrow="Secure access"
      title="Welcome back"
      description="Sign in to your platform or organization workspace."
      footer={
        <p>
          Have an employee invitation? <Link to="/register">Activate account</Link>
        </p>
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

        <div className="field-with-icon">
          <LockKeyhole size={16} />
          <FormField
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            registration={register("password")}
            error={errors.password}
          />
        </div>

        <div className="field-with-icon">
          <Building2 size={16} />
          <FormField
            label="Organization code"
            placeholder="Example: ACME"
            autoCapitalize="characters"
            registration={register("organizationCode")}
            error={errors.organizationCode}
            hint="Leave blank only for Platform Super Admin access."
          />
        </div>

        <div className="auth-form-meta">
          <label>
            <input type="checkbox" /> Keep me signed in
          </label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <SubmitButton loading={isSubmitting}>Sign in securely</SubmitButton>
      </form>

      <SsoButtons />
    </AuthLayout>
  );
}
