import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  IconButton,
  Stack,
  Grid,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  AccessTimeOutlined,
  MoreHorizOutlined,
} from "@mui/icons-material";
import { axiosInstance } from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";
import { AttendanceStatus } from "../types/enums";
import { useAuth } from "../context/AuthContext";

// ==========================================
// 1. TYPES & CONFIGURATION
// ==========================================

interface CalendarDaySummary {
  applicable_date: string;
  status: AttendanceStatus;
}

interface Session {
  id: number;
  clock_in: string;
  clock_out: string | null;
}

interface AttendanceDayDetail {
  id: number;
  applicable_date: string;
  status: AttendanceStatus;
  total_working_hours: number;
  is_late: boolean;
  sessions: Session[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; initial: string; color: string; bg: string }
> = {
  [AttendanceStatus.PRESENT]: {
    label: "Present",
    initial: "P",
    color: "#15803d",
    bg: "rgba(21, 128, 61, 0.1)",
  },
  [AttendanceStatus.ABSENT]: {
    label: "Absent",
    initial: "A",
    color: "#ba1a1a",
    bg: "rgba(186, 26, 26, 0.1)",
  },
  [AttendanceStatus.ON_LEAVE]: {
    label: "On Leave",
    initial: "L",
    color: "#d97706",
    bg: "rgba(245, 158, 11, 0.1)",
  },
  [AttendanceStatus.HOLIDAY]: {
    label: "Holiday",
    initial: "H",
    color: "#003d9b",
    bg: "rgba(0, 61, 155, 0.1)",
  },
  [AttendanceStatus.WEEK_OFF]: {
    label: "Week Off",
    initial: "WO",
    color: "#737685",
    bg: "rgba(115, 118, 133, 0.1)",
  },
  [AttendanceStatus.HALF_DAY]: {
    label: "Half Day",
    initial: "HD",
    color: "#0284c7",
    bg: "rgba(2, 132, 199, 0.1)",
  },
  [AttendanceStatus.REGULARIZATION_PENDING]: {
    label: "Reg. Pending",
    initial: "RP",
    color: "#6d28d9",
    bg: "rgba(109, 40, 217, 0.1)",
  },
};

const toYMD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatHours = (decimalHours: number) => {
  if (!decimalHours || isNaN(decimalHours)) return "0h 0m";
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);
  return `${h}h ${m}m`;
};

