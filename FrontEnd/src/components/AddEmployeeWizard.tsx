import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
  Divider,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Stack,
  CircularProgress,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  SaveOutlined,
  EditOutlined,
  PhotoCamera,
  CloudUploadOutlined,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { axiosInstance } from "../api/axiosInstance";

// ==========================================
// TYPES & CONSTANTS
// ==========================================
export type SystemRole =
  | "EMPLOYEE"
  | "MANAGER"
  | "HR"
  | "HR_MANAGER"
  | "ADMIN"
  | "";

export interface PersonalDetailsFormData {
  first_name: string;
  last_name: string;
  email: string;
  personal_email: string;
  phone_code: string;
  phone: string;
  date_of_birth: string;
  gender: "Male" | "Female" | "Other" | "";
  residential_address: string;
  current_address: string;
  same_as_residential: boolean;
  timezone: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone_code: string;
  emergency_contact_phone: string;
  role: SystemRole;
}

const inputStyles = {
  backgroundColor: "#f3f4f6",
  borderRadius: "4px 4px 0 0",
  "&:before": { borderBottom: "1px solid #c3c6d6" },
  "&:hover:not(.Mui-disabled):before": { borderBottom: "1px solid #737685" },
  "&:after": { borderBottom: "2px solid #003d9b" },
};

const ALL_IANA_TIMEZONES = Intl.supportedValuesOf("timeZone");
const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+971"];

const ALLOWED_CREATION_TARGET: Record<string, string[]> = {
  EMPLOYEE: [],
  MANAGER: [],
  HR: ["EMPLOYEE", "MANAGER"],
  HR_MANAGER: ["EMPLOYEE", "MANAGER", "HR"],
  ADMIN: ["EMPLOYEE", "MANAGER", "HR", "HR_MANAGER", "ADMIN"],
};

