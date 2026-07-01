import { Mail, UserPlus, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { organizationApi } from "../api/organization.api";
import { departmentApi, designationApi, type Department, type Designation } from "../api/department.api";

export function InviteEmployeeDrawer({ onClose, refresh }: { onClose: () => void; refresh: () => void; }) {
  const { accessToken } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [selectedDept, setSelectedDept] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      departmentApi.list(accessToken),
      designationApi.list(accessToken),
    ]).then(([depts, desigs]) => {
      setDepartments(depts.filter((d) => d.isActive === 1));
      setDesignations(desigs.filter((d) => d.isActive === 1));
    });
  }, [accessToken]);

  const filteredDesignations = selectedDept
    ? designations.filter((d) => d.departmentId === selectedDept)
    : designations;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError("");
    try {
      await organizationApi.inviteEmployee(
        {
          firstName: String(data.get("firstName")),
          lastName: String(data.get("lastName")),
          email: String(data.get("email")),
          employeeCode: String(data.get("employeeCode")),
          departmentId: String(data.get("departmentId")),
          designationId: String(data.get("designationId")),
          role: String(data.get("role")),
        },
        accessToken,
      );
      refresh();
      onClose();
    } catch {
      setError("The employee invitation could not be sent.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="drawer-content">
      <div className="drawer-header">
        <h2 className="drawer-title">Invite employee</h2>
        <button onClick={onClose} className="drawer-close-btn" type="button">
          <X size={20} />
        </button>
      </div>
      <form className="drawer-form" onSubmit={submit}>
        <div className="drawer-body">
          {error && <div className="form-alert">{error}</div>}
          <div className="form-section-title">
            <UserPlus size={18} />
            <div>
              <strong>Employee information</strong>
              <span>The employee will verify their email using OTP.</span>
            </div>
          </div>
          <div className="management-form-grid">
            <label>
              <span>First name</span>
              <input name="firstName" placeholder="Asha" required />
            </label>
            <label>
              <span>Last name</span>
              <input name="lastName" placeholder="Kumar" required />
            </label>
            <label className="full">
              <span>Work email</span>
              <div className="management-input-icon">
                <Mail size={16} />
                <input
                  name="email"
                  type="email"
                  placeholder="asha@company.com"
                  required
                />
              </div>
            </label>
            <label>
              <span>Employee code</span>
              <input name="employeeCode" placeholder="ACME-001" required />
            </label>
            <label>
              <span>Role</span>
              <select name="role" defaultValue="EMPLOYEE">
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="HR_ADMIN">HR Admin</option>
                <option value="PAYROLL_OFFICER">Payroll Officer</option>
                <option value="RECRUITER">Recruiter</option>
              </select>
            </label>
            <label>
              <span>Department</span>
              <select
                name="departmentId"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="">— Select department —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Designation</span>
              <select name="designationId">
                <option value="">— Select designation —</option>
                {filteredDesignations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} {d.departmentName ? `(${d.departmentName})` : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="drawer-form-actions">
          <button type="button" className="management-secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="management-primary-button" disabled={submitting}>
            {submitting ? "Sending…" : "Create employee and send invitation"}
          </button>
        </div>
      </form>
    </div>
  );
}
