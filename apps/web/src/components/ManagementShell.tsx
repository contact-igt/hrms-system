import {
  Briefcase,
  Building2,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings2,
  ShieldCheck,
  UsersRound,
  Users,
  Clock,
  TrendingUp,
  Package,
  Filter,
  Globe,
  DollarSign,
  Image,
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
        { to: "/organization/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/projects", label: "Project", icon: FolderKanban },
        { to: "/organization/departments", label: "Departments", icon: Building2 },
        { to: "/organization/designations", label: "Designations", icon: Briefcase },
        { to: "/organization/employees", label: "Employees", icon: Users },
        { to: "/organization/time-tracker", label: "Time Tracker", icon: Clock },
        { to: "/organization/growth-stats", label: "Growth Stats", icon: TrendingUp },
        { to: "/organization/inventory", label: "Inventory", icon: Package },
        { to: "/organization/client-pipeline", label: "Client Pipeline", icon: Filter },
        { to: "/organization/team", label: "Team", icon: UsersRound },
        { to: "/organization/client-portal", label: "Client Portal", icon: Globe },
        { to: "/organization/financial", label: "Financial", icon: DollarSign },
        { to: "/organization/portfolio", label: "Portfolio", icon: Image },
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
          <p>{platform ? "WORKSPACE" : "MANAGEMENT"}</p>
          {platform && (
            <NavLink to="/platform/organizations" end>
              <LayoutDashboard size={17} /> Overview
            </NavLink>
          )}
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
