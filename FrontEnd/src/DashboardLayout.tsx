import LoginPage from "./pages/LoginPage";
import Sidebar from "./components/Sidebar";
// Note: You will create these page components later.
// For now, they can just be empty components or placeholders.
// import AttendancePage from "./pages/AttendancePage";
import { Box, CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";
import TopNavBar from "./components/TopNavBar";

// --- Layout Component ---
// This wraps all the internal pages so the Sidebar is only rendered once.
function DashboardLayout() {
  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8f9fb" }}
    >
      <CssBaseline />

      {/* Persistent Sidebar */}
      <Sidebar />
      <TopNavBar />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          // 280px is the width of the sidebar
          //   ml: "280px",
        }}
      >
        {/* We will add the TopNavBar here in the next step */}

        {/* The current route's component renders here */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
