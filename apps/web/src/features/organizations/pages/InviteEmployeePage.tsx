import { ArrowLeft, Mail, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ManagementShell } from "../../../components/ManagementShell";
import { useAuth } from "../../auth/context/AuthContext";
import { organizationApi } from "../api/organization.api";

export function InviteEmployeePage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      navigate("/organization/employees");
    } catch {
      setError("The employee invitation could not be sent.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ManagementShell
      eyebrow="Employee onboarding"
      title="Invite employee"
      description="The approved role and organization are securely attached to the invitation."
      action={
        <Link className="management-secondary-button" to="/organization/employees">
          <ArrowLeft size={15} /> Back
        </Link>
      }
    >
      <form className="management-form-card compact" onSubmit={submit}>
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
            <span>Department ID</span>
            <input name="departmentId" placeholder="Department UUID" required />
          </label>
          <label>
            <span>Designation ID</span>
            <input name="designationId" placeholder="Designation UUID" required />
          </label>
        </div>
        <button className="management-primary-button form-submit" disabled={submitting}>
          {submitting ? "Sending…" : "Create employee and send invitation"}
        </button>
      </form>
    </ManagementShell>
  );
}
