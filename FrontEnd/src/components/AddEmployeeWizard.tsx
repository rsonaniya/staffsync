import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import {
  CloudUploadOutlined,
  ArrowForward,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PersonalDetailsStep from "./PersonalDetailsStep";

// ==========================================
// 1. TYPES & STYLES
// ==========================================

const steps = ["Personal Details", "Employment", "Payroll & Bank", "Documents"];

const inputStyles = {
  backgroundColor: "#f3f4f6",
  borderRadius: "4px 4px 0 0",
  "&:before": { borderBottom: "1px solid #c3c6d6" },
  "&:hover:not(.Mui-disabled):before": { borderBottom: "1px solid #737685" },
  "&:after": { borderBottom: "2px solid #003d9b" },
};

// ==========================================
// 2. MAIN WIZARD COMPONENT
// ==========================================

export default function AddEmployeeWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const handleAddNewEmployee = () => {
    // Final form submission logic
    navigate("/employees");
  };

  const handleNext = () => {
    activeStep === steps.length - 1
      ? handleAddNewEmployee()
      : setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <PersonalDetailsStep
            onStepSubmit={(data: any) => {
              console.log("Validated Step 1 Data:", data);
              // Move to the next step ONLY after successful validation
              setActiveStep(1);
            }}
          />
        );
      case 1:
        return <EmploymentDetailsStep />;
      case 2:
        return <PayrollBankStep />;
      case 3:
        return <DocumentsStep />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        // PERFECT LAYOUT FIX: Push down by TopNav height, subtract it from 100vh
        marginTop: "64px",
        height: "calc(100vh - 64px)",
        width: "100%",
        px: { xs: 2, md: 4, lg: 5 },
        pt: 4, // Inner padding to give the title breathing room
      }}
    >
      <Box sx={{ mb: 4, flexShrink: 0 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
        >
          Add New Employee
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Enter the details to provision a new team member.
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper
        activeStep={activeStep}
        sx={{
          mb: 4,
          flexShrink: 0,
          "& .MuiStepLabel-label": { fontWeight: 600 },
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Scrollable Form Content Area */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 0.5, pb: 4 }}>
        {renderStepContent(activeStep)}
      </Box>

      {/* Sticky Navigation Footer */}
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "space-between",
          mt: "auto", // Forces the footer to the absolute bottom of the flex container
          pt: 2,
          pb: 3, // Slightly larger bottom padding so buttons aren't riding the exact pixel edge
          borderTop: "1px solid rgba(195, 198, 214, 0.5)",
          backgroundColor: "#f8f9fb",
          position: "sticky",
          bottom: 0,
          zIndex: 10,
        }}
      >
        <Button
          variant="text"
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<ArrowBack />}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          disableElevation
          type={activeStep === 0 ? "submit" : "button"}
          form={activeStep === 0 ? "personal-details-form" : undefined}
          onClick={activeStep === 0 ? undefined : handleNext}
          endIcon={activeStep === steps.length - 1 ? null : <ArrowForward />}
          sx={{
            backgroundColor: "#003d9b",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            "&:hover": { backgroundColor: "#0052cc" },
          }}
        >
          {activeStep === steps.length - 1 ? "Submit Employee" : "Next Step"}
        </Button>
      </Stack>
    </Box>
  );
}

// ==========================================
// 3. STEP COMPONENTS (Grid Errors Fixed!)
// ==========================================

function EmploymentDetailsStep() {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          variant="filled"
          label="Department"
          select
          slotProps={{ input: { sx: inputStyles } }}
        >
          <MenuItem value="eng">Engineering</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          variant="filled"
          label="Designation"
          slotProps={{ input: { sx: inputStyles } }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          variant="filled"
          label="Employment Type"
          select
          slotProps={{ input: { sx: inputStyles } }}
        >
          <MenuItem value="full">Full-time</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          variant="filled"
          label="Reporting Manager"
          slotProps={{ input: { sx: inputStyles } }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          variant="filled"
          label="Joining Date"
          type="date"
          slotProps={{
            input: { sx: inputStyles },
            inputLabel: { shrink: true },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          variant="filled"
          label="Probation Period (Months)"
          slotProps={{ input: { sx: inputStyles } }}
        />
      </Grid>
    </Grid>
  );
}

function PayrollBankStep() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Salary Configuration
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            variant="filled"
            label="Annual CTC"
            slotProps={{ input: { sx: inputStyles } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            variant="filled"
            label="Basic Salary"
            slotProps={{ input: { sx: inputStyles } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            variant="filled"
            label="HRA"
            slotProps={{ input: { sx: inputStyles } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            variant="filled"
            label="Special Allowance"
            slotProps={{ input: { sx: inputStyles } }}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Bank & Statutory
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            variant="filled"
            label="Bank Name"
            slotProps={{ input: { sx: inputStyles } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            variant="filled"
            label="Account Number"
            slotProps={{ input: { sx: inputStyles } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            variant="filled"
            label="IFSC Code"
            slotProps={{ input: { sx: inputStyles } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            variant="filled"
            label="PAN Number"
            slotProps={{ input: { sx: inputStyles } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            variant="filled"
            label="UAN Number"
            slotProps={{ input: { sx: inputStyles } }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function DocumentsStep() {
  return (
    <Grid container spacing={3}>
      {[
        "Profile Picture",
        "Aadhaar Card",
        "PAN Card",
        "Resume / CV",
        "Certificates",
      ].map((doc) => (
        <Grid size={{ xs: 12, sm: 6 }} key={doc}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderStyle: "dashed",
              borderColor: "rgba(195, 198, 214, 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CloudUploadOutlined
              sx={{ fontSize: 32, color: "text.secondary" }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {doc}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
