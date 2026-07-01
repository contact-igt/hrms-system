import { Building2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { departmentApi, type CreateDepartmentInput, type Department } from "../api/department.api";

type DepartmentDrawerProps = {
  mode: "create" | "edit";
  department?: Department;
  onClose: () => void;
  refresh: () => void;
  onSuccess: (msg: string) => void;
};

export function DepartmentDrawer({ mode, department, onClose, refresh, onSuccess }: DepartmentDrawerProps) {
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
      if (mode === "create") {
        const input: CreateDepartmentInput = {
          name: String(data.get("name")).trim(),
          code: String(data.get("code")).trim().toUpperCase(),
          description: String(data.get("description")).trim() || undefined,
        };
        await departmentApi.create(input, accessToken);
        onSuccess("Department created successfully.");
      } else if (mode === "edit" && department) {
        await departmentApi.update(
          department.id,
          {
            name: String(data.get("name")).trim(),
            code: String(data.get("code")).trim().toUpperCase(),
            description: String(data.get("description")).trim() || undefined,
          },
          accessToken,
        );
        onSuccess("Department updated successfully.");
      }
      refresh();
      onClose();
    } catch {
      setFormError(
        mode === "create"
          ? "Could not create department. The code may already exist."
          : "Could not update department.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="drawer-content">
      <div className="drawer-header">
        <h2 className="drawer-title">{mode === "create" ? "New department" : "Edit department"}</h2>
        <button onClick={onClose} className="drawer-close-btn" type="button">
          <X size={20} />
        </button>
      </div>
      <form className="drawer-form" onSubmit={handleSubmit}>
        <div className="drawer-body">
          {formError && <div className="form-alert">{formError}</div>}
          <div className="form-section-title">
            <Building2 size={18} />
            <div>
              <strong>Department details</strong>
              <span>Provide the name and code for this department.</span>
            </div>
          </div>
          <div className="management-form-grid">
            <label className="full">
              <span>Department name</span>
              <input
                name="name"
                placeholder="Engineering"
                defaultValue={mode === "edit" ? department?.name : ""}
                required
              />
            </label>
            <label>
              <span>Code</span>
              <input
                name="code"
                placeholder="ENG"
                defaultValue={mode === "edit" ? department?.code : ""}
                style={{ textTransform: "uppercase" }}
                required
              />
            </label>
            <label>
              <span>Description</span>
              <input
                name="description"
                placeholder="Optional description"
                defaultValue={mode === "edit" ? (department?.description ?? "") : ""}
              />
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
              ? "Create department"
              : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
