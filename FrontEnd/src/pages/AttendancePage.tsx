import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  Schedule,
  Timer,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";

// ==========================================
// 1. DATABASE-READY DATA MODEL
// ==========================================

export type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Late"
  | "Leave"
  | "LOP"
  | "Weekend"
  | "Holiday"
  | "Half Day";

export type LeaveCategory = "Annual" | "Sick" | "Casual" | null;

export interface TimeSession {
  clockIn: string; // e.g., "09:00" (In a real DB, use ISO 8601 timestamps)
  clockOut: string | null; // Null means currently clocked in
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD format is best for DB indexing
  dayNumber: number; // 1-31 (Extracted for UI convenience)
  status: AttendanceStatus;
  sessions: TimeSession[];
  leaveCategory?: LeaveCategory; // Only populated if status === 'Leave'
  isToday?: boolean;
}

export interface MonthSummary {
  totalPresent: number;
  lateMarks: number;
  avgWorkingHrs: string;
}

export interface MonthData {
  year: number;
  month: number;
  monthName: string;
  summary: MonthSummary;
  days: DailyRecord[];
}

// ==========================================
// 2. DUMMY DATA GENERATOR
// ==========================================

const generateDummyData = (): Record<string, MonthData> => {
  return {
    "2023-09": {
      // October (Index 9)
      year: 2023,
      month: 9,
      monthName: "October 2023",
      summary: { totalPresent: 18, lateMarks: 2, avgWorkingHrs: "8h 15m" },
      days: Array.from({ length: 31 }, (_, i) => {
        const dayNumber = i + 1;
        const dateStr = `2023-10-${dayNumber.toString().padStart(2, "0")}`;
        const dayOfWeek = new Date(2023, 9, dayNumber).getDay();

        // Weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          return { date: dateStr, dayNumber, status: "Weekend", sessions: [] };
        }

        // Specific Scenarios for the UI
        if (dayNumber === 4) {
          // Late with single session
          return {
            date: dateStr,
            dayNumber,
            status: "Late",
            sessions: [{ clockIn: "09:45", clockOut: "18:00" }],
          };
        }
        if (dayNumber === 9) {
          // Unapproved Absence
          return { date: dateStr, dayNumber, status: "Absent", sessions: [] };
        }
        if (dayNumber === 10) {
          // Active Shift (Clocked In, no Clock Out yet)
          return {
            date: dateStr,
            dayNumber,
            status: "Present",
            sessions: [{ clockIn: "09:00", clockOut: null }],
            isToday: true,
          };
        }
        if (dayNumber === 17) {
          // Approved Paid Leave
          return {
            date: dateStr,
            dayNumber,
            status: "Leave",
            leaveCategory: "Sick",
            sessions: [],
          };
        }
        if (dayNumber === 18) {
          // Loss of Pay (Unpaid Leave)
          return { date: dateStr, dayNumber, status: "LOP", sessions: [] };
        }
        if (dayNumber === 24) {
          // Multiple Sessions (Clocked out for lunch/errand)
          return {
            date: dateStr,
            dayNumber,
            status: "Present",
            sessions: [
              { clockIn: "08:55", clockOut: "13:00" },
              { clockIn: "14:00", clockOut: "18:15" },
            ],
          };
        }

        // Standard Present Day
        return {
          date: dateStr,
          dayNumber,
          status: "Present",
          sessions: [{ clockIn: "09:00", clockOut: "18:00" }],
        };
      }),
    },
  };
};

const MOCK_DATA = generateDummyData();
// We only generated one month for this specific DB-model demo
const AVAILABLE_MONTHS = ["2023-09"];

// ==========================================
// 3. STATS & LEGEND COMPONENTS
// ==========================================

