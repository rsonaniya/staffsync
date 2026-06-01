import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  Add,
  Close,
  FilterList,
  SickOutlined,
  FlightTakeoffOutlined,
  LocalCafeOutlined,
  Circle,
  CloudUploadOutlined,
} from "@mui/icons-material";

// ==========================================
// 1. DATA MODELS & DUMMY DATA
// ==========================================

type LeaveType = "Annual" | "Sick" | "Casual";
type LeaveStatus = "Approved" | "Pending" | "Rejected";

interface LeaveBalance {
  type: LeaveType;
  used: number;
  total: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

interface LeaveHistoryRecord {
  id: string;
  type: LeaveType;
  dateRange: string;
  duration: string;
  status: LeaveStatus;
}

const LEAVE_BALANCES: LeaveBalance[] = [
  {
    type: "Sick",
    used: 12,
    total: 14,
    icon: <SickOutlined fontSize="small" />,
    iconBg: "#dae2ff",
    iconColor: "#001848",
  },
  {
    type: "Annual",
    used: 18,
    total: 20,
    icon: <FlightTakeoffOutlined fontSize="small" />,
    iconBg: "#d6e3ff",
    iconColor: "#091c35",
  },
  {
    type: "Casual",
    used: 2,
    total: 3,
    icon: <LocalCafeOutlined fontSize="small" />,
    iconBg: "#dbe1ff",
    iconColor: "#00184a",
  },
];

const LEAVE_HISTORY: LeaveHistoryRecord[] = [
  {
    id: "1",
    type: "Sick",
    dateRange: "Oct 12, 2023 - Oct 13, 2023",
    duration: "2 Days",
    status: "Approved",
  },
  {
    id: "2",
    type: "Annual",
    dateRange: "Nov 20, 2023 - Nov 24, 2023",
    duration: "5 Days",
    status: "Pending",
  },
  {
    id: "3",
    type: "Casual",
    dateRange: "Sep 01, 2023",
    duration: "1 Day",
    status: "Approved",
  },
  {
    id: "4",
    type: "Sick",
    dateRange: "Jul 05, 2023",
    duration: "Half Day",
    status: "Rejected",
  },
];

// ==========================================
// 2. MAIN PAGE COMPONENT
// ==========================================

export default function LeavesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dayType, setDayType] = useState<"full" | "half">("full");

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const getLeaveIcon = (type: LeaveType) => {
    switch (type) {
      case "Sick":
        return <SickOutlined fontSize="small" sx={{ color: "#4f5f7b" }} />;
      case "Annual":
        return (
          <FlightTakeoffOutlined fontSize="small" sx={{ color: "#4f5f7b" }} />
        );
      case "Casual":
        return <LocalCafeOutlined fontSize="small" sx={{ color: "#4f5f7b" }} />;
    }
  };

  const getStatusStyles = (status: LeaveStatus) => {
    switch (status) {
      case "Approved":
        return { bg: "#E6F4EA", text: "#137333" };
      case "Pending":
        return { bg: "#FEF7E0", text: "#B06000" };
      case "Rejected":
        return { bg: "#FCE8E6", text: "#C5221F" };
    }
  };

  // Reusable styling for the inputs inside the modal to match the Tailwind "filled" look
  const filledInputStyles = {
    backgroundColor: "#f3f4f6", // surface-container-low
    borderRadius: "4px 4px 0 0",
    "&:before": { borderBottom: "1px solid #c3c6d6" }, // outline-variant
    "&:hover:not(.Mui-disabled):before": { borderBottom: "1px solid #737685" },
    "&:after": { borderBottom: "2px solid #003d9b" }, // primary focus
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
      {/* Page Header */}
      <Stack
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
          >
            Leaves Management
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Track and manage your leave balances and history.
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Add />}
          onClick={handleOpenModal}
          sx={{
            backgroundColor: "#003d9b",
            color: "#ffffff",
            fontWeight: 600,
            textTransform: "none",
            px: 2,
            py: 1,
            "&:hover": { backgroundColor: "#0052cc" },
          }}
        >
          Apply Leave
        </Button>
      </Stack>

      {/* Bento Grid: Leave Balances */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 3,
          mb: 4,
        }}
      >
        {LEAVE_BALANCES.map((balance, index) => (
          <Card
            key={index}
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
                p: 3,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between",
              }}
            >
              <Stack
                sx={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: balance.iconBg,
                    color: balance.iconColor,
                    p: 1,
                    borderRadius: 1,
                    display: "flex",
                  }}
                >
                  {balance.icon}
                </Box>
                <Chip
                  label={`${balance.type} Leave`}
                  size="small"
                  sx={{
                    backgroundColor: "#f3f4f6",
                    color: "text.secondary",
                    fontWeight: 500,
                    borderRadius: 1,
                  }}
                />
              </Stack>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 0.5 }}
                >
                  {balance.type} Balance
                </Typography>
                <Stack
                  sx={{ flexDirection: "row", alignItems: "baseline", gap: 1 }}
                >
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    {balance.used}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    / {balance.total} days
                  </Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Leave History Table */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: "rgba(195, 198, 214, 0.5)",
          overflow: "hidden",
        }}
      >
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
            backgroundColor: "#f3f4f6",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Leave History
          </Typography>
          <IconButton
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "text.primary", backgroundColor: "#e1e2e4" },
            }}
          >
            <FilterList fontSize="small" />
          </IconButton>
        </Stack>

        <TableContainer>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    width: "25%",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                  }}
                >
                  Type
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    width: "33%",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                  }}
                >
                  Date Range
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    width: "25%",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                  }}
                >
                  Duration
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
              {LEAVE_HISTORY.map((record) => {
                const statusStyle = getStatusStyles(record.status);
                return (
                  <TableRow
                    key={record.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(218, 226, 255, 0.15)",
                      },
                      "&:last-child td": { borderBottom: 0 },
                    }}
                  >
                    <TableCell
                      sx={{
                        borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                      }}
                    >
                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        {getLeaveIcon(record.type)}
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {record.type} Leave
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "text.secondary",
                        borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                      }}
                    >
                      {record.dateRange}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                      }}
                    >
                      {record.duration}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                      }}
                    >
                      <Chip
                        label={record.status}
                        size="small"
                        sx={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          fontWeight: 600,
                          borderRadius: 1,
                          height: 24,
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ========================================== */}
      {/* 3. NEW APPLY LEAVE MODAL (DIALOG)          */}
      {/* ========================================== */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              borderColor: "rgba(195, 198, 214, 0.5)",
              border: "1px solid",
              maxHeight: "90vh",
            },
          },
        }}
      >
        {/* Modal Header */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 3,
            pb: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            Apply for Leave
          </Typography>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              color: "text.secondary",
              "&:hover": { backgroundColor: "#f3f4f6" },
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        {/* Balances Summary Badges */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Stack sx={{ flexDirection: "row", gap: 1, flexWrap: "wrap" }}>
            <Chip
              icon={
                <Circle sx={{ fontSize: "8px !important", color: "#0052cc" }} />
              }
              label="Annual: 18 days"
              size="small"
              sx={{
                backgroundColor: "rgba(0, 82, 204, 0.1)",
                color: "#0052cc",
                border: "1px solid rgba(0, 82, 204, 0.2)",
                fontWeight: 500,
              }}
            />
            <Chip
              icon={
                <Circle sx={{ fontSize: "8px !important", color: "#4f5f7b" }} />
              }
              label="Sick: 12 days"
              size="small"
              sx={{
                backgroundColor: "rgba(79, 95, 123, 0.1)",
                color: "#4f5f7b",
                border: "1px solid rgba(79, 95, 123, 0.2)",
                fontWeight: 500,
              }}
            />
            <Chip
              icon={
                <Circle sx={{ fontSize: "8px !important", color: "#003c9e" }} />
              }
              label="Casual: 2 days"
              size="small"
              sx={{
                backgroundColor: "rgba(0, 60, 158, 0.1)",
                color: "#003c9e",
                border: "1px solid rgba(0, 60, 158, 0.2)",
                fontWeight: 500,
              }}
            />
          </Stack>
        </Box>

        {/* Modal Body */}
        <DialogContent
          sx={{
            p: 3,
            pt: 0,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            overflowY: "auto",
          }}
        >
          {/* Leave Type Select */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "text.secondary", ml: 0.5 }}
            >
              Leave Type
            </Typography>
            <Select
              variant="filled"
              defaultValue="Annual"
              disableUnderline={false}
              sx={filledInputStyles}
            >
              <MenuItem value="Annual">Annual Leave</MenuItem>
              <MenuItem value="Sick">Sick Leave</MenuItem>
              <MenuItem value="Casual">Casual Leave</MenuItem>
            </Select>
          </Box>

          {/* Day Type (Segmented Control) */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "text.secondary", ml: 0.5 }}
            >
              Day Type
            </Typography>
            <ToggleButtonGroup
              value={dayType}
              exclusive
              onChange={(_e, newVal) => {
                if (newVal) setDayType(newVal);
              }}
              sx={{
                height: 40,
                width: "fit-content",
                backgroundColor: "#ffffff",
                border: "1px solid #c3c6d6",
                "& .MuiToggleButton-root": {
                  border: "none",
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  color: "text.secondary",
                },
                "& .Mui-selected": {
                  backgroundColor: "#ffffff !important",
                  color: "#003d9b !important",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                },
              }}
            >
              <ToggleButton value="full">Full Day</ToggleButton>
              <ToggleButton value="half">Half Day</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Date Pickers */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "text.secondary", ml: 0.5 }}
              >
                From Date
              </Typography>
              <TextField
                type="date"
                variant="filled"
                slotProps={{ input: { sx: filledInputStyles } }}
              />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "text.secondary", ml: 0.5 }}
              >
                To Date
              </Typography>
              <TextField
                type="date"
                variant="filled"
                slotProps={{ input: { sx: filledInputStyles } }}
              />
            </Box>
          </Box>

          {/* Reason Textarea */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "text.secondary", ml: 0.5 }}
            >
              Reason
            </Typography>
            <TextField
              multiline
              rows={3}
              variant="filled"
              placeholder="Please provide a detailed reason..."
              slotProps={{ input: { sx: filledInputStyles } }}
            />
          </Box>

          {/* File Upload Dropzone */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "text.secondary", ml: 0.5 }}
            >
              Attachment
            </Typography>
            <Box
              sx={{
                border: "2px dashed #c3c6d6",
                borderRadius: 2,
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                cursor: "pointer",
                backgroundColor: "#ffffff",
                transition: "background-color 0.2s",
                "&:hover": { backgroundColor: "#f3f4f6" },
              }}
            >
              <CloudUploadOutlined
                sx={{ fontSize: 32, color: "text.disabled" }}
              />
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  Click or drag to upload file
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  PDF, JPG or PNG (max 5MB)
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        {/* Modal Footer */}
        <DialogActions
          sx={{ p: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button
            onClick={handleCloseModal}
            sx={{
              color: "#003d9b",
              textTransform: "uppercase",
              letterSpacing: 1,
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleCloseModal}
            sx={{
              backgroundColor: "#003d9b",
              textTransform: "uppercase",
              letterSpacing: 1,
              fontWeight: 700,
              px: 3,
              "&:hover": { backgroundColor: "#0052cc" },
            }}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
