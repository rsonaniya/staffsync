import { useState, useEffect, useMemo } from "react";
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
  MenuItem,
} from "@mui/material";
import { Add, EditOutlined, FmdGoodOutlined } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
// Standard structural location datasets
import { Country, State, City } from "country-state-city";
import TimezoneSelect from "react-timezone-select";
import type { ITimezone } from "react-timezone-select";
import { axiosInstance } from "../api/axiosInstance";
import FullScreenLoader from "../components/FullScreenLoader";
import { useToast } from "../context/ToastContext";

// ==========================================
// 1. TYPES & STYLES
// ==========================================

interface LocationItem {
  id: number;
  name: string;
  city: string;
  address: string | null;
  state: string;
  country: string;
  timezone: string;
  is_active: boolean;
}

interface LocationFormInputs {
  name: string;
  country: string;
  state: string;
  city: string;
  address: string;
  timezone: string | ITimezone;
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

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal tracking states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(
    null,
  );

  const { showToast } = useToast();

  // Initialize centralized React Hook Form core engine
  const { control, handleSubmit, reset, watch, setValue } =
    useForm<LocationFormInputs>({
      defaultValues: {
        name: "",
        country: "",
        state: "",
        city: "",
        address: "",
        timezone: "Asia/Kolkata",
        is_active: true,
      },
      mode: "onTouched",
    });

  // Watch location selections to drive cascading dependent dropdown filters
  const watchCountryName = watch("country");
  const watchStateName = watch("state");

  // Fetch all worldwide countries on mounting cycle
  const countriesList = useMemo(() => Country.getAllCountries(), []);

  // Find selected country object to extract its ISO code for state lookups
  const selectedCountryObj = useMemo(() => {
    return countriesList.find((c) => c.name === watchCountryName);
  }, [watchCountryName, countriesList]);

  // Compute available states dynamically based on selected country
  const statesList = useMemo(() => {
    return selectedCountryObj
      ? State.getStatesOfCountry(selectedCountryObj.isoCode)
      : [];
  }, [selectedCountryObj]);

  // Find selected state object to extract its code for city lookups
  const selectedStateObj = useMemo(() => {
    return statesList.find((s) => s.name === watchStateName);
  }, [watchStateName, statesList]);

  // Compute available cities dynamically based on selected state and country
  const citiesList = useMemo(() => {
    return selectedCountryObj && selectedStateObj
      ? City.getCitiesOfState(
          selectedCountryObj.isoCode,
          selectedStateObj.isoCode,
        )
      : [];
  }, [selectedCountryObj, selectedStateObj]);

