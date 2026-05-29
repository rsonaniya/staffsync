import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import type { MouseEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Link,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  Domain,
  ArrowForward,
  MailOutlineOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { axiosInstance } from "../api/axiosInstance";

// ==========================================
// 1. TYPES & SCHEMAS
// ==========================================

type LoginFormInputs = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type ForgotPasswordFormInputs = {
  forgotEmail: string;
};

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#737685" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#003d9b",
    },
  },
};

// ==========================================
// 2. MAIN LOGIN COMPONENT
// ==========================================

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Unified Notification Toast State
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "success";
  }>({
    open: false,
    message: "",
    severity: "error",
  });

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Login Form Registration
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    getValues: getLoginValues,
  } = useForm<LoginFormInputs>({
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "onTouched",
  });

  // Decoupled Forgot Password Form Registration
  const {
    register: forgotRegister,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
    reset: resetForgotForm,
  } = useForm<ForgotPasswordFormInputs>({
    defaultValues: { forgotEmail: "" },
    mode: "onTouched",
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleCloseToast = (
    _?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  // Open Forgot Modal and intelligently pre-fill email if entered on primary login line
  const handleOpenForgotModal = () => {
    const currentEmailValue = getLoginValues("email");
    resetForgotForm({ forgotEmail: currentEmailValue || "" });
    setIsForgotModalOpen(true);
  };

  const handleCloseForgotModal = () => {
    setIsForgotModalOpen(false);
    resetForgotForm();
  };

  // Primary Login Submission Pipeline
  const onLoginSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsSubmitting(true);
    try {
      const params = new URLSearchParams();
      params.append("username", data.email);
      params.append("password", data.password);

      const tokenResponse = await axiosInstance.post("/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token } = tokenResponse.data;

      const profileResponse = await axiosInstance.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setToast({
        open: true,
        message: "Logged in successfully! Redirecting...",
        severity: "success",
      });

      setTimeout(() => {
        login(access_token, profileResponse.data);
      }, 1000);
    } catch (err: any) {
      console.error("Login sequence error:", err);
      setToast({
        open: true,
        message:
          err.response?.data?.detail ||
          "Invalid work email or password. Please try again.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot Password API Endpoint Handler (/user/forgot-password)
  const onForgotSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (
    data,
  ) => {
    setIsForgotSubmitting(true);
    try {
      const response = await axiosInstance.post("/user/forgot-password", {
        email: data.forgotEmail.trim(),
      });

      // Leverages uniform response safely to block user-enumeration hacks
      setToast({
        open: true,
        message:
          response.data?.message ||
          "If you are registered with us, you will receive an email for password reset link",
        severity: "success",
      });

      // Enterprise Grace Period Lifecycle Redirect
      setTimeout(() => {
        handleCloseForgotModal();
      }, 3000);
    } catch (err: any) {
      console.error("Forgot password recovery processing exception:", err);
      const errorDetail = err.response?.data?.detail;
      setToast({
        open: true,
        message: Array.isArray(errorDetail)
          ? errorDetail[0]?.msg
          : errorDetail || "Failed to process password recovery request.",
        severity: "error",
      });
    } finally {
      setIsForgotSubmitting(false);
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
      {/* Background Accents */}
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

      {/* GLOBAL TOASTER COMPONENT */}
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
                <Domain sx={{ fontSize: 32, color: "#003d9b" }} />
              </Box>
              <Typography
                variant="h5"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to the Enterprise Management System.
              </Typography>
            </Stack>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} noValidate>
              <Stack spacing={2}>
                {/* Email Field */}
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
                    Work Email
                  </Typography>
                  <TextField
                    fullWidth
                    id="email"
                    disabled={isSubmitting}
                    placeholder="name@company.com"
                    variant="outlined"
                    type="email"
                    sx={inputStyles}
                    {...loginRegister("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid work email",
                      },
                    })}
                    error={!!loginErrors.email}
                    helperText={loginErrors.email?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined sx={{ color: "action.active" }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                {/* Password Field with Inline Forgot Link Wrapper */}
                <Box>
                  <Stack
                    direction="row"
                    sx={{
                      mb: 0.5,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 500, color: "text.secondary" }}
                    >
                      Password
                    </Typography>
                    <Link
                      component="button"
                      type="button"
                      variant="caption"
                      underline="hover"
                      onClick={handleOpenForgotModal}
                      disabled={isSubmitting}
                      sx={{
                        color: "#003d9b",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </Stack>
                  <TextField
                    fullWidth
                    id="password"
                    disabled={isSubmitting}
                    placeholder="Enter your password"
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    sx={inputStyles}
                    {...loginRegister("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    error={!!loginErrors.password}
                    helperText={loginErrors.password?.message}
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
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
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
                </Box>

                {/* Remember Me */}
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      disabled={isSubmitting}
                      {...loginRegister("rememberMe")}
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      Remember me on this device
                    </Typography>
                  }
                  sx={{ mt: -1 }}
                />

                {/* Submit Button */}
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
                  {isSubmitting ? "Authenticating..." : "Login to Portal"}
                </Button>
              </Stack>
            </form>

            {/* Footer / Contact IT */}
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block" }}
              >
                Having trouble accessing your account?
              </Typography>
              <Link
                href="#"
                variant="caption"
                underline="hover"
                sx={{ color: "#003d9b", fontWeight: 500 }}
              >
                Contact IT Support
              </Link>
            </Box>
          </CardContent>
        </Card>

        {/* Bottom branding mark */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            © 2026 Enterprise Suite.
          </Typography>
        </Box>
      </Container>

      {/* ==========================================
        3. ENTERPRISE FORGOT PASSWORD MODAL OVERLAY
       ========================================== */}
      <Dialog
        open={isForgotModalOpen}
        onClose={handleCloseForgotModal}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Reset Account Password
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, fontWeight: 400 }}
          >
            Enter your verification email to obtain a single-use credential
            recovery string.
          </Typography>
        </DialogTitle>

        <form onSubmit={handleForgotSubmit(onForgotSubmit)} noValidate>
          <DialogContent sx={{ pb: 3, pt: 1 }}>
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
                Work Email Address *
              </Typography>
              <TextField
                fullWidth
                id="forgotEmail"
                disabled={isForgotSubmitting}
                placeholder="name@company.com"
                variant="outlined"
                type="email"
                sx={inputStyles}
                {...forgotRegister("forgotEmail", {
                  required:
                    "Registered workspace email is required to push resets",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid work email",
                  },
                })}
                error={!!forgotErrors.forgotEmail}
                helperText={forgotErrors.forgotEmail?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineOutlined sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              onClick={handleCloseForgotModal}
              disabled={isForgotSubmitting}
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
              disabled={isForgotSubmitting}
              sx={{
                backgroundColor: "#003d9b",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                "&:hover": { backgroundColor: "#0052cc" },
              }}
            >
              {isForgotSubmitting ? "Processing..." : "Send Reset Link"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
