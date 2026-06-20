import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthContext";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { PlatformLoginPage } from "../features/auth/pages/PlatformLoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { SsoCallbackPage } from "../features/auth/pages/SsoCallbackPage";
import { VerifyOtpPage } from "../features/auth/pages/VerifyOtpPage";
import { OrganizationEmployeesPage } from "../features/organizations/pages/OrganizationEmployeesPage";
import { OrganizationSetupPage } from "../features/organizations/pages/OrganizationSetupPage";
import { InviteEmployeePage } from "../features/organizations/pages/InviteEmployeePage";
import { CreateOrganizationPage } from "../features/platform/pages/CreateOrganizationPage";
import { OrganizationsPage } from "../features/platform/pages/OrganizationsPage";
import { ProjectsPage } from "../features/projects/pages/ProjectsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/platform/login" element={<PlatformLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/sso/callback" element={<SsoCallbackPage />} />

          <Route element={<ProtectedRoute scope="ORGANIZATION" />}>
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/organization/setup" element={<OrganizationSetupPage />} />
            <Route
              path="/organization/employees"
              element={<OrganizationEmployeesPage />}
            />
            <Route
              path="/organization/employees/invite"
              element={<InviteEmployeePage />}
            />
          </Route>

          <Route element={<ProtectedRoute scope="PLATFORM" />}>
            <Route
              path="/platform/organizations"
              element={<OrganizationsPage />}
            />
            <Route
              path="/platform/organizations/new"
              element={<CreateOrganizationPage />}
            />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
