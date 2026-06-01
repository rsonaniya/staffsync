import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Card,
  CardContent,
  Tooltip,
  Divider,
} from "@mui/material";
import { PhotoCamera, CloudUploadOutlined } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { axiosInstance } from "../../api/axiosInstance";

// A reusable sub-component for displaying read-only data fields cleanly
const InfoField = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box sx={{ mb: 2 }}>
    <Typography
      variant="caption"
      sx={{
        color: "text.secondary",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        fontWeight: 600,
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="body1"
      sx={{ color: "text.primary", fontWeight: 500, mt: 0.5 }}
    >
      {value || "—"}
    </Typography>
  </Box>
);

export default function MyPersonalDetailsView() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user: currentUser, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  const targetId = id || currentUser?.id;
  const navigate = useNavigate();
  const isOwnProfile = location.pathname.startsWith("/my-profile");

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  // Avatar Upload States
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const res = await axiosInstance.get(`/user/${targetId}`);
        setProfileData(res.data);
      } catch (error) {
        showToast("Failed to fetch profile details", "error");
      } finally {
        setLoading(false);
      }
    };
    if (targetId) fetchEmployeeData();
  }, [targetId, showToast]);

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
      setProfileData(response.data);

      setIsAvatarModalOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || "Failed to upload profile picture.",
        "error",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (loading) {
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
        <CircularProgress size={40} sx={{ color: "#003d9b", mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading personal profile...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: "64px", px: { xs: 2, md: 4, lg: 5 }, pt: 4, pb: 4 }}>
      {!isOwnProfile && (
        <Button
          variant="text"
          onClick={() => navigate("/employees")}
          startIcon={<ArrowBack />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: "#434654",
            mb: 2,
            ml: -1,
          }}
        >
          Back to Directory
        </Button>
      )}
      {/* Header Profile Section */}
      <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 3, mb: 4 }}>
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={profileData?.profile_image_url || undefined}
            alt={profileData?.first_name}
            sx={{
              width: 90,
              height: 90,
              fontSize: "2.5rem",
              fontWeight: 700,
              backgroundColor: "#003d9b",
              border: "2px solid #e5e7eb",
            }}
          >
            {profileData?.first_name?.charAt(0).toUpperCase() || "U"}
          </Avatar>
          {isOwnProfile && (
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
          )}
        </Box>
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            {profileData?.first_name} {profileData?.last_name || ""}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mt: 0.5,
              textTransform: "capitalize",
            }}
          >
            {profileData?.role?.replace("_", " ").toLowerCase() || "Employee"}
          </Typography>
        </Box>
      </Stack>

      {/* Details Cards */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "rgba(195, 198, 214, 0.5)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}
              >
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField
                    label="First Name"
                    value={profileData?.first_name}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Last Name" value={profileData?.last_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Gender" value={profileData?.gender} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField
                    label="Date of Birth"
                    value={profileData?.date_of_birth}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}
              >
                Contact Details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <InfoField
                    label="Corporate Email"
                    value={profileData?.email}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <InfoField
                    label="Personal Email"
                    value={profileData?.personal_email}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField
                    label="Contact Number"
                    value={profileData?.phone}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField label="Timezone" value={profileData?.timezone} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "rgba(195, 198, 214, 0.5)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}
              >
                Address Information
              </Typography>
              <InfoField
                label="Current Mailing Address"
                value={profileData?.current_address}
              />
              <InfoField
                label="Permanent Residential Address"
                value={profileData?.residential_address}
              />

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}
              >
                Emergency Contact
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField
                    label="Emergency Contact Name"
                    value={profileData?.emergency_contact_name}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoField
                    label="Relationship"
                    value={profileData?.emergency_contact_relationship}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <InfoField
                    label="Emergency Phone"
                    value={profileData?.emergency_contact_phone}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Avatar Upload Modal */}
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
