import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";

// Import your pages and components
import LoginPage from "./pages/LoginPage";
// Note: You will create these page components later.
// For now, they can just be empty components or placeholders.
// import AttendancePage from "./pages/AttendancePage";
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

// --- Main App Router ---
export default function App() {
  // Optional: A basic MUI theme to set default fonts and colors globally
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
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected/Dashboard Routes (Wrapped in Layout) */}
          <Route path="/" element={<DashboardLayout />}>
            {/* Redirect base path to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="holidays" element={<CompanyHolidaysPage />} />
            <Route path="leaves" element={<LeavesPage />} />
            <Route path="requests" element={<MyRequestsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="payslips" element={<PayslipsPage />} />
            <Route path="employees" element={<EmployeesDirectoryPage />} />
            <Route path="employees/new" element={<AddEmployeeWizard />} />
            <Route path="approvals" element={<ApprovalsPage />} />

            {/* Settings & Help */}
            <Route path="settings" element={<div>Settings Placeholder</div>} />
            <Route path="help" element={<div>Help Placeholder</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
