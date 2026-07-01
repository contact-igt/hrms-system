import { Plus, Search, UserRound, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { ManagementShell } from "../../../components/ManagementShell";
import { useAuth } from "../../auth/context/AuthContext";
import {
  organizationApi,
  type OrganizationMember,
} from "../api/organization.api";
import { InviteEmployeeDrawer } from "../components/InviteEmployeeDrawer";

export function OrganizationEmployeesPage() {
  const { accessToken } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);

  const load = () => {
    if (!accessToken) return;
    setLoading(true);
    organizationApi
      .listMembers(accessToken)
      .then(setMembers)
      .catch(() => setError("Employees could not be loaded."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return (
    <ManagementShell
      eyebrow="Organization"
      title="Employees"
      description="Onboard employees and manage organization-level access."
      action={
        <button
          className="management-primary-button"
          type="button"
          onClick={() => setShowInviteDrawer(true)}
        >
          <Plus size={16} /> Invite employee
        </button>
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

      {showInviteDrawer && (
        <div className="drawer-overlay active" onClick={() => setShowInviteDrawer(false)}>
          <div className="drawer open" onClick={(e) => e.stopPropagation()}>
            <InviteEmployeeDrawer onClose={() => setShowInviteDrawer(false)} refresh={load} />
          </div>
        </div>
      )}
    </ManagementShell>
  );
}
