import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Divider,
  Chip,
} from "@mui/material";
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

export default function MyEmploymentDetailsView() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const targetId = id || currentUser?.id;
  const navigate = useNavigate();
  const isOwnProfile = location.pathname.startsWith("/my-profile");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [lookups, setLookups] = useState<any>({
    policies: [],
    shifts: [],
    locations: [],
    managers: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, polRes, shiftRes, locRes, mgrRes] = await Promise.all([
          axiosInstance
            .get(`/user/employment-details/${targetId}`)
            .catch(() => ({ data: null })),
          axiosInstance.get("/admin/leave-policy").catch(() => ({ data: [] })),
          axiosInstance.get("/admin/shift").catch(() => ({ data: [] })),
          axiosInstance.get("/admin/location").catch(() => ({ data: [] })),
          axiosInstance.get("/user/manager-lookup").catch(() => ({ data: [] })),
        ]);
        setData(empRes.data);
        setLookups({
          policies: polRes.data,
          shifts: shiftRes.data,
          locations: locRes.data,
          managers: mgrRes.data,
        });
      } catch (error) {
        showToast("Failed to fetch employment details.", "error");
      } finally {
        setLoading(false);
      }
    };
    if (targetId) fetchData();
  }, [targetId, showToast]);

  const getLookupName = (id: number, list: any[], key = "name") =>
    list.find((item) => item.id === id)?.[key] || "—";
  const getManagerName = (id: number) => {
    const mgr = lookups.managers.find((m: any) => m.id === id);
    return mgr ? `${mgr.first_name} ${mgr.last_name || ""}` : "—";
  };

  const EmptyState = () => (
    <Box sx={{ mt: "64px", px: { xs: 2, md: 4, lg: 5 }, pt: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Employment Details
      </Typography>
      <Card
        variant="outlined"
        sx={{ borderRadius: 3, p: 6, textAlign: "center", mt: 4 }}
      >
        <Typography color="text.secondary">
          Your employment mapping has not been configured yet.
        </Typography>
      </Card>
    </Box>
  );

  return (
    <>
      {loading && <FullScreenLoader message="Loading employment details..." />}
      {!data ? (
        <EmptyState />
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
            Employment Details
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>
            Your official corporate placement and structural organization.
          </Typography>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "rgba(195, 198, 214, 0.5)",
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}
            >
              Corporate Placement
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoField label="Department" value={data.department} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoField label="Designation" value={data.designation} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoField
                  label="Employment Type"
                  value={
                    <Chip
                      label={data.employment_type?.replace("_", " ")}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        borderRadius: 1,
                        backgroundColor: "rgba(0, 61, 155, 0.1)",
                        color: "#003d9b",
                      }}
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoField
                  label="Reporting Manager"
                  value={getManagerName(data.reporting_manager_id)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoField label="Joining Date" value={data.joining_date} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoField
                  label="Probation Period"
                  value={`${data.probation_period_months} Months`}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}
            >
              Operational Rulesets
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoField
                  label="Assigned Leave Policy"
                  value={getLookupName(data.leave_policy_id, lookups.policies)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoField
                  label="Assigned Shift Schedule"
                  value={getLookupName(data.shift_id, lookups.shifts)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoField
                  label="Base Location"
                  value={getLookupName(data.location_id, lookups.locations)}
                />
              </Grid>
            </Grid>
          </Card>
        </Box>
      )}
    </>
  );
}
