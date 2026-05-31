import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  Toolbar,
  Avatar,
  Typography,
  Stack,
  Tooltip,
} from "@mui/material";
import { NotificationsOutlined, LogoutOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SIDEBAR_WIDTH = 280;

export default function TopNavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        ml: { sm: `${SIDEBAR_WIDTH}px` },
        backgroundColor: "rgba(248, 249, 251, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
        color: "#191c1e",
      }}
    >
      <Toolbar
        sx={{
          height: 64,
          px: { xs: 2, md: 3 },
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* ==========================================
            LEFT SIDE: PERSONALIZED USER CONTEXT 
            ========================================== */}
        <Box
          onClick={() => navigate("/my-profile/personal")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
            px: 1,
            py: 0.5,
            borderRadius: 2,
            transition: "background-color 0.2s",
            "&:hover": { backgroundColor: "rgba(195, 198, 214, 0.2)" },
          }}
        >
          <Avatar
            src={(user as any)?.profile_image_url || undefined}
            alt={user?.first_name}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: "#003d9b",
              fontWeight: 600,
              fontSize: "1.1rem",
              border: "2px solid #ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {user?.first_name?.charAt(0).toUpperCase() || "U"}
          </Avatar>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}
            >
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              {/* Fallback to System Role if designation isn't loaded in context yet */}
              {(user as any)?.employment_details?.designation ||
                user?.role.replace("_", " ")}
            </Typography>
          </Box>
        </Box>

        {/* ==========================================
            RIGHT SIDE: GLOBAL ACTIONS (NOTIFICATIONS & LOGOUT) 
            ========================================== */}
        <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton
              sx={{
                color: "#434654",
                "&:hover": {
                  backgroundColor: "rgba(195, 198, 214, 0.3)",
                  color: "#003d9b",
                },
              }}
            >
              {/* Later: Add a <Badge color="error" variant="dot"> here for WebSockets! */}
              <NotificationsOutlined />
            </IconButton>
          </Tooltip>

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              my: 1.5,
              mx: 1,
              borderColor: "rgba(195, 198, 214, 0.5)",
            }}
          />

          <Button
            startIcon={<LogoutOutlined fontSize="small" />}
            sx={{
              color: "#ba1a1a", // Deep red for logout intent
              fontWeight: 600,
              textTransform: "none",
              px: 2,
              py: 0.75,
              borderRadius: 2,
              "&:hover": {
                color: "#93000a",
                backgroundColor: "rgba(186, 26, 26, 0.08)",
              },
            }}
            onClick={() => logout()}
          >
            Logout
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
