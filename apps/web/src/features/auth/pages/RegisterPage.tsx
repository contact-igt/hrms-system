import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, authApi } from "../api/auth.api";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { SubmitButton } from "../components/SubmitButton";
import {
  registerSchema,
  type RegisterFormValues,
} from "../schemas/auth.schemas";

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      invitationToken: searchParams.get("invitation") ?? "",
    },
  });

  const submit = handleSubmit(async (values) => {
    setServerError("");
    try {
      const flow = await authApi.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        invitationToken: values.invitationToken,
      });
      navigate("/verify-otp", { state: flow });
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Unable to activate this invitation.",
      );
    }
  });

  return (
    <AuthLayout
      eyebrow="Employee activation"
      title="Create your account"
      description="Use the invitation sent by your organization administrator."
      footer={
        <p>
          Already activated? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={submit}>
        {serverError && <div className="form-alert">{serverError}</div>}

        <div className="two-field-grid">
          <div className="field-with-icon">
            <UserRound size={16} />
            <FormField
              label="First name"
              placeholder="Asha"
              autoComplete="given-name"
              registration={register("firstName")}
              error={errors.firstName}
            />
          </div>
          <FormField
            label="Last name"
            placeholder="Kumar"
            autoComplete="family-name"
            registration={register("lastName")}
            error={errors.lastName}
          />
        </div>

        <div className="field-with-icon">
          <Mail size={16} />
          <FormField
            label="Work email"
            type="email"
            placeholder="asha@company.com"
            autoComplete="email"
            registration={register("email")}
            error={errors.email}
          />
        </div>

        <div className="field-with-icon">
          <KeyRound size={16} />
          <FormField
            label="Invitation token"
            placeholder="Paste your invitation token"
            registration={register("invitationToken")}
            error={errors.invitationToken}
          />
        </div>

        <FormField
          label="Create password"
          type="password"
          placeholder="Minimum 12 characters"
          autoComplete="new-password"
          registration={register("password")}
          error={errors.password}
          hint="Use at least 12 characters."
        />
        <FormField
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          registration={register("confirmPassword")}
          error={errors.confirmPassword}
        />

        <SubmitButton loading={isSubmitting}>Send verification OTP</SubmitButton>
      </form>
    </AuthLayout>
  );
}
