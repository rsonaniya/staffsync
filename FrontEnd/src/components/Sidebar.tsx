import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  DashboardOutlined,
  CalendarToday,
  EventOutlined,
  EventBusyOutlined,
  AssignmentIndOutlined,
  DescriptionOutlined,
  PaymentsOutlined,
  SettingsOutlined,
  HelpOutlined,
  GroupsOutlined,
  FactCheckOutlined,
  SettingsSuggestOutlined,
  GavelOutlined,
  PlaylistAddCheckOutlined,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext"; // Import auth hook to check permissions

const SIDEBAR_WIDTH = 280;

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const MAIN_NAV_ITEMS = [
  { text: "Dashboard", icon: <DashboardOutlined />, path: "/dashboard" },
  { text: "Attendance", icon: <CalendarToday />, path: "/attendance" },
  { text: "Company Holidays", icon: <EventOutlined />, path: "/holidays" },
  { text: "Leaves", icon: <EventBusyOutlined />, path: "/leaves" },
  { text: "My Requests", icon: <AssignmentIndOutlined />, path: "/requests" },
  { text: "Documents", icon: <DescriptionOutlined />, path: "/documents" },
  { text: "Payslips", icon: <PaymentsOutlined />, path: "/payslips" },
];

const ADMIN_NAV_ITEMS = [
  { text: "Employees", icon: <GroupsOutlined />, path: "/employees" },
  { text: "Approvals", icon: <FactCheckOutlined />, path: "/approvals" },
];

// Clean addition of the premium setup elements
const CONFIG_NAV_ITEMS = [
  {
    text: "Leave Types",
    icon: <SettingsSuggestOutlined />,
    path: "/leave-types",
  },
  { text: "Leave Policies", icon: <GavelOutlined />, path: "/leave-policies" },
  {
    text: "Policy Rules",
    icon: <PlaylistAddCheckOutlined />,
    path: "/policy-rules",
  },
];

const BOTTOM_NAV_ITEMS = [
  { text: "Settings", icon: <SettingsOutlined />, path: "/settings" },
  { text: "Help", icon: <HelpOutlined />, path: "/help" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth(); // Destructure currently logged in user state

  // Check if current agent has global administrative permissions
  const isSystemManager = user?.role === "ADMIN" || user?.role === "HR_MANAGER";

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname.startsWith(item.path);

    return (
      <ListItem key={item.text} disablePadding>
        <ListItemButton
          onClick={() => navigate(item.path)}
          sx={{
            borderRadius: 2,
            py: 1,
            px: 2,
            position: "relative",
            backgroundColor: isActive
              ? "rgba(205, 221, 255, 0.3)"
              : "transparent",
            "&:hover": {
              backgroundColor: isActive
                ? "rgba(205, 221, 255, 0.4)"
                : "rgba(231, 232, 234, 0.5)",
            },
            "&::before": isActive
              ? {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "3px",
                  backgroundColor: "#003d9b",
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                }
              : {},
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: isActive ? "#003d9b" : "#434654",
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            slotProps={{
              primary: {
                sx: {
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#003d9b" : "#434654",
                },
              },
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
          backgroundColor: "#f8f9fb",
          borderRight: "1px solid rgba(195, 198, 214, 0.5)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header / Logo Area */}
      <Box
        sx={{ px: 3, py: 3, display: "flex", alignItems: "center", gap: 1.5 }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: "#003d9b",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
            fontWeight: 700,
          }}
        >
          E
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#003d9b", lineHeight: 1.2 }}
          >
            EMS Portal
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#434654", fontWeight: 500 }}
          >
            Enterprise Suite
          </Typography>
        </Box>
      </Box>

      {/* Navigation Streams */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 1 }}>
        <List sx={{ p: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {MAIN_NAV_ITEMS.map(renderNavItem)}
        </List>

        {/* Administration Operational Section */}
        {/* Visible by Admins, HR Managers, or Standard Managers/HR agents depending on your routing setup */}
        <Box sx={{ mt: 4, mb: 1 }}>
          <Typography
            sx={{
              px: 2,
              py: 0.5,
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "#737685",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Administration
          </Typography>
          <List
            sx={{
              p: 0,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              mt: 0.5,
            }}
          >
            {ADMIN_NAV_ITEMS.map(renderNavItem)}
          </List>
        </Box>

        {/* System Configuration Block (Exclusively for ADMIN and HR_MANAGER) */}
        {isSystemManager && (
          <Box sx={{ mt: 4, mb: 1 }}>
            <Typography
              sx={{
                px: 2,
                py: 0.5,
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "#737685",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              System Configuration
            </Typography>
            <List
              sx={{
                p: 0,
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                mt: 0.5,
              }}
            >
              {CONFIG_NAV_ITEMS.map(renderNavItem)}
            </List>
          </Box>
        )}
      </Box>

      {/* Footer Navigation Area */}
      <Box sx={{ p: 3, borderTop: "1px solid rgba(195, 198, 214, 0.5)" }}>
        <List sx={{ p: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {BOTTOM_NAV_ITEMS.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  "&:hover": {
                    backgroundColor: "rgba(231, 232, 234, 0.5)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "#434654" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: "0.875rem",
                        color: "#434654",
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
