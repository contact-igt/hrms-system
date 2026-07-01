import { Building2, Mail, UserRound, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { platformApi } from "../api/platform.api";

export function CreateOrganizationDrawer({ onClose, refresh }: { onClose: () => void; refresh: () => void; }) {
  const { accessToken } = useAuth();
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
      // refresh parent list and close drawer
      refresh();
      onClose();
    } catch (error: any) {
      const message = error?.message || "The organization could not be created.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="drawer-content">
      <div className="drawer-header">
        <h2 className="drawer-title">Create organization</h2>
        <button onClick={onClose} className="drawer-close-btn">
          <X size={20} />
        </button>
      </div>
      <form className="drawer-form" onSubmit={submit}>
        <div className="drawer-body">
          {error && <div className="form-alert">{ error}</div>}
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
              <span>Invitation can be sent after creation from the organizations list.</span>
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
        </div>
        <div className="drawer-form-actions">
          <button type="button" className="management-secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="management-primary-button" disabled={submitting}>
            {submitting ? "Creating…" : "Create Organization"}
          </button>
        </div>
      </form>
    </div>
  );
}
