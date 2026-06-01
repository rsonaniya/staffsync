import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import { ArrowBack, SaveOutlined, EditOutlined } from "@mui/icons-material"; // 🚀 Added EditOutlined
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
// 🚀 IMPORT NEW RBAC UTILITY
import { checkEditPermission, type SystemRole } from "../utils/permissions";

interface PayrollFormData {
  annual_ctc: number;
  basic_salary: number;
  hra: number;
  special_allowance: number;
  bank_name: string;
  account_number: string;
  ifsc: string;
  account_holder_name: string;
  pan_number: string;
  aadhaar_number: string;
  uan_number: string;
}

const inputStyles = {
  backgroundColor: "#f3f4f6",
  borderRadius: "4px 4px 0 0",
  "&:before": { borderBottom: "1px solid #c3c6d6" },
  "&:hover:not(.Mui-disabled):before": { borderBottom: "1px solid #737685" },
  "&:after": { borderBottom: "2px solid #003d9b" },
};

export default function PayrollDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isActionProcessing, setIsActionProcessing] = useState<boolean>(false);
  const [isExistingRecord, setIsExistingRecord] = useState<boolean>(false);

  // 🚀 Added isEditing state matching other active edit pages
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [fetchedTargetRole, setFetchedTargetRole] = useState<SystemRole | null>(
    null,
  );

  const { control, handleSubmit, reset } = useForm<PayrollFormData>({
    defaultValues: {
      annual_ctc: 0,
      basic_salary: 0,
      hra: 0,
      special_allowance: 0,
      bank_name: "",
      account_number: "",
      ifsc: "",
      account_holder_name: "",
      pan_number: "",
      aadhaar_number: "",
      uan_number: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        // 1. Fetch the Target User's Base Profile to get their Role for the Security Matrix
        const userRes = await axiosInstance.get(`/user/${id}`);
        const targetRole = userRes.data.role;
        setFetchedTargetRole(targetRole);

        // 🚀 URL BYPASS SECURITY CHECK
        if (!checkEditPermission(currentUser?.role, targetRole)) {
          showToast(
            "You do not have administrative clearance to edit this profile.",
            "error",
          );
          navigate(`/employees/${id}/view/payroll`, { replace: true });
          return;
        }

        // 2. Fetch Payroll Details
        try {
          const payRes = await axiosInstance.get(
            `/user/payroll-bank-details/${id}`,
          );
          if (payRes.data) {
            setIsExistingRecord(true);
            setIsEditing(false); // 🚀 Default to safely viewing existing records
            reset(payRes.data);
          }
        } catch (e: any) {
          // 🚀 FIX: Broadened catch block prevents redirection bug!
          console.warn(
            "No existing payroll record found, switching to creation mode.",
          );
          setIsExistingRecord(false);
          setIsEditing(true); // 🚀 Auto-enable editing if creating a brand new record
        }
      } catch (error) {
        showToast("Failed to initialize payroll configuration.", "error");
        navigate("/employees");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAllData();
  }, [id, reset, showToast, navigate, currentUser?.role]);

  const handleFormSubmission = async (data: PayrollFormData) => {
    setIsActionProcessing(true);
    try {
      if (isExistingRecord) {
        await axiosInstance.put(`/user/payroll-bank-details/${id}`, data);
        showToast("Payroll details updated successfully!", "success");
        setIsEditing(false); // 🚀 Lock the form back to view mode after saving
      } else {
        await axiosInstance.post(`/user/payroll-bank-details/${id}`, data);
        showToast("Payroll mapping initialized successfully!", "success");
        navigate("/employees"); // Navigate back to directory on initial creation
      }
    } catch (error: any) {
      const errorDetail = error.response?.data?.detail;
      const msg = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to save configurations.";
      showToast(msg, "error");
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleCancelEditing = () => {
    reset(); // Revert any unsaved changes
    setIsEditing(false); // Lock the form
  };

  if (initialLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 64px)",
        }}
      >
        <CircularProgress size={45} sx={{ color: "#003d9b", mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Fetching financial data models...
        </Typography>
      </Box>
    );
  }

  // Final Failsafe
  if (!checkEditPermission(currentUser?.role, fetchedTargetRole || undefined))
    return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        marginTop: "64px",
        height: "calc(100vh - 64px)",
        width: "100%",
        px: { xs: 2, md: 4, lg: 5 },
        pt: 4,
      }}
    >
      {/* 🚀 Restored Dynamic Header with Edit Toggle */}
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
          >
            {isExistingRecord
              ? isEditing
                ? "Edit Payroll Configuration"
                : "Payroll Configuration View"
              : "Initialize Payroll Mapping"}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {isExistingRecord
              ? isEditing
                ? "Update compensation structure and statutory bank disclosures."
                : "Review compensation structure and statutory bank disclosures."
              : "Define compensation structure and statutory bank disclosures for this employee."}
          </Typography>
        </Box>

        {isExistingRecord && !isEditing && (
          <Button
            variant="outlined"
            startIcon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#003d9b",
              borderColor: "rgba(0, 61, 155, 0.5)",
              borderRadius: 2,
              "&:hover": {
                borderColor: "#003d9b",
                backgroundColor: "rgba(0, 61, 155, 0.05)",
              },
            }}
          >
            Edit Details
          </Button>
        )}
      </Stack>

      <Box sx={{ flex: 1, overflowY: "auto", px: 0.5, pb: 4 }}>
        <form id="payroll-form" onSubmit={handleSubmit(handleFormSubmission)}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
          >
            Salary Structure
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="annual_ctc"
                control={control}
                rules={{ required: "Annual CTC is required", min: 0 }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Annual CTC *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="basic_salary"
                control={control}
                rules={{ required: "Basic Salary is required", min: 0 }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Basic Salary *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="hra"
                control={control}
                rules={{ required: "HRA is required", min: 0 }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="HRA *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="special_allowance"
                control={control}
                rules={{ min: 0 }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Special Allowance"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 4 }} />

          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
          >
            Bank & Statutory Details
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="bank_name"
                control={control}
                rules={{ required: "Bank name is required" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Bank Name *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="account_number"
                control={control}
                rules={{ required: "Account number is required" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Account Number *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="ifsc"
                control={control}
                rules={{ required: "IFSC Code is required" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="IFSC Code *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="account_holder_name"
                control={control}
                rules={{ required: "Account holder name is required" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Account Holder Name *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="pan_number"
                control={control}
                rules={{ required: "PAN number is required" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="PAN Number *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="aadhaar_number"
                control={control}
                rules={{ required: "Government Identity Number is required" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Gov Identity Number *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="uan_number"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="UAN Number (Optional)"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </form>
      </Box>

      {/* 🚀 Dynamic Sticky Footer matching other Active Edit Pages */}
      {isEditing ? (
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            mt: "auto",
            pt: 2,
            pb: 3,
            borderTop: "1px solid rgba(195, 198, 214, 0.5)",
            backgroundColor: "#f8f9fb",
            position: "sticky",
            bottom: 0,
            zIndex: 10,
          }}
        >
          <Button
            variant="text"
            onClick={
              isExistingRecord
                ? handleCancelEditing
                : () => navigate("/employees")
            }
            disabled={isActionProcessing}
            startIcon={<ArrowBack />}
            sx={{ textTransform: "none", fontWeight: 600, color: "#434654" }}
          >
            {isExistingRecord ? "Cancel Editing" : "Cancel & Return"}
          </Button>
          <Button
            variant="contained"
            disableElevation
            type="submit"
            form="payroll-form"
            disabled={isActionProcessing}
            startIcon={<SaveOutlined />}
            sx={{
              backgroundColor: "#003d9b",
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              borderRadius: 2,
              "&:hover": { backgroundColor: "#0052cc" },
            }}
          >
            {isActionProcessing
              ? "Saving..."
              : isExistingRecord
                ? "Save Changes"
                : "Initialize Payroll"}
          </Button>
        </Stack>
      ) : (
        <Box
          sx={{
            mt: "auto",
            pt: 2,
            pb: 3,
            borderTop: "1px solid rgba(195, 198, 214, 0.5)",
            backgroundColor: "#f8f9fb",
            position: "sticky",
            bottom: 0,
            zIndex: 10,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/employees")}
            startIcon={<ArrowBack />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              color: "#434654",
              borderColor: "rgba(195, 198, 214, 0.8)",
            }}
          >
            Back to Directory
          </Button>
        </Box>
      )}
    </Box>
  );
}