  // Fetch all system locations from database (GET: /admin/location/)
  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response =
        await axiosInstance.get<LocationItem[]>("/admin/location/");
      setLocations(response.data);
    } catch (error: any) {
      console.error("Failed to load corporate locations:", error);
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to sync system locations from the server.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Open modal handler configuration
  const handleOpenModal = (loc: LocationItem | null = null) => {
    setEditingLocation(loc);
    if (loc) {
      reset({
        name: loc.name,
        country: loc.country,
        state: loc.state,
        city: loc.city,
        address: loc.address || "",
        timezone: loc.timezone,
        is_active: loc.is_active,
      });
    } else {
      reset({
        name: "",
        country: "",
        state: "",
        city: "",
        address: "",
        timezone: "Asia/Kolkata",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
  };

  // Process structured form submission to backend database (POST & PUT)
  const onSubmit = async (data: LocationFormInputs) => {
    // Unpack timezone safe string from react-timezone-select structure
    const extractedTimezone =
      typeof data.timezone === "object" && data.timezone !== null
        ? (data.timezone as any).value || String(data.timezone)
        : data.timezone;

    const payload = {
      name: data.name.trim(),
      country: data.country,
      state: data.state,
      city: data.city,
      address: data.address.trim() || null,
      timezone: extractedTimezone,
      is_active: data.is_active,
    };

    try {
      if (editingLocation) {
        // PUT: /admin/location/{id}
        const response = await axiosInstance.put(
          `/admin/location/${editingLocation.id}`,
          payload,
        );
        showToast(
          response.data?.message ||
            "Corporate workspace location updated successfully!",
          "success",
        );
      } else {
        // POST: /admin/location/
        const response = await axiosInstance.post("/admin/location/", payload);
        showToast(
          response.data?.message ||
            "New corporate location registered successfully!",
          "success",
        );
      }
      handleCloseModal();
      fetchLocations();
    } catch (error: any) {
      console.error("Failed to save branch parameters:", error);
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to preserve branch office structural bounds.";
      showToast(errorMessage, "error");
    }
  };

  return (
    <>
      {isLoading && (
        <FullScreenLoader message="Mapping corporate workspaces..." />
      )}

      <Box
        sx={{
          width: "100%",
          px: { xs: 2, md: 4, lg: 5 },
          pb: 4,
          pt: { xs: 10, md: 12 },
        }}
      >
        {/* Page Top Header Bar Layout */}
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
              Office Locations
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Configure physical enterprise branch settings, timezones, and
              regional holiday charts.
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
            Add Location
          </Button>
        </Stack>

        {/* Master Locations Layout Data Grid View */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "rgba(195, 198, 214, 0.5)",
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 600 }}>
              <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                <TableRow>
                  {[
                    "Office Name",
                    "Regional Bounds",
                    "Timezone",
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
                {!isLoading && locations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 6, color: "text.secondary" }}
                    >
                      No corporate facilities registered yet. Click 'Add
                      Location' to configure one.
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((loc) => (
                    <TableRow
                      key={loc.id}
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
                              color: "#003d9b",
                              justifyContent: "center",
                            }}
                          >
                            <FmdGoodOutlined fontSize="small" />
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "text.primary" }}
                            >
                              {loc.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                maxWidth: 220,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {loc.address || "No physical address specified"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell
                        sx={{ color: "text.primary", fontWeight: 500 }}
                      >
                        {loc.city}, {loc.state}, {loc.country}
                      </TableCell>

                      <TableCell
                        sx={{ color: "text.secondary", fontWeight: 600 }}
                      >
                        <Chip
                          label={loc.timezone}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: 1,
                            fontWeight: 600,
                            borderColor: "rgba(195, 198, 214, 0.6)",
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={loc.is_active ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            backgroundColor: loc.is_active
                              ? "rgba(21, 128, 61, 0.1)"
                              : "rgba(115, 118, 133, 0.1)",
                            color: loc.is_active ? "#15803d" : "#737685",
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
                          onClick={() => handleOpenModal(loc)}
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

        {/* ==========================================
          3. DYNAMIC FACILITY OVERLAY MODAL FORM
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
            {editingLocation ? "Edit Office Location" : "Add Office Location"}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontWeight: 400 }}
            >
              Specify localized geo-parameters for your corporate branch
              offices.
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
              <Stack spacing={2.5} sx={{ p: 0.5 }}>
                {/* 1. Office Name (2 to 250 characters validation criteria) */}
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required:
                      "Facility structural designation name is required",
                    minLength: {
                      value: 2,
                      message:
                        "Designation title must be at least 2 characters long",
                    },
                    maxLength: {
                      value: 250,
                      message: "Designation title cannot exceed 250 characters",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      variant="filled"
                      label="Office Location Name *"
                      placeholder="e.g., Indore Office 1"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                    />
                  )}
                />

                {/* 2. Country Dropdown Selection Field */}
                <Controller
                  name="country"
                  control={control}
                  rules={{
                    required: "Target operating country selection is required",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      variant="filled"
                      label="Country *"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setValue("state", ""); // Reset dependent fields downstream instantly
                        setValue("city", "");
                      }}
                    >
                      {countriesList.map((c) => (
                        <MenuItem key={c.isoCode} value={c.name}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* 3. Dependent State Dropdown Selection Field */}
                <Controller
                  name="state"
                  control={control}
                  rules={{
                    required: "Regional corporate state selection is required",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      disabled={!watchCountryName || statesList.length === 0}
                      variant="filled"
                      label="State / Province *"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setValue("city", ""); // Reset city selection instantly downstream
                      }}
                    >
                      {statesList.map((s) => (
                        <MenuItem key={s.isoCode} value={s.name}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* 4. Dependent City Dropdown Selection Field */}
                <Controller
                  name="city"
                  control={control}
                  rules={{
                    required:
                      "Municipal operational city selection is required",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      disabled={!watchStateName || citiesList.length === 0}
                      variant="filled"
                      label="City *"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                    >
                      {citiesList.map((ct) => (
                        <MenuItem key={ct.name} value={ct.name}>
                          {ct.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* 5. Physical Address Text Area (Max 500 criteria) */}
                <Controller
                  name="address"
                  control={control}
                  rules={{
                    maxLength: {
                      value: 500,
                      message:
                        "Physical mailing records cannot exceed 500 characters",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      variant="filled"
                      label="Street Physical Address"
                      placeholder="e.g., 123, Vijay Nagar Indore"
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ input: { sx: inputStyles } }}
                    />
                  )}
                />

                {/* 6. Standard IANA Timezone Picker */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      display: "block",
                      mb: 0.5,
                      fontWeight: 500,
                    }}
                  >
                    Standard Office Timezone *
                  </Typography>
                  <Controller
                    name="timezone"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TimezoneSelect
                        value={value as any} // Cast explicitly to keep react-hook-form value wrapper content isolated
                        onChange={onChange}
                        labelStyle="altName"
                        styles={{
                          control: (base: Record<string, any>) => ({
                            ...base,
                            backgroundColor: "#f3f4f6",
                            border: "none",
                            borderBottom: "1px solid #c3c6d6",
                            borderRadius: "4px 4px 0 0",
                            boxShadow: "none",
                            padding: "4px",
                            "&:hover": { borderBottom: "1px solid #737685" },
                          }),
                        }}
                      />
                    )}
                  />
                </Box>

                {/* 7. Active Toggle Box */}
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
                      Active Location Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Toggle active to allow employee placement assignments at
                      this hub
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
                {editingLocation ? "Save Changes" : "Save Location"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </>
  );
}
