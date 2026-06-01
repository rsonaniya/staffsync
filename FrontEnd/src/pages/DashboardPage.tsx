import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  Link,
  LinearProgress,
} from "@mui/material";
import {
  FlightTakeoff,
  MedicalServicesOutlined,
  LocalCafeOutlined,
  Circle,
} from "@mui/icons-material";

// --- Dummy Data ---
const LEAVE_BALANCES = [
  {
    type: "Annual",
    left: 12,
    total: 20,
    icon: <FlightTakeoff />,
    color: "#003d9b",
  },
  {
    type: "Sick",
    left: 5,
    total: 10,
    icon: <MedicalServicesOutlined color="error" />,
    color: "#C5221F",
  },
  {
    type: "Casual",
    left: 3,
    total: 5,
    icon: <LocalCafeOutlined />,
    color: "#434654",
  },
];

const UPCOMING_HOLIDAYS = [
  { month: "NOV", day: "28", name: "Thanksgiving Day", weekday: "Thursday" },
  { month: "DEC", day: "25", name: "Christmas Day", weekday: "Wednesday" },
];

const WEEKLY_ATTENDANCE = [
  { day: "Mon", hours: 8, type: "full" },
  { day: "Tue", hours: 8.5, type: "full" },
  { day: "Wed", hours: 7.5, type: "full" },
  { day: "Thu", hours: 4, type: "half" },
  { day: "Fri", hours: 0.2, type: "none" },
];

