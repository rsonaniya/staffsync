import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid, // Standard root import for modern Grid
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Search,
  FilterList,
  ChevronLeft,
  ChevronRight,
  Celebration,
  MenuBook,
  EventNote,
  SupportAgent,
  OpenInNew,
  ArrowForward,
  Circle,
} from "@mui/icons-material";

// ==========================================
// 1. DATA MODEL & DUMMY DATA (2026 Indian Holidays)
// ==========================================

interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: "Public" | "Company";
}

const HOLIDAYS_2026: Holiday[] = [
  { id: "1", date: "2026-01-26", name: "Republic Day", type: "Public" },
  { id: "2", date: "2026-03-03", name: "Holi", type: "Public" },
  { id: "3", date: "2026-03-20", name: "Eid-ul-Fitr", type: "Public" },
  { id: "4", date: "2026-04-03", name: "Good Friday", type: "Public" },
  { id: "5", date: "2026-05-01", name: "Labour Day", type: "Public" },
  { id: "6", date: "2026-05-27", name: "Id-ul-Zuha (Bakrid)", type: "Public" }, // "Next" holiday from May 16
  { id: "7", date: "2026-08-15", name: "Independence Day", type: "Public" },
  { id: "8", date: "2026-08-26", name: "Raksha Bandhan", type: "Company" },
  { id: "9", date: "2026-10-02", name: "Gandhi Jayanti", type: "Public" },
  { id: "10", date: "2026-10-19", name: "Dussehra", type: "Public" },
  { id: "11", date: "2026-11-08", name: "Diwali", type: "Public" },
  { id: "12", date: "2026-12-25", name: "Christmas Day", type: "Public" },
];

// Current mocked system date for dynamic "Days Left" calculation
const CURRENT_DATE = new Date("2026-05-16T00:00:00Z");

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================

