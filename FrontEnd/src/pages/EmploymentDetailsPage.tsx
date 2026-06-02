import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Stack,
  Autocomplete,
  Avatar,
} from "@mui/material";
import { ArrowBack, SaveOutlined, EditOutlined } from "@mui/icons-material"; // 🚀 Added EditOutlined
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { checkEditPermission, type SystemRole } from "../utils/permissions";
import FullScreenLoader from "../components/FullScreenLoader";

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

  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const [isActionProcessing, setIsActionProcessing] = useState<boolean>(false);
  const [isExistingRecord, setIsExistingRecord] = useState<boolean>(false);

  // 🚀 Added isEditing state matching AddEmployeeWizard
  const [isEditing, setIsEditing] = useState<boolean>(false);
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
        setInitialLoading(true);
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

        const userRes = await axiosInstance.get(`/user/${id}`);
        const targetRole = userRes.data.role;
        setFetchedTargetRole(targetRole);

        if (!checkEditPermission(currentUser?.role, targetRole)) {
          showToast(
            "You do not have administrative clearance to edit this profile.",
            "error",
          );
          navigate(`/employees/${id}/view/employment`, { replace: true });
          return;
        }

        try {
          const empRes = await axiosInstance.get(
            `/user/employment-details/${id}`,
          );
          if (empRes.data) {
            setIsExistingRecord(true);
            setIsEditing(false); // 🚀 Default to safely viewing existing records
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
          console.warn(
            "No existing employment record found, switching to creation mode.",
          );
          setIsExistingRecord(false);
          setIsEditing(true); // 🚀 Auto-enable editing if creating a brand new record
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
        setIsEditing(false); // 🚀 Lock the form back to view mode after saving
      } else {
        await axiosInstance.post(`/user/employment-details/${id}`, payload);
        showToast("Employment mapping initialized successfully!", "success");
        navigate("/employees");
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

  if (initialLoading)
    return <FullScreenLoader message=" Fetching employment data..." />;

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
                ? "Edit Employment Configuration"
                : "Employment Configuration View"
              : "Initialize Employment Mapping"}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {isExistingRecord
              ? isEditing
                ? "Update structural placement and operational rulesets."
                : "Review structural placement and operational rulesets."
              : "Define structural placement and operational rulesets for this employee."}
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
                    disabled={!isEditing || isActionProcessing}
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
                    disabled={!isEditing || isActionProcessing}
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
                    disabled={!isEditing || isActionProcessing}
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
                    disabled={!isEditing || isActionProcessing}
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props as any;
                      return (
                        <Box
                          component="li"
                          key={key}
                          {...optionProps}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar
                            src={option.profile_image_url || undefined}
                            alt={option.first_name}
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              backgroundColor: "#003d9b",
                            }}
                          >
                            {option.first_name?.charAt(0).toUpperCase() || "M"}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "text.primary" }}
                            >
                              {option.first_name} {option.last_name || ""}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                display: "block",
                                mt: -0.25,
                              }}
                            >
                              {option.email}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    }}
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
                    disabled={!isEditing || isActionProcessing}
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
                    disabled={!isEditing || isActionProcessing}
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
                    disabled={!isEditing || isActionProcessing}
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
                    disabled={!isEditing || isActionProcessing}
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
                    disabled={!isEditing || isActionProcessing}
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

      {/* 🚀 Dynamic Sticky Footer matching AddEmployeeWizard */}
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
