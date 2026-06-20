import { Plus, Search, UserRound, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ManagementShell } from "../../../components/ManagementShell";
import { useAuth } from "../../auth/context/AuthContext";
import {
  organizationApi,
  type OrganizationMember,
} from "../api/organization.api";

export function OrganizationEmployeesPage() {
  const { accessToken } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    organizationApi
      .listMembers(accessToken)
      .then((records) => {
        if (active) setMembers(records);
      })
      .catch(() => {
        if (active) setError("Employees could not be loaded.");
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
      eyebrow="Organization"
      title="Employees"
      description="Onboard employees and manage organization-level access."
      action={
        <Link
          className="management-primary-button"
          to="/organization/employees/invite"
        >
          <Plus size={16} /> Invite employee
        </Link>
      }
    >
      <div className="management-toolbar">
        <label>
          <Search size={16} />
          <input placeholder="Search employees" />
        </label>
        <button type="button">All roles</button>
        <button type="button">All statuses</button>
      </div>

      <div className="management-table-card">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee code</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  <span className="organization-cell">
                    <i>
                      <UserRound size={16} />
                    </i>
                    <span>
                      <strong>{member.name}</strong>
                      <small>{member.email}</small>
                    </span>
                  </span>
                </td>
                <td>{member.employeeCode}</td>
                <td>{member.role.replace(/_/g, " ")}</td>
                <td>
                  <span className={`status-badge ${member.status.toLowerCase()}`}>
                    {member.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="management-empty">Loading employees…</div>}
        {!loading && error && <div className="management-empty error">{error}</div>}
        {!loading && !error && members.length === 0 && (
          <div className="management-empty">
            <UsersRound size={25} />
            <strong>No employees yet</strong>
            <span>Invite the first employee to this organization.</span>
          </div>
        )}
      </div>
    </ManagementShell>
  );
}
