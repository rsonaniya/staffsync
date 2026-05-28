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
  Snackbar, // <-- Added for toaster
  Alert, // <-- Added for toaster look
} from "@mui/material";
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  Domain,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { axiosInstance } from "../api/axiosInstance";

type LoginFormInputs = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TOASTER STATE SYSTEM
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

  // React Hook Form implementation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onTouched", // Validates automatically when fields are blurred
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

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
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

      // Trigger a success toast just before redirecting
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
      // Trigger error toaster dynamically based on backend message
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
        autoHideDuration={5000}
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

            {/* Login Form with useForm validations natively attached */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid work email",
                      },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
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

                {/* Password Field */}
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
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    id="password"
                    disabled={isSubmitting}
                    placeholder="Enter your password"
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
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
                      {...register("rememberMe")}
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
                    "&:hover": {
                      backgroundColor: "#0040a2",
                    },
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
    </Box>
  );
}
