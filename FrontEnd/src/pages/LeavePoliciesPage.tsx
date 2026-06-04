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
import { Add, EditOutlined, GavelOutlined } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { axiosInstance } from "../api/axiosInstance";
import FullScreenLoader from "../components/FullScreenLoader";
import { useToast } from "../context/ToastContext";

// ==========================================
// 1. TYPES & STYLES
// ==========================================

interface LeavePolicy {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface LeavePolicyFormInputs {
  name: string;
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

export default function LeavePoliciesPage() {
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal tracking states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null);

  // Initialize unified Hook Form validation engine using Pydantic parameters
  const { control, handleSubmit, reset } = useForm<LeavePolicyFormInputs>({
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
    mode: "onTouched",
  });
  const { showToast } = useToast();

  // Fetch leave policies from FastAPI backend
  // 1. Don't forget to initialize the context hook at the top of your LeavePoliciesPage component if you haven't yet:
  // const { showToast } = useToast();

  const fetchLeavePolicies = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get<LeavePolicy[]>(
        "/admin/leave-policy/",
      );
      setLeavePolicies(response.data);
    } catch (error: any) {
      console.error("Failed to load leave policies:", error);

      // Dig out the precise validation/error string from your FastAPI backend
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail ||
          "Failed to sync leave policy configurations from the server.";

      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeavePolicies();
  }, []);

  // Open modal handler (handles both fresh creates and context edits)
  const handleOpenModal = (policy: LeavePolicy | null = null) => {
    setEditingPolicy(policy);
    if (policy) {
      reset({
        name: policy.name,
        description: policy.description || "",
        is_active: policy.is_active,
      });
    } else {
      reset({
        name: "",
        description: "",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPolicy(null);
  };

  const onSubmit = async (data: LeavePolicyFormInputs) => {
    try {
      if (editingPolicy) {
        // PUT processing lifecycle
        const response = await axiosInstance.put(
          `/admin/leave-policy/${editingPolicy.id}`,
          data,
        );
        // Grabs message from backend or applies a clean fallback
        showToast(
          response.data?.message || "Leave policy updated successfully!",
          "success",
        );
      } else {
        // POST processing lifecycle
        const response = await axiosInstance.post("/admin/leave-policy/", data);
        // Grabs message from backend or applies a clean fallback
        showToast(
          response.data?.message || "Leave policy created successfully!",
          "success",
        );
      }
      handleCloseModal();
      fetchLeavePolicies(); // Refresh table state seamlessly
    } catch (error: any) {
      console.error("Failed to save leave policy structure:", error);

      // Extract precise validation array errors or standard detail strings from FastAPI
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to save leave policy configuration.";

      showToast(errorMessage, "error");
    }
  };

  return (
    <>
      {isLoading && <FullScreenLoader message="Loading leave policies..." />}

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
              Leave Policies
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Manage and define organizational leave rules and guidelines.
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
            Add Leave Policy
          </Button>
        </Stack>

        {/* Main Container Core Table */}
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
                  {["Policy Name", "Description", "Status", "Action"].map(
                    (head) => (
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
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {!isLoading && leavePolicies.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ py: 6, color: "text.secondary" }}
                    >
                      No leave policies configured. Click 'Add Leave Policy' to
                      configure one.
                    </TableCell>
                  </TableRow>
                ) : (
                  leavePolicies.map((policy) => (
                    <TableRow
                      key={policy.id}
                      sx={{
                        "&:hover": { backgroundColor: "#F0F7FF" },
                        transition: "background-color 0.2s",
                        "& td": {
                          borderBottom: "1px solid rgba(195, 198, 214, 0.3)",
                        },
                      }}
                    >
                      {/* Name Entry column with custom contextual layout icon mapping */}
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
                            <GavelOutlined fontSize="small" />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "text.primary" }}
                          >
                            {policy.name}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Description Column */}
                      <TableCell
                        sx={{
                          color: "text.secondary",
                          maxWidth: 400,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {policy.description || "—"}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        <Chip
                          label={policy.is_active ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            backgroundColor: policy.is_active
                              ? "rgba(21, 128, 61, 0.1)"
                              : "rgba(115, 118, 133, 0.1)",
                            color: policy.is_active ? "#15803d" : "#737685",
                            fontWeight: 700,
                            px: 1,
                            height: 24,
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>

                      {/* Operational Edit Action Trigger */}
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModal(policy)}
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
          {!isLoading && leavePolicies.length === 0 ? (
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
                No leave policies configured. Click 'Add Leave Policy' to
                configure one.
              </Typography>
            </Card>
          ) : (
            leavePolicies.map((policy) => (
              <Card
                key={policy.id}
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
                  {/* Top Header Area */}
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
                        <GavelOutlined fontSize="small" />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: "text.primary" }}
                      >
                        {policy.name}
                      </Typography>
                    </Stack>

                    <IconButton
                      size="small"
                      onClick={() => handleOpenModal(policy)}
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

                  {/* Metadata Grid Layout Fields */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
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
                          label={policy.is_active ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            backgroundColor: policy.is_active
                              ? "rgba(21, 128, 61, 0.1)"
                              : "rgba(115, 118, 133, 0.1)",
                            color: policy.is_active ? "#15803d" : "#737685",
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
                          {policy.description || "—"}
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
            {editingPolicy ? "Edit Leave Policy" : "Add New Leave Policy"}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontWeight: 400 }}
            >
              Define global tracking guidelines for company workflows.
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
                {/* Policy Name Field (With strict backend Pydantic validation rules) */}
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: "Leave policy name is required",
                    minLength: {
                      value: 5,
                      message: "Name must be at least 5 characters long",
                    },
                    maxLength: {
                      value: 100,
                      message: "Name cannot exceed 100 characters",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="filled"
                      label="Leave Policy Name *"
                      placeholder="e.g., Contractor Policy - India"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                    />
                  )}
                />

                {/* Description Field */}
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
                      placeholder="A short description of leave policy scope"
                      multiline
                      rows={3}
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                    />
                  )}
                />

                {/* Active Toggle Switch Card */}
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
                      Flag to set this leave policy active or inactive
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
                {editingPolicy ? "Save Changes" : "Save Policy"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </>
  );
}
