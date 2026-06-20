import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export function SsoCallbackPage() {
  const navigate = useNavigate();
  const { acceptSession } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    authApi
      .refresh()
      .then((session) => {
        if (!active) return;
        acceptSession(session);
        navigate(
          session.user.scopeType === "PLATFORM"
            ? "/platform/organizations"
            : "/projects",
          { replace: true },
        );
      })
      .catch(() => {
        if (active) {
          setError("SSO authentication could not be completed.");
        }
      });

    return () => {
      active = false;
    };
  }, [acceptSession, navigate]);

  return (
    <AuthLayout
      eyebrow="Single sign-on"
      title={error ? "SSO sign in failed" : "Completing secure sign in"}
      description={
        error
          ? error
          : "Validating your organization identity and creating your HRMS session."
      }
    >
      <div className="auth-loader embedded">
        <span />
        <p>{error ? "Return to sign in and try again." : "Please wait…"}</p>
      </div>
    </AuthLayout>
  );
}
