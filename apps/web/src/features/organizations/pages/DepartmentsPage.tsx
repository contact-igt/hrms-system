import {
  Building2,
  CheckCircle2,
  Pencil,
  Plus,
  PowerOff,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ManagementShell } from "../../../components/ManagementShell";
import { useAuth } from "../../auth/context/AuthContext";
import {
  departmentApi,
  type Department,
} from "../api/department.api";
import { DepartmentDrawer } from "../components/DepartmentDrawer";

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; department: Department };

export function DepartmentsPage() {
  const { accessToken } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");

  const load = () => {
    if (!accessToken) return;
    setLoading(true);
    departmentApi
      .list(accessToken)
      .then(setDepartments)
      .catch(() => setError("Departments could not be loaded."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const openCreate = () => {
    setModal({ mode: "create" });
  };

  const openEdit = (dept: Department) => {
    setModal({ mode: "edit", department: dept });
  };

  const closeModal = () => setModal({ mode: "closed" });

  const handleDeactivate = async (dept: Department) => {
    if (!accessToken) return;
    if (!confirm(`Deactivate department "${dept.name}"? Employees assigned to it will be unaffected.`))
      return;
    try {
      await departmentApi.deactivate(dept.id, accessToken);
      setSuccessMsg("Department deactivated.");
      load();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Could not deactivate department.");
    }
  };

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()),
  );

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <ManagementShell
      eyebrow="Organization"
      title="Departments"
      description="Manage the departments in your organization. Departments group employees and are linked to designations."
      action={
        <button
          id="dept-new-btn"
          className="management-primary-button"
          type="button"
          onClick={openCreate}
        >
          <Plus size={16} /> New department
        </button>
      }
    >
      {successMsg && (
        <div className="form-success" style={{ marginBottom: "1rem" }}>
          <CheckCircle2 size={15} /> {successMsg}
        </div>
      )}

      <div className="management-toolbar">
        <label>
          <Search size={16} />
          <input
            placeholder="Search by name or code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {filtered.length} department{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="management-table-card">
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Code</th>
              <th>Description</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((dept) => (
              <tr key={dept.id}>
                <td>
                  <span className="organization-cell">
                    <i>
                      <Building2 size={16} />
                    </i>
                    <span>
                      <strong>{dept.name}</strong>
                    </span>
                  </span>
                </td>
                <td>
                  <code style={{ fontSize: "0.8rem", background: "var(--surface-2,#f1f3f5)", padding: "2px 6px", borderRadius: 4 }}>
                    {dept.code}
                  </code>
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  {dept.description ?? "—"}
                </td>
                <td>
                  <span className={`status-badge ${dept.isActive ? "active" : "suspended"}`}>
                    {dept.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <span style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button
                      id={`dept-edit-${dept.id}`}
                      className="management-secondary-button"
                      type="button"
                      onClick={() => openEdit(dept)}
                      title="Edit department"
                    >
                      <Pencil size={14} />
                    </button>
                    {dept.isActive ? (
                      <button
                        id={`dept-deactivate-${dept.id}`}
                        className="management-secondary-button"
                        type="button"
                        onClick={() => handleDeactivate(dept)}
                        title="Deactivate department"
                      >
                        <PowerOff size={14} />
                      </button>
                    ) : null}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <div className="management-empty">Loading departments…</div>}
        {!loading && error && <div className="management-empty error">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="management-empty">
            <Building2 size={25} />
            <strong>{search ? "No matching departments" : "No departments yet"}</strong>
            <span>
              {search
                ? "Try a different search term."
                : "Create the first department to organise your workforce."}
            </span>
            {!search && (
              <button
                className="management-primary-button"
                type="button"
                onClick={openCreate}
              >
                <Plus size={15} /> New department
              </button>
            )}
          </div>
        )}
      </div>

      {modal.mode !== "closed" && (
        <div className="drawer-overlay active" onClick={closeModal}>
          <div className="drawer open" onClick={(e) => e.stopPropagation()}>
            <DepartmentDrawer
              mode={modal.mode}
              department={modal.mode === "edit" ? modal.department : undefined}
              onClose={closeModal}
              refresh={load}
              onSuccess={showSuccess}
            />
          </div>
        </div>
      )}
    </ManagementShell>
  );
}
