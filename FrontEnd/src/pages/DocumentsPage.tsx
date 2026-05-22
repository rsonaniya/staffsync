import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  BadgeOutlined,
  DescriptionOutlined,
  AccountBalanceOutlined,
  SchoolOutlined,
  WorkspacePremiumOutlined,
  DownloadOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

// ==========================================
// 1. DATA MODELS & DUMMY DATA
// ==========================================

interface DocumentRecord {
  id: string;
  title: string;
  subtitle: string;
  status: "Verified" | "Signed" | "Action Required";
  dueDate?: string;
}

const IDENTITY_DOCS: DocumentRecord[] = [
  {
    id: "doc-1",
    title: "Passport Copy",
    subtitle: "Uploaded on Oct 12, 2023",
    status: "Verified",
  },
  {
    id: "doc-2",
    title: "Employment Contract",
    subtitle: "Uploaded on Sep 01, 2023",
    status: "Signed",
  },
];

const FINANCIAL_DOCS: DocumentRecord[] = [
  {
    id: "doc-3",
    title: "W-4 Form 2024",
    subtitle: "Required for upcoming tax year.",
    status: "Action Required",
    dueDate: "Nov 30, 2023",
  },
];

const CERTIFICATIONS = [
  {
    id: "cert-1",
    title: "B.S. Computer Science",
    issuer: "Stanford University",
    icon: <SchoolOutlined fontSize="small" sx={{ color: "text.primary" }} />,
  },
  {
    id: "cert-2",
    title: "AWS Solutions Architect",
    issuer: "Amazon Web Services",
    icon: (
      <WorkspacePremiumOutlined
        fontSize="small"
        sx={{ color: "text.primary" }}
      />
    ),
  },
];

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

const getStatusConfig = (status: string) => {
  switch (status) {
    case "Verified":
    case "Signed":
      return { bg: "#e6f4ea", text: "#137333", border: "#ceead6" };
    case "Action Required":
      return { bg: "#fef7e0", text: "#b06000", border: "#fce8b2" };
    default:
      return { bg: "#f3f4f6", text: "text.secondary", border: "#e1e2e4" };
  }
};

// ==========================================
// 3. MAIN PAGE COMPONENT
// ==========================================

