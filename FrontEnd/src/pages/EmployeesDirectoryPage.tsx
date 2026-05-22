import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
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
  Typography,
} from "@mui/material";
import {
  PersonAdd,
  Groups,
  GroupAdd,
  WorkOff,
  Search,
  FilterList,
  FileDownload,
  MoreVert,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// ==========================================
// 1. DATA MODELS & DUMMY DATA
// ==========================================

interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  department: string;
  status: "Active" | "Inactive";
}

const EMPLOYEES_DATA: EmployeeRecord[] = [
  {
    id: "#EMP-00124",
    name: "Sarah Jenkins",
    email: "sarah.j@enterprise.com",
    avatarUrl: "https://i.pravatar.cc/150?u=sarah",
    role: "Senior Product Designer",
    department: "Product & Design",
    status: "Active",
  },
  {
    id: "#EMP-00128",
    name: "Michael Chen",
    email: "m.chen@enterprise.com",
    avatarUrl: "https://i.pravatar.cc/150?u=michael",
    role: "Lead Data Analyst",
    department: "Business Intelligence",
    status: "Active",
  },
  {
    id: "#EMP-00142",
    name: "Elena Rodriguez",
    email: "e.rodriguez@enterprise.com",
    avatarUrl: "https://i.pravatar.cc/150?u=elena",
    role: "HR Manager",
    department: "Human Resources",
    status: "Inactive",
  },
  {
    id: "#EMP-00155",
    name: "David Smith",
    email: "d.smith@enterprise.com",
    avatarUrl: "https://i.pravatar.cc/150?u=david",
    role: "DevOps Lead",
    department: "Engineering",
    status: "Active",
  },
  {
    id: "#EMP-00168",
    name: "Amelia Clarke",
    email: "a.clarke@enterprise.com",
    avatarUrl: "https://i.pravatar.cc/150?u=amelia",
    role: "Marketing Director",
    department: "Marketing",
    status: "Active",
  },
];

// ==========================================
// 2. MAIN PAGE COMPONENT
// ==========================================

export default function EmployeesDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "flex-end" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
          >
            Employee Directory
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Manage company staff and access profiles.
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableElevation
          startIcon={<PersonAdd />}
          sx={{
            backgroundColor: "#003d9b",
            color: "#ffffff",
            fontWeight: 600,
            textTransform: "none",
            px: 3,
            py: 1,
            borderRadius: 2,
            "&:hover": { backgroundColor: "#0052cc" },
          }}
          onClick={() => navigate("/employees/new")}
        >
          Add Employee
        </Button>
      </Stack>

      {/* Metrics Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Metric Card 1 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "rgba(195, 198, 214, 0.5)",
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
            }}
          >
            <CardContent
              sx={{
                p: "24px !important",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
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
                  flexShrink: 0,
                }}
              >
                <Groups />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.disabled",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Total Headcount
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "text.primary", mt: 0.5 }}
                >
                  1,248
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric Card 2 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "rgba(195, 198, 214, 0.5)",
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
            }}
          >
            <CardContent
              sx={{
                p: "24px !important",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "rgba(0, 81, 208, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0051d0",
                  flexShrink: 0,
                }}
              >
                <GroupAdd />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.disabled",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  New Joinees
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
                    variant="h4"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    24
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "#15803d" }}
                  >
                    +12% from last month
                  </Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric Card 3 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "rgba(195, 198, 214, 0.5)",
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
            }}
          >
            <CardContent
              sx={{
                p: "24px !important",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "rgba(186, 26, 26, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ba1a1a",
                  flexShrink: 0,
                }}
              >
                <WorkOff />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.disabled",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  On Leave Today
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "text.primary", mt: 0.5 }}
                >
                  15
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Data Table Card */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: "rgba(195, 198, 214, 0.5)",
          overflow: "hidden",
        }}
      >
        {/* Table Toolbar */}
        <Stack
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            p: 2,
            gap: 2,
            borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
          }}
        >
          <TextField
            placeholder="Filter list..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 320 },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f3f4f6",
                borderRadius: 2,
              },
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
          <Stack sx={{ flexDirection: "row", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList fontSize="small" />}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                borderColor: "rgba(195, 198, 214, 0.5)",
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                  borderColor: "rgba(195, 198, 214, 0.5)",
                },
              }}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload fontSize="small" />}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                borderColor: "rgba(195, 198, 214, 0.5)",
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                  borderColor: "rgba(195, 198, 214, 0.5)",
                },
              }}
            >
              Export
            </Button>
          </Stack>
        </Stack>

        {/* Table Content */}
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
              <TableRow>
                {[
                  "Employee ID",
                  "Employee Name",
                  "Role / Designation",
                  "Department",
                  "Status",
                  "Action",
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "text.disabled",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                      py: 2,
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {EMPLOYEES_DATA.map((employee) => (
                <TableRow
                  key={employee.id}
                  sx={{
                    "&:hover": { backgroundColor: "#F0F7FF" },
                    transition: "background-color 0.2s",
                    "& td": {
                      borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                    },
                  }}
                >
                  <TableCell sx={{ color: "text.secondary", fontWeight: 500 }}>
                    {employee.id}
                  </TableCell>
                  <TableCell>
                    <Stack
                      sx={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Avatar
                        src={employee.avatarUrl}
                        sx={{
                          width: 40,
                          height: 40,
                          border: "1px solid rgba(195, 198, 214, 0.5)",
                        }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "text.primary" }}
                        >
                          {employee.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.disabled" }}
                        >
                          {employee.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {employee.role}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {employee.department}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.status}
                      size="small"
                      sx={{
                        backgroundColor:
                          employee.status === "Active"
                            ? "rgba(21, 128, 61, 0.1)"
                            : "#e7e8ea",
                        color:
                          employee.status === "Active" ? "#15803d" : "#434654",
                        fontWeight: 700,
                        px: 1,
                        height: 24,
                        fontSize: "0.75rem",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      sx={{
                        color: "text.secondary",
                        "&:hover": {
                          backgroundColor: "#e1e2e4",
                          color: "text.primary",
                        },
                      }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Custom Pagination Footer */}
        <Stack
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            gap: 2,
            backgroundColor: "rgba(243, 244, 246, 0.5)",
            borderTop: "1px solid rgba(195, 198, 214, 0.3)",
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Showing 1 to 5 of 1,248 entries
          </Typography>

          <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(195, 198, 214, 0.5)",
                borderRadius: 1,
                color: "text.disabled",
                cursor: "not-allowed",
              }}
            >
              <ChevronLeft fontSize="small" />
            </Box>

            <Box
              sx={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#003d9b",
                color: "#ffffff",
                borderRadius: 1,
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              1
            </Box>

            {["2", "3"].map((page) => (
              <Box
                key={page}
                sx={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(195, 198, 214, 0.5)",
                  color: "text.secondary",
                  borderRadius: 1,
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#e1e2e4" },
                }}
              >
                {page}
              </Box>
            ))}

            <Box
              sx={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(195, 198, 214, 0.5)",
                borderRadius: 1,
                color: "text.secondary",
                cursor: "pointer",
                "&:hover": { backgroundColor: "#e1e2e4" },
              }}
            >
              <ChevronRight fontSize="small" />
            </Box>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
}
