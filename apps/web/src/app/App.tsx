import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthContext";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { PlatformLoginPage } from "../features/auth/pages/PlatformLoginPage";
import { ActivateAccountPage } from "../features/auth/pages/ActivateAccountPage";
import { SetupPasswordPage } from "../features/auth/pages/SetupPasswordPage";
import { OtpVerificationPage } from "../features/auth/pages/OtpVerificationPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { SsoCallbackPage } from "../features/auth/pages/SsoCallbackPage";
import { VerifyOtpPage } from "../features/auth/pages/VerifyOtpPage";
import { OrganizationEmployeesPage } from "../features/organizations/pages/OrganizationEmployeesPage";
import { OrganizationSetupPage } from "../features/organizations/pages/OrganizationSetupPage";
import { DepartmentsPage } from "../features/organizations/pages/DepartmentsPage";
import { DesignationsPage } from "../features/organizations/pages/DesignationsPage";
import { CreateOrganizationPage } from "../features/platform/pages/CreateOrganizationPage";
import { OrganizationsPage } from "../features/platform/pages/OrganizationsPage";
import { OrganizationDetailsPage } from "../features/platform/pages/OrganizationDetailsPage";
import { ProjectsPage } from "../features/projects/pages/ProjectsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/platform/login" element={<PlatformLoginPage />} />
          <Route path="/activate-account" element={<ActivateAccountPage />} />
          <Route path="/activate-account/:invitationToken" element={<ActivateAccountPage />} />

          <Route path="/setup-account-password" element={<SetupPasswordPage />} />
          <Route path="/otp-verification" element={<OtpVerificationPage />} />
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
              path="/organization/departments"
              element={<DepartmentsPage />}
            />
            <Route
              path="/organization/designations"
              element={<DesignationsPage />}
            />
          </Route>

          <Route element={<ProtectedRoute scope="PLATFORM" />}>
            <Route
              path="/platform/organizations"
              element={<OrganizationsPage />}
            />
            <Route
              path="/platform/organizations/:id"
              element={<OrganizationDetailsPage />}
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
