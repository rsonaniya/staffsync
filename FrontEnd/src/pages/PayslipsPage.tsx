import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  TrendingUp,
  VisibilityOutlined,
  PictureAsPdfOutlined,
} from "@mui/icons-material";

// ==========================================
// 1. DATA MODELS & DUMMY DATA
// ==========================================

interface PayslipRecord {
  id: string;
  monthStr: string;
  monthShort: string;
  period: string;
  netSalary: string;
  isActive?: boolean;
}

const PAYSLIP_RECORDS: PayslipRecord[] = [
  {
    id: "1",
    monthStr: "December 2023",
    monthShort: "DEC",
    period: "01 Dec - 31 Dec",
    netSalary: "$4,850.00",
    isActive: true, // Highlights the month tag
  },
  {
    id: "2",
    monthStr: "November 2023",
    monthShort: "NOV",
    period: "01 Nov - 30 Nov",
    netSalary: "$4,620.00",
  },
  {
    id: "3",
    monthStr: "October 2023",
    monthShort: "OCT",
    period: "01 Oct - 31 Oct",
    netSalary: "$4,620.00",
  },
  {
    id: "4",
    monthStr: "September 2023",
    monthShort: "SEP",
    period: "01 Sep - 30 Sep",
    netSalary: "$4,500.00",
  },
  {
    id: "5",
    monthStr: "August 2023",
    monthShort: "AUG",
    period: "01 Aug - 31 Aug",
    netSalary: "$4,500.00",
  },
];

const TREND_DATA = [
  { month: "Apr", height: "40%" },
  { month: "May", height: "42%" },
  { month: "Jun", height: "42%" },
  { month: "Jul", height: "45%" },
  { month: "Aug", height: "45%" },
  { month: "Sep", height: "48%" },
  { month: "Oct", height: "48%" },
  { month: "Nov", height: "52%" },
  { month: "Dec", height: "60%", isCurrent: true },
];

// ==========================================
// 2. MAIN PAGE COMPONENT
// ==========================================

