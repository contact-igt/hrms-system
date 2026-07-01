import { Briefcase, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { designationApi, type CreateDesignationInput, type Department, type Designation } from "../api/department.api";

type DesignationDrawerProps = {
  mode: "create" | "edit";
  designation?: Designation;
  departments: Department[];
  onClose: () => void;
  refresh: () => void;
  onSuccess: (msg: string) => void;
};

export function DesignationDrawer({ mode, designation, departments, onClose, refresh, onSuccess }: DesignationDrawerProps) {
  const { accessToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    const data = new FormData(event.currentTarget);

    setSubmitting(true);
    setFormError("");
    try {
      const deptId = String(data.get("departmentId")).trim();
      if (mode === "create") {
        const input: CreateDesignationInput = {
          title: String(data.get("title")).trim(),
          level: Number(data.get("level")) || 1,
          departmentId: deptId || undefined,
        };
        await designationApi.create(input, accessToken);
        onSuccess("Designation created successfully.");
      } else if (mode === "edit" && designation) {
        await designationApi.update(
          designation.id,
          {
            title: String(data.get("title")).trim(),
            level: Number(data.get("level")) || 1,
            departmentId: deptId || null,
          },
          accessToken,
        );
        onSuccess("Designation updated successfully.");
      }
      refresh();
      onClose();
    } catch {
      setFormError(
        mode === "create"
          ? "Could not create designation. The title may already exist."
          : "Could not update designation.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="drawer-content">
      <div className="drawer-header">
        <h2 className="drawer-title">{mode === "create" ? "New designation" : "Edit designation"}</h2>
        <button onClick={onClose} className="drawer-close-btn" type="button">
          <X size={20} />
        </button>
      </div>
      <form className="drawer-form" onSubmit={handleSubmit}>
        <div className="drawer-body">
          {formError && <div className="form-alert">{formError}</div>}
          <div className="form-section-title">
            <Briefcase size={18} />
            <div>
              <strong>Designation details</strong>
              <span>Define the title and level of this role.</span>
            </div>
          </div>
          <div className="management-form-grid">
            <label className="full">
              <span>Title</span>
              <input
                name="title"
                placeholder="Software Engineer"
                defaultValue={mode === "edit" ? designation?.title : ""}
                required
              />
            </label>
            <label>
              <span>Level (1–10)</span>
              <input
                name="level"
                type="number"
                min={1}
                max={10}
                defaultValue={mode === "edit" ? designation?.level : 1}
                required
              />
            </label>
            <label>
              <span>Department</span>
              <select
                name="departmentId"
                defaultValue={mode === "edit" ? (designation?.departmentId ?? "") : ""}
              >
                <option value="">— Unassigned —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="drawer-form-actions">
          <button className="management-secondary-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="management-primary-button" disabled={submitting}>
            {submitting
              ? "Saving…"
              : mode === "create"
              ? "Create designation"
              : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
