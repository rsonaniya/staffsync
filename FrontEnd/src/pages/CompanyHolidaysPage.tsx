import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  Grid,
  Divider,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  EventAvailableOutlined,
  CelebrationOutlined,
  CalendarTodayOutlined,
} from "@mui/icons-material";
import { axiosInstance } from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";
import FullScreenLoader from "../components/FullScreenLoader";

// ==========================================
// 1. TYPES & CONSTANTS
// ==========================================

interface Holiday {
  id: number;
  name: string;
  applicable_date: string; // Format: "YYYY-MM-DD"
  is_active: boolean;
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

// Helper to format JS Date into "YYYY-MM-DD" safely
const toYMD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

export default function CompanyHolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calendar Engine States
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date()); // Tracks the month being viewed
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Tracks the exact day clicked

  const { showToast } = useToast();

  // 🚀 Fetch holidays from your new endpoint
  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get<Holiday[]>("/user/holidays");
      // Filter out inactive holidays if needed, or keep all to show them
      setHolidays(response.data.filter((h) => h.is_active));
    } catch (error: any) {
      console.error("Failed to fetch user holidays:", error);
      showToast("Failed to load company holiday calendar.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Calendar Navigation Handlers ---
  const handlePrevMonth = () => {
    setCurrentMonthDate(
      new Date(
        currentMonthDate.getFullYear(),
        currentMonthDate.getMonth() - 1,
        1,
      ),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(
      new Date(
        currentMonthDate.getFullYear(),
        currentMonthDate.getMonth() + 1,
        1,
      ),
    );
  };

  const handleDateClick = (dayNumber: number) => {
    setSelectedDate(
      new Date(
        currentMonthDate.getFullYear(),
        currentMonthDate.getMonth(),
        dayNumber,
      ),
    );
  };

  // --- Calendar Grid Computation ---
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

  // Create an array representing the grid cells (null for empty leading days, numbers for actual days)
  const calendarCells: (number | null)[] = useMemo(() => {
    const cells = Array(firstDayIndex).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push(i);
    }
    return cells;
  }, [daysInMonth, firstDayIndex]);

  // --- Selected Date Context ---
  // Find if there are any holidays matching the currently selected day
  const holidaysOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const targetYMD = toYMD(selectedDate);
    return holidays.filter((h) => h.applicable_date === targetYMD);
  }, [selectedDate, holidays]);

  return (
    <>
      {isLoading && (
        <FullScreenLoader message="Loading corporate calendar..." />
      )}

      <Box
        sx={{
          width: "100%",
          px: { xs: 2, md: 4, lg: 5 },
          pb: 4,
          pt: { xs: 10, md: 12 },
        }}
      >
        {/* Page Header */}
        <Stack sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
          >
            Company Holidays
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            View official company-wide holidays and plan your upcoming
            schedules.
          </Typography>
        </Stack>

        {/* 🚀 RESPONSIVE SPLIT LAYOUT */}
        {/* Desktop: Side-by-side. Mobile: Calendar on top, Details stacked below */}
        <Grid container spacing={4} sx={{ alignItems: "flex-start" }}>
          {/* ==========================================
              LEFT COLUMN: INTERACTIVE CALENDAR WIDGET
              ========================================== */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 4,
                borderColor: "rgba(195, 198, 214, 0.5)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                p: { xs: 2, sm: 3 },
                maxWidth: 500, // Keeps the calendar medium-sized and cleanly proportioned
                mx: "auto", // Centers it nicely if it's sitting alone on mobile
              }}
            >
              {/* Calendar Header Control Row */}
              <Stack
                direction="row"
                sx={{
                  mb: 3,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  {MONTHS[currentMonthDate.getMonth()]}{" "}
                  {currentMonthDate.getFullYear()}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    onClick={handlePrevMonth}
                    sx={{
                      backgroundColor: "#f3f4f6",
                      "&:hover": { backgroundColor: "#e5e7eb" },
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={handleNextMonth}
                    sx={{
                      backgroundColor: "#f3f4f6",
                      "&:hover": { backgroundColor: "#e5e7eb" },
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                </Stack>
              </Stack>

              {/* Days of the Week Header Row */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  mb: 2,
                  gap: 1,
                }}
              >
                {WEEKDAYS.map((day) => (
                  <Typography
                    key={day}
                    variant="caption"
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.disabled",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {day}
                  </Typography>
                ))}
              </Box>

              {/* Dynamic Calendar Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 1,
                }}
              >
                {calendarCells.map((dayNum, index) => {
                  if (dayNum === null) {
                    return <Box key={`empty-${index}`} sx={{ height: 44 }} />; // Empty placeholder cells
                  }

                  const cellDateYMD = toYMD(
                    new Date(
                      currentMonthDate.getFullYear(),
                      currentMonthDate.getMonth(),
                      dayNum,
                    ),
                  );
                  const isHoliday = holidays.some(
                    (h) => h.applicable_date === cellDateYMD,
                  );
                  const isSelected =
                    selectedDate && toYMD(selectedDate) === cellDateYMD;
                  const isToday = toYMD(new Date()) === cellDateYMD;

                  return (
                    <Box
                      key={`day-${dayNum}`}
                      onClick={() => handleDateClick(dayNum)}
                      sx={{
                        height: 44,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        borderRadius: 2,
                        position: "relative",
                        // 🚀 Dynamic Color Coding Logic
                        backgroundColor: isSelected
                          ? "#003d9b" // Selected state
                          : isHoliday
                            ? "rgba(0, 61, 155, 0.08)" // Soft highlight for holidays
                            : "transparent",
                        color: isSelected
                          ? "#ffffff" // White text if selected
                          : isHoliday
                            ? "#003d9b" // Deep blue text if holiday
                            : "text.primary", // Default text
                        fontWeight:
                          isSelected || isHoliday || isToday ? 700 : 500,
                        border:
                          isToday && !isSelected
                            ? "1px solid rgba(0, 61, 155, 0.4)"
                            : "1px solid transparent",
                        "&:hover": {
                          backgroundColor: isSelected
                            ? "#003d9b"
                            : "rgba(0, 61, 155, 0.15)",
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      {dayNum}
                      {/* Tiny indicator dot for holidays if the cell is not actively selected */}
                      {isHoliday && !isSelected && (
                        <Box
                          sx={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            backgroundColor: "#003d9b",
                            position: "absolute",
                            bottom: 4,
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>

          {/* ==========================================
              RIGHT COLUMN: DYNAMIC HOLIDAY DETAILS CARD
              ========================================== */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "text.disabled",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 2,
              }}
            >
              Selected Date Context
            </Typography>

            {holidaysOnSelectedDate.length > 0 ? (
              // 🚀 STATE: HOLIDAY FOUND
              <Stack spacing={2.5}>
                {holidaysOnSelectedDate.map((holiday) => (
                  <Card
                    key={holiday.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      borderColor: "rgba(0, 61, 155, 0.3)",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 4px 20px rgba(0, 61, 155, 0.05)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Decorative accent edge */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        backgroundColor: "#003d9b",
                      }}
                    />

                    <CardContent sx={{ p: 3, pl: 4 }}>
                      <Stack
                        direction="row"
                        sx={{
                          mb: 2,
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#003d9b", mb: 0.5 }}
                          >
                            {holiday.name}
                          </Typography>
                          <Stack
                            direction="row"
                            sx={{ alignItems: "center", gap: 1 }}
                          >
                            <EventAvailableOutlined
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary", fontWeight: 500 }}
                            >
                              {selectedDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </Typography>
                          </Stack>
                        </Box>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            backgroundColor: "rgba(0, 61, 155, 0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#003d9b",
                          }}
                        >
                          <CelebrationOutlined fontSize="small" />
                        </Box>
                      </Stack>

                      <Divider
                        sx={{ my: 2, borderColor: "rgba(195, 198, 214, 0.4)" }}
                      />

                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", lineHeight: 1.6 }}
                      >
                        This is an officially designated corporate holiday.
                        Depending on your assigned shift and regional policy
                        rules, you are not expected to clock in on this date.
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              // 🚀 STATE: NO HOLIDAY (STANDARD WORK DAY)
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderColor: "rgba(195, 198, 214, 0.5)",
                  backgroundColor: "#f8f9fb",
                  textAlign: "center",
                  py: 6,
                  px: 3,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    mx: "auto",
                    borderRadius: "50%",
                    backgroundColor: "#e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#737685",
                    mb: 2,
                  }}
                >
                  <CalendarTodayOutlined />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}
                >
                  Standard Work Day
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", maxWidth: 300, mx: "auto" }}
                >
                  There are no company holidays recognized on{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  . Standard attendance policies apply.
                </Typography>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
