import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import { Box, Typography, Grid, Card, Divider, Button } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { axiosInstance } from "../../api/axiosInstance";
import FullScreenLoader from "../../components/FullScreenLoader";

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

export default function MyPayrollDetailsView() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const targetId = id || currentUser?.id;
  const navigate = useNavigate();
  const isOwnProfile = location.pathname.startsWith("/my-profile");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(
          `/user/payroll-bank-details/${targetId}`,
        );
        setData(res.data);
      } catch (error) {
        // Will throw 404 naturally if not created yet
      } finally {
        setLoading(false);
      }
    };
    if (targetId) fetchData();
  }, [targetId, showToast]);

  const formatCurrency = (val: number, curr = "INR") =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: curr,
    }).format(val);

  const EmpteState = () => (
    <Box sx={{ mt: "64px", px: { xs: 2, md: 4, lg: 5 }, pt: 4 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
      >
        Payroll & Bank Details
      </Typography>
      <Card
        variant="outlined"
        sx={{ borderRadius: 3, p: 6, textAlign: "center", mt: 4 }}
      >
        <Typography color="text.secondary">
          Your payroll and banking profiles have not been configured yet.
        </Typography>
      </Card>
    </Box>
  );

  return (
    <>
      {loading && <FullScreenLoader message="Loading financial records..." />}
      {!data ? (
        <EmpteState />
      ) : (
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
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
          >
            Payroll & Bank Details
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>
            Your official compensation structure and clearing accounts.
          </Typography>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "rgba(195, 198, 214, 0.5)",
              p: 4,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}
            >
              Salary Configuration
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <InfoField
                  label="Annual CTC"
                  value={formatCurrency(data.annual_ctc, data.currency)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <InfoField
                  label="Basic Salary"
                  value={formatCurrency(data.basic_salary, data.currency)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <InfoField
                  label="HRA"
                  value={formatCurrency(data.hra, data.currency)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <InfoField
                  label="Special Allowance"
                  value={formatCurrency(data.special_allowance, data.currency)}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}
            >
              Bank & Statutory Disclosures
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoField label="Bank Name" value={data.bank_name} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoField label="Account Number" value={data.account_number} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoField label="IFSC Code" value={data.ifsc} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoField
                  label="Account Holder Name"
                  value={data.account_holder_name}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoField label="PAN Card Number" value={data.pan_number} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoField
                  label="Aadhaar Card Reference"
                  value={data.aadhaar_number}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoField label="EPFO UAN Number" value={data.uan_number} />
              </Grid>
            </Grid>
          </Card>
        </Box>
      )}
    </>
  );
}
