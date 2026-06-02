import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Divider,
} from "@mui/material";
import {
  PersonAdd,
  Groups,
  GroupAdd,
  WorkOff,
  MoreVert,
  BadgeOutlined,
  PaymentsOutlined,
  FolderOpenOutlined,
  EditOutlined,
  VisibilityOutlined,
  MarkEmailReadOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
// 🚀 IMPORTING THE NEW UNIVERSAL PERMISSION UTILITIES
import {
  checkEditPermission,
  canCreateNewEmployee,
} from "../utils/permissions";
import FullScreenLoader from "../components/FullScreenLoader";

// ==========================================
// 1. STRICT DATA TYPE DEFINITIONS
// ==========================================

export type DocumentCategory =
  | "IDENTITY"
  | "ADDRESS"
  | "EDUCATION"
  | "EMPLOYMENT"
  | "FINANCIAL"
  | "OTHER";
export type SystemRole =
  | "EMPLOYEE"
  | "MANAGER"
  | "HR"
  | "HR_MANAGER"
  | "ADMIN"
  | "";
export type GenderOption = "Male" | "Female" | "Other" | "";

interface EmploymentDetails {
  id: number;
  department: string;
  designation: string;
  employment_type: string;
  joining_date: string;
}

interface PayrollDetails {
  id: number;
  annual_ctc: number;
  bank_name: string;
  account_number: string;
}

interface EmployeeRecord {
  id: number;
  is_email_verified: boolean;
  first_name: string;
  last_name: string;
  email: string;
  personal_email: string;
  phone: string;
  date_of_birth: string;
  gender: GenderOption;
  residential_address: string;
  current_address: string;
  timezone: string;
  profile_image_url: string | null;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  role: SystemRole;
  account_status: string;
  onboarding_step: number;
  employment_details: EmploymentDetails | null;
  payroll_details: PayrollDetails | null;
  documents: any[];
  leave_balances: any[];
}

interface OnboardingStatus {
  label: string;
  color: "warning" | "info" | "secondary" | "success";
}

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

export default function EmployeesDirectoryPage() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  // --- Row Action Menu State ---
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeRecord | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  // ==========================================
  // 🚀 ROLE-BASED ACCESS CONTROL (RBAC) EVALUATION
  // ==========================================

  // Uses the utility to see if the top-right "Add Employee" button should render
  const canGloballyCreate = canCreateNewEmployee(currentUser?.role);

  // Uses the utility to see if the clicked row's 3-dot menu allows editing
  const hasEditPermission = checkEditPermission(
    currentUser?.role,
    selectedEmp?.role,
  );

  // --- Fetch Directory Data ---
  useEffect(() => {
    let isCurrentRequestValid = true;

    const loadDataInitial = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/user");
        if (isCurrentRequestValid) {
          setEmployees(response.data || []);
        }
      } catch (error: any) {
        if (isCurrentRequestValid) {
          showToast(
            error.response?.data?.detail ||
              "Failed to load system employee directory maps.",
            "error",
          );
        }
      } finally {
        if (isCurrentRequestValid) {
          setLoading(false);
        }
      }
    };

    loadDataInitial();

    return () => {
      isCurrentRequestValid = false;
    };
  }, [showToast]);

  // --- Menu Control Handlers ---
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    emp: EmployeeRecord,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmp(emp);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // --- Action Option Trigger Handlers ---
  const handleViewEditPersonal = () => {
    if (!selectedEmp) return;
    handleMenuClose();
    // 🚀 Smart Routing: If they have edit rights, go to edit mode. Otherwise, go to view mode.
    if (hasEditPermission) {
      navigate(`/employees/${selectedEmp.id}/edit`);
    } else {
      navigate(`/employees/${selectedEmp.id}/view/personal`);
    }
  };

  const handleActionEmployment = () => {
    if (!selectedEmp) return;
    handleMenuClose();
    if (hasEditPermission) {
      navigate(`/employees/${selectedEmp.id}/employment`);
    } else {
      navigate(`/employees/${selectedEmp.id}/view/employment`);
    }
  };

  const handleActionPayroll = () => {
    if (!selectedEmp) return;
    handleMenuClose();
    if (hasEditPermission) {
      navigate(`/employees/${selectedEmp.id}/payroll`);
    } else {
      navigate(`/employees/${selectedEmp.id}/view/payroll`);
    }
  };

  const handleActionDocuments = () => {
    if (!selectedEmp) return;
    handleMenuClose();
    if (hasEditPermission) {
      navigate(`/employees/${selectedEmp.id}/documents`);
    } else {
      navigate(`/employees/${selectedEmp.id}/view/documents`);
    }
  };

  const handleResendActivationLink = async () => {
    if (!selectedEmp) return;
    handleMenuClose();

    try {
      const response = await axiosInstance.get(
        `/user/resend-activation-mail/${selectedEmp.id}`,
      );
      showToast(
        response.data?.message ||
          "Account activation email re-sent successfully",
        "success",
      );
    } catch (error: any) {
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : errorDetail || "Failed to resend the activation email.";
      showToast(errorMessage, "error");
    }
  };

  const getOnboardingStatusDetails = (
    step: number,
    isVerified: boolean,
  ): OnboardingStatus => {
    if (step === 1) return { label: "Job Info Pending", color: "warning" };
    if (step === 2) return { label: "Payroll Pending", color: "warning" };
    if (step === 3) return { label: "Documents Pending", color: "info" };
    if (step === 4 && !isVerified)
      return { label: "Activation Pending", color: "secondary" };
    return { label: "Active", color: "success" };
  };

  return (
    <>
      {loading && (
        <FullScreenLoader message="Loading Employees List, please wait..." />
      )}
      <Box
        sx={{
          width: "100%",
          px: { xs: 2, md: 4, lg: 5 },
          pb: 4,
          pt: { xs: 10, md: 12 },
        }}
      >
        {/* Page Header */}
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
              Employee Directory
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Central administrative console for staff profiles and onboarding
              tracking.
            </Typography>
          </Box>

          {/* 🚀 Render Add Employee Button ONLY if HR/Admin */}
          {canGloballyCreate && (
            <Button
              variant="contained"
              disableElevation
              startIcon={<PersonAdd />}
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
              onClick={() => navigate("/employees/new")}
            >
              Add Employee
            </Button>
          )}
        </Stack>

        {/* Metrics Grid Cards Summary Section */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              sx={{ borderRadius: 3, borderColor: "rgba(195, 198, 214, 0.5)" }}
            >
              <CardContent
                sx={{
                  p: "24px !important",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "rgba(0, 82, 204, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0052cc",
                  }}
                >
                  <Groups />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "text.disabled",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Registered Staff
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "text.primary", mt: 0.5 }}
                  >
                    {employees.length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              sx={{ borderRadius: 3, borderColor: "rgba(195, 198, 214, 0.5)" }}
            >
              <CardContent
                sx={{
                  p: "24px !important",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f59e0b",
                  }}
                >
                  <GroupAdd />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "text.disabled",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Onboarding Pipelines
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "text.primary", mt: 0.5 }}
                  >
                    {employees.filter((e) => e.onboarding_step < 4).length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              sx={{ borderRadius: 3, borderColor: "rgba(195, 198, 214, 0.5)" }}
            >
              <CardContent
                sx={{
                  p: "24px !important",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "rgba(21, 128, 61, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#15803d",
                  }}
                >
                  <WorkOff />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "text.disabled",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Fully Integrated
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "text.primary", mt: 0.5 }}
                  >
                    {
                      employees.filter(
                        (e) => e.onboarding_step === 4 && e.is_email_verified,
                      ).length
                    }
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Command Center Table */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "rgba(195, 198, 214, 0.5)",
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                <TableRow>
                  {[
                    "Employee Profile",
                    "System Role",
                    "Corporate Dept",
                    "Onboarding Status",
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
                        py: 2,
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      sx={{
                        textAlign: "center",
                        py: 6,
                        color: "text.secondary",
                      }}
                    >
                      No active company staff records found in system clusters.
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((emp) => {
                    const status = getOnboardingStatusDetails(
                      emp.onboarding_step,
                      emp.is_email_verified,
                    );
                    return (
                      <TableRow
                        key={emp.id}
                        sx={{
                          "&:hover": { backgroundColor: "#F0F7FF" },
                          transition: "background-color 0.2s",
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
                            <Avatar
                              src={emp.profile_image_url || undefined}
                              alt={emp.first_name}
                              sx={{
                                width: 40,
                                height: 40,
                                border: "1px solid rgba(195, 198, 214, 0.5)",
                                backgroundColor: "#003d9b",
                                fontSize: "1rem",
                              }}
                            >
                              {emp.first_name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "text.primary" }}
                              >
                                {emp.first_name} {emp.last_name || ""}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "text.disabled" }}
                              >
                                {emp.email}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "text.secondary",
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        >
                          {emp.role.replace("_", " ").toLowerCase()}
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary" }}>
                          {emp.employment_details?.department || (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.disabled",
                                fontStyle: "italic",
                              }}
                            >
                              Not Mapped Yet
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={status.label}
                            size="small"
                            color={status.color}
                            variant={
                              status.color === "success" ? "filled" : "outlined"
                            }
                            sx={{
                              fontWeight: 700,
                              px: 0.5,
                              height: 24,
                              fontSize: "0.725rem",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, emp)}
                            sx={{
                              color: "text.secondary",
                              "&:hover": {
                                backgroundColor: "#e1e2e4",
                                color: "text.primary",
                              },
                            }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* --- DYNAMIC 3-DOT ROW CONTEXT ACTION MENU --- */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          slotProps={{
            paper: {
              sx: {
                minWidth: 220,
                borderRadius: 2,
                boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid rgba(195,198,214,0.3)",
              },
            },
          }}
        >
          <MenuItem
            onClick={handleViewEditPersonal}
            sx={{ gap: 1.5, fontSize: "0.875rem", py: 1 }}
          >
            {hasEditPermission ? (
              <EditOutlined fontSize="small" sx={{ color: "#003d9b" }} />
            ) : (
              <VisibilityOutlined
                fontSize="small"
                sx={{ color: "text.secondary" }}
              />
            )}
            {hasEditPermission
              ? "View/Edit Personal Details"
              : "View Personal Details"}
          </MenuItem>

          <MenuItem
            disabled={!selectedEmp || selectedEmp.onboarding_step < 1}
            onClick={handleActionEmployment}
            sx={{ gap: 1.5, fontSize: "0.875rem", py: 1 }}
          >
            <BadgeOutlined
              fontSize="small"
              sx={{
                color:
                  selectedEmp && selectedEmp.onboarding_step >= 1
                    ? hasEditPermission
                      ? "#003d9b"
                      : "text.secondary"
                    : "inherit",
              }}
            />
            {selectedEmp && selectedEmp.onboarding_step > 1
              ? hasEditPermission
                ? "View/Edit Employment"
                : "View Employment"
              : hasEditPermission
                ? "Add Employment Details"
                : "View Employment"}
          </MenuItem>

          <MenuItem
            disabled={!selectedEmp || selectedEmp.onboarding_step < 2}
            onClick={handleActionPayroll}
            sx={{ gap: 1.5, fontSize: "0.875rem", py: 1 }}
          >
            <PaymentsOutlined
              fontSize="small"
              sx={{
                color:
                  selectedEmp && selectedEmp.onboarding_step >= 2
                    ? hasEditPermission
                      ? "#003d9b"
                      : "text.secondary"
                    : "inherit",
              }}
            />
            {selectedEmp && selectedEmp.onboarding_step > 2
              ? hasEditPermission
                ? "View/Edit Payroll"
                : "View Payroll"
              : hasEditPermission
                ? "Add Payroll & Bank"
                : "View Payroll"}
          </MenuItem>

          <MenuItem
            disabled={!selectedEmp || selectedEmp.onboarding_step < 3}
            onClick={handleActionDocuments}
            sx={{ gap: 1.5, fontSize: "0.875rem", py: 1 }}
          >
            <FolderOpenOutlined
              fontSize="small"
              sx={{
                color:
                  selectedEmp && selectedEmp.onboarding_step >= 3
                    ? hasEditPermission
                      ? "#003d9b"
                      : "text.secondary"
                    : "inherit",
              }}
            />
            {hasEditPermission
              ? "Manage Documents Vault"
              : "View Documents Vault"}
          </MenuItem>

          {/* ONLY render Resend Activation if they have Admin/HR Edit powers */}
          {selectedEmp &&
            selectedEmp.onboarding_step === 4 &&
            !selectedEmp.is_email_verified &&
            hasEditPermission && (
              <Box>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                  onClick={handleResendActivationLink}
                  sx={{
                    gap: 1.5,
                    fontSize: "0.875rem",
                    color: "secondary.main",
                    fontWeight: 600,
                    py: 1,
                  }}
                >
                  <MarkEmailReadOutlined fontSize="small" />
                  Resend Activation Link
                </MenuItem>
              </Box>
            )}
        </Menu>
      </Box>
    </>
  );
}
