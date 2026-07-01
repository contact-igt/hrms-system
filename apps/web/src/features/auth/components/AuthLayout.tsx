import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <Link className="auth-brand" to="/login">
          <span className="auth-brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>Orbix HRMS</strong>
            <small>People operations, clearly managed.</small>
          </span>
        </Link>

        <div className="showcase-content">
          <span className="showcase-pill">
            <Sparkles size={14} /> Built for growing organizations
          </span>
          <h2>One secure workspace for every level of your organization.</h2>
          <p>
            Platform administrators create organizations. Organization
            administrators onboard teams. Employees get exactly the access they
            need.
          </p>

          <div className="access-map">
            <AccessLevel
              icon={ShieldCheck}
              title="Platform Admin"
              text="Creates and manages organizations"
            />
            <span className="access-line" />
            <AccessLevel
              icon={Building2}
              title="Organization Admin"
              text="Onboards and manages organization members"
            />
            <span className="access-line" />
            <AccessLevel
              icon={UsersRound}
              title="Employees"
              text="Access role-based HRMS services"
            />
          </div>
        </div>

        <div className="showcase-security">
          <CheckCircle2 size={16} />
          JWT sessions, tenant isolation, OTP verification, and secure SSO.
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-heading">
            <span>{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
          {footer && <div className="auth-card-footer">{footer}</div>}
        </div>
      </section>
    </main>
  );
}

function AccessLevel({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
}) {
  return (
    <div className="access-level">
      <span>
        <Icon size={18} />
      </span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </div>
  );
}
