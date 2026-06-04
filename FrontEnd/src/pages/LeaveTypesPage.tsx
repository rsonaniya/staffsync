import { useState, useEffect } from "react";
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
  CardContent,
  Divider,
  Grid,
} from "@mui/material";
import {
  Add,
  EditOutlined,
  SettingsSuggestOutlined,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { axiosInstance } from "../api/axiosInstance";
import FullScreenLoader from "../components/FullScreenLoader";
import { useToast } from "../context/ToastContext";

// ==========================================
// 1. TYPES & STYLES
// ==========================================

interface LeaveType {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
}

interface LeaveTypeFormInputs {
  name: string;
  code: string;
  description: string;
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

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal tracking states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);

  // Initialize unified Hook Form validation engine
  const { control, handleSubmit, reset } = useForm<LeaveTypeFormInputs>({
    defaultValues: {
      name: "",
      code: "",
      description: "",
      is_active: true,
    },
    mode: "onTouched",
  });

  const { showToast } = useToast();

  // Fetch leave types on mounting lifecycle
  const fetchLeaveTypes = async () => {
    setIsLoading(true);
    try {
      const response =
        await axiosInstance.get<LeaveType[]>("/admin/leave-type/");
      setLeaveTypes(response.data);
    } catch (error: any) {
      console.error("Failed to load leave types:", error);

      // Dig out the exact error message from FastAPI or fall back to a clean default
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to sync leave type records from the server.";

      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  // Open modal handler (handles both fresh creates and context edits)
  const handleOpenModal = (type: LeaveType | null = null) => {
    setEditingType(type);
    if (type) {
      reset({
        name: type.name,
        code: type.code,
        description: type.description || "",
        is_active: type.is_active,
      });
    } else {
      reset({
        name: "",
        code: "",
        description: "",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
  };

  // Process unified form submissions to the database
  const onSubmit = async (data: LeaveTypeFormInputs) => {
    // Sanitize values on submit to replicate backend Pydantic sanitation logic
    const sanitizedData = {
      ...data,
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
    };

    try {
      if (editingType) {
        const response = await axiosInstance.put(
          `/admin/leave-type/${editingType.id}`,
          sanitizedData,
        );
        // Grabs success message from backend or applies a clean fallback
        showToast(
          response.data?.message || "Leave type updated successfully!",
          "success",
        );
      } else {
        const response = await axiosInstance.post(
          "/admin/leave-type/",
          sanitizedData,
        );
        // Grabs success message from backend or applies a clean fallback
        showToast(
          response.data?.message || "Leave type created successfully!",
          "success",
        );
      }
      handleCloseModal();
      fetchLeaveTypes(); // Refresh table view automatically
    } catch (error: any) {
      console.error("Failed to save leave type structure:", error);

      // Dig out the exact validation/operational detail error array or string from FastAPI
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to save leave type configuration.";

      showToast(errorMessage, "error");
    }
  };

  return (
    <>
      {isLoading && <FullScreenLoader message="Loading leave types..." />}

      <Box
        sx={{
          width: "100%",
          px: { xs: 2, md: 4, lg: 5 },
          pb: 4,
          pt: { xs: 10, md: 12 },
        }}
      >
        {/* Page Header Layout block */}
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
              Leave Types
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Configure and define operational organization leave types.
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
            Add Leave Type
          </Button>
        </Stack>

        {/* Main Container Core Table for desktop*/}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "rgba(195, 198, 214, 0.5)",
            overflow: "hidden",
            display: { xs: "none", lg: "block" },
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 600 }}>
              <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                <TableRow>
                  {[
                    "Leave Name",
                    "Code",
                    "Description",
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
                {!isLoading && leaveTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 6, color: "text.secondary" }}
                    >
                      No leave configurations found. Click 'Add Leave Type' to
                      configure one.
                    </TableCell>
                  </TableRow>
                ) : (
                  leaveTypes.map((type) => (
                    <TableRow
                      key={type.id}
                      sx={{
                        "&:hover": { backgroundColor: "#F0F7FF" },
                        transition: "background-color 0.2s",
                        "& td": {
                          borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                        },
                      }}
                    >
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
                              justifyContent: "center",
                              color: "#003d9b",
                            }}
                          >
                            <SettingsSuggestOutlined fontSize="small" />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "text.primary" }}
                          >
                            {type.name}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell
                        sx={{ color: "text.secondary", fontWeight: 600 }}
                      >
                        <Chip
                          label={type.code}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: 1,
                            fontWeight: 600,
                            borderColor: "rgba(195, 198, 214, 0.6)",
                          }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          color: "text.secondary",
                          maxWidth: 300,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {type.description || "—"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={type.is_active ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            backgroundColor: type.is_active
                              ? "rgba(21, 128, 61, 0.1)"
                              : "rgba(115, 118, 133, 0.1)",
                            color: type.is_active ? "#15803d" : "#737685",
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
                          onClick={() => handleOpenModal(type)}
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
        {/* 🚀 STREAM 2: MOBILE/TABLET COMPACT CARD VIEW (Visible on Viewports < 1200px) */}
        <Stack
          spacing={2.5}
          sx={{ display: { xs: "flex", lg: "none" }, width: "100%" }}
        >
          {!isLoading && leaveTypes.length === 0 ? (
            <Card
              variant="outlined"
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: 3,
                borderColor: "rgba(195, 198, 214, 0.5)",
                backgroundColor: "#ffffff",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No leave configurations found. Click 'Add Leave Type' to
                configure one.
              </Typography>
            </Card>
          ) : (
            leaveTypes.map((type) => (
              <Card
                key={type.id}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderColor: "rgba(195, 198, 214, 0.5)",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.01)",
                  "&:hover": { backgroundColor: "#F0F7FF" },
                  transition: "background-color 0.2s",
                }}
              >
                <CardContent sx={{ p: "20px !important" }}>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{ alignItems: "center", gap: 2 }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          backgroundColor: "rgba(0, 61, 155, 0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#003d9b",
                        }}
                      >
                        <SettingsSuggestOutlined fontSize="small" />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: "text.primary" }}
                      >
                        {type.name}
                      </Typography>
                    </Stack>

                    <IconButton
                      size="small"
                      onClick={() => handleOpenModal(type)}
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
                  </Stack>

                  <Divider
                    sx={{ my: 2, borderColor: "rgba(195, 198, 214, 0.3)" }}
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "text.disabled",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                        }}
                      >
                        Code
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={type.code}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: 1,
                            fontWeight: 600,
                            borderColor: "rgba(195, 198, 214, 0.6)",
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "text.disabled",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                        }}
                      >
                        Status
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={type.is_active ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            backgroundColor: type.is_active
                              ? "rgba(21, 128, 61, 0.1)"
                              : "rgba(115, 118, 133, 0.1)",
                            color: type.is_active ? "#15803d" : "#737685",
                            fontWeight: 700,
                            px: 1,
                            height: 24,
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{
                          mt: 0.5,
                          pt: 1.5,
                          borderTop: "1px dashed rgba(195, 198, 214, 0.2)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "text.disabled",
                            textTransform: "uppercase",
                            letterSpacing: "0.03em",
                          }}
                        >
                          Description
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            mt: 0.5,
                            lineHeight: 1.4,
                          }}
                        >
                          {type.description || "—"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>

        {/* ==========================================
          3. DYNAMIC DIALOG FORM COMPONENT
         ========================================== */}
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          fullWidth
          maxWidth="xs"
          slotProps={{
            paper: {
              sx: {
                borderRadius: 3,
                p: 1,
                maxHeight: "90vh",
              },
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            {editingType ? "Edit Leave Type" : "Add New Leave Type"}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontWeight: 400 }}
            >
              Define global parameters for leave tracking structures.
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
                {/* Name Field with min/max validation criteria */}
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: "Leave name is required",
                    minLength: {
                      value: 5,
                      message: "Leave name must be at least 5 characters long",
                    },
                    maxLength: {
                      value: 50,
                      message: "Leave name cannot exceed 50 characters",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="filled"
                      label="Leave Type Name *"
                      placeholder="e.g., Sick Leave"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                    />
                  )}
                />

                {/* Code Field with formatting middleware + validation criteria */}
                <Controller
                  name="code"
                  control={control}
                  rules={{
                    required: "Leave code is required",
                    minLength: {
                      value: 2,
                      message: "Code must be at least 2 characters long",
                    },
                    maxLength: {
                      value: 5,
                      message: "Code cannot exceed 5 cents/characters",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="filled"
                      label="Leave Code *"
                      placeholder="e.g., SL"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                      // Native input formatting matching your upper-case backend requirement
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.toUpperCase().replace(/\s/g, ""),
                        )
                      }
                    />
                  )}
                />

                {/* Description Field with max length validation criteria */}
                <Controller
                  name="description"
                  control={control}
                  rules={{
                    maxLength: {
                      value: 500,
                      message: "Description cannot exceed 500 characters",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="filled"
                      label="Description"
                      placeholder="Short summary of leave type scope"
                      multiline
                      rows={3}
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                    />
                  )}
                />

                {/* Active Toggle Switch Block */}
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
                      Active Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Allow allocation of this leave style across policies
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
                {editingType ? "Save Changes" : "Save Leave Type"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </>
  );
}