function AttendanceStats({ summary }: { summary: MonthSummary }) {
  return (
    <Stack spacing={2}>
      <Card
        variant="outlined"
        sx={{ borderRadius: 2, borderColor: "rgba(195, 198, 214, 0.5)" }}
      >
        <CardContent
          sx={{
            p: "16px !important",
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "rgba(0, 82, 204, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0052cc",
              flexShrink: 0,
            }}
          >
            <CheckCircle fontSize="small" />
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 600,
              }}
            >
              Total Present
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              {summary.totalPresent} Days
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{ borderRadius: 2, borderColor: "rgba(195, 198, 214, 0.5)" }}
      >
        <CardContent
          sx={{
            p: "16px !important",
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "rgba(186, 26, 26, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ba1a1a",
              flexShrink: 0,
            }}
          >
            <Schedule fontSize="small" />
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 600,
              }}
            >
              Late Marks
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              {summary.lateMarks} Days
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{ borderRadius: 2, borderColor: "rgba(195, 198, 214, 0.5)" }}
      >
        <CardContent
          sx={{
            p: "16px !important",
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "rgba(0, 81, 208, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0051d0",
              flexShrink: 0,
            }}
          >
            <Timer fontSize="small" />
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 600,
              }}
            >
              Avg Working Hrs
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              {summary.avgWorkingHrs}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}

