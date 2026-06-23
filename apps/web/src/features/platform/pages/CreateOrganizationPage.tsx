import { ArrowLeft, Building2, Mail, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ManagementShell } from "../../../components/ManagementShell";
import { useAuth } from "../../auth/context/AuthContext";
import { platformApi } from "../api/platform.api";

export function CreateOrganizationPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    setSubmitting(true);
    setError("");

    const data = new FormData(event.currentTarget);
    try {
      await platformApi.createOrganization(
        {
          name: String(data.get("name")),
          code: String(data.get("code")).toUpperCase(),
          domain: String(data.get("domain")),
          admin: {
            firstName: String(data.get("firstName")),
            lastName: String(data.get("lastName")),
            email: String(data.get("email")),
          },
        },
        accessToken,
      );
      navigate("/platform/organizations");
    } catch (error: any) {
      const message = error?.message || 'The organization could not be created.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ManagementShell
      eyebrow="Platform"
      title="Create organization"
      description="Create the tenant and invite its first Organization Admin."
      action={
        <Link className="management-secondary-button" to="/platform/organizations">
          <ArrowLeft size={15} /> Back
        </Link>
      }
    >
      <form className="management-form-card" onSubmit={submit}>
        {error && <div className="form-alert">{error}</div>}
        <div className="form-section-title">
          <Building2 size={18} />
          <div>
            <strong>Organization details</strong>
            <span>These values define the organization tenant.</span>
          </div>
        </div>
        <div className="management-form-grid">
          <label>
            <span>Organization name</span>
            <input name="name" placeholder="Acme Private Limited" required />
          </label>
          <label>
            <span>Organization code</span>
            <input name="code" placeholder="ACME" maxLength={20} required />
          </label>
          <label className="full">
            <span>Approved domain</span>
            <input name="domain" placeholder="acme.com" required />
          </label>
        </div>

        <div className="form-section-title divided">
          <UserRound size={18} />
          <div>
            <strong>First Organization Admin</strong>
            <span>An invitation and OTP will be sent after creation.</span>
          </div>
        </div>
        <div className="management-form-grid">
          <label>
            <span>First name</span>
            <input name="firstName" placeholder="Priya" required />
          </label>
          <label>
            <span>Last name</span>
            <input name="lastName" placeholder="Shah" required />
          </label>
          <label className="full">
            <span>Admin email</span>
            <div className="management-input-icon">
              <Mail size={16} />
              <input name="email" type="email" placeholder="priya@acme.com" required />
            </div>
          </label>
        </div>

        <button className="management-primary-button form-submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create organization and send invitation"}
        </button>
      </form>
    </ManagementShell>
  );
}
