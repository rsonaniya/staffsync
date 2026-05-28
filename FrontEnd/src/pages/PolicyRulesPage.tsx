import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
} from "@mui/material";
import {
  Add,
  EditOutlined,
  DeleteOutlined,
  PlaylistAddCheckOutlined,
  WarningAmberRounded, // Added for delete warning accent
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { axiosInstance } from "../api/axiosInstance";
import FullScreenLoader from "../components/FullScreenLoader";
import { useToast } from "../context/ToastContext";

// ==========================================
// 1. TYPES & STYLES
// ==========================================

interface LeavePolicyRule {
  id: number;
  leave_policy_id: number;
  leave_type_id: number;
  allowance: number;
  credit_frequency: "YEARLY_UPFRONT" | "MONTHLY_ACCRUAL";
  is_paid: boolean;
}

interface LeavePolicyRuleFormInputs {
  leave_policy_id: "" | number;
  leave_type_id: "" | number;
  allowance: number;
  credit_frequency: "YEARLY_UPFRONT" | "MONTHLY_ACCRUAL";
  is_paid: boolean;
}

interface MasterPolicy {
  id: number;
  name: string;
  is_active: boolean;
}

interface MasterType {
  id: number;
  name: string;
  code: string;
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

export default function PolicyRulesPage() {
  const [rules, setRules] = useState<LeavePolicyRule[]>([]);
  const [policies, setPolicies] = useState<MasterPolicy[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<MasterType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal tracking states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LeavePolicyRule | null>(null);

  // NEW: State for tracking custom delete confirmation modal
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const { showToast } = useToast();

  const { control, handleSubmit, reset } = useForm<LeavePolicyRuleFormInputs>({
    defaultValues: {
      leave_policy_id: "",
      leave_type_id: "",
      allowance: 0,
      credit_frequency: "MONTHLY_ACCRUAL",
      is_paid: true,
    },
    mode: "onTouched",
  });

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, policiesRes, typesRes] = await Promise.all([
        axiosInstance.get<LeavePolicyRule[]>("/admin/leave-policy-rules/"),
        axiosInstance.get<MasterPolicy[]>("/admin/leave-policy/"),
        axiosInstance.get<MasterType[]>("/admin/leave-type/"),
      ]);

      setRules(rulesRes.data);
      setPolicies(policiesRes.data);
      setLeaveTypes(typesRes.data);
    } catch (error: any) {
      console.error(
        "Failed to sync system configuration data mappings:",
        error,
      );

      // Unpack FastAPI detail arrays or fallback string messages cleanly
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail ||
          "Failed to synchronize system configuration dependency charts.";

      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleOpenModal = (rule: LeavePolicyRule | null = null) => {
    setEditingRule(rule);
    if (rule) {
      reset({
        leave_policy_id: rule.leave_policy_id,
        leave_type_id: rule.leave_type_id,
        allowance: rule.allowance,
        credit_frequency: rule.credit_frequency,
        is_paid: rule.is_paid,
      });
    } else {
      reset({
        leave_policy_id: "",
        leave_type_id: "",
        allowance: 0,
        credit_frequency: "MONTHLY_ACCRUAL",
        is_paid: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const onSubmit = async (data: LeavePolicyRuleFormInputs) => {
    try {
      if (editingRule) {
        const response = await axiosInstance.put(
          `/admin/leave-policy-rules/${editingRule.id}`,
          data,
        );
        // Grabs backend confirmation string or applies a fallback
        showToast(
          response.data?.message || "Policy rule updated successfully!",
          "success",
        );
      } else {
        const response = await axiosInstance.post(
          "/admin/leave-policy-rules/",
          data,
        );
        // Grabs backend confirmation string or applies a fallback
        showToast(
          response.data?.message || "Policy rule created successfully!",
          "success",
        );
      }
      handleCloseModal();
      fetchAllData(); // Refresh relational data rows
    } catch (error: any) {
      console.error("Failed to preserve policy ruleset:", error);

      // Safely unwrap FastAPI validation arrays or standard error strings
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to preserve policy ruleset configuration.";

      showToast(errorMessage, "error");
    }
  };

  // Trigger custom deletion dialog workflow
  const handleOpenDeleteDialog = (id: number) => {
    setDeleteTargetId(id);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteTargetId(null);
  };

  // Process the finalized API execution branch for deletion
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    handleCloseDeleteDialog();
    setIsLoading(true);
    try {
      const response = await axiosInstance.delete(
        `/admin/leave-policy-rules/${deleteTargetId}`,
      );

      // Grab success message directly from the backend response
      showToast(
        response.data?.message || "Leave policy rule deleted successfully!",
        "success",
      );

      fetchAllData();
    } catch (error: any) {
      console.error("Failed to remove target configuration rule:", error);

      // Extract precise error string from FastAPI or fall back to a clean default
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to delete the leave policy rule.";

      showToast(errorMessage, "error");
      setIsLoading(false);
    }
  };

  const getPolicyName = (id: number) => {
    return policies.find((p) => p.id === id)?.name || `Policy ID: ${id}`;
  };

  const getLeaveTypeDisplay = (id: number) => {
    const type = leaveTypes.find((t) => t.id === id);
    return type ? `${type.name} (${type.code})` : `Leave Type ID: ${id}`;
  };

  return (
    <>
      {isLoading && (
        <FullScreenLoader message="Syncing rules configurations..." />
      )}

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
              Policy Rules
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Define parameters for active leave allocations, accrual cycles,
              and allowances.
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
            Add Policy Rule
          </Button>
        </Stack>

        {/* Main Data Table */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "rgba(195, 198, 214, 0.5)",
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                <TableRow>
                  {[
                    "Assigned Leave Policy",
                    "Target Leave Type",
                    "Annual Allowance",
                    "Credit Frequency",
                    "Type",
                    "Actions",
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
                {!isLoading && rules.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: 6, color: "text.secondary" }}
                    >
                      No policy rules configured yet. Click 'Add Policy Rule' to
                      assign limits.
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow
                      key={rule.id}
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
                            <PlaylistAddCheckOutlined fontSize="small" />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "text.primary" }}
                          >
                            {getPolicyName(rule.leave_policy_id)}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell
                        sx={{ color: "text.primary", fontWeight: 500 }}
                      >
                        {getLeaveTypeDisplay(rule.leave_type_id)}
                      </TableCell>

                      <TableCell
                        sx={{ color: "text.secondary", fontWeight: 700 }}
                      >
                        {rule.allowance} Days
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            rule.credit_frequency === "YEARLY_UPFRONT"
                              ? "Yearly Upfront"
                              : "Monthly Accrual"
                          }
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 1,
                            color:
                              rule.credit_frequency === "YEARLY_UPFRONT"
                                ? "#003d9b"
                                : "#434654",
                            borderColor:
                              rule.credit_frequency === "YEARLY_UPFRONT"
                                ? "rgba(0, 61, 155, 0.3)"
                                : "rgba(195, 198, 214, 0.6)",
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={rule.is_paid ? "Paid Leave" : "Unpaid Leave"}
                          size="small"
                          sx={{
                            backgroundColor: rule.is_paid
                              ? "rgba(21, 128, 61, 0.1)"
                              : "rgba(186, 26, 26, 0.1)",
                            color: rule.is_paid ? "#15803d" : "#ba1a1a",
                            fontWeight: 700,
                            px: 1,
                            height: 24,
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenModal(rule)}
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
                          {/* UPDATED: Points to our beautiful custom modal instead of a browser shortcut */}
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog(rule.id)}
                            sx={{
                              color: "text.secondary",
                              "&:hover": {
                                backgroundColor: "rgba(186, 26, 26, 0.1)",
                                color: "#ba1a1a",
                              },
                            }}
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* ==========================================
            3. DYNAMIC CONFIGURATION DIALOG FORM
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
            {editingRule ? "Edit Policy Rule" : "Add New Policy Rule"}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontWeight: 400 }}
            >
              Link leave categories to general buckets with limits and rules.
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
                <Controller
                  name="leave_policy_id"
                  control={control}
                  rules={{ required: "Parent leave policy is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      variant="filled"
                      label="Leave Policy Bucket *"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                      disabled={!!editingRule}
                    >
                      {policies
                        // .filter((p: MasterPolicy) => p.is_active)
                        .map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="leave_type_id"
                  control={control}
                  rules={{ required: "Target leave type category is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      variant="filled"
                      label="Target Leave Type Category *"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                      disabled={!!editingRule}
                    >
                      {leaveTypes
                        .filter((t: MasterType) => t.is_active)
                        .map((t) => (
                          <MenuItem key={t.id} value={t.id}>
                            {t.name} ({t.code})
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="allowance"
                  control={control}
                  rules={{
                    required: "Annual allowance total is required",
                    min: {
                      value: 0,
                      message: "Leave allowance cannot be negative",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      variant="filled"
                      label="Annual Allowance (Days) *"
                      placeholder="e.g., 14.5"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{
                        input: {
                          sx: inputStyles,
                          inputProps: { step: "0.5", min: "0" },
                        },
                      }}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || null)
                      }
                    />
                  )}
                />

                <Controller
                  name="credit_frequency"
                  control={control}
                  rules={{ required: "Credit frequency structure is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      variant="filled"
                      label="Credit Frequency Structure *"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                    >
                      <MenuItem value="MONTHLY_ACCRUAL">
                        Monthly Accrual Cycle
                      </MenuItem>
                      <MenuItem value="YEARLY_UPFRONT">
                        Yearly Upfront Allocation
                      </MenuItem>
                    </TextField>
                  )}
                />

                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderColor: "rgba(195, 198, 214, 0.5)",
                    display: "flex",
                    justifyBox: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Paid Leave Rule
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Toggle active if employees receive regular salary during
                      this leave
                    </Typography>
                  </Box>
                  <Controller
                    name="is_paid"
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
                {editingRule ? "Save Changes" : "Save Rule Configuration"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* ==========================================
            4. NEW: PREMIUM MUI DELETION CONFIRMATION DIALOG
           ========================================== */}
        <Dialog
          open={deleteTargetId !== null}
          onClose={handleCloseDeleteDialog}
          fullWidth
          maxWidth="xs"
          slotProps={{
            paper: {
              sx: { borderRadius: 3, p: 1 },
            },
          }}
        >
          <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "rgba(186, 26, 26, 0.1)",
                color: "#ba1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <WarningAmberRounded />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}
              >
                Delete Policy Rule?
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.5 }}
              >
                Are you sure you want to remove this leave assignment ruleset?
                This action cannot be undone and will affect current allocation
                balances.
              </Typography>
            </Box>
          </Box>

          <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
            <Button
              onClick={handleCloseDeleteDialog}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "text.secondary",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              disableElevation
              sx={{
                backgroundColor: "#ba1a1a",
                color: "#ffffff",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                "&:hover": { backgroundColor: "#93000a" },
              }}
            >
              Delete Rule
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
