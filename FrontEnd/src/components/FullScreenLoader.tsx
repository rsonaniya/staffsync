import { Box, CircularProgress, Typography, Stack } from "@mui/material";

interface FullScreenLoaderProps {
  message?: string;
}

export default function FullScreenLoader({
  message = "Loading, please wait...",
}: FullScreenLoaderProps) {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(248, 249, 251, 0.5)", // Semi-transparent app background
        backdropFilter: "blur(8px)", // Frosted glass overlay
        zIndex: 9999, // Ensures it covers everything including sidebars and navbars
        overflow: "hidden",
      }}
    >
      {/* Dynamic Background Blue Accents (Matching your Login Design) */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "45%",
          height: "45%",
          borderRadius: "50%",
          backgroundColor: "rgba(0, 61, 155, 0.08)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          right: "-5%",
          width: "50%",
          height: "50%",
          borderRadius: "50%",
          backgroundColor: "rgba(205, 221, 255, 0.15)",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />

      {/* Center Spinner and Branding Stack */}
      <Stack
        spacing={3}
        sx={{
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          {/* Subtle track background under the main spinner */}
          <CircularProgress
            variant="determinate"
            sx={{ color: "rgba(0, 61, 155, 0.1)" }}
            size={56}
            thickness={4.5}
            value={100}
          />
          {/* Active branding spinner */}
          <CircularProgress
            variant="indeterminate"
            disableShrink
            sx={{
              color: "#003d9b",
              animationDuration: "600ms",
              position: "absolute",
              left: 0,
            }}
            size={56}
            thickness={4.5}
          />
        </Box>

        {message && (
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              letterSpacing: "0.02em",
              animation: "pulse 2s infinite ease-in-out",
              "@keyframes pulse": {
                "0%": { opacity: 0.6 },
                "50%": { opacity: 1 },
                "100%": { opacity: 0.6 },
              },
            }}
          >
            {message}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