export default function AddEmployeeWizard() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user: currentUser, updateUserProfile } = useAuth();

  const targetId =
    location.pathname === "/employees/new" ? null : id || currentUser?.id;
  const isExistingEmployee = Boolean(targetId);
  const isOwnProfile = location.pathname.startsWith("/my-profile");

  const [isEditing, setIsEditing] = useState<boolean>(!isExistingEmployee);
  const [isActionProcessing, setIsActionProcessing] = useState<boolean>(false);
  const [isFetchingData, setIsFetchingData] =
    useState<boolean>(isExistingEmployee);

  // 🚀 Keep track of the original role so mid-edit dropdown changes don't break permissions
  const [fetchedTargetRole, setFetchedTargetRole] = useState<SystemRole | null>(
    null,
  );

  const navigate = useNavigate();
  const { showToast } = useToast();

  // ==========================================
  // 🚀 STRICT HIERARCHICAL RBAC EVALUATION
  // ==========================================
  const checkEditPermission = (): boolean => {
    if (!currentUser) return false;

    // 1. Admins have omnipotent edit access
    if (currentUser.role === "ADMIN") return true;

    // 2. Non-Admins CANNOT edit their own profile details
    if (targetId && targetId === currentUser.id) return false;

    // 3. Anyone with access to the "New Employee" route can edit the blank form
    if (!isExistingEmployee) return true;

    // 4. Must wait for the target's role to load from the API before evaluating
    if (!fetchedTargetRole) return false;

    // 5. HR Manager Hierarchy
    if (currentUser.role === "HR_MANAGER") {
      return ["EMPLOYEE", "MANAGER", "HR"].includes(fetchedTargetRole);
    }

    // 6. Standard HR Hierarchy
    if (currentUser.role === "HR") {
      return ["EMPLOYEE", "MANAGER"].includes(fetchedTargetRole);
    }

    return false;
  };

  const canEdit = checkEditPermission();

  const allowedRoles = useMemo(() => {
    if (!currentUser?.role) return [];
    return ALLOWED_CREATION_TARGET[currentUser.role] || [];
  }, [currentUser]);

  // --- AVATAR UPLOAD STATES ---
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const { control, handleSubmit, setValue, getValues, watch, reset } =
    useForm<PersonalDetailsFormData>({
      defaultValues: {
        first_name: "",
        last_name: "",
        email: "",
        personal_email: "",
        phone_code: "+91",
        phone: "",
        date_of_birth: "",
        gender: "",
        residential_address: "",
        current_address: "",
        same_as_residential: false,
        timezone: "Asia/Kolkata",
        emergency_contact_name: "",
        emergency_contact_relationship: "",
        emergency_contact_phone_code: "+91",
        emergency_contact_phone: "",
        role: "EMPLOYEE",
      },
      mode: "onTouched",
    });

  const isSameAddressChecked = watch("same_as_residential");

  useEffect(() => {
    if (isExistingEmployee && targetId) {
      const fetchEmployeeData = async () => {
        try {
          const res = await axiosInstance.get(`/user/${targetId}`);
          const data = res.data;

          // Save the target's original role for the permission matrix
          setFetchedTargetRole(data.role || "EMPLOYEE");

          let pCode = "+91",
            pNum = data.phone || "";
          COUNTRY_CODES.forEach((c) => {
            if (pNum.startsWith(c)) {
              pCode = c;
              pNum = pNum.replace(c, "");
            }
          });

          let epCode = "+91",
            epNum = data.emergency_contact_phone || "";
          COUNTRY_CODES.forEach((c) => {
            if (epNum.startsWith(c)) {
              epCode = c;
              epNum = epNum.replace(c, "");
            }
          });

          reset({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            personal_email: data.personal_email || "",
            phone_code: pCode,
            phone: pNum,
            date_of_birth: data.date_of_birth || "",
            gender: data.gender || "",
            residential_address: data.residential_address || "",
            current_address: data.current_address || "",
            same_as_residential:
              data.residential_address === data.current_address &&
              !!data.residential_address,
            timezone: data.timezone || "Asia/Kolkata",
            emergency_contact_name: data.emergency_contact_name || "",
            emergency_contact_relationship:
              data.emergency_contact_relationship || "",
            emergency_contact_phone_code: epCode,
            emergency_contact_phone: epNum,
            role: data.role || "EMPLOYEE",
          });
        } catch (error) {
          showToast("Failed to fetch employee details", "error");
          navigate("/employees");
        } finally {
          setIsFetchingData(false);
        }
      };
      fetchEmployeeData();
    }
  }, [targetId, isExistingEmployee, reset, showToast, navigate]);

  const handleFormSubmission = async (data: PersonalDetailsFormData) => {
    setIsActionProcessing(true);
    try {
      const compiledPayload = {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim() || null,
        email: data.email.trim(),
        personal_email: data.personal_email.trim(),
        phone: `${data.phone_code}${data.phone.trim()}`,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        residential_address: data.residential_address.trim(),
        current_address: data.same_as_residential
          ? data.residential_address.trim()
          : data.current_address.trim(),
        timezone: data.timezone,
        emergency_contact_name: data.emergency_contact_name.trim(),
        emergency_contact_relationship:
          data.emergency_contact_relationship.trim(),
        emergency_contact_phone: `${data.emergency_contact_phone_code}${data.emergency_contact_phone.trim()}`,
        role: data.role,
      };

      if (isExistingEmployee) {
        await axiosInstance.put(`/user/${targetId}`, compiledPayload);
        showToast("Employee details updated successfully!", "success");
        setFetchedTargetRole(data.role); // Update internal state matrix to match save
        setIsEditing(false);
      } else {
        await axiosInstance.post("/user", compiledPayload);
        showToast("Employee record initialized successfully!", "success");
        navigate("/employees");
      }
    } catch (error: any) {
      const errorDetail = error.response?.data?.detail;
      const msg = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to save profile parameters.";
      showToast(msg, "error");
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleCancelEditing = () => {
    reset();
    setIsEditing(false);
  };

  // --- AVATAR HANDLERS ---
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast("Only JPEG, PNG, and WEBP images are allowed.", "error");
      return;
    }
    if (file.size < 102400 || file.size > 5242880) {
      showToast("Image must be between 100 KB and 5 MB.", "error");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUploadSubmit = async () => {
    if (!avatarFile) return;
    setIsUploadingAvatar(true);

    const formData = new FormData();
    formData.append("profile_image", avatarFile);

    try {
      const response = await axiosInstance.patch(
        "/user/upload-profile-pic",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      showToast("Profile picture updated successfully!", "success");
      updateUserProfile(response.data);

      setIsAvatarModalOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      const errorDetail = error.response?.data?.detail;
      const msg = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to upload profile picture.";
      showToast(msg, "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isFetchingData) {
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
          Loading profile data...
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
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexShrink: 0,
        }}
      >
        <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          {isOwnProfile && (
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={currentUser?.profile_image_url || undefined}
                alt={currentUser?.first_name}
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: "2rem",
                  fontWeight: 700,
                  backgroundColor: "#003d9b",
                  border: "2px solid #e5e7eb",
                }}
              >
                {currentUser?.first_name?.charAt(0).toUpperCase() || "U"}
              </Avatar>
              <Tooltip title="Update Profile Picture">
                <IconButton
                  onClick={() => setIsAvatarModalOpen(true)}
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: -4,
                    right: -4,
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(195,198,214,0.5)",
                    color: "#003d9b",
                    "&:hover": { backgroundColor: "#f3f4f6" },
                  }}
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
            >
              {isExistingEmployee
                ? isEditing
                  ? "Edit Employee Profile"
                  : "Employee Profile View"
                : "Provision New Employee"}
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              {isExistingEmployee
                ? isEditing
                  ? "Update the core demographic and system access parameters for this user."
                  : "Review the demographic and system access parameters for this user."
                : "Complete the core data fields to register this human resource profile in the enterprise system directory."}
            </Typography>
          </Box>
        </Stack>

        {isExistingEmployee && canEdit && !isEditing && (
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
          id="personal-details-form"
          onSubmit={handleSubmit(handleFormSubmission)}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
          >
            Basic Information
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="first_name"
                control={control}
                rules={{
                  required: "First name is required",
                  minLength: 1,
                  maxLength: 50,
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="First Name *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="last_name"
                control={control}
                rules={{ maxLength: 50 }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Last Name"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="gender"
                control={control}
                rules={{ required: "Gender selection identity is required" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Gender *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="date_of_birth"
                control={control}
                rules={{ required: "Date of Birth records are required" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Date of Birth *"
                    type="date"
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
          </Grid>

          <Divider sx={{ mb: 4 }} />

          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
          >
            Contact & Corporate Address Routing
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Unique corporate domain email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please supply a valid corporate formatting",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={
                      !isEditing || isActionProcessing || isExistingEmployee
                    }
                    variant="filled"
                    label={
                      isExistingEmployee
                        ? "Corporate Email (Read Only)"
                        : "Corporate Email *"
                    }
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="personal_email"
                control={control}
                rules={{
                  required: "Unique personal recovery email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please supply a valid communication formatting",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Personal Email *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Core dial contact number is required",
                  minLength: 4,
                  maxLength: 20,
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Contact Number *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{
                      input: {
                        sx: inputStyles,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Controller
                              name="phone_code"
                              control={control}
                              render={({ field: codeField }) => (
                                <TextField
                                  {...codeField}
                                  select
                                  variant="standard"
                                  disabled={!isEditing || isActionProcessing}
                                  slotProps={{
                                    input: { disableUnderline: true },
                                  }}
                                  sx={{
                                    width: 60,
                                    mr: 1,
                                    "& .MuiSelect-select": { py: 0 },
                                  }}
                                >
                                  {COUNTRY_CODES.map((code) => (
                                    <MenuItem key={code} value={code}>
                                      {code}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              )}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="timezone"
                control={control}
                rules={{
                  required:
                    "Standard IANA operational timezone mapping is required",
                }}
                render={({
                  field: { onChange, value, ref },
                  fieldState: { error },
                }) => (
                  <Autocomplete
                    options={ALL_IANA_TIMEZONES}
                    value={value || null}
                    disabled={!isEditing || isActionProcessing}
                    onChange={(_, newValue) => onChange(newValue || "")}
                    renderInput={(params) => {
                      const { slotProps, ...restParams } = params;
                      return (
                        <TextField
                          {...restParams}
                          inputRef={ref}
                          variant="filled"
                          label="Timezone *"
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

            <Grid size={{ xs: 12 }} sx={{ mt: 1, mb: -1 }}>
              <Controller
                name="same_as_residential"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        disabled={!isEditing || isActionProcessing}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          onChange(checked);
                          if (checked) {
                            setValue(
                              "current_address",
                              getValues("residential_address"),
                              { shouldValidate: true },
                            );
                          }
                        }}
                        color="primary"
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        Current mailing address is the same as permanent
                        residential address
                      </Typography>
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="residential_address"
                control={control}
                rules={{
                  required: "Permanent home mailing records are required",
                  minLength: 5,
                  maxLength: 500,
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Permanent Residential Address *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                    onChange={(e) => {
                      field.onChange(e);
                      if (getValues("same_as_residential")) {
                        setValue("current_address", e.target.value, {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="current_address"
                control={control}
                rules={{
                  required: "Current residency bound details are required",
                  minLength: 5,
                  maxLength: 500,
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    disabled={
                      !isEditing || isActionProcessing || isSameAddressChecked
                    }
                    variant="filled"
                    label="Current Mailing Address *"
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
            Emergency Contact & Platform Privileges
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="emergency_contact_name"
                control={control}
                rules={{
                  required: "Designated first responder name is required",
                  minLength: 1,
                  maxLength: 100,
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Emergency Contact Name *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="emergency_contact_relationship"
                control={control}
                rules={{
                  required: "Relationship links are required",
                  minLength: 1,
                  maxLength: 50,
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Relationship *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="emergency_contact_phone"
                control={control}
                rules={{
                  required: "Responder contact number is required",
                  minLength: 4,
                  maxLength: 20,
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="Emergency Phone *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{
                      input: {
                        sx: inputStyles,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Controller
                              name="emergency_contact_phone_code"
                              control={control}
                              render={({ field: codeField }) => (
                                <TextField
                                  {...codeField}
                                  select
                                  variant="standard"
                                  disabled={!isEditing || isActionProcessing}
                                  slotProps={{
                                    input: { disableUnderline: true },
                                  }}
                                  sx={{
                                    width: 60,
                                    mr: 1,
                                    "& .MuiSelect-select": { py: 0 },
                                  }}
                                >
                                  {COUNTRY_CODES.map((code) => (
                                    <MenuItem key={code} value={code}>
                                      {code}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              )}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="role"
                control={control}
                rules={{
                  required:
                    "System access clearance allocation tier is required",
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    disabled={!isEditing || isActionProcessing}
                    variant="filled"
                    label="System Role *"
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ input: { sx: inputStyles } }}
                  >
                    {allowedRoles.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r.replace("_", " ")}
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
            onClick={
              isExistingEmployee
                ? handleCancelEditing
                : () => navigate("/employees")
            }
            disabled={isActionProcessing}
            startIcon={<ArrowBack />}
            sx={{ textTransform: "none", fontWeight: 600, color: "#434654" }}
          >
            {isExistingEmployee ? "Cancel Editing" : "Cancel & Return"}
          </Button>
          <Button
            variant="contained"
            disableElevation
            type="submit"
            form="personal-details-form"
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
              : isExistingEmployee
                ? "Save Changes"
                : "Initialize Employee Profile"}
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
          {!isOwnProfile && (
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
          )}
        </Box>
      )}

      {/* PROFILE PICTURE UPLOAD MODAL */}
      <Dialog
        open={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            borderBottom: "1px solid rgba(195, 198, 214, 0.4)",
            pb: 2,
            textAlign: "center",
          }}
        >
          Update Profile Picture
        </DialogTitle>
        <DialogContent
          sx={{
            pt: "32px !important",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Avatar
            src={avatarPreview || currentUser?.profile_image_url || undefined}
            sx={{
              width: 140,
              height: 140,
              fontSize: "3rem",
              fontWeight: 700,
              backgroundColor: "#003d9b",
              border: "4px solid #f3f4f6",
            }}
          >
            {currentUser?.first_name?.charAt(0).toUpperCase() || "U"}
          </Avatar>
          <Button
            component="label"
            variant="outlined"
            disableElevation
            startIcon={<CloudUploadOutlined />}
            disabled={isUploadingAvatar}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              borderColor: "rgba(195, 198, 214, 0.8)",
              color: "text.primary",
            }}
          >
            Choose New Image
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              hidden
              onChange={handleAvatarFileSelect}
            />
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: "center", px: 2 }}
          >
            Supported formats: JPEG, PNG, WEBP. <br /> Allowed size: 100 KB to 5
            MB.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ px: 3, pb: 3, pt: 1, justifyContent: "center", gap: 2 }}
        >
          <Button
            onClick={() => {
              setIsAvatarModalOpen(false);
              setAvatarFile(null);
              setAvatarPreview(null);
            }}
            disabled={isUploadingAvatar}
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAvatarUploadSubmit}
            variant="contained"
            disableElevation
            disabled={!avatarFile || isUploadingAvatar}
            sx={{
              backgroundColor: "#003d9b",
              fontWeight: 600,
              textTransform: "none",
              px: 3,
              borderRadius: 2,
              "&:hover": { backgroundColor: "#0052cc" },
            }}
          >
            {isUploadingAvatar ? "Uploading..." : "Save Picture"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
