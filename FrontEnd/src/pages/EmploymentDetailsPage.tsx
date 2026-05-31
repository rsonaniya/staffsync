import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  Stack,
  Avatar,
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

export interface EmploymentDetailsFormData {
  department: string;
  designation: string;
  employment_type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN" | "";
  reporting_manager_id: number | "";
  joining_date: string;
  probation_period_months: number;
  leave_policy_id: number | "";
  shift_id: number | "";
  location_id: number | "";
}

interface DropdownOptions {
  leavePolicies: Array<{ id: number; name: string; is_active: boolean }>;
  shifts: Array<{
    id: number;
    name: string;
    is_active: boolean;
    start_time: string;
    end_time: string;
  }>;
  locations: Array<{
    id: number;
    name: string;
    city: string;
    is_active: boolean;
  }>;
  managers: Array<{ id: number; first_name: string; last_name: string | null }>;
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

export default function EmploymentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const targetId = id || currentUser?.id;

  const navigate = useNavigate();
  const { showToast } = useToast();

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isActionProcessing, setIsActionProcessing] = useState<boolean>(false);

  const [hasExistingRecord, setHasExistingRecord] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [lookups, setLookups] = useState<DropdownOptions>({
    leavePolicies: [],
    shifts: [],
    locations: [],
    managers: [],
  });

  // Permission Check: Can this user edit profiles?
  const canEdit = ["ADMIN", "HR", "HR_MANAGER"].includes(
    currentUser?.role || "",
  );

  const { control, handleSubmit, reset } = useForm<EmploymentDetailsFormData>({
    defaultValues: {
      department: "",
      designation: "",
      employment_type: "",
      reporting_manager_id: "",
      joining_date: "",
      probation_period_months: 0,
      leave_policy_id: "",
      shift_id: "",
      location_id: "",
    },
    mode: "onTouched",
  });

  // 🚀 CONCURRENT DATA FETCHING
  useEffect(() => {
    const loadAllRequiredMetadata = async () => {
      setInitialLoading(true);
      try {
        const [
          policiesRes,
          shiftsRes,
          locationsRes,
          managersRes,
          existingDetailsRes,
        ] = await Promise.all([
          axiosInstance.get("/admin/leave-policy").catch(() => ({ data: [] })),
          axiosInstance.get("/admin/shift").catch(() => ({ data: [] })),
          axiosInstance.get("/admin/location").catch(() => ({ data: [] })),
          axiosInstance.get("/user/manager-lookup").catch(() => ({ data: [] })),
          // Check if employment details exist for this user ID
          axiosInstance
            .get(`/user/employment-details/${targetId}`)
            .catch(() => null),
        ]);

        setLookups({
          leavePolicies: policiesRes.data || [],
          shifts: shiftsRes.data || [],
          locations: locationsRes.data || [],
          managers: managersRes.data || [],
        });

        if (existingDetailsRes && existingDetailsRes.data) {
          const record = existingDetailsRes.data;
          setHasExistingRecord(true);
          setIsEditing(false); // Lock into View Mode

          reset({
            department: record.department || "",
            designation: record.designation || "",
            employment_type: record.employment_type || "",
            reporting_manager_id: record.reporting_manager_id ?? "",
            joining_date: record.joining_date || "",
            probation_period_months: record.probation_period_months ?? 0,
            leave_policy_id: record.leave_policy_id || "",
            shift_id: record.shift_id || "",
            location_id: record.location_id || "",
          });
        } else {
          // If no record exists, default to Edit/Creation mode
          setHasExistingRecord(false);
          setIsEditing(true);
        }
      } catch (error: any) {
        console.error(
          "Critical failure during lookup catalog initialization:",
          error,
        );
        showToast(
          "Failed to initialize active system directory configuration maps.",
          "error",
        );
      } finally {
        setInitialLoading(false);
      }
    };

    if (targetId) {
      loadAllRequiredMetadata();
    }
  }, [targetId, reset, showToast]);

  const handleFormSubmission = async (data: EmploymentDetailsFormData) => {
    setIsActionProcessing(true);
    try {
      const processedPayload = {
        user_id: Number(targetId), // Injected to ensure relational linkage
        department: data.department.trim(),
        designation: data.designation.trim(),
        employment_type: data.employment_type,
        reporting_manager_id:
          data.reporting_manager_id === ""
            ? null
            : Number(data.reporting_manager_id),
        joining_date: data.joining_date,
        probation_period_months: Number(data.probation_period_months),
        leave_policy_id: Number(data.leave_policy_id),
        shift_id: Number(data.shift_id),
        location_id: Number(data.location_id),
      };

      if (hasExistingRecord) {
        await axiosInstance.put(
          `/user/employment-details/${targetId}`,
          processedPayload,
        );
        showToast("Employment details updated successfully!", "success");
        setIsEditing(false); // Lock the form back to view mode
      } else {
        await axiosInstance.post(
          `user/employment-details/${targetId}`,
          processedPayload,
        );
        showToast("Employment details added successfully!", "success");
        navigate("/employees"); // Navigate back to table upon first creation
      }
    } catch (error: any) {
      console.error("Form submission exception:", error);
      const errorDetail = error.response?.data?.detail;
      const msg = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to save employment parameters.";
      showToast(msg, "error");
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleCancelEditing = () => {
    if (!hasExistingRecord) {
      navigate("/employees");
    } else {
      setIsEditing(false); // Revert to View mode without resetting inputs (or trigger re-fetch if strict reset is desired)
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
          Synchronizing corporate structure profiles...
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
      {/* 🚀 Dynamic Header with Edit Toggle */}
      <Stack
        direction="row"
        sx={{
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
                ? "Edit Employment Details"
                : "Employment Details View"
              : "Add Employment Details"}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {hasExistingRecord
              ? isEditing
                ? "Update the job placement and structural organization for this employee."
                : "Review the job placement and structural organization for this employee."
              : "Complete the job placement parameters to map this employee into the enterprise architecture."}
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
            Edit Details
          </Button>
        )}
      </Stack>

      <Box sx={{ flex: 1, overflowY: "auto", px: 0.5, pb: 4 }}>
        <form
          id="employment-details-form"
          onSubmit={handleSubmit(handleFormSubmission)}
        >
          <Typography
            variant="h6"
            sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}
          >
            Corporate Placement Settings
          </Typography>
          <Grid container spacing={3}>
            {/* 1. Department */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="department"
                control={control}
                rules={{
                  required: "Department assignment is required",
                  minLength: 2,
                  maxLength: 100,
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Department Name *"
                    placeholder="e.g., Engineering"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>

            {/* 2. Designation */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="designation"
                control={control}
                rules={{
                  required: "Designation field role title is required",
                  minLength: 2,
                  maxLength: 100,
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Designation Title *"
                    placeholder="e.g., Full Stack Developer"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>

            {/* 3. Employment Type */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="employment_type"
                control={control}
                rules={{
                  required: "Employment contract classification is required",
                }}
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
                    <MenuItem value="FULL_TIME">Full-time Regular</MenuItem>
                    <MenuItem value="PART_TIME">Part-time Staff</MenuItem>
                    <MenuItem value="CONTRACT">External Contractor</MenuItem>
                    <MenuItem value="INTERN">Internship Bound</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* 4. Reporting Manager */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="reporting_manager_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Reporting Manager"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{
                      input: { sx: inputStyles },
                      select: {
                        renderValue: (selected) => {
                          if (selected === "")
                            return <em>None Assigned (Self-Reporting)</em>;
                          const mgr = lookups.managers.find(
                            (m) => m.id === selected,
                          );
                          return mgr
                            ? `${mgr.first_name} ${mgr.last_name || ""}`
                            : "";
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>None Assigned (Self-Reporting)</em>
                    </MenuItem>
                    {lookups.managers.map((m: any) => (
                      <MenuItem key={m.id} value={m.id}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ alignItems: "center" }}
                        >
                          <Avatar
                            src={m.profile_image_url || undefined}
                            alt={m.first_name}
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: "0.75rem",
                              backgroundColor: "#003d9b",
                            }}
                          >
                            {m.first_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {m.first_name} {m.last_name || ""}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* 5. Joining Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="joining_date"
                control={control}
                rules={{
                  required: "Official onboarding joining date is required",
                }}
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

            {/* 6. Probation */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="probation_period_months"
                control={control}
                rules={{
                  min: {
                    value: 0,
                    message: "Probation span cannot be negative",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Probation Period (Months)"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* 7. Leave Policy */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="leave_policy_id"
                control={control}
                rules={{
                  required:
                    "An annual legal leave policy matrix mapping assignment is required",
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Assigned Leave Policy *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  >
                    {lookups.leavePolicies
                      .filter((p) => p.is_active || p.id === field.value)
                      .map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name}
                        </MenuItem>
                      ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* 8. Shift Schedule */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="shift_id"
                control={control}
                rules={{
                  required:
                    "A core attendance working operational shift tier is required",
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Assigned Shift Schedule *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  >
                    {lookups.shifts
                      .filter((s) => s.is_active || s.id === field.value)
                      .map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name} ({s.start_time.substring(0, 5)} -{" "}
                          {s.end_time.substring(0, 5)})
                        </MenuItem>
                      ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* 9. Location Base */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="location_id"
                control={control}
                rules={{
                  required:
                    "Physical operational office base mapping destination link is required",
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Office Base Location *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  >
                    {lookups.locations
                      .filter((l) => l.is_active || l.id === field.value)
                      .map((l) => (
                        <MenuItem key={l.id} value={l.id}>
                          {l.name} ({l.city})
                        </MenuItem>
                      ))}
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </form>
      </Box>

      {/* 🚀 Dynamic Sticky Footer */}
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
            form="employment-details-form"
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
              ? "Saving Profile..."
              : hasExistingRecord
                ? "Save Changes"
                : "Add Employment Details"}
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