const getErrorMessage = (error: any) => {
  const detail = error.response?.data?.detail;
  return Array.isArray(detail)
    ? detail[0]?.msg
    : detail || "An error occurred while fetching data.";
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

export default function AttendancePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDaySummary[]>([]);
  const [dayDetail, setDayDetail] = useState<AttendanceDayDetail | null>(null);
  const [_isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchCalendar = async (targetDate: Date) => {
    setIsLoadingCalendar(true);
    try {
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      const response = await axiosInstance.get(`/attendance/calendar`, {
        params: { year, month },
      });
      setCalendarData(response.data);
    } catch (error: any) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const fetchDayDetail = async (targetDate: Date) => {
    setIsLoadingDetail(true);
    try {
      const ymd = toYMD(targetDate);
      const response = await axiosInstance.get(`/attendance/detail/${ymd}`);
      setDayDetail(response.data);
    } catch (error: any) {
      if (error.response?.status !== 404)
        showToast(getErrorMessage(error), "error");
      setDayDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchCalendar(currentMonthDate);
  }, [currentMonthDate.getFullYear(), currentMonthDate.getMonth()]);
  useEffect(() => {
    fetchDayDetail(selectedDate);
  }, [selectedDate]);

  const calendarCells = useMemo(() => {
    const daysInMonth = new Date(
      currentMonthDate.getFullYear(),
      currentMonthDate.getMonth() + 1,
      0,
    ).getDate();
    const firstDayIndex = new Date(
      currentMonthDate.getFullYear(),
      currentMonthDate.getMonth(),
      1,
    ).getDay();
    const cells = Array(firstDayIndex).fill(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);
    return cells;
  }, [currentMonthDate]);

  const calendarMap = useMemo(
    () => new Map(calendarData.map((d) => [d.applicable_date, d])),
    [calendarData],
  );

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "Ongoing";
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: user?.timezone || "UTC",
    }).format(new Date(isoString));
  };

  const calcDuration = (start: string, end: string | null) => {
    const s = new Date(start).getTime();
    const e = end ? new Date(end).getTime() : new Date().getTime();
    return formatHours((e - s) / 3600000);
  };

  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 2, md: 4, lg: 5 },
        pb: 4,
        pt: { xs: 10, md: 12 },
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Attendance
      </Typography>

      <Grid container spacing={4} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 4, p: 3, maxWidth: 550, mx: "auto" }}
          >
            <Stack
              sx={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {MONTHS[currentMonthDate.getMonth()]}{" "}
                {currentMonthDate.getFullYear()}
              </Typography>
              <Stack sx={{ flexDirection: "row" }}>
                <IconButton
                  onClick={() =>
                    setCurrentMonthDate(
                      (d) => new Date(d.getFullYear(), d.getMonth() - 1),
                    )
                  }
                >
                  <ChevronLeft />
                </IconButton>
                <IconButton
                  onClick={() =>
                    setCurrentMonthDate(
                      (d) => new Date(d.getFullYear(), d.getMonth() + 1),
                    )
                  }
                >
                  <ChevronRight />
                </IconButton>
              </Stack>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 1,
              }}
            >
              {WEEKDAYS.map((d) => (
                <Typography
                  key={d}
                  variant="caption"
                  sx={{ textAlign: "center", fontWeight: 700 }}
                >
                  {d}
                </Typography>
              ))}
              {calendarCells.map((dayNum, index) => {
                if (!dayNum) return <Box key={index} sx={{ height: 50 }} />;
                const cellYMD = toYMD(
                  new Date(
                    currentMonthDate.getFullYear(),
                    currentMonthDate.getMonth(),
                    dayNum,
                  ),
                );
                const data = calendarMap.get(cellYMD);
                const config = data ? STATUS_CONFIG[data.status] : null;
                const isSelected = toYMD(selectedDate) === cellYMD;

                return (
                  <Box
                    key={dayNum}
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          currentMonthDate.getFullYear(),
                          currentMonthDate.getMonth(),
                          dayNum,
                        ),
                      )
                    }
                    sx={{
                      height: 50,
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      pt: 0.5,
                      cursor: "pointer",
                      backgroundColor: isSelected
                        ? "#003d9b"
                        : config?.bg || "transparent",
                      color: isSelected ? "#fff" : "inherit",
                      border:
                        toYMD(new Date()) === cellYMD
                          ? "1px solid #003d9b"
                          : "none",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.9rem" }}>
                      {dayNum}
                    </Typography>
                    {config && (
                      <Typography
                        sx={{
                          fontSize: "9px",
                          fontWeight: 800,
                          color: isSelected ? "#fff" : config.color,
                        }}
                      >
                        {config.initial}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 3, p: 3, minHeight: 300 }}
          >
            {isLoadingDetail ? (
              <CircularProgress />
            ) : dayDetail ? (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedDate.toDateString()}
                </Typography>
                <Chip
                  label={STATUS_CONFIG[dayDetail.status]?.label}
                  sx={{
                    my: 1,
                    backgroundColor: STATUS_CONFIG[dayDetail.status]?.bg,
                  }}
                />
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  {dayDetail.sessions.map((s, i) => (
                    <Box
                      key={i}
                      sx={{
                        p: 1.5,
                        bgcolor: "#f8f9fb",
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <AccessTimeOutlined fontSize="small" />
                        <Typography variant="body2">
                          {formatTime(s.clock_in)} - {formatTime(s.clock_out)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {calcDuration(s.clock_in, s.clock_out)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </>
            ) : (
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <MoreHorizOutlined
                  sx={{ fontSize: 40, color: "text.disabled" }}
                />
                <Typography color="text.secondary">
                  No attendance record for{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
