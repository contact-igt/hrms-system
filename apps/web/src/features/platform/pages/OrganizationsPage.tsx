import { Building2, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ManagementShell } from "../../../components/ManagementShell";
import { useAuth } from "../../auth/context/AuthContext";
import {
  platformApi,
  type OrganizationRecord,
} from "../api/platform.api";

export function OrganizationsPage() {
  const { accessToken } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    let active = true;

    platformApi
      .listOrganizations(accessToken)
      .then((records) => {
        if (active) setOrganizations(records);
      })
      .catch(() => {
        if (active) setError("Organizations could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  return (
    <ManagementShell
      eyebrow="Platform"
      title="Organizations"
      description="Create organizations, monitor activation, and control platform access."
      action={
        <Link className="management-primary-button" to="/platform/organizations/new">
          <Plus size={16} /> New organization
        </Link>
      }
    >
      <div className="management-toolbar">
        <label>
          <Search size={16} />
          <input placeholder="Search organizations" />
        </label>
        <button type="button">All statuses</button>
      </div>

      <div className="management-table-card">
        <table>
          <thead>
            <tr>
              <th>Organization</th>
              <th>Code</th>
              <th>Domain</th>
              <th>Members</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((organization) => (
              <tr key={organization.id}>
                <td>
                  <span className="organization-cell">
                    <i>
                      <Building2 size={16} />
                    </i>
                    <strong>{organization.name}</strong>
                  </span>
                </td>
                <td>{organization.code}</td>
                <td>{organization.domain}</td>
                <td>{organization.memberCount}</td>
                <td>
                  <span className={`status-badge ${organization.status.toLowerCase()}`}>
                    {organization.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <div className="management-empty">Loading organizations…</div>}
        {!loading && error && <div className="management-empty error">{error}</div>}
        {!loading && !error && organizations.length === 0 && (
          <div className="management-empty">
            <Building2 size={25} />
            <strong>No organizations yet</strong>
            <span>Create the first organization and invite its administrator.</span>
          </div>
        )}
      </div>
    </ManagementShell>
  );
}
