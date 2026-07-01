import { AlertTriangle, Building2, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ManagementShell } from "../../../components/ManagementShell";
import { useAuth } from "../../auth/context/AuthContext";

import { CreateOrganizationDrawer } from "../components/CreateOrganizationDrawer";
import {
  platformApi,
  type OrganizationRecord,
} from "../api/platform.api";

export function OrganizationsPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();


  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orgToDelete, setOrgToDelete] = useState<OrganizationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!orgToDelete || !accessToken) return;
    setIsDeleting(true);
    try {
      await platformApi.deleteOrganization(orgToDelete.id, accessToken);
      setOrganizations((prev) => prev.filter((o) => o.id !== orgToDelete.id));
      setOrgToDelete(null);
    } catch (err) {
      alert("Delete failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInviteAdmin = async (orgId: string, isResend = false) => {
    if (isResend) {
      const email = window.prompt("Enter admin email to resend invitation:");
      if (!email) return;
      const firstName = window.prompt("Enter admin first name:");
      if (!firstName) return;
      const lastName = window.prompt("Enter admin last name:");
      if (!lastName) return;

      try {
        await platformApi.inviteOrganizationAdmin(orgId, { firstName, lastName, email }, accessToken!);
        alert("Invitation resent successfully");
        setOrganizations((prev) =>
          prev.map((o) => (o.id === orgId ? { ...o, status: "PENDING" } : o))
        );
      } catch (err) {
        alert("Failed: " + (err instanceof Error ? err.message : String(err)));
      }
    } else {
      try {
        await platformApi.inviteOrganizationAdmin(orgId, undefined, accessToken!);
        alert("Invitation sent successfully");
        setOrganizations((prev) =>
          prev.map((o) => (o.id === orgId ? { ...o, status: "PENDING" } : o))
        );
      } catch (err) {
        alert("Failed: " + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

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
        <button className="management-primary-button" onClick={() => setShowCreateDrawer(true)}>
          <Plus size={16} /> New organization
        </button>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((organization) => (
              <tr 
                key={organization.id} 
                onClick={() => navigate(`/platform/organizations/${organization.id}`)}
                className="clickable-row"
              >
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
                    {organization.status === 'NOT_INVITED' ? 'Not Invited' : organization.status}
                  </span>
                </td>
                <td className="action-cell">
                  <div className="action-icons-group">
                    {organization.status === 'ACTIVE' && (
                      <>
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="Edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/platform/organizations/${organization.id}/edit`);
                          }}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn action-icon-btn--danger"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrgToDelete(organization);
                          }}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </>
                    )}
                    {organization.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="Resend Invite"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInviteAdmin(organization.id, true);
                          }}
                        >
                          <span className="material-symbols-outlined">refresh</span>
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="Edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/platform/organizations/${organization.id}/edit`);
                          }}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn action-icon-btn--danger"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrgToDelete(organization);
                          }}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </>
                    )}
                    {!(organization.status === 'ACTIVE' || organization.status === 'PENDING') && (
                      <>
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="Invite"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInviteAdmin(organization.id, false);
                          }}
                        >
                          <span className="material-symbols-outlined">mail</span>
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="Edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/platform/organizations/${organization.id}/edit`);
                          }}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn action-icon-btn--danger"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrgToDelete(organization);
                          }}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </>
                    )}
                  </div>
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

        {/* Drawer overlay */}
          {showCreateDrawer &&            <div className="drawer-overlay active" onClick={() => setShowCreateDrawer(false)}>
            {/* Stop propagation to prevent closing when clicking inside drawer */}
            <div className="drawer open" onClick={e => e.stopPropagation()}>
              <CreateOrganizationDrawer onClose={() => setShowCreateDrawer(false)} refresh={() => { /* re-fetch logic would go here or via context */ }} />
            </div>
          </div>
        }

        {/* Delete confirmation modal */}
        {orgToDelete && (
          <div className="modal-overlay" onClick={() => setOrgToDelete(null)}>
            <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button"
                className="confirm-modal-close-btn"
                onClick={() => setOrgToDelete(null)}
                aria-label="Close modal"
              >
                <X size={14} />
              </button>
              <div className="confirm-modal-icon-wrap">
                <AlertTriangle size={24} />
              </div>
              <h3 className="confirm-modal-title">Are you sure you want to delete this organization?</h3>
              <p className="confirm-modal-text">
                This action cannot be undone. The organization will be permanently deleted.
              </p>
              <div className="confirm-modal-actions">
                <button
                  type="button"
                  className="confirm-modal-btn-danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, delete this organization"}
                </button>
                <button
                  type="button"
                  className="confirm-modal-btn-secondary"
                  onClick={() => setOrgToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel, keep this organization
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ManagementShell>
  );
}
