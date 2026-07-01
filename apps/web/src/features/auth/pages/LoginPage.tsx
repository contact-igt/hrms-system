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
  const { organizationLogin } = useAuth();
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
      const user = await organizationLogin(values);
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
      eyebrow="Organization access"
      title="Sign in to your organization"
      description="Enter your organization code and employee credentials."
      footer={
        <p>
          Have an employee invitation? <Link to="/activate-account">Activate account</Link>
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

      <div className="platform-login-link">
        Platform administrator? <Link to="/platform/login">Platform login</Link>
      </div>
    </AuthLayout>
  );
}
