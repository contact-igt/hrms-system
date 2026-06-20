import {
  Building2,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";

type ManagementShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
};

export function ManagementShell({
  eyebrow,
  title,
  description,
  children,
  action,
}: ManagementShellProps) {
  const { user, logout } = useAuth();
  const platform = user?.scopeType === "PLATFORM";

  const navItems = platform
    ? [
        {
          to: "/platform/organizations",
          label: "Organizations",
          icon: Building2,
        },
      ]
    : [
        { to: "/projects", label: "Projects", icon: FolderKanban },
        {
          to: "/organization/employees",
          label: "Employees",
          icon: UsersRound,
        },
        {
          to: "/organization/setup",
          label: "Organization setup",
          icon: Settings2,
        },
      ];

  return (
    <div className="management-shell">
      <aside className="management-sidebar">
        <Link className="management-brand" to={platform ? "/platform/organizations" : "/projects"}>
          <span className="management-brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>Orbix HRMS</strong>
            <small>{platform ? "Platform workspace" : user?.organization?.name}</small>
          </span>
        </Link>

        <div className="scope-card">
          {platform ? <ShieldCheck size={18} /> : <Building2 size={18} />}
          <div>
            <span>Active scope</span>
            <strong>{platform ? "Platform" : user?.organization?.code}</strong>
          </div>
          <ChevronDown size={14} />
        </div>

        <nav>
          <p>WORKSPACE</p>
          <NavLink to={platform ? "/platform/organizations" : "/projects"} end>
            <LayoutDashboard size={17} /> Overview
          </NavLink>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink to={to} key={to}>
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>

        <button className="management-logout" type="button" onClick={logout}>
          <LogOut size={16} /> Sign out
        </button>
      </aside>

      <main className="management-main">
        <header className="management-topbar">
          <span>{platform ? "Platform administration" : "Organization administration"}</span>
          <div>
            <span className="management-avatar">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </span>
            <span>
              <strong>
                {user?.firstName} {user?.lastName}
              </strong>
              <small>{user?.roles.join(", ")}</small>
            </span>
          </div>
        </header>

        <section className="management-content">
          <div className="management-heading">
            <div>
              <span>{eyebrow}</span>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
            {action}
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}
