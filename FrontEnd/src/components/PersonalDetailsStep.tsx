import {
  Grid,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
  Divider,
  Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";

// ==========================================
// TYPES & CONSTANTS
// ==========================================

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
  timezone: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone_code: string;
  emergency_contact_phone: string;
  role: "EMPLOYEE" | "MANAGER" | "HR" | "HR_MANAGER" | "ADMIN" | "";
}

const inputStyles = {
  backgroundColor: "#f3f4f6",
  borderRadius: "4px 4px 0 0",
  "&:before": { borderBottom: "1px solid #c3c6d6" },
  "&:hover:not(.Mui-disabled):before": { borderBottom: "1px solid #737685" },
  "&:after": { borderBottom: "2px solid #003d9b" },
};

// Generates a perfect, exhaustive array of all IANA timezones natively!
const ALL_IANA_TIMEZONES = Intl.supportedValuesOf("timeZone");

const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+971"];

interface Props {
  onStepSubmit: (data: PersonalDetailsFormData) => void;
  defaultValues?: Partial<PersonalDetailsFormData>;
}

// ==========================================
// COMPONENT
// ==========================================

export default function PersonalDetailsStep({
  onStepSubmit,
  defaultValues,
}: Props) {
  const { control, handleSubmit } = useForm<PersonalDetailsFormData>({
    // 1. Fallback empty state for "Add New Employee"
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
      timezone: "Asia/Kolkata",
      emergency_contact_name: "",
      emergency_contact_relationship: "",
      emergency_contact_phone_code: "+91",
      emergency_contact_phone: "",
      role: "EMPLOYEE",
    },
    // 2. Magic for "Edit" Mode: Overrides the defaults when API data arrives
    values: defaultValues as PersonalDetailsFormData,
    mode: "onTouched",
  });

  const onSubmit = (data: PersonalDetailsFormData) => {
    onStepSubmit(data);
  };

  return (
    <form id="personal-details-form" onSubmit={handleSubmit(onSubmit)}>
      {/* --- BASIC INFO --- */}
      <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
        Basic Information
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="first_name"
            control={control}
            rules={{ required: "First name is required", maxLength: 50 }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
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
            rules={{ required: "Gender is required" }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                select
                fullWidth
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
            rules={{ required: "Date of Birth is required" }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
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

      {/* --- CONTACT & ADDRESS --- */}
      <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
        Contact & Address
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Corporate email is required",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                variant="filled"
                label="Corporate Email *"
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
              required: "Personal email is required",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
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
              required: "Phone is required",
              minLength: 4,
              maxLength: 20,
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
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
                              slotProps={{ input: { disableUnderline: true } }}
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
            rules={{ required: "Timezone is required" }}
            render={({
              field: { onChange, value, ref },
              fieldState: { error },
            }) => (
              <Autocomplete
                options={ALL_IANA_TIMEZONES}
                value={value || null}
                onChange={(_, newValue) => {
                  onChange(newValue || "");
                }}
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
                          // Tell TypeScript exactly what we are appending to clear the build error
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
            name="residential_address"
            control={control}
            rules={{
              required: "Address is required",
              minLength: 5,
              maxLength: 500,
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                variant="filled"
                label="Residential Address *"
                multiline
                rows={3}
                error={!!error}
                helperText={error?.message}
                slotProps={{ input: { sx: inputStyles } }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="current_address"
            control={control}
            rules={{
              required: "Current address is required",
              minLength: 5,
              maxLength: 500,
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                variant="filled"
                label="Current Address *"
                multiline
                rows={3}
                error={!!error}
                helperText={error?.message}
                slotProps={{ input: { sx: inputStyles } }}
              />
            )}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* --- EMERGENCY CONTACT & ROLE --- */}
      <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
        Emergency Contact & System Role
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="emergency_contact_name"
            control={control}
            rules={{
              required: "Emergency contact is required",
              maxLength: 100,
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
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
            rules={{ required: "Relationship is required", maxLength: 50 }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
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
            rules={{ required: "Phone is required", maxLength: 20 }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
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
            rules={{ required: "System Role is required" }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                select
                fullWidth
                variant="filled"
                label="System Role *"
                error={!!error}
                helperText={error?.message}
                slotProps={{ input: { sx: inputStyles } }}
              >
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="HR_MANAGER">HR Manager</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </TextField>
            )}
          />
        </Grid>
      </Grid>
    </form>
  );
}
