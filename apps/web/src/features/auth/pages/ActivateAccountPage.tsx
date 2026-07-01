import { Mail, ShieldCheck, UserRound, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { AuthLayout } from "../components/AuthLayout";
import { SubmitButton } from "../components/SubmitButton";

export function ActivateAccountPage() {
  // Token may come from:
  //  1. URL path param: /activate-account/:invitationToken  (from invitation email)
  //  2. Legacy query string: /activate-account?invitation=TOKEN  (backward compat)
  const { invitationToken: tokenFromPath } = useParams<{ invitationToken?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const resolvedToken =
    tokenFromPath
      ? decodeURIComponent(tokenFromPath)
      : (searchParams.get("invitation") ?? "");

  const hasToken = resolvedToken.length >= 20;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminDetails, setAdminDetails] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    organizationCode: string;
  } | null>(null);

  useEffect(() => {
    if (!hasToken) return;
    let active = true;
    setLoading(true);
    setError("");

    authApi.getInvitation(resolvedToken)
      .then((data) => {
        if (active) {
          setAdminDetails(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load invitation details. Please check your invitation link.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [resolvedToken, hasToken]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!adminDetails || !hasToken) return;
    navigate("/setup-account-password", {
      state: {
        firstName: adminDetails.firstName,
        lastName: adminDetails.lastName,
        email: adminDetails.email,
        companyCode: resolvedToken,
      },
    });
  };

  return (
    <AuthLayout
      eyebrow="Organization Activation"
      title="Check Your Account"
      description="Verify your invitation details to activate your Orbix HRMS workspace."
    >
      <form className="auth-form" onSubmit={submit}>
        {/* Step Indicator */}
        <div className="act-step-indicator">
          <div className="act-step-dot act-step-active">
            <span>1</span>
          </div>
          <div className="act-step-line" />
          <div className="act-step-dot">
            <span>2</span>
          </div>
          <div className="act-step-line" />
          <div className="act-step-dot">
            <span>3</span>
          </div>
        </div>

        {/* Shield Icon */}
        <div className="activate-icon-wrap">
          <ShieldCheck size={28} strokeWidth={1.8} />
        </div>

        {/* Token status banner */}
        {!hasToken ? (
          <div className="act-token-badge act-token-badge--warn">
            No invitation token found. Please open the link from your invitation email.
          </div>
        ) : error ? (
          <div className="act-token-badge act-token-badge--warn">
            Invalid or expired invitation token. Please check your email link.
          </div>
        ) : (
          <div className="act-token-badge act-token-badge--ok">
            <ShieldCheck size={13} />
            Invitation token detected — ready to activate
          </div>
        )}

        {loading && (
          <div className="activation-loading-wrap">
            <div className="activation-spinner" />
            <div className="activation-loading-text">Fetching invitation details...</div>
          </div>
        )}

        {error && (
          <div className="form-alert" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {!loading && adminDetails && (
          <div className="activation-info-card">
            <div className="activation-info-header">
              <span className="activation-info-header-title">Invitation Verified</span>
            </div>
            
            <div className="activation-info-item">
              <span className="activation-info-label">First Name</span>
              <span className="activation-info-value">
                <UserRound size={13} /> {adminDetails.firstName}
              </span>
            </div>

            <div className="activation-info-item">
              <span className="activation-info-label">Last Name</span>
              <span className="activation-info-value">
                <UserRound size={13} /> {adminDetails.lastName}
              </span>
            </div>

            <div className="activation-info-item">
              <span className="activation-info-label">Work Email</span>
              <span className="activation-info-value">
                <Mail size={13} /> {adminDetails.email}
              </span>
            </div>

            <div className="activation-info-item">
              <span className="activation-info-label">Organization Code</span>
              <span className="activation-info-value">
                <Building2 size={13} /> {adminDetails.organizationCode}
              </span>
            </div>
          </div>
        )}

        <SubmitButton loading={loading} disabled={!hasToken || loading || !!error || !adminDetails}>
          Confirm &amp; Continue
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
