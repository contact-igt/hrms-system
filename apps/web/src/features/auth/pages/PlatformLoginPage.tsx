import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api/auth.api";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { SubmitButton } from "../components/SubmitButton";
import { useAuth } from "../context/AuthContext";
import {
  platformLoginSchema,
  type PlatformLoginFormValues,
} from "../schemas/auth.schemas";

export function PlatformLoginPage() {
  const { platformLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlatformLoginFormValues>({
    resolver: zodResolver(platformLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(async (values) => {
    setServerError("");
    try {
      const user = await platformLogin(values);

      if (user.scopeType !== "PLATFORM") {
        setServerError("This account does not have platform access.");
        return;
      }

      const requestedPath = (
        location.state as { from?: string } | null
      )?.from;
      navigate(requestedPath ?? "/platform/organizations", { replace: true });
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Unable to sign in to the platform.",
      );
    }
  });

  return (
    <AuthLayout
      eyebrow="Platform administration"
      title="Platform Admin"
      description="Securely sign in to create and manage organizations."
      footer={
        <p>
          Organization member? <Link to="/login">Organization login</Link>
        </p>
      }
    >
      <div className="platform-access-notice">
        <ShieldCheck size={18} />
        <div>
          <strong>Restricted platform access</strong>
          <span>
            Platform accounts are created only through the secure bootstrap
            process.
          </span>
        </div>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {serverError && <div className="form-alert">{serverError}</div>}

        <div className="field-with-icon">
          <Mail size={16} />
          <FormField
            label="Platform email"
            type="email"
            placeholder="admin@platform.com"
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

        <div className="auth-form-meta">
          <span />
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <SubmitButton loading={isSubmitting}>
          Open platform workspace
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
