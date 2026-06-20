import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { AuthScope } from "../types/auth.types";

export function ProtectedRoute({ scope }: { scope: AuthScope }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="auth-loader">
        <span />
        <p>Restoring secure session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={scope === "PLATFORM" ? "/platform/login" : "/login"}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (user.scopeType !== scope) {
    const target =
      user.scopeType === "PLATFORM" ? "/platform/organizations" : "/projects";
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}
