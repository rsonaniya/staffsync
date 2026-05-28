import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  VerifiedUserOutlined,
  LockResetOutlined, // New icon for reset mode
  ArrowForward,
} from "@mui/icons-material";
import { axiosInstance } from "../api/axiosInstance";

type SetPasswordInputs = {
  password: string;
  confirmPassword: string;
};

export default function AuthActionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. DETERMINE OPERATION MODE DYNAMICALLY
  const isResetMode = location.pathname === "/reset-password";

  // Dynamic Content Mappings
  const endpoint = isResetMode ? "/user/reset-password" : "/user/set-password";
  const titleText = isResetMode
    ? "Reset Your Password"
    : "Activate Your Account";
  const subtitleText = isResetMode
    ? "Provide a new secure password to regain access to your account."
    : "Set a strong secure password to register on your corporate portal profile.";
  const buttonText = isResetMode ? "Reset Password" : "Activate Account";
  const submittingText = isResetMode
    ? "Resetting Password..."
    : "Activating Profile...";
  const HeaderIcon = isResetMode ? LockResetOutlined : VerifiedUserOutlined;

  // Extract query string parameters safely
  const email = (searchParams.get("email") || "").trim().replace(/ /g, "+");
  const token = searchParams.get("token") || "";

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "success";
  }>({
    open: false,
    message: "",
    severity: "error",
  });

  const { control, handleSubmit, watch } = useForm<SetPasswordInputs>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const passwordValue = watch("password");

  const handleCloseToast = (
    _?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const onSubmit = async (data: SetPasswordInputs) => {
    if (!email || !token) {
      setToast({
        open: true,
        message:
          "Validation Error: Missing processing token or email from the link.",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      email: email.trim(),
      token: token.trim(),
      password: data.password,
    };

    try {
      // Dynamic endpoint target selection
      const response = await axiosInstance.post(endpoint, payload);

      setToast({
        open: true,
        // Automatically utilizing the string sent directly by your backend
        message:
          response.data?.message ||
          `Operation successful! Redirecting to login...`,
        severity: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Authentication action failure:", error);
      setToast({
        open: true,
        message:
          error.response?.data?.detail?.[0]?.msg ||
          error.response?.data?.detail ||
          "Action failed. The verification link may be invalid or expired.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fb",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Subtle Accents */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "40%",
          height: "40%",
          borderRadius: "50%",
          backgroundColor: "rgba(0, 61, 155, 0.05)",
          filter: "blur(120px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          right: "-5%",
          width: "50%",
          height: "50%",
          borderRadius: "50%",
          backgroundColor: "rgba(205, 221, 255, 0.1)",
          filter: "blur(150px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 1.5 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            border: "1px solid rgba(195, 198, 214, 0.5)",
            boxShadow: "0px 8px 24px rgba(0,0,0,0.04)",
          }}
        >
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            {/* Header Section */}
            <Stack sx={{ alignItems: "center", textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  backgroundColor: "#edeef0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                  mb: 2,
                  border: "1px solid rgba(195, 198, 214, 0.3)",
                }}
              >
                <HeaderIcon sx={{ fontSize: 32, color: "#003d9b" }} />
              </Box>
              <Typography
                variant="h5"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                {titleText}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitleText}
              </Typography>

              {email && (
                <Chip
                  label={email}
                  size="small"
                  variant="outlined"
                  sx={{
                    mt: 2,
                    maxWidth: "100%",
                    borderRadius: 1,
                    fontWeight: 500,
                    color: "text.secondary",
                  }}
                />
              )}
            </Stack>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={2}>
                {/* Field 1: New Password */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      color: "text.secondary",
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    New Password
                  </Typography>
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: "Password assignment is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                      maxLength: {
                        value: 14,
                        message: "Password cannot exceed 14 characters",
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        disabled={isSubmitting}
                        variant="outlined"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        error={!!error}
                        helperText={error?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockOutlined sx={{ color: "action.active" }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  disabled={isSubmitting}
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                {/* Field 2: Confirm Password */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      color: "text.secondary",
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    Confirm Password
                  </Typography>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    rules={{
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === passwordValue ||
                        "The passwords you entered do not match",
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        disabled={isSubmitting}
                        variant="outlined"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        error={!!error}
                        helperText={error?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockOutlined sx={{ color: "action.active" }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                  edge="end"
                                  disabled={isSubmitting}
                                >
                                  {showConfirmPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disableElevation
                  disabled={isSubmitting}
                  endIcon={<ArrowForward />}
                  sx={{
                    py: 1.5,
                    backgroundColor: "#003d9b",
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "0.875rem",
                    "&:hover": { backgroundColor: "#0040a2" },
                  }}
                >
                  {isSubmitting ? submittingText : buttonText}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            © 2026 Enterprise Suite.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