function NextHolidayCard({ nextHoliday }: { nextHoliday: Holiday | null }) {
  if (!nextHoliday) return null;

  const holidayDate = new Date(nextHoliday.date);
  const diffTime = Math.abs(holidayDate.getTime() - CURRENT_DATE.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const monthShort = holidayDate.toLocaleString("default", { month: "short" });
  const dayNum = holidayDate.getDate().toString().padStart(2, "0");
  const weekday = holidayDate.toLocaleString("default", { weekday: "long" });

  return (
    <Card
      sx={{
        backgroundColor: "#003d9b",
        color: "#ffffff",
        borderRadius: 3,
        position: "relative",
        overflow: "hidden",
        minHeight: 200,
      }}
    >
      {/* Decorative Watermark */}
      <Celebration
        sx={{
          position: "absolute",
          right: -20,
          top: -20,
          fontSize: 160,
          opacity: 0.1,
          transform: "rotate(15deg)",
        }}
      />

      <CardContent
        sx={{
          p: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative", // Keeps content above the watermark
          zIndex: 1,
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "#b2c5ff", fontWeight: 600, letterSpacing: 1 }}
          >
            NEXT HOLIDAY
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
            {nextHoliday.name}
          </Typography>
        </Box>

        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mt: 4,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {monthShort} {dayNum}
            </Typography>
            <Typography variant="body2" sx={{ color: "#b2c5ff", mt: 0.5 }}>
              {weekday}
            </Typography>
          </Box>

          <Box
            sx={{
              backgroundColor: "#ffffff",
              color: "#003d9b",
              px: 2,
              py: 1,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {diffDays}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Days
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PolicyLinksCard() {
  const policies = [
    {
      label: "Holiday Pay Policy",
      icon: <MenuBook fontSize="small" />,
      actionIcon: <OpenInNew fontSize="small" />,
    },
    {
      label: "Floating Holidays Guide",
      icon: <EventNote fontSize="small" />,
      actionIcon: <OpenInNew fontSize="small" />,
    },
    {
      label: "Contact HR",
      icon: <SupportAgent fontSize="small" />,
      actionIcon: <ArrowForward fontSize="small" />,
    },
  ];

  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3, borderColor: "rgba(195, 198, 214, 0.5)" }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 1,
            display: "block",
            mb: 2,
          }}
        >
          Holiday Policies
        </Typography>
        <Stack sx={{ gap: 1 }}>
          {policies.map((policy, idx) => (
            <Box
              key={idx}
              component="a"
              href="#"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                borderRadius: 2,
                textDecoration: "none",
                color: "text.primary",
                "&:hover": { backgroundColor: "#f3f4f6" },
                "&:hover .icon-left": { color: "#003d9b" },
              }}
            >
              <Stack
                sx={{ flexDirection: "row", alignItems: "center", gap: 1.5 }}
              >
                <Box
                  className="icon-left"
                  sx={{
                    color: "text.secondary",
                    display: "flex",
                    transition: "color 0.2s",
                  }}
                >
                  {policy.icon}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {policy.label}
                </Typography>
              </Stack>
              <Box sx={{ color: "text.disabled", display: "flex" }}>
                {policy.actionIcon}
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 3. MAIN PAGE COMPONENT
// ==========================================

export default function CompanyHolidaysPage() {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [searchQuery, setSearchQuery] = useState("");

  // Determine which holiday is "Next" based on current date
  const nextHoliday = useMemo(() => {
    return (
      HOLIDAYS_2026.find(
        (h) => new Date(h.date).getTime() >= CURRENT_DATE.getTime(),
      ) || null
    );
  }, []);

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
      <Stack
        sx={{
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "flex-end" },
          justifyContent: "space-between",
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
          >
            Company Holidays
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            View and manage the official holiday schedule for your region.
          </Typography>
        </Box>

        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          size="small"
          sx={{
            minWidth: 120,
            backgroundColor: "#ffffff",
            fontWeight: 500,
            "& fieldset": { borderColor: "rgba(195, 198, 214, 0.5)" },
          }}
        >
          <MenuItem value="2025">2025</MenuItem>
          <MenuItem value="2026">2026</MenuItem>
          <MenuItem value="2027">2027</MenuItem>
        </Select>
      </Stack>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - Table */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "rgba(195, 198, 214, 0.5)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Table Toolbar */}
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                backgroundColor: "#ffffff",
              }}
            >
              <TextField
                placeholder="Search holidays..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: 250,
                  "& fieldset": { borderColor: "rgba(195, 198, 214, 0.5)" },
                  "& .MuiOutlinedInput-root": { backgroundColor: "#f3f4f6" },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search
                          fontSize="small"
                          sx={{ color: "text.secondary" }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterList fontSize="small" />}
                sx={{
                  textTransform: "none",
                  color: "text.secondary",
                  borderColor: "rgba(195, 198, 214, 0.5)",
                  "&:hover": {
                    backgroundColor: "#f3f4f6",
                    borderColor: "rgba(195, 198, 214, 0.5)",
                  },
                }}
              >
                Filter
              </Button>
            </Stack>

            {/* Table */}
            <TableContainer sx={{ flexGrow: 1 }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                      }}
                    >
                      Day
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                      }}
                    >
                      Holiday Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                      }}
                    >
                      Type
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                      }}
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {HOLIDAYS_2026.filter((h) =>
                    h.name.toLowerCase().includes(searchQuery.toLowerCase()),
                  ).map((holiday) => {
                    const hDate = new Date(holiday.date);
                    const isPassed = hDate.getTime() < CURRENT_DATE.getTime();
                    const isNext = nextHoliday?.id === holiday.id;

                    const formattedDate = hDate.toLocaleString("default", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    });
                    const weekday = hDate.toLocaleString("default", {
                      weekday: "long",
                    });

                    return (
                      <TableRow
                        key={holiday.id}
                        sx={{
                          backgroundColor: isNext
                            ? "rgba(205, 221, 255, 0.15)"
                            : "#ffffff", // Highlight next holiday row
                          "&:hover": {
                            backgroundColor: "rgba(218, 226, 255, 0.3)",
                          },
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell
                          sx={{
                            color: isNext ? "#003d9b" : "text.secondary",
                            fontWeight: isNext ? 600 : 400,
                            borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                          }}
                        >
                          {formattedDate}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                          }}
                        >
                          {weekday}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 500,
                            color: "text.primary",
                            borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                          }}
                        >
                          {holiday.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                          }}
                        >
                          <Chip
                            label={holiday.type}
                            size="small"
                            sx={{
                              backgroundColor: "#e7e8ea",
                              color: "text.secondary",
                              fontWeight: 500,
                              height: 24,
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                          }}
                        >
                          {isPassed && (
                            <Typography
                              variant="caption"
                              sx={{ color: "text.disabled" }}
                            >
                              Passed
                            </Typography>
                          )}
                          {isNext && (
                            <Chip
                              icon={
                                <Circle sx={{ fontSize: "8px !important" }} />
                              }
                              label="Upcoming"
                              size="small"
                              sx={{
                                backgroundColor: "rgba(0, 81, 208, 0.1)",
                                color: "#0051d0",
                                border: "1px solid rgba(0, 81, 208, 0.2)",
                                fontWeight: 600,
                                height: 24,
                                fontSize: "0.75rem",
                                "& .MuiChip-icon": { color: "#0051d0", ml: 1 },
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Table Pagination */}
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                borderTop: "1px solid rgba(195, 198, 214, 0.5)",
                backgroundColor: "#ffffff",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", px: 1 }}
              >
                Showing 1-{HOLIDAYS_2026.length} of {HOLIDAYS_2026.length}{" "}
                holidays
              </Typography>
              <Stack sx={{ flexDirection: "row", gap: 0.5 }}>
                <IconButton
                  size="small"
                  disabled
                  sx={{ color: "text.disabled" }}
                >
                  <ChevronLeft fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: "text.primary",
                    "&:hover": { backgroundColor: "#f3f4f6" },
                  }}
                >
                  <ChevronRight fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* Right Column - Widgets */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack sx={{ gap: 3 }}>
            <NextHolidayCard nextHoliday={nextHoliday} />
            <PolicyLinksCard />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
