import React, { useState } from "react";
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
  Collapse,
} from "@mui/material";
import {
  DashboardOutlined,
  CalendarToday,
  EventOutlined,
  EventBusyOutlined,
  AssignmentIndOutlined,
  PaymentsOutlined,
  SettingsOutlined,
  HelpOutlined,
  GroupsOutlined,
  FactCheckOutlined,
  SettingsSuggestOutlined,
  GavelOutlined,
  PlaylistAddCheckOutlined,
  AccessTimeOutlined,
  FmdGoodOutlined,
  CalendarMonthOutlined,
  ExpandLess,
  ExpandMore,
  AccountCircleOutlined,
  BadgeOutlined,
  WorkspacePremiumOutlined,
  AccountBalanceOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

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
  { text: "Payslips", icon: <PaymentsOutlined />, path: "/payslips" },
];

// 🚀 NEW: Dedicated Profile Navigation for Employees
const PROFILE_NAV_ITEMS = [
  {
    text: "Personal Details",
    icon: <BadgeOutlined />,
    path: "/my-profile/personal",
  },
  {
    text: "Employment Setup",
    icon: <WorkspacePremiumOutlined />,
    path: "/my-profile/employment",
  },
  {
    text: "Bank & Statutory",
    icon: <AccountBalanceOutlined />,
    path: "/my-profile/payroll",
  },
  {
    text: "My Documents",
    icon: <DescriptionOutlined />,
    path: "/my-profile/documents",
  },
];

const ADMIN_NAV_ITEMS = [
  { text: "Employees", icon: <GroupsOutlined />, path: "/employees" },
  { text: "Approvals", icon: <FactCheckOutlined />, path: "/approvals" },
];

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
  { text: "Shifts", icon: <AccessTimeOutlined />, path: "/shifts" },
  { text: "Locations", icon: <FmdGoodOutlined />, path: "/locations" },
  {
    text: "Holidays",
    icon: <CalendarMonthOutlined />,
    path: "/manage-holidays",
  },
];

const BOTTOM_NAV_ITEMS = [
  { text: "Settings", icon: <SettingsOutlined />, path: "/settings" },
  { text: "Help", icon: <HelpOutlined />, path: "/help" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Accordion Open/Close Trackers ---
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(true); // Default open for easy access
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(true);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(true);

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
            sx={{ minWidth: 40, color: isActive ? "#003d9b" : "#434654" }}
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
          S
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#003d9b", lineHeight: 1.2 }}
          >
            StaffSync
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
        {/* Core Main Paths */}
        <List sx={{ p: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {MAIN_NAV_ITEMS.map(renderNavItem)}
        </List>

        {/* 🚀 NEW: My Profile Collapsible Section */}
        {user && (
          <Box sx={{ mt: 3, mb: 0.5 }}>
            <Box
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1,
                cursor: "pointer",
                borderRadius: 1.5,
                "&:hover": { backgroundColor: "rgba(231, 232, 234, 0.4)" },
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "#737685",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                My Profile
              </Typography>
              {isProfileOpen ? (
                <ExpandLess sx={{ fontSize: 16, color: "#737685" }} />
              ) : (
                <ExpandMore sx={{ fontSize: 16, color: "#737685" }} />
              )}
            </Box>

            <Collapse in={isProfileOpen} timeout="auto" unmountOnExit>
              <List
                sx={{
                  p: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                {PROFILE_NAV_ITEMS.map(renderNavItem)}
              </List>
            </Collapse>
          </Box>
        )}

        {/* Administration Collapsible Section */}
        {user &&
          ["ADMIN", "HR", "HR_MANAGER", "MANAGER"].includes(user.role) && (
            <Box sx={{ mt: 3, mb: 0.5 }}>
              <Box
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1,
                  cursor: "pointer",
                  borderRadius: 1.5,
                  "&:hover": { backgroundColor: "rgba(231, 232, 234, 0.4)" },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: "#737685",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Administration
                </Typography>
                {isAdminOpen ? (
                  <ExpandLess sx={{ fontSize: 16, color: "#737685" }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 16, color: "#737685" }} />
                )}
              </Box>

              <Collapse in={isAdminOpen} timeout="auto" unmountOnExit>
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
              </Collapse>
            </Box>
          )}

        {/* System Configuration Collapsible Section */}
        {isSystemManager && (
          <Box sx={{ mt: 3, mb: 0.5 }}>
            <Box
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1,
                cursor: "pointer",
                borderRadius: 1.5,
                "&:hover": { backgroundColor: "rgba(231, 232, 234, 0.4)" },
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "#737685",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                System Configuration
              </Typography>
              {isConfigOpen ? (
                <ExpandLess sx={{ fontSize: 16, color: "#737685" }} />
              ) : (
                <ExpandMore sx={{ fontSize: 16, color: "#737685" }} />
              )}
            </Box>

            <Collapse in={isConfigOpen} timeout="auto" unmountOnExit>
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
            </Collapse>
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
                  "&:hover": { backgroundColor: "rgba(231, 232, 234, 0.5)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "#434654" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{
                    primary: { sx: { fontSize: "0.875rem", color: "#434654" } },
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
