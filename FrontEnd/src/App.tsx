import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { useAuth } from "./context/AuthContext";

// Import your pages and components
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import AttendancePage from "./pages/AttendancePage";
import CompanyHolidaysPage from "./pages/CompanyHolidaysPage";
import LeavesPage from "./pages/LeavesPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import DocumentsPage from "./pages/DocumentsPage";
import PayslipsPage from "./pages/PayslipsPage";
import EmployeesDirectoryPage from "./pages/EmployeesDirectoryPage";
import AddEmployeeWizard from "./components/AddEmployeeWizard";
import ApprovalsPage from "./pages/ApprovalsPage";
import FullScreenLoader from "./components/FullScreenLoader";
import LeaveTypesPage from "./pages/LeaveTypesPage";
import LeavePoliciesPage from "./pages/LeavePoliciesPage";
import PolicyRulesPage from "./pages/PolicyRulesPage";
import ActivateAccountPage from "./pages/AuthActionPage";
import { ToastProvider } from "./context/ToastContext";
import ShiftsPage from "./pages/ShiftsPage";
import LocationsPage from "./pages/LocationsPage";
import ManageHolidaysPage from "./pages/ManageHolidaysPage";

// ==========================================
// PROTECTED ROUTE COMPONENT (Role Enforcement)
// ==========================================
interface ProtectedRouteProps {
  allowedRoles?: Array<"ADMIN" | "HR" | "HR_MANAGER" | "MANAGER" | "EMPLOYEE">;
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show a clean global spinner while verifying the token on mount
  if (isLoading) return <FullScreenLoader />;

  // If not logged in, force transition to auth page
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user doesn't have permissions, redirect to dashboard root
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized: render child routes
  return <Outlet />;
}

// ==========================================
// MAIN APP ROUTER
// ==========================================
export default function App() {
  const theme = createTheme({
    typography: {
      fontFamily: "Inter, sans-serif",
    },
    palette: {
      background: {
        default: "#f8f9fb",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <ToastProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/activate-account" element={<ActivateAccountPage />} />
          <Route path="/reset-password" element={<ActivateAccountPage />} />

          {/* Guarded/Dashboard Routes (Wrapped in ProtectedRoute & DashboardLayout) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              {/* Redirect base path to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* Universally accessible paths for all roles */}
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="holidays" element={<CompanyHolidaysPage />} />
              <Route path="leaves" element={<LeavesPage />} />
              <Route path="requests" element={<MyRequestsPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="payslips" element={<PayslipsPage />} />

              {/* HR / Admin Operational Roles Only */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["ADMIN", "HR", "HR_MANAGER"]}
                  />
                }
              >
                <Route path="employees/new" element={<AddEmployeeWizard />} />
              </Route>

              {/* Management & Administration Cross-Section */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["ADMIN", "HR", "HR_MANAGER", "MANAGER"]}
                  />
                }
              >
                <Route path="employees" element={<EmployeesDirectoryPage />} />
                <Route path="approvals" element={<ApprovalsPage />} />
              </Route>
              <Route
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "HR_MANAGER"]} />
                }
              >
                <Route path="leave-types" element={<LeaveTypesPage />} />
                <Route path="leave-policies" element={<LeavePoliciesPage />} />
                <Route path="policy-rules" element={<PolicyRulesPage />} />
                <Route path="shifts" element={<ShiftsPage />} />
                <Route path="locations" element={<LocationsPage />} />
                <Route
                  path="manage-holidays"
                  element={<ManageHolidaysPage />}
                />
              </Route>

              {/* Settings & Help Placeholders */}
              <Route
                path="settings"
                element={<div>Settings Placeholder</div>}
              />
              <Route path="help" element={<div>Help Placeholder</div>} />
            </Route>
          </Route>

          {/* Fallback route for typos */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </ThemeProvider>
  );
}
