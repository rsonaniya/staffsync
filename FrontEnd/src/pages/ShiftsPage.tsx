import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Switch,
} from "@mui/material";
import { Add, EditOutlined, AccessTimeOutlined } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { axiosInstance } from "../api/axiosInstance";
import FullScreenLoader from "../components/FullScreenLoader";
import { useToast } from "../context/ToastContext";

// ==========================================
// 1. TYPES & STYLES
// ==========================================

interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  grace_period_minutes: number;
  is_active: boolean;
}

interface ShiftFormInputs {
  name: string;
  start_time: string;
  end_time: string;
  grace_period_minutes: number;
  is_active: boolean;
}

const inputStyles = {
  backgroundColor: "#f3f4f6",
  borderRadius: "4px 4px 0 0",
  "&:before": { borderBottom: "1px solid #c3c6d6" },
  "&:hover:not(.Mui-disabled):before": { borderBottom: "1px solid #737685" },
  "&:after": { borderBottom: "2px solid #003d9b" },
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal tracking states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  // Initialize centralized form validation engine
  const { control, handleSubmit, reset } = useForm<ShiftFormInputs>({
    defaultValues: {
      name: "",
      start_time: "09:00",
      end_time: "18:00",
      grace_period_minutes: 15,
      is_active: true,
    },
    mode: "onTouched",
  });

  const { showToast } = useToast();

  // Fetch all master shift patterns from backend database
  const fetchShifts = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get<Shift[]>("/admin/shift/");
      setShifts(response.data);
    } catch (error: any) {
      console.error("Failed to sync employee shifts:", error);
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to sync shift configurations from the server.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // Open modal handler configuration
  const handleOpenModal = (shift: Shift | null = null) => {
    setEditingShift(shift);
    if (shift) {
      reset({
        name: shift.name,
        // Backend might supply HH:MM:SS format, normalize to HH:MM for HTML5 textfields
        start_time: shift.start_time.slice(0, 5),
        end_time: shift.end_time.slice(0, 5),
        grace_period_minutes: shift.grace_period_minutes,
        is_active: shift.is_active,
      });
    } else {
      reset({
        name: "",
        start_time: "09:00",
        end_time: "18:00",
        grace_period_minutes: 15,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShift(null);
  };

  // Save processing lifecycle branch execution
  const onSubmit = async (data: ShiftFormInputs) => {
    const payload = {
      ...data,
      name: data.name.trim(),
      // Guaranteeing times are fully padded as HH:MM:SS parameters to preserve strict Pydantic parsing formats
      start_time:
        data.start_time.length === 5
          ? `${data.start_time}:00`
          : data.start_time,
      end_time:
        data.end_time.length === 5 ? `${data.end_time}:00` : data.end_time,
    };

    try {
      if (editingShift) {
        const response = await axiosInstance.put(
          `/admin/shift/${editingShift.id}`,
          payload,
        );
        showToast(
          response.data?.message ||
            "Operational shift parameters updated successfully!",
          "success",
        );
      } else {
        const response = await axiosInstance.post("/admin/shift/", payload);
        showToast(
          response.data?.message ||
            "New corporate shift rules created successfully!",
          "success",
        );
      }
      handleCloseModal();
      fetchShifts();
    } catch (error: any) {
      console.error("Failed to save shift tracking structure:", error);
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to save current work shift details.";
      showToast(errorMessage, "error");
    }
  };

  // Formatter to cleanly render standard AM/PM timing charts inside data cells
  const formatTimeDisplay = (timeString: string) => {
    if (!timeString) return "—";
    const [hours, minutes] = timeString.split(":");
    const hourNum = parseInt(hours, 10);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      {isLoading && (
        <FullScreenLoader message="Syncing shift configurations..." />
      )}

      <Box
        sx={{
          width: "100%",
          px: { xs: 2, md: 4, lg: 5 },
          pb: 4,
          pt: { xs: 10, md: 12 },
        }}
      >
        {/* Page Header Component Block */}
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
              Work Shifts
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Configure and manage standard operating schedules, break limits,
              and grace margins.
            </Typography>
          </Box>
          <Button
            variant="contained"
            disableElevation
            startIcon={<Add />}
            onClick={() => handleOpenModal(null)}
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
          >
            Add Work Shift
          </Button>
        </Stack>

        {/* Main Data Table View Container */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "rgba(195, 198, 214, 0.5)",
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 600 }}>
              <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                <TableRow>
                  {[
                    "Shift Details",
                    "Schedules Window",
                    "Grace Window",
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
                {!isLoading && shifts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 6, color: "text.secondary" }}
                    >
                      No active shift profiles mapped. Click 'Add Work Shift' to
                      map scheduling parameters.
                    </TableCell>
                  </TableRow>
                ) : (
                  shifts.map((shift) => (
                    <TableRow
                      key={shift.id}
                      sx={{
                        "&:hover": { backgroundColor: "#F0F7FF" },
                        transition: "background-color 0.2s",
                        "& td": {
                          borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                        },
                      }}
                    >
                      {/* Shift Title Identifiers */}
                      <TableCell>
                        <Stack
                          sx={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1.5,
                              backgroundColor: "rgba(0, 61, 155, 0.05)",
                              display: "flex",
                              alignItems: "center",
                              justifyBox: "center",
                              color: "#003d9b",
                              justifyContent: "center",
                            }}
                          >
                            <AccessTimeOutlined fontSize="small" />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "text.primary" }}
                          >
                            {shift.name}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Timeline Scheduling bounds */}
                      <TableCell
                        sx={{ color: "text.primary", fontWeight: 500 }}
                      >
                        {formatTimeDisplay(shift.start_time)} –{" "}
                        {formatTimeDisplay(shift.end_time)}
                      </TableCell>

                      {/* Grace period details */}
                      <TableCell
                        sx={{ color: "text.secondary", fontWeight: 600 }}
                      >
                        {shift.grace_period_minutes} Mins
                      </TableCell>

                      {/* Status indicator tags */}
                      <TableCell>
                        <Chip
                          label={shift.is_active ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            backgroundColor: shift.is_active
                              ? "rgba(21, 128, 61, 0.1)"
                              : "rgba(115, 118, 133, 0.1)",
                            color: shift.is_active ? "#15803d" : "#737685",
                            fontWeight: 700,
                            px: 1,
                            height: 24,
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>

                      {/* Modals trigger actions */}
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModal(shift)}
                          sx={{
                            color: "text.secondary",
                            "&:hover": {
                              backgroundColor: "#e1e2e4",
                              color: "text.primary",
                            },
                          }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* ==========================================
          3. DYNAMIC CONFIGURATION FORM DIALOG COMPONENT
         ========================================== */}
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          fullWidth
          maxWidth="xs"
          slotProps={{
            paper: { sx: { borderRadius: 3, p: 1, maxHeight: "90vh" } },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            {editingShift ? "Edit Work Shift" : "Add New Work Shift"}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontWeight: 400 }}
            >
              Specify absolute working metrics for daily authentication
              processing rules.
            </Typography>
          </DialogTitle>

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <DialogContent
              sx={{
                pb: 2,
                pt: "8px !important",
                overflowY: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": {
                  width: "0px",
                  height: "0px",
                  display: "none",
                },
              }}
            >
              <Stack spacing={3} sx={{ p: 0.5 }}>
                {/* 1. Shift Name Selector (Matches min=2, max=50 bounds) */}
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: "Shift context name is required",
                    minLength: {
                      value: 2,
                      message:
                        "Shift profile title must be at least 2 characters long",
                    },
                    maxLength: {
                      value: 50,
                      message:
                        "Shift profile title cannot exceed 50 characters",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="filled"
                      label="Shift Profile Name *"
                      placeholder="e.g., Morning Support Shift"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                    />
                  )}
                />

                {/* Scheduling Parameters Grid Group */}
                <Stack direction="row" spacing={2}>
                  {/* 2. Expected Log In Window Start Time */}
                  <Controller
                    name="start_time"
                    control={control}
                    rules={{
                      required: "Clock-in start window time is required",
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="time"
                        variant="filled"
                        label="Start Time (Punch-In) *"
                        error={!!error}
                        helperText={error?.message}
                        slotProps={{
                          input: { sx: inputStyles },
                          inputLabel: { shrink: true }, // <-- This is the correct MUI v6 slot configuration property!
                        }}
                      />
                    )}
                  />

                  {/* 3. Expected Logout Window End Time */}
                  <Controller
                    name="end_time"
                    control={control}
                    rules={{
                      required: "Clock-out closure window time is required",
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="time"
                        variant="filled"
                        label="End Time (Punch-Out) *"
                        error={!!error}
                        helperText={error?.message}
                        slotProps={{
                          input: { sx: inputStyles },
                          inputLabel: { shrink: true }, // <-- This is the correct MUI v6 slot configuration property!
                        }}
                      />
                    )}
                  />
                </Stack>

                {/* 4. Numerical Grace Window Input (Enforcing ge=0 bounds) */}
                <Controller
                  name="grace_period_minutes"
                  control={control}
                  rules={{
                    required: "Late punch grace window metric is required",
                    min: {
                      value: 0,
                      message:
                        "Grace allowance metric parameters cannot be negative",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      variant="filled"
                      label="Grace Period Margin (Minutes) *"
                      placeholder="e.g., 15"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{
                        input: { sx: inputStyles, inputProps: { min: "0" } },
                      }}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || null)
                      }
                    />
                  )}
                />

                {/* 5. Active Profile Status Monitor Toggle */}
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderColor: "rgba(195, 198, 214, 0.5)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Active Configuration Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Toggle active to make this scheduling block selectable on
                      employment assignments
                    </Typography>
                  </Box>
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                    )}
                  />
                </Card>
              </Stack>
            </DialogContent>

            <DialogActions
              sx={{
                px: 3,
                pb: 2,
                pt: 2,
                gap: 1,
                borderTop: "1px solid rgba(195, 198, 214, 0.3)",
              }}
            >
              <Button
                onClick={handleCloseModal}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disableElevation
                sx={{
                  backgroundColor: "#003d9b",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": { backgroundColor: "#0052cc" },
                }}
              >
                {editingShift ? "Save Changes" : "Save Shift Pattern"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </>
  );
}
