import { useState, useEffect } from "react";
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
  CircularProgress,
  Dialog,
  DialogActions,
} from "@mui/material";
import {
  FlightTakeoff,
  MedicalServicesOutlined,
  LocalCafeOutlined,
  Circle,
  WarningAmberRounded,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { axiosInstance } from "../api/axiosInstance";
import type { AttendanceStatus } from "../types/enums";

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

interface AttendanceData {
  applicable_date: string;
  day_type: AttendanceStatus;
  is_clocked_in: boolean;
  total_working_hours: number;
  current_session_start: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null,
  );
  const [isLoadingClock, setIsLoadingClock] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // Real-time tracker for the active session (in milliseconds)
  const [liveSessionMs, setLiveSessionMs] = useState<number>(0);

  const [warningModal, setWarningModal] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: "",
  });

  // 1. Fetch initial status on mount
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response =
          await axiosInstance.get<AttendanceData>("/attendance/today");
        setAttendanceData(response.data);
      } catch (error) {
        console.error("Failed to fetch today's attendance:", error);
      } finally {
        setIsLoadingClock(false);
      }
    };
    fetchAttendance();
  }, []);

  // 2. Live Tick Counter (Updates every second if clocked in)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (attendanceData?.is_clocked_in && attendanceData.current_session_start) {
      interval = setInterval(() => {
        const startTime = new Date(
          attendanceData.current_session_start!,
        ).getTime();
        const now = Date.now();
        setLiveSessionMs(Math.max(0, now - startTime));
      }, 1000);
    } else {
      setLiveSessionMs(0);
    }

    return () => clearInterval(interval);
  }, [attendanceData]);

  const handleToggleClock = async () => {
    // If clocking in, check if status is a non-working day
    if (!isClockedIn) {
      const status = attendanceData?.day_type;
      const nonWorkingStatuses = ["ON_LEAVE", "HOLIDAY", "WEEK_OFF"];

      if (status && nonWorkingStatuses.includes(status)) {
        setWarningModal({
          open: true,
          message: `Today is a scheduled ${status.replace("_", " ").toLowerCase()}. You are not expected to work. Do you still want to clock in?`,
        });
        return; // Stop here, wait for modal confirmation
      }
    }

    // Proceed if not blocked
    executeClockAction();
  };

  const executeClockAction = async () => {
    setIsToggling(true);
    setWarningModal({ open: false, message: "" }); // Close modal if open
    try {
      const response = await axiosInstance.post<AttendanceData>(
        "/attendance/toggle",
        {},
      );
      setAttendanceData(response.data);
      showToast(
        response.data.is_clocked_in
          ? "Clocked in successfully"
          : "Clocked out successfully",
        "success",
      );
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || "Failed to process clock action.",
        "error",
      );
    } finally {
      setIsToggling(false);
    }
  };

  // --- Dynamic Formatting Utilities ---
  const isClockedIn = attendanceData?.is_clocked_in || false;

  // Calculate total formatted time HH:MM:SS
  const totalBaseMs = (attendanceData?.total_working_hours || 0) * 3600000;
  const totalCombinedSecs = Math.floor((totalBaseMs + liveSessionMs) / 1000);

  const displayHours = Math.floor(totalCombinedSecs / 3600)
    .toString()
    .padStart(2, "0");
  const displayMins = Math.floor((totalCombinedSecs % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const displaySecs = (totalCombinedSecs % 60).toString().padStart(2, "0");

  // Calculate safe, timezone-converted start time string
  let clockedInSinceStr = "Shift hasn't started";
  if (isClockedIn && attendanceData?.current_session_start) {
    try {
      const startDateObj = new Date(attendanceData.current_session_start);
      // Fallback to local browser timezone if user.timezone is inexplicably missing
      const targetTimezone =
        user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

      const timeStr = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: targetTimezone,
      }).format(startDateObj);

      clockedInSinceStr = `Clocked in since ${timeStr}`;
    } catch (e) {
      // Failsafe in case of invalid timezone strings
      clockedInSinceStr = "Clocked in";
    }
  } else if (
    attendanceData?.total_working_hours &&
    attendanceData.total_working_hours > 0
  ) {
    clockedInSinceStr = "Currently clocked out";
  }

  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 2, md: 4, lg: 5 },
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
          Good Morning, {user?.first_name || "User"}
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
            {/* 1. API-DRIVEN TIME CLOCK WIDGET */}
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

                <Stack
                  sx={{
                    alignItems: "center",
                    mb: 4,
                    minHeight: "85px",
                    justifyContent: "center",
                  }}
                >
                  {isLoadingClock ? (
                    <CircularProgress size={30} sx={{ color: "#003d9b" }} />
                  ) : (
                    <>
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                          color: "#003d9b",
                        }}
                      >
                        {displayHours}:{displayMins}:{displaySecs}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mt: 1 }}
                      >
                        {clockedInSinceStr}
                      </Typography>
                    </>
                  )}
                </Stack>

                {/* Simplified Toggle Buttons */}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleToggleClock}
                  disabled={isLoadingClock || isToggling}
                  disableElevation
                  sx={{
                    py: 1.5,
                    backgroundColor: isClockedIn ? "#ba1a1a" : "#003d9b",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: isClockedIn ? "#93000a" : "#0052cc",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: isClockedIn
                        ? "rgba(186, 26, 26, 0.5)"
                        : "rgba(0, 61, 155, 0.5)",
                      color: "#ffffff",
                    },
                  }}
                >
                  {isToggling
                    ? "Processing..."
                    : isClockedIn
                      ? "Clock Out"
                      : "Clock In"}
                </Button>
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
                        flex: 1,
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

                    {WEEKLY_ATTENDANCE.map((data, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          zIndex: 1,
                          width: "10%",
                          height: "100%",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
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
                            height: "20px",
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
      <Dialog
        open={warningModal.open}
        onClose={() => setWarningModal({ open: false, message: "" })}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "flex-start" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "rgba(245, 158, 11, 0.1)", // Amber warning color
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <WarningAmberRounded />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}
            >
              Non-Working Day
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.5 }}
            >
              {warningModal.message}
            </Typography>
          </Box>
        </Box>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setWarningModal({ open: false, message: "" })}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={executeClockAction}
            variant="contained"
            disableElevation
            sx={{
              backgroundColor: "#d97706",
              color: "#ffffff",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": { backgroundColor: "#b45309" },
            }}
          >
            Confirm Clock In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
