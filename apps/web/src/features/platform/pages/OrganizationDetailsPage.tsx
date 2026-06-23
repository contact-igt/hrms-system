import { Building2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ManagementShell } from "../../../components/ManagementShell";
import { useAuth } from "../../auth/context/AuthContext";
import { platformApi, type OrganizationRecord } from "../api/platform.api";

export function OrganizationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) {
    // If no ID in the URL, go back to the list view.
    navigate("/platform/organizations");
    return null;
  }
  const { accessToken } = useAuth();
  const [organization, setOrganization] = useState<OrganizationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken || !id) return;
    let active = true;

    platformApi
      .getOrganization(id, accessToken)
      .then((record) => {
        if (active) setOrganization(record);
      })
      .catch((err) => {
        if (active) setError("Organization details could not be loaded: " + (err instanceof Error ? err.message : String(err)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [accessToken, id]);

  return (
    <ManagementShell
      eyebrow="Platform"
      title={organization ? organization.name : "Organization Details"}
      description="View organization details and monitor status."
      action={
        <Link className="management-secondary-button" to="/platform/organizations">
          <ArrowLeft size={16} /> Back to organizations
        </Link>
      }
    >
      {loading && <div className="management-empty">Loading organization…</div>}
      {!loading && error && <div className="management-empty error">{error}</div>}
      {!loading && !error && organization && (
        <div className="management-form-card compact">
          <div className="form-section-title">
            <Building2 size={18} />
            <div>
              <strong>Organization Information</strong>
              <span>General details about the organization.</span>
            </div>
          </div>
          
          <div className="management-form-grid" style={{ marginBottom: "20px" }}>
            <label className="full">
              <span>Organization name</span>
              <input value={organization.name} readOnly disabled />
            </label>
            <label>
              <span>Code</span>
              <input value={organization.code} readOnly disabled />
            </label>
            <label>
              <span>Domain</span>
              <input value={organization.domain} readOnly disabled />
            </label>
            <label>
              <span>Status</span>
              <div style={{ marginTop: "8px" }}>
                <span className={`status-badge ${organization.status.toLowerCase()}`}>
                  {organization.status}
                </span>
              </div>
            </label>
            <label>
              <span>Members</span>
              <input value={organization.memberCount} readOnly disabled />
            </label>
          </div>
        </div>
      )}
    </ManagementShell>
  );
}