export default function PayslipsPage() {
  const [financialYear, setFinancialYear] = useState("2023-2024");

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
            Payslips Management
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            View and download your monthly salary statements.
          </Typography>
        </Box>

        <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.secondary" }}
          >
            Financial Year
          </Typography>
          <Select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            size="small"
            sx={{
              minWidth: 140,
              backgroundColor: "#ffffff",
              fontWeight: 500,
              "& fieldset": { borderColor: "rgba(195, 198, 214, 0.5)" },
              "& .MuiSelect-select": { py: 1 },
            }}
          >
            <MenuItem value="2023-2024">2023 - 2024</MenuItem>
            <MenuItem value="2022-2023">2022 - 2023</MenuItem>
            <MenuItem value="2021-2022">2021 - 2022</MenuItem>
          </Select>
        </Stack>
      </Stack>

      {/* Top Widgets Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Salary Trend Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "rgba(195, 198, 214, 0.5)",
              height: "100%",
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{
                p: 3,
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Chart Header */}
              <Stack
                sx={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    Salary Trend
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Net salary progression over the financial year
                  </Typography>
                </Box>
                <Chip
                  icon={
                    <TrendingUp
                      sx={{
                        fontSize: "14px !important",
                        color: "#0052cc !important",
                      }}
                    />
                  }
                  label="+4.2% YTD"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(0, 82, 204, 0.1)",
                    color: "#0052cc",
                    fontWeight: 600,
                    borderRadius: 1,
                  }}
                />
              </Stack>

              {/* CSS Bar Chart */}
              <Box
                sx={{
                  flexGrow: 1,
                  position: "relative",
                  width: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "flex-end",
                  p: 2,
                  gap: 1.5,
                  background:
                    "linear-gradient(180deg, rgba(243,244,246,0) 0%, rgba(243,244,246,1) 100%)",
                }}
              >
                {TREND_DATA.map((data, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: "100%",
                      height: data.height,
                      backgroundColor: data.isCurrent
                        ? "#003d9b"
                        : "rgba(0, 61, 155, 0.3)",
                      borderRadius: "4px 4px 0 0",
                      transition: "background-color 0.2s",
                      cursor: "pointer",
                      position: "relative",
                      "&:hover": {
                        backgroundColor: data.isCurrent
                          ? "#003d9b"
                          : "rgba(0, 61, 155, 0.5)",
                      },
                      ...(data.isCurrent && {
                        boxShadow: "0 0 12px rgba(0,61,155,0.3)",
                      }),
                    }}
                  />
                ))}
              </Box>

              {/* X-Axis Labels */}
              <Stack
                sx={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  mt: 1,
                  px: 2,
                }}
              >
                {TREND_DATA.map((data, index) => (
                  <Typography
                    key={index}
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 500,
                      fontSize: "11px",
                    }}
                  >
                    {data.month}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* YTD Summary Cards */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack sx={{ gap: 2, height: "100%" }}>
            {/* Earnings Card */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: "rgba(195, 198, 214, 0.5)",
                flex: 1,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  right: -24,
                  top: -24,
                  width: 96,
                  height: 96,
                  backgroundColor: "rgba(0, 61, 155, 0.05)",
                  borderRadius: "50%",
                  filter: "blur(20px)",
                }}
              />
              <CardContent
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}
                >
                  YTD Earnings
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  $42,850.00
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    width: "100%",
                    backgroundColor: "#e7e8ea",
                    height: 6,
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: "#003d9b",
                      width: "75%",
                      height: "100%",
                      borderRadius: 3,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Deductions Card */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: "rgba(195, 198, 214, 0.5)",
                flex: 1,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  right: -24,
                  top: -24,
                  width: 96,
                  height: 96,
                  backgroundColor: "rgba(186, 26, 26, 0.05)",
                  borderRadius: "50%",
                  filter: "blur(20px)",
                }}
              />
              <CardContent
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}
                >
                  YTD Deductions
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  $8,420.00
                </Typography>
                <Stack
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 1,
                    mt: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#ba1a1a",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Includes taxes, insurance, and benefits
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Payslips Table */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: "rgba(195, 198, 214, 0.5)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
            backgroundColor: "#f8f9fb",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Monthly Records
          </Typography>
        </Box>

        <TableContainer>
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
                  Month
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                  }}
                >
                  Period
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                  }}
                >
                  Net Salary
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {PAYSLIP_RECORDS.map((record) => (
                <TableRow
                  key={record.id}
                  sx={{
                    "&:hover": { backgroundColor: "#F0F7FF" },
                    transition: "background-color 0.2s",
                    "&:hover .action-buttons": { opacity: 1 }, // Show buttons on row hover
                  }}
                >
                  <TableCell
                    sx={{ borderBottom: "1px solid rgba(195, 198, 214, 0.3)" }}
                  >
                    <Stack
                      sx={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 600,
                          fontSize: "11px",
                          backgroundColor: record.isActive
                            ? "#cdddff"
                            : "#e7e8ea",
                          color: record.isActive ? "#001848" : "#434654",
                        }}
                      >
                        {record.monthShort}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: "text.primary" }}
                      >
                        {record.monthStr}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell
                    sx={{
                      color: "text.secondary",
                      borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                    }}
                  >
                    {record.period}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 500,
                      color: "text.primary",
                      borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                    }}
                  >
                    {record.netSalary}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{ borderBottom: "1px solid rgba(195, 198, 214, 0.3)" }}
                  >
                    <Stack
                      className="action-buttons"
                      sx={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        gap: 0.5,
                        opacity: { xs: 1, md: 0 }, // Always visible on mobile, hover-only on desktop
                        transition: "opacity 0.2s",
                      }}
                    >
                      <IconButton
                        size="small"
                        title="View Details"
                        sx={{
                          color: "text.secondary",
                          "&:hover": {
                            color: "#003d9b",
                            backgroundColor: "rgba(0, 82, 204, 0.1)",
                          },
                        }}
                      >
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Download PDF"
                        sx={{
                          color: "text.secondary",
                          "&:hover": {
                            color: "#003d9b",
                            backgroundColor: "rgba(0, 82, 204, 0.1)",
                          },
                        }}
                      >
                        <PictureAsPdfOutlined fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
