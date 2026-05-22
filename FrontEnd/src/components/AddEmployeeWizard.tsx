import { useState } from "react";
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
    // form submission logic
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
        return <PersonalDetailsStep />;
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
        width: "100%",
        px: { xs: 2, md: 4, lg: 5 },
        pb: 4,
        pt: { xs: 10, md: 12 },
      }}
    >
      <Box sx={{ mb: 4 }}>
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
        sx={{ mb: 5, "& .MuiStepLabel-label": { fontWeight: 600 } }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Form Content */}
      <Box sx={{ minHeight: 400 }}>{renderStepContent(activeStep)}</Box>

      {/* Navigation Footer */}
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "space-between",
          mt: 4,
          pt: 2,
          borderTop: "1px solid rgba(195, 198, 214, 0.5)",
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
          onClick={handleNext}
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
// 3. STEP COMPONENTS
// ==========================================

function PersonalDetailsStep() {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          variant="filled"
          label="First Name"
          slotProps={{ input: { sx: inputStyles } }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          variant="filled"
          label="Last Name"
          slotProps={{ input: { sx: inputStyles } }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          variant="filled"
          label="Email Address"
          slotProps={{ input: { sx: inputStyles } }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          variant="filled"
          label="Phone Number"
          slotProps={{ input: { sx: inputStyles } }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          variant="filled"
          label="Date of Birth"
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
          label="Gender"
          select
          slotProps={{ input: { sx: inputStyles } }}
        >
          <MenuItem value="m">Male</MenuItem>
          <MenuItem value="f">Female</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          variant="filled"
          label="Residential Address"
          multiline
          rows={3}
          slotProps={{ input: { sx: inputStyles } }}
        />
      </Grid>
    </Grid>
  );
}

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