export default function DocumentsPage() {
  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 2, md: 4, lg: 5 },
        pb: 4,
        pt: { xs: 10, md: 12 },
      }}
    >
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
        >
          Documents
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Manage and view your official records and certificates.
        </Typography>
      </Box>

      {/* Main Grid Layout */}
      <Grid container spacing={3}>
        {/* ========================================== */}
        {/* LEFT COLUMN: Identity & Legal              */}
        {/* ========================================== */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Section Header */}
            <Box
              sx={{ borderBottom: "1px solid rgba(195, 198, 214, 0.5)", pb: 1 }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Identity & Legal
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {IDENTITY_DOCS.map((doc, idx) => {
                const statusCfg = getStatusConfig(doc.status);
                const isPassport = doc.title.includes("Passport");

                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={doc.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        borderColor: "rgba(195, 198, 214, 0.5)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "box-shadow 0.2s",
                        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: "24px !important",
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Icon & Badge Row */}
                        <Stack
                          sx={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor: "rgba(0, 82, 204, 0.1)",
                              color: "#0052cc",
                              p: 1,
                              borderRadius: 1,
                              display: "flex",
                            }}
                          >
                            {isPassport ? (
                              <BadgeOutlined />
                            ) : (
                              <DescriptionOutlined />
                            )}
                          </Box>
                          <Chip
                            label={doc.status}
                            size="small"
                            sx={{
                              backgroundColor: statusCfg.bg,
                              color: statusCfg.text,
                              border: `1px solid ${statusCfg.border}`,
                              fontWeight: 500,
                              borderRadius: 4,
                              height: 24,
                              fontSize: "0.75rem",
                            }}
                          />
                        </Stack>

                        {/* Text Content */}
                        <Box sx={{ flexGrow: 1, mb: 3 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: "text.primary",
                              mb: 0.5,
                              lineHeight: 1.2,
                            }}
                          >
                            {doc.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {doc.subtitle}
                          </Typography>
                        </Box>

                        {/* Action Buttons */}
                        <Stack
                          sx={{
                            flexDirection: "row",
                            gap: 1,
                            pt: 2,
                            borderTop: "1px solid rgba(195, 198, 214, 0.5)",
                          }}
                        >
                          <Button
                            variant="outlined"
                            fullWidth
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderColor: "rgba(195, 198, 214, 0.5)",
                              "&:hover": {
                                backgroundColor: "#f3f4f6",
                                borderColor: "rgba(195, 198, 214, 0.5)",
                              },
                            }}
                          >
                            Preview
                          </Button>
                          <Button
                            variant="outlined"
                            sx={{
                              minWidth: 0,
                              px: 2,
                              color: "text.secondary",
                              borderColor: "rgba(195, 198, 214, 0.5)",
                              "&:hover": {
                                backgroundColor: "#f3f4f6",
                                borderColor: "rgba(195, 198, 214, 0.5)",
                              },
                            }}
                          >
                            <DownloadOutlined fontSize="small" />
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Grid>

        {/* ========================================== */}
        {/* RIGHT COLUMN: Tax & Financial              */}
        {/* ========================================== */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Section Header */}
            <Box
              sx={{ borderBottom: "1px solid rgba(195, 198, 214, 0.5)", pb: 1 }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Tax & Financial
              </Typography>
            </Box>

            {FINANCIAL_DOCS.map((doc) => {
              const statusCfg = getStatusConfig(doc.status);

              return (
                <Card
                  key={doc.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: "rgba(195, 198, 214, 0.5)",
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "box-shadow 0.2s",
                    "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
                  }}
                >
                  <CardContent
                    sx={{
                      p: "24px !important",
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Icon & Badge Row */}
                    <Stack
                      sx={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: "#e1e2e4",
                          color: "#434654",
                          p: 1,
                          borderRadius: 1,
                          display: "flex",
                        }}
                      >
                        <AccountBalanceOutlined />
                      </Box>
                      <Chip
                        label={doc.status}
                        size="small"
                        sx={{
                          backgroundColor: statusCfg.bg,
                          color: statusCfg.text,
                          border: `1px solid ${statusCfg.border}`,
                          fontWeight: 500,
                          borderRadius: 4,
                          height: 24,
                          fontSize: "0.75rem",
                        }}
                      />
                    </Stack>

                    {/* Text Content */}
                    <Box sx={{ flexGrow: 1, mb: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          mb: 0.5,
                          lineHeight: 1.2,
                        }}
                      >
                        {doc.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        {doc.subtitle}
                      </Typography>
                      {doc.dueDate && (
                        <Typography
                          variant="caption"
                          sx={{ color: "#ba1a1a", fontWeight: 500 }}
                        >
                          Due: {doc.dueDate}
                        </Typography>
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Stack
                      sx={{
                        flexDirection: "column",
                        gap: 1,
                        pt: 2,
                        borderTop: "1px solid rgba(195, 198, 214, 0.5)",
                      }}
                    >
                      <Button
                        variant="contained"
                        disableElevation
                        fullWidth
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          backgroundColor: "#003d9b",
                          "&:hover": { backgroundColor: "#0052cc" },
                        }}
                      >
                        Complete Form
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          color: "text.secondary",
                          borderColor: "rgba(195, 198, 214, 0.5)",
                          "&:hover": {
                            backgroundColor: "#f3f4f6",
                            borderColor: "rgba(195, 198, 214, 0.5)",
                          },
                        }}
                      >
                        View Previous
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Grid>

        {/* ========================================== */}
        {/* FULL WIDTH ROW: Certifications             */}
        {/* ========================================== */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {/* Section Header */}
            <Stack
              sx={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
                borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
                pb: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Certifications
              </Typography>
              {/* Optional link if they have many certs, safe for read-only view */}
              <Typography
                variant="caption"
                sx={{
                  color: "#003d9b",
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                View All
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              {CERTIFICATIONS.map((cert) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cert.id}>
                  <Box
                    sx={{
                      backgroundColor: "#ffffff",
                      border: "1px solid rgba(195, 198, 214, 0.5)",
                      borderRadius: 2,
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      "&:hover": { backgroundColor: "#f3f4f6" },
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: "#e1e2e4",
                        p: 1,
                        borderRadius: 1,
                        display: "flex",
                      }}
                    >
                      {cert.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {cert.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {cert.issuer}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: "#003d9b" },
                      }}
                    >
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