export default function DashboardPage() {
  const [isClockedIn, setIsClockedIn] = useState(false);

  const handleToggleClock = () => {
    setIsClockedIn((prev) => !prev);
  };

  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 2, md: 4, lg: 5 }, // Anchors it left with clean responsive padding
        pb: 4,
        pt: { xs: 10, md: 12 },
      }}
    >
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{ fontWeight: 700, color: "text.primary" }}
          variant="h4"
          gutterBottom
        >
          Good Morning, Alex
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here is what's happening today.
        </Typography>
      </Box>

      {/* Bulletproof Flexbox Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 3,
        }}
      >
        {/* === LEFT COLUMN === */}
        <Box sx={{ flex: "0 0 auto", width: { xs: "100%", lg: "350px" } }}>
          <Stack spacing={3}>
            {/* 1. Time Clock Widget */}
            <Card
              variant="outlined"
              sx={{ borderRadius: 2, borderColor: "rgba(195, 198, 214, 0.5)" }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                  }}
                  direction="row"
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Time Clock
                  </Typography>
                  <Chip
                    icon={
                      <Circle
                        sx={{
                          fontSize: "8px !important",
                          color: isClockedIn ? "#137333" : "#737685",
                        }}
                      />
                    }
                    label={isClockedIn ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      backgroundColor: isClockedIn ? "#E6F4EA" : "#f3f4f6",
                      color: isClockedIn ? "#137333" : "#434654",
                      fontWeight: 600,
                      borderRadius: 1,
                      px: 0.5,
                    }}
                  />
                </Stack>

                <Stack sx={{ alignItems: "center", mb: 4 }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      color: "#003d9b",
                    }}
                  >
                    {isClockedIn ? "04:23:15" : "00:00:00"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mt: 1 }}
                  >
                    {isClockedIn ? "Since 08:30 AM" : "Shift hasn't started"}
                  </Typography>
                </Stack>

                {/* Conditional Action Buttons */}
                {!isClockedIn ? (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleToggleClock}
                    disableElevation
                    sx={{
                      py: 1.5,
                      backgroundColor: "#003d9b",
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "#0052cc" },
                    }}
                  >
                    Clock In
                  </Button>
                ) : (
                  <Stack direction="row" spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      disableElevation
                      sx={{
                        py: 1.5,
                        backgroundColor: "#e1e2e4",
                        color: "#191c1e",
                        fontWeight: 600,
                        "&:hover": { backgroundColor: "#d9dadc" },
                      }}
                    >
                      Break
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleToggleClock}
                      disableElevation
                      sx={{
                        py: 1.5,
                        backgroundColor: "#ba1a1a",
                        fontWeight: 600,
                        "&:hover": { backgroundColor: "#93000a" },
                      }}
                    >
                      Clock Out
                    </Button>
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* 2. Upcoming Holidays Widget */}
            <Card
              variant="outlined"
              sx={{ borderRadius: 2, borderColor: "rgba(195, 198, 214, 0.5)" }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Upcoming Holidays
                  </Typography>
                  <Link
                    href="#"
                    variant="caption"
                    underline="none"
                    sx={{ color: "#003d9b", fontWeight: 600 }}
                  >
                    View All
                  </Link>
                </Stack>

                <Stack spacing={0} divider={<Divider sx={{ my: 2 }} />}>
                  {UPCOMING_HOLIDAYS.map((holiday, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                      <Box
                        sx={{
                          backgroundColor: "#dae2ff",
                          borderRadius: 1,
                          p: 1,
                          minWidth: 50,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            fontWeight: 600,
                            color: "#003fa5",
                          }}
                        >
                          {holiday.month}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            display: "block",
                            fontWeight: 700,
                            color: "#001848",
                            lineHeight: 1,
                          }}
                        >
                          {holiday.day}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: "text.primary" }}
                        >
                          {holiday.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {holiday.weekday}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* === RIGHT COLUMN === */}
        <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
          <Stack spacing={3}>
            {/* 3. Leave Balance Widget */}
            <Card
              variant="outlined"
              sx={{ borderRadius: 2, borderColor: "rgba(195, 198, 214, 0.5)" }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Leave Balance
                </Typography>

                {/* Safe Flexbox implementation for Leave Cards */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  {LEAVE_BALANCES.map((leave, index) => (
                    <Box
                      key={index}
                      sx={{
                        flex: 1, // Ensures all 3 cards stretch evenly
                        border: "1px solid rgba(195, 198, 214, 0.5)",
                        borderRadius: 2,
                        p: 2,
                        backgroundColor: "#f8f9fb",
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {leave.type}
                        </Typography>
                        {leave.icon}
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "baseline", mb: 2 }}
                      >
                        <Typography
                          variant="h4"
                          sx={{ fontWeight: 700, color: "text.primary" }}
                        >
                          {leave.left < 10 ? `0${leave.left}` : leave.left}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          days left
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(leave.left / leave.total) * 100}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: "#e1e2e4",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: leave.color,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* 4. Weekly Attendance Widget */}
            <Card
              variant="outlined"
              sx={{ borderRadius: 2, borderColor: "rgba(195, 198, 214, 0.5)" }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 4 }}>
                  Weekly Attendance
                </Typography>

                <Box
                  sx={{
                    position: "relative",
                    height: 200,
                    mt: 2,
                    display: "flex",
                  }}
                >
                  {/* Y-Axis Labels & Grid Lines */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      pr: 2,
                      width: 30,
                    }}
                  >
                    {["10h", "8h", "6h", "4h", "0h"].map((label) => (
                      <Typography
                        key={label}
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "10px", transform: "translateY(-50%)" }}
                      >
                        {label}
                      </Typography>
                    ))}
                  </Box>

                  {/* Chart Area */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-around",
                      pb: 0,
                    }}
                  >
                    {[0, 25, 50, 75, 100].map((percent) => (
                      <Box
                        key={percent}
                        sx={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: `${percent}%`,
                          borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                          zIndex: 0,
                        }}
                      />
                    ))}

                    {/* Bars */}
                    {WEEKLY_ATTENDANCE.map((data, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-end", // <--- 1. Anchors the bar to the bottom line
                          zIndex: 1,
                          width: "10%",
                          height: "100%", // <--- 2. CRITICAL FIX: Gives the wrapper a 100% height
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            // 3. We use calc() to subtract the height of the text label below it.
                            // This ensures the top of the bar aligns perfectly with the Y-axis grid lines!
                            height: `calc(${(data.hours / 10) * 100}% - 28px)`,
                            backgroundColor:
                              data.type === "full"
                                ? "#003d9b"
                                : data.type === "half"
                                  ? "#cdddff"
                                  : "#e1e2e4",
                            borderRadius: "2px 2px 0 0",
                            transition: "height 0.3s ease",
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            mt: 1,
                            height: "20px", // Strict height for the text
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {data.day}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
