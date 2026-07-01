import {
  Briefcase,
  CheckCircle2,
  ChevronDown,
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
  designationApi,
  type Department,
  type Designation,
} from "../api/department.api";
import { DesignationDrawer } from "../components/DesignationDrawer";

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; designation: Designation };

export function DesignationsPage() {
  const { accessToken } = useAuth();
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");

  const load = () => {
    if (!accessToken) return;
    setLoading(true);
    Promise.all([
      designationApi.list(accessToken),
      departmentApi.list(accessToken),
    ])
      .then(([desigs, depts]) => {
        setDesignations(desigs);
        setDepartments(depts.filter((d) => d.isActive === 1));
      })
      .catch(() => setError("Designations could not be loaded."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const openCreate = () => {
    setModal({ mode: "create" });
  };

  const openEdit = (desig: Designation) => {
    setModal({ mode: "edit", designation: desig });
  };

  const closeModal = () => setModal({ mode: "closed" });

  const handleDeactivate = async (desig: Designation) => {
    if (!accessToken) return;
    if (!confirm(`Deactivate designation "${desig.title}"?`)) return;
    try {
      await designationApi.deactivate(desig.id, accessToken);
      setSuccessMsg("Designation deactivated.");
      load();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Could not deactivate designation.");
    }
  };

  const filtered = designations.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.departmentName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept ? d.departmentId === filterDept : true;
    return matchSearch && matchDept;
  });

  const levelLabel = (level: number) => {
    const labels: Record<number, string> = {
      1: "Entry",
      2: "Junior",
      3: "Mid",
      4: "Senior",
      5: "Lead",
      6: "Principal",
      7: "Staff",
      8: "Manager",
      9: "Director",
      10: "VP",
    };
    return labels[level] ?? `L${level}`;
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <ManagementShell
      eyebrow="Organization"
      title="Designations"
      description="Define job titles and levels used across departments in your organization."
      action={
        <button
          id="desig-new-btn"
          className="management-primary-button"
          type="button"
          onClick={openCreate}
        >
          <Plus size={16} /> New designation
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
            placeholder="Search by title or department"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <ChevronDown size={14} />
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            style={{ border: "none", background: "transparent", cursor: "pointer" }}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {filtered.length} designation{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="management-table-card">
        <table>
          <thead>
            <tr>
              <th>Designation</th>
              <th>Level</th>
              <th>Department</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((desig) => (
              <tr key={desig.id}>
                <td>
                  <span className="organization-cell">
                    <i>
                      <Briefcase size={16} />
                    </i>
                    <span>
                      <strong>{desig.title}</strong>
                    </span>
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.8rem",
                    }}
                  >
                    <code
                      style={{
                        background: "var(--surface-2,#f1f3f5)",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      L{desig.level}
                    </code>
                    {levelLabel(desig.level)}
                  </span>
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  {desig.departmentName ?? <em>Unassigned</em>}
                </td>
                <td>
                  <span
                    className={`status-badge ${desig.isActive ? "active" : "suspended"}`}
                  >
                    {desig.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      id={`desig-edit-${desig.id}`}
                      className="management-secondary-button"
                      type="button"
                      onClick={() => openEdit(desig)}
                      title="Edit designation"
                    >
                      <Pencil size={14} />
                    </button>
                    {desig.isActive ? (
                      <button
                        id={`desig-deactivate-${desig.id}`}
                        className="management-secondary-button"
                        type="button"
                        onClick={() => handleDeactivate(desig)}
                        title="Deactivate designation"
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

        {loading && <div className="management-empty">Loading designations…</div>}
        {!loading && error && <div className="management-empty error">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="management-empty">
            <Briefcase size={25} />
            <strong>{search || filterDept ? "No matching designations" : "No designations yet"}</strong>
            <span>
              {search || filterDept
                ? "Try different filters."
                : "Create the first designation to define job roles."}
            </span>
            {!search && !filterDept && (
              <button
                className="management-primary-button"
                type="button"
                onClick={openCreate}
              >
                <Plus size={15} /> New designation
              </button>
            )}
          </div>
        )}
      </div>

      {modal.mode !== "closed" && (
        <div className="drawer-overlay active" onClick={closeModal}>
          <div className="drawer open" onClick={(e) => e.stopPropagation()}>
            <DesignationDrawer
              mode={modal.mode}
              designation={modal.mode === "edit" ? modal.designation : undefined}
              departments={departments}
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
