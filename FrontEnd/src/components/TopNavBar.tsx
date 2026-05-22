import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Toolbar,
} from "@mui/material";
import {
  SearchOutlined,
  NotificationsOutlined,
  AccountCircleOutlined,
} from "@mui/icons-material";

// We export the width so it can be synced with the Sidebar if needed
const SIDEBAR_WIDTH = 280;

export default function TopNavBar() {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        ml: { sm: `${SIDEBAR_WIDTH}px` },
        backgroundColor: "rgba(248, 249, 251, 0.8)", // Match surface background with 80% opacity
        backdropFilter: "blur(12px)", // Frosted glass effect
        borderBottom: "1px solid rgba(195, 198, 214, 0.5)", // outline-variant border
        color: "#191c1e", // text on-surface
      }}
    >
      <Toolbar
        sx={{
          height: 64,
          px: { xs: 2, md: 3 },
          justifyContent: "space-between",
        }}
      >
        {/* Left Side: Search Bar */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <OutlinedInput
            placeholder="Search..."
            size="small"
            startAdornment={
              <InputAdornment position="start">
                <SearchOutlined sx={{ color: "#737685", fontSize: 20 }} />
              </InputAdornment>
            }
            sx={{
              width: 256,
              height: 40,
              borderRadius: 20, // Fully rounded pill shape
              backgroundColor: "#f3f4f6", // surface-container-low
              "& fieldset": {
                borderColor: "rgba(195, 198, 214, 0.5)",
              },
              "&:hover fieldset": {
                borderColor: "#003d9b", // hover matches primary
              },
              "&.Mui-focused fieldset": {
                borderColor: "#003d9b",
                borderWidth: "1px", // Keep it to 1px so it doesn't jump
              },
              input: {
                paddingLeft: 0,
                fontSize: "0.875rem",
              },
            }}
          />
        </Box>

        {/* Right Side: Actions & Profile */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            sx={{
              color: "#434654", // on-surface-variant
              "&:hover": { backgroundColor: "#f3f4f6" }, // surface-container-low
            }}
          >
            <NotificationsOutlined />
          </IconButton>

          <IconButton
            sx={{
              color: "#434654",
              "&:hover": { backgroundColor: "#f3f4f6" },
            }}
          >
            <AccountCircleOutlined />
          </IconButton>

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              my: 1.5,
              mx: 0.5,
              borderColor: "rgba(195, 198, 214, 0.5)",
            }}
          />

          <Button
            sx={{
              color: "#003d9b", // primary
              fontWeight: 600,
              textTransform: "none",
              px: 1.5,
              py: 0.5,
              "&:hover": {
                color: "#0052cc", // primary-container text hover
                backgroundColor: "transparent",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
