import { useState, useEffect } from "react";
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
import { ArrowBack, SaveOutlined, EditOutlined } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

// ==========================================
// 1. TYPES & DATA STRUCTS
// ==========================================

export interface PayrollBankFormData {
  annual_ctc: number | "";
  basic_salary: number | "";
  hra: number | "";
  special_allowance: number | "";
  currency: string;
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

// ==========================================
// 2. MAIN PAGE COMPONENT
// ==========================================

export default function PayrollDetailsPage() {
  const { id } = useParams<{ id: string }>(); // The Employee's User ID
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  const targetId = id || currentUser?.id;

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isActionProcessing, setIsActionProcessing] = useState<boolean>(false);

  const [hasExistingRecord, setHasExistingRecord] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Permission Check: Can this user edit financial profiles?
  const canEdit = ["ADMIN", "HR", "HR_MANAGER"].includes(
    currentUser?.role || "",
  );

  const { control, handleSubmit, reset } = useForm<PayrollBankFormData>({
    defaultValues: {
      annual_ctc: "",
      basic_salary: "",
      hra: "",
      special_allowance: "",
      currency: "INR",
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

  // 🚀 FETCH EXISTING DATA
  useEffect(() => {
    const fetchPayrollDetails = async () => {
      setInitialLoading(true);
      try {
        const response = await axiosInstance.get(
          `/user/payroll-bank-details/${targetId}`,
        );
        if (response.data) {
          const record = response.data;
          setHasExistingRecord(true);
          setIsEditing(false); // Lock into View Mode

          reset({
            annual_ctc: record.annual_ctc ?? "",
            basic_salary: record.basic_salary ?? "",
            hra: record.hra ?? "",
            special_allowance: record.special_allowance ?? "",
            currency: record.currency || "INR",
            bank_name: record.bank_name || "",
            account_number: record.account_number || "",
            ifsc: record.ifsc || "",
            account_holder_name: record.account_holder_name || "",
            pan_number: record.pan_number || "",
            aadhaar_number: record.aadhaar_number || "",
            uan_number: record.uan_number || "",
          });
        }
      } catch (error) {
        // 404 indicates no record exists yet, which is normal for a new onboarding
        setHasExistingRecord(false);
        setIsEditing(true);
      } finally {
        setInitialLoading(false);
      }
    };

    if (targetId) {
      fetchPayrollDetails();
    }
  }, [targetId, reset]);

  // 🚀 SUBMISSION HANDLER
  const handleFormSubmission = async (data: PayrollBankFormData) => {
    setIsActionProcessing(true);
    try {
      const processedPayload = {
        annual_ctc: Number(data.annual_ctc),
        basic_salary: Number(data.basic_salary),
        hra: Number(data.hra),
        special_allowance: Number(data.special_allowance),
        currency: data.currency.trim() || "INR",
        bank_name: data.bank_name.trim(),
        account_number: data.account_number.trim(),
        ifsc: data.ifsc.trim().toUpperCase(),
        account_holder_name: data.account_holder_name.trim() || null,
        pan_number: data.pan_number.trim().toUpperCase() || null,
        aadhaar_number: data.aadhaar_number.trim() || null,
        uan_number: data.uan_number.trim() || null,
      };

      if (hasExistingRecord) {
        await axiosInstance.put(
          `/user/payroll-bank-details/${targetId}`,
          processedPayload,
        );
        showToast("Payroll & Bank details updated successfully!", "success");
        setIsEditing(false); // Lock the form back to view mode
      } else {
        await axiosInstance.post(
          `/user/payroll-bank-details/${targetId}`,
          processedPayload,
        );
        showToast("Payroll & Bank details added successfully!", "success");
        navigate("/employees"); // Route back on successful first creation
      }
    } catch (error: any) {
      console.error("Form submission exception:", error);
      const errorDetail = error.response?.data?.detail;
      const msg = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to save financial parameters.";
      showToast(msg, "error");
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleCancelEditing = () => {
    if (!hasExistingRecord) {
      navigate("/employees");
    } else {
      setIsEditing(false); // Revert to View mode safely
    }
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
          Loading financial and statutory data...
        </Typography>
      </Box>
    );
  }

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
      {/* 🚀 Dynamic Header with Edit Toggle (All alignments strictly inside SX!) */}
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
            {hasExistingRecord
              ? isEditing
                ? "Edit Payroll & Bank Details"
                : "Payroll Details View"
              : "Add Payroll & Bank Details"}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {hasExistingRecord
              ? isEditing
                ? "Update the compensation structure and clearing accounts."
                : "Review the compensation structure and clearing accounts."
              : "Complete the financial tracking and ledger settlement details to activate standard payroll logic."}
          </Typography>
        </Box>

        {/* Render Edit Button ONLY if viewing an existing record, they have permission, and it's currently locked */}
        {hasExistingRecord && canEdit && !isEditing && (
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
            Edit Financials
          </Button>
        )}
      </Stack>

      <Box sx={{ flex: 1, overflowY: "auto", px: 0.5, pb: 4 }}>
        <form
          id="payroll-bank-form"
          onSubmit={handleSubmit(handleFormSubmission)}
        >
          <Typography
            variant="h6"
            sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
          >
            Salary Configuration
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="annual_ctc"
                control={control}
                rules={{
                  required: "Annual CTC allocation is required",
                  min: { value: 0, message: "Value cannot be negative" },
                }}
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
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="basic_salary"
                control={control}
                rules={{
                  required: "Basic salary component configuration is required",
                  min: { value: 0, message: "Value cannot be negative" },
                }}
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
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="hra"
                control={control}
                rules={{
                  required: "HRA allocation parameters are required",
                  min: { value: 0, message: "Value cannot be negative" },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="HRA Component *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Controller
                name="special_allowance"
                control={control}
                rules={{
                  required: "Special allowance parameter sets are required",
                  min: { value: 0, message: "Value cannot be negative" },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Special Allowance *"
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
            sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
          >
            Bank & Statutory Disclosures
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="bank_name"
                control={control}
                rules={{
                  required: "Bank clearing entity name is required",
                  minLength: 2,
                  maxLength: 250,
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Bank Name *"
                    placeholder="e.g., ICICI Bank"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="account_number"
                control={control}
                rules={{
                  required: "Settlement ledger account number is required",
                  minLength: 2,
                  maxLength: 50,
                }}
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
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="ifsc"
                control={control}
                rules={{
                  required: "An 11 character clearing IFSC string is required",
                  minLength: {
                    value: 11,
                    message: "IFSC string must contain exactly 11 characters",
                  },
                  maxLength: {
                    value: 11,
                    message: "IFSC string must contain exactly 11 characters",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="IFSC Code *"
                    placeholder="e.g., ICIC0000001"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="account_holder_name"
                control={control}
                rules={{ minLength: 2, maxLength: 50 }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Account Holder Name"
                    placeholder="Defaults to employee name if blank"
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
                rules={{
                  minLength: {
                    value: 10,
                    message: "PAN number contains 10 characters",
                  },
                  maxLength: {
                    value: 10,
                    message: "PAN number contains 10 characters",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="PAN Card Number"
                    placeholder="e.g., ABCDE1234F"
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
                rules={{
                  minLength: {
                    value: 12,
                    message: "UAN string must be exactly 12 characters",
                  },
                  maxLength: {
                    value: 12,
                    message: "UAN string must be exactly 12 characters",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="EPFO UAN Number"
                    placeholder="e.g., 100XXXXXXXXX"
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
                rules={{
                  minLength: {
                    value: 12,
                    message: "Identity parameter requires exactly 12 metrics",
                  },
                  maxLength: {
                    value: 12,
                    message: "Identity parameter requires exactly 12 metrics",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="National ID Reference"
                    placeholder="e.g., 123456789012"
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

      {/* 🚀 Dynamic Sticky Footer (Alignments safely inside sx) */}
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
            onClick={handleCancelEditing}
            disabled={isActionProcessing}
            startIcon={<ArrowBack />}
            sx={{ textTransform: "none", fontWeight: 600, color: "#434654" }}
          >
            {hasExistingRecord ? "Cancel Editing" : "Cancel & Return"}
          </Button>
          <Button
            variant="contained"
            disableElevation
            type="submit"
            form="payroll-bank-form"
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
              ? "Saving Financials..."
              : hasExistingRecord
                ? "Save Changes"
                : "Add Payroll Details"}
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
