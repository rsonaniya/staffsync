import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  Stack,
  Autocomplete,
} from "@mui/material";
import { ArrowBack, SaveOutlined } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
// 🚀 IMPORT NEW RBAC UTILITY
import { checkEditPermission, type SystemRole } from "../utils/permissions";

// ==========================================
// TYPES & CONSTANTS
// ==========================================
interface EmploymentDetailsFormData {
  department: string;
  designation: string;
  employment_type: string;
  joining_date: string;
  probation_period_months: number;
  reporting_manager_id: number | null;
  leave_policy_id: number | null;
  shift_id: number | null;
  location_id: number | null;
}

const inputStyles = {
  backgroundColor: "#f3f4f6",
  borderRadius: "4px 4px 0 0",
  "&:before": { borderBottom: "1px solid #c3c6d6" },
  "&:hover:not(.Mui-disabled):before": { borderBottom: "1px solid #737685" },
  "&:after": { borderBottom: "2px solid #003d9b" },
};

export default function EmploymentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isActionProcessing, setIsActionProcessing] = useState<boolean>(false);
  const [isExistingRecord, setIsExistingRecord] = useState<boolean>(false);

  // 🚀 RBAC Security States
  const [fetchedTargetRole, setFetchedTargetRole] = useState<SystemRole | null>(
    null,
  );

  // Dropdown Lookups
  const [policies, setPolicies] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  const { control, handleSubmit, reset } = useForm<EmploymentDetailsFormData>({
    defaultValues: {
      department: "",
      designation: "",
      employment_type: "FULL_TIME",
      joining_date: "",
      probation_period_months: 3,
      reporting_manager_id: null,
      leave_policy_id: null,
      shift_id: null,
      location_id: null,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        // 1. Fetch Lookups
        const [polRes, shiftRes, locRes, mgrRes] = await Promise.all([
          axiosInstance.get("/admin/leave-policy").catch(() => ({ data: [] })),
          axiosInstance.get("/admin/shift").catch(() => ({ data: [] })),
          axiosInstance.get("/admin/location").catch(() => ({ data: [] })),
          axiosInstance.get("/user/manager-lookup").catch(() => ({ data: [] })),
        ]);
        setPolicies(polRes.data);
        setShifts(shiftRes.data);
        setLocations(locRes.data);
        setManagers(mgrRes.data);

        // 2. Fetch the Target User's Base Profile to get their Role for the Security Matrix
        const userRes = await axiosInstance.get(`/user/${id}`);
        const targetRole = userRes.data.role;
        setFetchedTargetRole(targetRole);

        // 🚀 URL BYPASS SECURITY CHECK
        // If they don't have permission to edit this role, boot them to the View page immediately.
        if (!checkEditPermission(currentUser?.role, targetRole)) {
          showToast(
            "You do not have administrative clearance to edit this profile.",
            "error",
          );
          navigate(`/employees/${id}/view/employment`, { replace: true });
          return; // Stop execution
        }

        // 3. Fetch Employment Details if Security Check Passes
        try {
          const empRes = await axiosInstance.get(
            `/user/employment-details/${id}`,
          );
          if (empRes.data) {
            setIsExistingRecord(true);
            reset({
              department: empRes.data.department || "",
              designation: empRes.data.designation || "",
              employment_type: empRes.data.employment_type || "FULL_TIME",
              joining_date: empRes.data.joining_date || "",
              probation_period_months: empRes.data.probation_period_months || 0,
              reporting_manager_id: empRes.data.reporting_manager_id || null,
              leave_policy_id: empRes.data.leave_policy_id || null,
              shift_id: empRes.data.shift_id || null,
              location_id: empRes.data.location_id || null,
            });
          }
        } catch (e: any) {
          if (e.response?.status === 404) {
            setIsExistingRecord(false);
          } else {
            throw e;
          }
        }
      } catch (error) {
        showToast("Failed to initialize employment configuration.", "error");
        navigate("/employees");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAllData();
  }, [id, reset, showToast, navigate, currentUser?.role]);

  const handleFormSubmission = async (data: EmploymentDetailsFormData) => {
    setIsActionProcessing(true);
    try {
      const payload = { ...data };
      if (isExistingRecord) {
        await axiosInstance.put(`/user/employment-details/${id}`, payload);
        showToast("Employment details updated successfully!", "success");
      } else {
        await axiosInstance.post(`/user/employment-details/${id}`, payload);
        showToast("Employment mapping initialized successfully!", "success");
      }
      navigate("/employees");
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
          Fetching employment data models...
        </Typography>
      </Box>
    );
  }

  // 🚀 Final Failsafe: If somehow rendering bypasses the useEffect redirect
  if (!checkEditPermission(currentUser?.role, fetchedTargetRole || undefined)) {
    return null;
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
              ? "Edit Employment Configuration"
              : "Initialize Employment Mapping"}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Define structural placement and operational rulesets for this
            employee.
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ flex: 1, overflowY: "auto", px: 0.5, pb: 4 }}>
        <form
          id="employment-form"
          onSubmit={handleSubmit(handleFormSubmission)}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
          >
            Corporate Placement
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="department"
                control={control}
                rules={{ required: "Department allocation is required" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={isActionProcessing}
                    variant="filled"
                    label="Department *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="designation"
                control={control}
                rules={{ required: "Title designation is required" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={isActionProcessing}
                    variant="filled"
                    label="Designation *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="employment_type"
                control={control}
                rules={{ required: "Contract type is required" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    disabled={isActionProcessing}
                    variant="filled"
                    label="Employment Type *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  >
                    <MenuItem value="FULL_TIME">Full Time</MenuItem>
                    <MenuItem value="PART_TIME">Part Time</MenuItem>
                    <MenuItem value="CONTRACT">Contract</MenuItem>
                    <MenuItem value="INTERN">Intern</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reporting_manager_id"
                control={control}
                render={({
                  field: { onChange, value, ref },
                  fieldState: { error },
                }) => (
                  <Autocomplete
                    options={managers}
                    getOptionLabel={(option) =>
                      `${option.first_name} ${option.last_name || ""}`
                    }
                    value={managers.find((m) => m.id === value) || null}
                    onChange={(_, newValue) =>
                      onChange(newValue ? newValue.id : null)
                    }
                    disabled={isActionProcessing}
                    renderInput={(params) => {
                      const { slotProps, ...restParams } = params;
                      return (
                        <TextField
                          {...restParams}
                          inputRef={ref}
                          variant="filled"
                          label="Reporting Manager"
                          error={!!error}
                          helperText={error?.message}
                          slotProps={{
                            ...slotProps,
                            input: {
                              ...slotProps?.input,
                              ...({ sx: inputStyles } as any),
                            },
                          }}
                        />
                      );
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="joining_date"
                control={control}
                rules={{ required: "Induction date is required" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    disabled={isActionProcessing}
                    variant="filled"
                    label="Joining Date *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{
                      input: { sx: inputStyles },
                      inputLabel: { shrink: true },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="probation_period_months"
                control={control}
                rules={{ required: "Probation limit is required", min: 0 }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    disabled={isActionProcessing}
                    variant="filled"
                    label="Probation Period (Months) *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
          >
            Operational Rulesets
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="leave_policy_id"
                control={control}
                rules={{ required: "Policy mapping required" }}
                render={({
                  field: { onChange, value, ref },
                  fieldState: { error },
                }) => (
                  <Autocomplete
                    options={policies}
                    getOptionLabel={(option) => option.name}
                    value={policies.find((p) => p.id === value) || null}
                    onChange={(_, newValue) =>
                      onChange(newValue ? newValue.id : null)
                    }
                    disabled={isActionProcessing}
                    renderInput={(params) => {
                      const { slotProps, ...restParams } = params;
                      return (
                        <TextField
                          {...restParams}
                          inputRef={ref}
                          variant="filled"
                          label="Leave Policy *"
                          error={!!error}
                          helperText={error?.message}
                          slotProps={{
                            ...slotProps,
                            input: {
                              ...slotProps?.input,
                              ...({ sx: inputStyles } as any),
                            },
                          }}
                        />
                      );
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="shift_id"
                control={control}
                rules={{ required: "Shift mapping required" }}
                render={({
                  field: { onChange, value, ref },
                  fieldState: { error },
                }) => (
                  <Autocomplete
                    options={shifts}
                    getOptionLabel={(option) => option.name}
                    value={shifts.find((s) => s.id === value) || null}
                    onChange={(_, newValue) =>
                      onChange(newValue ? newValue.id : null)
                    }
                    disabled={isActionProcessing}
                    renderInput={(params) => {
                      const { slotProps, ...restParams } = params;
                      return (
                        <TextField
                          {...restParams}
                          inputRef={ref}
                          variant="filled"
                          label="Default Shift *"
                          error={!!error}
                          helperText={error?.message}
                          slotProps={{
                            ...slotProps,
                            input: {
                              ...slotProps?.input,
                              ...({ sx: inputStyles } as any),
                            },
                          }}
                        />
                      );
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="location_id"
                control={control}
                rules={{ required: "Location base required" }}
                render={({
                  field: { onChange, value, ref },
                  fieldState: { error },
                }) => (
                  <Autocomplete
                    options={locations}
                    getOptionLabel={(option) => option.name}
                    value={locations.find((l) => l.id === value) || null}
                    onChange={(_, newValue) =>
                      onChange(newValue ? newValue.id : null)
                    }
                    disabled={isActionProcessing}
                    renderInput={(params) => {
                      const { slotProps, ...restParams } = params;
                      return (
                        <TextField
                          {...restParams}
                          inputRef={ref}
                          variant="filled"
                          label="Base Location *"
                          error={!!error}
                          helperText={error?.message}
                          slotProps={{
                            ...slotProps,
                            input: {
                              ...slotProps?.input,
                              ...({ sx: inputStyles } as any),
                            },
                          }}
                        />
                      );
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </form>
      </Box>

      {/* 🚀 Dynamic Sticky Footer */}
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
          onClick={() => navigate("/employees")}
          disabled={isActionProcessing}
          startIcon={<ArrowBack />}
          sx={{ textTransform: "none", fontWeight: 600, color: "#434654" }}
        >
          Cancel & Return
        </Button>
        <Button
          variant="contained"
          disableElevation
          type="submit"
          form="employment-form"
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
              : "Initialize Employment"}
        </Button>
      </Stack>
    </Box>
  );
}
