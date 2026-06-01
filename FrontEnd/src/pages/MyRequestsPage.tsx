import { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  Search,
  PendingActions,
  CheckCircle,
  EventAvailable,
  FlightTakeoff,
  MedicalServices,
  School,
  HomeWork,
  Schedule,
  Check,
  Close,
  MoreVert,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";

// ==========================================
// 1. DATA MODELS & DUMMY DATA
// ==========================================

type RequestStatus = "Pending" | "Approved" | "Rejected";
type RequestType =
  | "Annual Leave"
  | "Sick Leave"
  | "Training"
  | "Work From Home";

interface Approver {
  initials: string;
  name: string;
}

interface RequestRecord {
  id: string;
  type: RequestType;
  dateRange: string;
  appliedOn: string;
  approver: Approver;
  status: RequestStatus;
}

const REQUESTS_DATA: RequestRecord[] = [
  {
    id: "REQ-2023-089",
    type: "Annual Leave",
    dateRange: "Oct 12 - Oct 15, 2023",
    appliedOn: "Oct 01, 2023",
    approver: { initials: "JD", name: "Jane Doe" },
    status: "Pending",
  },
  {
    id: "REQ-2023-075",
    type: "Sick Leave",
    dateRange: "Sep 05, 2023",
    appliedOn: "Sep 06, 2023",
    approver: { initials: "JD", name: "Jane Doe" },
    status: "Approved",
  },
  {
    id: "REQ-2023-062",
    type: "Training",
    dateRange: "Aug 20 - Aug 22, 2023",
    appliedOn: "Jul 15, 2023",
    approver: { initials: "MS", name: "Mark Smith" },
    status: "Rejected",
  },
  {
    id: "REQ-2023-091",
    type: "Work From Home",
    dateRange: "Oct 20, 2023",
    appliedOn: "Oct 10, 2023",
    approver: { initials: "JD", name: "Jane Doe" },
    status: "Pending",
  },
];

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

const getTypeIcon = (type: RequestType) => {
  switch (type) {
    case "Annual Leave":
      return (
        <FlightTakeoff
          fontSize="small"
          sx={{ color: "text.secondary", fontSize: 18 }}
        />
      );
    case "Sick Leave":
      return (
        <MedicalServices
          fontSize="small"
          sx={{ color: "text.secondary", fontSize: 18 }}
        />
      );
    case "Training":
      return (
        <School
          fontSize="small"
          sx={{ color: "text.secondary", fontSize: 18 }}
        />
      );
    case "Work From Home":
      return (
        <HomeWork
          fontSize="small"
          sx={{ color: "text.secondary", fontSize: 18 }}
        />
      );
  }
};

const getStatusConfig = (status: RequestStatus) => {
  switch (status) {
    case "Pending":
      return {
        bg: "#fff8e1",
        text: "#f57f17",
        border: "#ffe082",
        icon: <Schedule sx={{ fontSize: 14 }} />,
      };
    case "Approved":
      return {
        bg: "#e6f4ea",
        text: "#0b8043",
        border: "#a8dab5",
        icon: <Check sx={{ fontSize: 14 }} />,
      };
    case "Rejected":
      return {
        bg: "#ffdad6",
        text: "#ba1a1a",
        border: "#ffb4ab",
        icon: <Close sx={{ fontSize: 14 }} />,
      };
  }
};

// ==========================================
// 3. MAIN PAGE COMPONENT
// ==========================================

export default function MyRequestsPage() {
  const [filterMode, setFilterMode] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 2, md: 4, lg: 5 },
        pb: 4,
        pt: { xs: 10, md: 12 },
      }}
    >
      {/* Page Header & Top Actions */}
      <Stack
        sx={{
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
          >
            My Requests
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Track and manage your submitted requests.
          </Typography>
        </Box>

        <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          {/* Segmented Filter Control */}
          <ToggleButtonGroup
            value={filterMode}
            exclusive
            onChange={(_e, newVal) => {
              if (newVal) setFilterMode(newVal);
            }}
            size="small"
            sx={{
              height: 36,
              backgroundColor: "#ffffff",
              "& .MuiToggleButton-root": {
                textTransform: "none",
                px: 2,
                fontWeight: 500,
                color: "text.secondary",
              },
              "& .Mui-selected": {
                backgroundColor: "#f3f4f6 !important",
                color: "text.primary !important",
              },
            }}
          >
            <ToggleButton value="All">All</ToggleButton>
            <ToggleButton value="Pending">Pending</ToggleButton>
            <ToggleButton value="Completed">Completed</ToggleButton>
          </ToggleButtonGroup>

          {/* Search Input */}
          <TextField
            placeholder="Filter requests..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: 220,
              backgroundColor: "#ffffff",
              "& .MuiOutlinedInput-root": { height: 36 },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </Stack>

      {/* Bento Grid: Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Card 1: Pending */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: "rgba(195, 198, 214, 0.5)",
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
            }}
          >
            <CardContent
              sx={{
                p: "24px !important",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Pending
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "#003d9b", mt: 0.5 }}
                >
                  3
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "rgba(0, 82, 204, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0052cc",
                }}
              >
                <PendingActions />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Approved (YTD) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: "rgba(195, 198, 214, 0.5)",
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
            }}
          >
            <CardContent
              sx={{
                p: "24px !important",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Approved (YTD)
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "#0b8043", mt: 0.5 }}
                >
                  12
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "#e6f4ea",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0b8043",
                }}
              >
                <CheckCircle />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3: Available Leave */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: "rgba(195, 198, 214, 0.5)",
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
            }}
          >
            <CardContent
              sx={{
                p: "24px !important",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Available Leave
                </Typography>
                <Stack
                  sx={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    8
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    days
                  </Typography>
                </Stack>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                }}
              >
                <EventAvailable />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Data Table */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: "rgba(195, 198, 214, 0.5)",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                  }}
                >
                  Request ID
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
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                  }}
                >
                  Date Range
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                  }}
                >
                  Applied On
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                  }}
                >
                  Approver
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {REQUESTS_DATA.map((record) => {
                const statusCfg = getStatusConfig(record.status);

                return (
                  <TableRow
                    key={record.id}
                    sx={{
                      "&:hover": { backgroundColor: "#F0F7FF" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#003d9b",
                        borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                      }}
                    >
                      {record.id}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                      }}
                    >
                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {getTypeIcon(record.type)}
                        <Typography variant="body2">{record.type}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                      }}
                    >
                      {record.dateRange}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "text.secondary",
                        borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                      }}
                    >
                      {record.appliedOn}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                      }}
                    >
                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: "11px",
                            backgroundColor: "#e1e2e4",
                            color: "text.secondary",
                            fontWeight: 600,
                          }}
                        >
                          {record.approver.initials}
                        </Avatar>
                        <Typography variant="body2">
                          {record.approver.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                      }}
                    >
                      <Chip
                        icon={statusCfg.icon}
                        label={record.status}
                        size="small"
                        sx={{
                          backgroundColor: statusCfg.bg,
                          color: statusCfg.text,
                          border: `1px solid ${statusCfg.border}`,
                          fontWeight: 500,
                          borderRadius: 1,
                          height: 24,
                          "& .MuiChip-icon": { color: statusCfg.text, ml: 0.5 },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{
                          color: "text.secondary",
                          "&:hover": {
                            color: "#003d9b",
                            backgroundColor: "#e8f0fe",
                          },
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Custom Pagination Footer */}
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            backgroundColor: "#f3f4f6",
            borderTop: "1px solid rgba(195, 198, 214, 0.5)",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Showing 1 to 4 of 24 entries
          </Typography>

          <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 0.5 }}>
            <IconButton size="small" disabled sx={{ color: "text.disabled" }}>
              <ChevronLeft fontSize="small" />
            </IconButton>

            {/* Active Page */}
            <Box
              sx={{
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#003d9b",
                color: "#ffffff",
                borderRadius: 1,
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              1
            </Box>

            {/* Inactive Pages */}
            {["2", "3", "...", "6"].map((page, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                  borderRadius: 1,
                  fontWeight: 500,
                  fontSize: "14px",
                  cursor: page === "..." ? "default" : "pointer",
                  "&:hover": {
                    backgroundColor: page === "..." ? "transparent" : "#e1e2e4",
                  },
                }}
              >
                {page}
              </Box>
            ))}

            <IconButton
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "#003d9b", backgroundColor: "#e1e2e4" },
              }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
}
