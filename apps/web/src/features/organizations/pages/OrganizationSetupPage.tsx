import { Building2, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ManagementShell } from "../../../components/ManagementShell";
import { useAuth } from "../../auth/context/AuthContext";
import { organizationApi } from "../api/organization.api";

export function OrganizationSetupPage() {
  const { accessToken, user } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    const data = new FormData(event.currentTarget);
    setMessage("");
    setError("");
    try {
      await organizationApi.updateSettings(
        {
          name: String(data.get("name")),
          domain: String(data.get("domain")),
          timezone: String(data.get("timezone")),
        },
        accessToken,
      );
      setMessage("Organization settings updated.");
    } catch {
      setError("Organization settings could not be updated.");
    }
  };

  return (
    <ManagementShell
      eyebrow="Organization"
      title="Organization setup"
      description="Manage the identity and regional defaults for your organization."
    >
      <form className="management-form-card compact" onSubmit={submit}>
        {message && (
          <div className="form-success">
            <CheckCircle2 size={15} /> {message}
          </div>
        )}
        {error && <div className="form-alert">{error}</div>}
        <div className="form-section-title">
          <Building2 size={18} />
          <div>
            <strong>Organization profile</strong>
            <span>Only Organization Admins can update these values.</span>
          </div>
        </div>
        <div className="management-form-grid">
          <label className="full">
            <span>Organization name</span>
            <input
              name="name"
              defaultValue={user?.organization?.name}
              required
            />
          </label>
          <label>
            <span>Approved domain</span>
            <input name="domain" placeholder="company.com" required />
          </label>
          <label>
            <span>Timezone</span>
            <select name="timezone" defaultValue="Asia/Kolkata">
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </label>
        </div>
        <button className="management-primary-button form-submit">
          Save organization settings
        </button>
      </form>
    </ManagementShell>
  );
}