function AttendanceLegend() {
  const legends = [
    { label: "Present", color: "#E6F4EA", border: "#A1D7AC" },
    { label: "Late", color: "#FEF7E0", border: "#F6D97C" },
    { label: "Leave (Paid)", color: "#e8f0fe", border: "#8ab4f8" },
    { label: "Absent / LOP", color: "#FCE8E6", border: "#F2A29F" },
    { label: "Weekend / Holiday", color: "#e7e8ea", border: "#c3c6d6" },
  ];

  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 2, borderColor: "rgba(195, 198, 214, 0.5)", mt: 2 }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Legend
        </Typography>
        <Stack spacing={1.5}>
          {legends.map((item) => (
            <Stack
              direction="row"
              sx={{ alignItems: "center", gap: 1.5 }}
              key={item.label}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: item.color,
                  border: `1px solid ${item.border}`,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 4. MAIN CALENDAR COMPONENT
// ==========================================

interface CalendarProps {
  data: MonthData;
  onPrev: () => void;
  onNext: () => void;
  disablePrev: boolean;
  disableNext: boolean;
}

function AttendanceCalendar({
  data,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
}: CalendarProps) {
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDayOfMonth = new Date(data.year, data.month, 1).getDay();
  const paddingDays = Array.from({ length: firstDayOfMonth });

  const totalCells = firstDayOfMonth + data.days.length;
  const trailingDaysCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const trailingDays = Array.from({ length: trailingDaysCount });

  const getStatusStyles = (status: AttendanceStatus) => {
    switch (status) {
      case "Present":
        return { bg: "#E6F4EA", border: "#A1D7AC", text: "#137333" };
      case "Late":
        return { bg: "#FEF7E0", border: "#F6D97C", text: "#B06000" };
      case "Leave":
        return { bg: "#e8f0fe", border: "#8ab4f8", text: "#1967d2" };
      case "Absent":
      case "LOP":
        return { bg: "#FCE8E6", border: "#F2A29F", text: "#C5221F" };
      default:
        return null;
    }
  };

  // Helper to format sessions safely
  const formatSessions = (sessions: TimeSession[]) => {
    if (!sessions || sessions.length === 0) return null;

    // If multiple sessions, just show First In and Last Out to save UI space
    const firstIn = sessions[0].clockIn;
    const lastOut = sessions[sessions.length - 1].clockOut || "--:--";
    return `${firstIn} - ${lastOut}`;
  };

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            Attendance Overview
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Track and manage your daily attendance records.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "#ffffff",
            border: "1px solid rgba(195, 198, 214, 0.5)",
            borderRadius: 2,
            p: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={onPrev}
            disabled={disablePrev}
            sx={{ color: "text.secondary" }}
          >
            <ChevronLeft />
          </IconButton>
          <Typography
            variant="button"
            sx={{
              px: 2,
              minWidth: 120,
              textAlign: "center",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {data.monthName}
          </Typography>
          <IconButton
            size="small"
            onClick={onNext}
            disabled={disableNext}
            sx={{ color: "text.secondary" }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Stack>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: "rgba(195, 198, 214, 0.5)",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            backgroundColor: "#f3f4f6",
            borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
          }}
        >
          {WEEKDAYS.map((day) => (
            <Typography
              key={day}
              variant="caption"
              sx={{
                py: 1.5,
                textAlign: "center",
                fontWeight: 600,
                color: "text.secondary",
                textTransform: "uppercase",
                borderRight: "1px solid rgba(195, 198, 214, 0.5)",
                "&:last-child": { borderRight: "none" },
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "1px",
            backgroundColor: "rgba(195, 198, 214, 0.5)",
            flexGrow: 1,
          }}
        >
          {paddingDays.map((_, i) => (
            <Box
              key={`pad-${i}`}
              sx={{
                backgroundColor: "#e7e8ea",
                p: 1,
                minHeight: 100,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="body2" sx={{ color: "text.disabled" }}>
                {30 - firstDayOfMonth + i + 1}
              </Typography>
            </Box>
          ))}

          {data.days.map((record) => {
            const isWeekend =
              record.status === "Weekend" || record.status === "Holiday";
            const style = getStatusStyles(record.status);
            const timeString = formatSessions(record.sessions);

            return (
              <Box
                key={record.date}
                sx={{
                  backgroundColor: isWeekend ? "#e7e8ea" : "#ffffff",
                  p: 1,
                  minHeight: 100,
                  display: "flex",
                  flexDirection: "column",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: isWeekend ? "#e7e8ea" : "#f3f4f6",
                  },
                  ...(record.isToday && {
                    boxShadow: "inset 0 0 0 2px #003d9b",
                  }),
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: record.isToday ? 700 : 400,
                    color: record.isToday ? "#003d9b" : "text.primary",
                  }}
                >
                  {record.dayNumber}
                </Typography>

                {style && (
                  <Box
                    sx={{
                      mt: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        px: 0.5,
                        py: 0.25,
                        backgroundColor: style.bg,
                        border: `1px solid ${style.border}`,
                        borderRadius: 1,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: style.text,
                        }}
                      >
                        {record.status}
                      </Typography>
                    </Box>

                    {/* Render Times if Present/Late, Render Leave Category if Leave */}
                    {timeString ? (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "10px",
                          color: "text.secondary",
                          textAlign: "center",
                        }}
                      >
                        {timeString}
                        {record.sessions.length > 1 && " *"}{" "}
                        {/* Little indicator for multiple sessions */}
                      </Typography>
                    ) : record.status === "Leave" ? (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "10px",
                          color: "text.secondary",
                          textAlign: "center",
                          fontStyle: "italic",
                        }}
                      >
                        {record.leaveCategory}
                      </Typography>
                    ) : null}
                  </Box>
                )}
              </Box>
            );
          })}

          {trailingDays.map((_, i) => (
            <Box
              key={`trail-${i}`}
              sx={{
                backgroundColor: "#e7e8ea",
                p: 1,
                minHeight: 100,
                display: "flex",
                flexDirection: "column",
                opacity: 0.5,
              }}
            >
              <Typography variant="body2" sx={{ color: "text.disabled" }}>
                {i + 1}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}

// ==========================================
// 5. PARENT PAGE COMPONENT
// ==========================================

export default function AttendancePage() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const currentMonthKey = AVAILABLE_MONTHS[currentMonthIndex];
  const currentMonthData = MOCK_DATA[currentMonthKey];

  const handlePrev = () => {
    if (currentMonthIndex > 0) setCurrentMonthIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentMonthIndex < AVAILABLE_MONTHS.length - 1)
      setCurrentMonthIndex((prev) => prev + 1);
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
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 3,
        }}
      >
        <Box sx={{ flex: "0 0 auto", width: { xs: "100%", lg: "280px" } }}>
          <AttendanceStats summary={currentMonthData.summary} />
          <AttendanceLegend />
        </Box>

        <Box sx={{ flex: "1 1 auto", minWidth: 0, display: "flex" }}>
          <AttendanceCalendar
            data={currentMonthData}
            onPrev={handlePrev}
            onNext={handleNext}
            disablePrev={currentMonthIndex === 0}
            disableNext={currentMonthIndex === AVAILABLE_MONTHS.length - 1}
          />
        </Box>
      </Box>
    </Box>
  );
}
