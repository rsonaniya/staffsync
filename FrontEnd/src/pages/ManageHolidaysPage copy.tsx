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
  MenuItem,
  Checkbox,
  ListItemText,
  Tooltip,
  OutlinedInput,
  Select,
} from "@mui/material";
import {
  Add,
  EditOutlined,
  CalendarMonthOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { axiosInstance } from "../api/axiosInstance";
import FullScreenLoader from "../components/FullScreenLoader";
import { useToast } from "../context/ToastContext";

// ==========================================
// 1. TYPES, SCHEMAS & DESIGN TOKENS
// ==========================================

interface LocationResponse {
  id: number;
  name: string;
  city: string;
  address: string | null;
  state: string;
  country: string;
  timezone: string;
  is_active: boolean;
}

interface HolidayItem {
  id: number;
  name: string;
  applicable_date: string;
  is_active: boolean;
  locations: LocationResponse[];
}

interface HolidayFormInputs {
  name: string;
  applicable_date: string;
  locations_ids: number[];
  is_active: boolean;
}

const inputStyles = {
  backgroundColor: "#f3f4f6",
  borderRadius: "4px 4px 0 0",
  "&:before": { borderBottom: "1px solid #c3c6d6" },
  "&:hover:not(.Mui-disabled):before": { borderBottom: "1px solid #737685" },
  "&:after": { borderBottom: "2px solid #003d9b" },
};

const clearButtonStyles = {
  position: "absolute",
  right: 32, // Perfectly flushes next to the native dropdown arrow icon
  top: "50%",
  transform: "translateY(-50%)",
  color: "#737685",
  zIndex: 2,
  "&:hover": { color: "#003d9b", backgroundColor: "rgba(0, 61, 155, 0.05)" },
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

export default function ManageHolidaysPage() {
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal display states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayItem | null>(
    null,
  );

  // Popover dialog overlay configuration to inspect all office locations
  const [viewLocationsModal, setViewLocationsModal] = useState<{
    open: boolean;
    items: LocationResponse[];
    holidayName: string;
  }>({
    open: false,
    items: [],
    holidayName: "",
  });

  const { showToast } = useToast();

  // Initialize unified Hook Form validation core engine
  const { control, handleSubmit, reset } = useForm<HolidayFormInputs>({
    defaultValues: {
      name: "",
      applicable_date: "",
      locations_ids: [],
      is_active: true,
    },
    mode: "onTouched",
  });

  // Pull all synchronized corporate datasets concurrently (GET: /admin/holiday/ and /admin/location/)
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [holidaysRes, locationsRes] = await Promise.all([
        axiosInstance.get<HolidayItem[]>("/admin/holiday/"),
        axiosInstance.get<LocationResponse[]>("/admin/location/"),
      ]);
      setHolidays(holidaysRes.data);
      setLocations(locationsRes.data);
    } catch (error: any) {
      console.error("Failed to synchronize corporate calendar matrix:", error);
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to sync calendar metadata from the server.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Form initialization lifecycle handler (Add vs Edit context)
  const handleOpenModal = (holiday: HolidayItem | null = null) => {
    setEditingHoliday(holiday);
    if (holiday) {
      reset({
        name: holiday.name,
        applicable_date: holiday.applicable_date,
        locations_ids: holiday.locations.map((loc) => loc.id),
        is_active: holiday.is_active,
      });
    } else {
      reset({
        name: "",
        applicable_date: "",
        locations_ids: [],
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHoliday(null);
  };

  // Submit operations payload generator (POST & PUT workflows)
  const onSubmit = async (data: HolidayFormInputs) => {
    const payload = {
      ...data,
      name: data.name.trim(),
    };

    try {
      if (editingHoliday) {
        const response = await axiosInstance.put(
          `/admin/holiday/${editingHoliday.id}`,
          payload,
        );
        showToast(
          response.data?.message ||
            "Corporate holiday fields updated successfully!",
          "success",
        );
      } else {
        const response = await axiosInstance.post("/admin/holiday/", payload);
        showToast(
          response.data?.message ||
            "New corporate holiday registered successfully!",
          "success",
        );
      }
      handleCloseModal();
      fetchAllData();
    } catch (error: any) {
      console.error("Failed to save holiday profile metrics:", error);
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to preserve core corporate calendar entries.";
      showToast(errorMessage, "error");
    }
  };

  // Human-readable date standard parser output formatter
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "—";
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {isLoading && (
        <FullScreenLoader message="Syncing corporate calendar rules..." />
      )}

      <Box
        sx={{
          width: "100%",
          px: { xs: 2, md: 4, lg: 5 },
          pb: 4,
          pt: { xs: 10, md: 12 },
        }}
      >
        {/* Page Top Header Bar Layout */}
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
              Holiday Management
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Configure corporate annual holiday frameworks and regional
              placement mapping bounds.
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
            Add Holiday
          </Button>
        </Stack>

        {/* Master Data Grid Table Container */}
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
                    "Holiday Details",
                    "Applicable Date",
                    "Assigned Locations",
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
                {!isLoading && holidays.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 6, color: "text.secondary" }}
                    >
                      No company holiday entries registered. Click 'Add Holiday'
                      to populate calendar maps.
                    </TableCell>
                  </TableRow>
                ) : (
                  holidays.map((holiday) => (
                    <TableRow
                      key={holiday.id}
                      sx={{
                        "&:hover": { backgroundColor: "#F0F7FF" },
                        transition: "background-color 0.2s",
                        "& td": {
                          borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                        },
                      }}
                    >
                      {/* Holiday title info */}
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
                              color: "#003d9b",
                              justifyContent: "center",
                            }}
                          >
                            <CalendarMonthOutlined fontSize="small" />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "text.primary" }}
                          >
                            {holiday.name}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Timestamps validation cells */}
                      <TableCell
                        sx={{ color: "text.primary", fontWeight: 500 }}
                      >
                        {formatDateDisplay(holiday.applicable_date)}
                      </TableCell>

                      {/* Multi-Location Chip Display Implementation */}
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center" }}
                        >
                          {holiday.locations.length === 0 ? (
                            <Typography variant="caption" color="text.disabled">
                              No branches assigned
                            </Typography>
                          ) : (
                            <>
                              <Chip
                                label={holiday.locations[0].name}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderRadius: 1,
                                  fontWeight: 500,
                                  maxCardWidth: 150,
                                }}
                              />
                              {holiday.locations.length > 1 && (
                                <Tooltip title="Click to view all branches">
                                  <Chip
                                    label={`+${holiday.locations.length - 1} More`}
                                    size="small"
                                    onClick={() =>
                                      setViewLocationsModal({
                                        open: true,
                                        items: holiday.locations,
                                        holidayName: holiday.name,
                                      })
                                    }
                                    sx={{
                                      backgroundColor:
                                        "rgba(205, 221, 255, 0.4)",
                                      color: "#003d9b",
                                      fontWeight: 700,
                                      borderRadius: 1,
                                      cursor: "pointer",
                                      "&:hover": {
                                        backgroundColor:
                                          "rgba(205, 221, 255, 0.6)",
                                      },
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </>
                          )}
                        </Stack>
                      </TableCell>

                      {/* Status tags */}
                      <TableCell>
                        <Chip
                          label={holiday.is_active ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            backgroundColor: holiday.is_active
                              ? "rgba(21, 128, 61, 0.1)"
                              : "rgba(115, 118, 133, 0.1)",
                            color: holiday.is_active ? "#15803d" : "#737685",
                            fontWeight: 700,
                            px: 1,
                            height: 24,
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>

                      {/* Editing configurations triggers */}
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModal(holiday)}
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
          3. DYNAMIC CALENDAR SUBMISSION FORM DIALOG 
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
            {editingHoliday ? "Edit Corporate Holiday" : "Add New Holiday"}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontWeight: 400 }}
            >
              Establish corporate operational stand-down milestones across
              regional facility grids.
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
                {/* 1. Holiday Title Input */}
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: "Holiday recognition label is required",
                    minLength: {
                      value: 2,
                      message:
                        "Recognition label must be at least 2 characters long",
                    },
                    maxLength: {
                      value: 250,
                      message: "Recognition label cannot exceed 250 characters",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="filled"
                      label="Holiday Name *"
                      placeholder="e.g., Diwali"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                    />
                  )}
                />

                {/* 2. ISO Calendar Date Input Field */}
                <Controller
                  name="applicable_date"
                  control={control}
                  rules={{
                    required: "Calendar assignment target date is required",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      variant="filled"
                      label="Applicable Celebration Date *"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{
                        input: { sx: inputStyles },
                        inputLabel: { shrink: true },
                      }}
                    />
                  )}
                />

                {/* 3. Checkbox-Enabled Multi-Location Selector Dropdown with Fixed Layout & Functional Select All */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      display: "block",
                      mb: 0.5,
                      fontWeight: 500,
                    }}
                  >
                    Assigned Office Branches *
                  </Typography>
                  <Controller
                    name="locations_ids"
                    control={control}
                    rules={{
                      required:
                        "Please attach at least one facility node to map this holiday structure",
                    }}
                    render={({ field, fieldState: { error } }) => {
                      const selectedIds = field.value || [];
                      const isAllSelected =
                        locations.length > 0 &&
                        selectedIds.length === locations.length;

                      // Cleaned toggle handler that directly intercepts values safely
                      const handleToggleSelectAll = (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isAllSelected) {
                          field.onChange([]);
                        } else {
                          field.onChange(locations.map((loc) => loc.id));
                        }
                      };

                      const handleClearAll = (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        field.onChange([]);
                      };

                      return (
                        <Box sx={{ position: "relative" }}>
                          <Select
                            multiple
                            fullWidth
                            displayEmpty
                            value={selectedIds}
                            onChange={(e) => field.onChange(e.target.value)}
                            input={
                              <OutlinedInput
                                error={!!error}
                                sx={{
                                  backgroundColor: "#f3f4f6",
                                  borderRadius: "4px 4px 0 0",
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                    borderBottom: "1px solid #c3c6d6",
                                    borderRadius: "4px 4px 0 0",
                                  },
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderBottom: "1px solid #737685",
                                  },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      borderBottom: "2px solid #003d9b",
                                    },
                                  /* Absolute clean layout rendering block eliminating internal padding bloat */
                                  "& .MuiSelect-select": {
                                    py: selectedIds.length > 0 ? "6px" : "12px",
                                    minHeight: "24px",
                                    display: "flex",
                                    alignItems: "center",
                                  },
                                }}
                              />
                            }
                            renderValue={(selected) => {
                              const ids = selected as number[];
                              if (ids.length === 0) {
                                return (
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "text.disabled" }}
                                  >
                                    Select branch offices...
                                  </Typography>
                                );
                              }
                              return (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 0.5,
                                    pr: 4,
                                  }}
                                >
                                  {ids.map((id) => {
                                    const match = locations.find(
                                      (l) => l.id === id,
                                    );
                                    return match ? (
                                      <Chip
                                        key={id}
                                        label={match.name}
                                        size="small"
                                        sx={{
                                          borderRadius: 1,
                                          fontWeight: 500,
                                          height: 24,
                                        }}
                                      />
                                    ) : null;
                                  })}
                                </Box>
                              );
                            }}
                          >
                            {/* Functional Bulk Selector Header Element */}
                            {locations.length > 0 && (
                              <Box
                                onClick={handleToggleSelectAll}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  py: 1,
                                  px: 2,
                                  cursor: "pointer",
                                  borderBottom:
                                    "1px solid rgba(195, 198, 214, 0.4)",
                                  fontWeight: 600,
                                  backgroundColor: isAllSelected
                                    ? "rgba(0, 61, 155, 0.02)"
                                    : "transparent",
                                  "&:hover": {
                                    backgroundColor: "rgba(0, 61, 155, 0.05)",
                                  },
                                }}
                              >
                                <Checkbox
                                  checked={isAllSelected}
                                  indeterminate={
                                    selectedIds.length > 0 &&
                                    selectedIds.length < locations.length
                                  }
                                  sx={{
                                    p: 0,
                                    mr: 1.5,
                                    color: "#003d9b",
                                    "&.Mui-checked, &.MuiCheckbox-indeterminate":
                                      { color: "#003d9b" },
                                  }}
                                />
                                <ListItemText
                                  primary={
                                    isAllSelected
                                      ? "Unselect All Branches"
                                      : "Select All Branches"
                                  }
                                  slotProps={{
                                    primary: {
                                      sx: {
                                        fontWeight: 600,
                                        color: "#003d9b",
                                        fontSize: "0.875rem",
                                      },
                                    },
                                  }}
                                />
                              </Box>
                            )}

                            {/* Standard Options Mapping Selection Block */}
                            {locations.map((loc) => (
                              <MenuItem
                                key={loc.id}
                                value={loc.id}
                                sx={{ py: 0.75 }}
                              >
                                <Checkbox
                                  checked={selectedIds.indexOf(loc.id) > -1}
                                  sx={{
                                    color: "#003d9b",
                                    "&.Mui-checked": { color: "#003d9b" },
                                  }}
                                />
                                <ListItemText
                                  primary={loc.name}
                                  secondary={`${loc.city}, ${loc.country}`}
                                  slotProps={{
                                    primary: {
                                      sx: {
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                      },
                                    },
                                  }}
                                />
                              </MenuItem>
                            ))}
                          </Select>

                          {/* Quick Clear Floating Close Trigger Action button overlay */}
                          {selectedIds.length > 0 && (
                            <IconButton
                              size="small"
                              onClick={handleClearAll}
                              sx={clearButtonStyles}
                              title="Clear selections"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </IconButton>
                          )}

                          {/* Core dynamic verification warning validation display texts */}
                          {error && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#d32f2f",
                                mt: "4px",
                                ml: "14px",
                                display: "block",
                              }}
                            >
                              {error.message}
                            </Typography>
                          )}
                        </Box>
                      );
                    }}
                  />
                </Box>

                {/* 4. Active Status Toggle Switch Frame */}
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
                      Active Registration Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Deactivating completely hides this holiday assignment from
                      staff dash modules
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
                {editingHoliday ? "Save Changes" : "Save Holiday Entry"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* ==========================================
          4. SUB-OVERLAY DIALOG: INSPECT ALL ATTACHED FACILITY HUBS
         ========================================== */}
        <Dialog
          open={viewLocationsModal.open}
          onClose={() =>
            setViewLocationsModal((prev) => ({ ...prev, open: false }))
          }
          fullWidth
          maxWidth="xs"
          slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            {viewLocationsModal.holidayName}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontWeight: 400 }}
            >
              Full list of branches where this calendar event applies.
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pb: 3, pt: 2 }}>
            <Stack spacing={1.5} sx={{ maxH: 300, overflowY: "auto", pr: 0.5 }}>
              {viewLocationsModal.items.map((loc) => (
                <Card
                  key={loc.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    borderColor: "rgba(195, 198, 214, 0.4)",
                  }}
                >
                  <LocationOnOutlined sx={{ color: "#003d9b" }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {loc.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {loc.city}, {loc.state}, {loc.country}
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() =>
                setViewLocationsModal((prev) => ({ ...prev, open: false }))
              }
              variant="contained"
              disableElevation
              sx={{
                backgroundColor: "#003d9b",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Close View
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
