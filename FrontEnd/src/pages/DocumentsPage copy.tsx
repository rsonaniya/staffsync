import React, { useState, useMemo } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import {
  BadgeOutlined,
  SchoolOutlined,
  DescriptionOutlined,
  DownloadOutlined,
  VisibilityOutlined,
  ImageOutlined,
  PictureAsPdfOutlined,
  LocationOnOutlined,
  AccountBalanceOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export type DocumentCategory =
  | "IDENTITY"
  | "ADDRESS"
  | "EDUCATION"
  | "EMPLOYMENT"
  | "FINANCIAL"
  | "OTHER";

interface BackendDocument {
  category: string;
  display_name: string;
  file_name: string;
  file_url: string;
  file_public_id: string;
}

// ==========================================
// 2. HELPER UTILITIES
// ==========================================

// Parse file extension to return a relevant theme icon
const getFileIcon = (fileName: string) => {
  const lowercaseName = fileName.toLowerCase();
  if (lowercaseName.endsWith(".pdf")) {
    return <PictureAsPdfOutlined sx={{ color: "#ba1a1a" }} />;
  }
  if (
    lowercaseName.endsWith(".jpg") ||
    lowercaseName.endsWith(".jpeg") ||
    lowercaseName.endsWith(".png") ||
    lowercaseName.endsWith(".webp")
  ) {
    return <ImageOutlined sx={{ color: "#003d9b" }} />;
  }
  return <DescriptionOutlined sx={{ color: "#737685" }} />;
};

// Returns descriptive headers and group icons based on Pydantic enum categories
const getCategoryConfig = (category: string) => {
  switch (category.toUpperCase()) {
    case "IDENTITY":
      return {
        title: "Identity Verification",
        icon: <BadgeOutlined sx={{ fontSize: 20, color: "#003d9b" }} />,
      };
    case "ADDRESS":
      return {
        title: "Address & Residency Proof",
        icon: <LocationOnOutlined sx={{ fontSize: 20, color: "#003d9b" }} />,
      };
    case "EDUCATION":
      return {
        title: "Academic Certifications",
        icon: <SchoolOutlined sx={{ fontSize: 20, color: "#003d9b" }} />,
      };
    case "EMPLOYMENT":
      return {
        title: "Work History & Contracts",
        icon: (
          <WorkspacePremiumOutlined sx={{ fontSize: 20, color: "#003d9b" }} />
        ),
      };
    case "FINANCIAL":
      return {
        title: "Tax & Banking Documentation",
        icon: (
          <AccountBalanceOutlined sx={{ fontSize: 20, color: "#003d9b" }} />
        ),
      };
    default:
      return {
        title: "Supplemental Records",
        icon: <DescriptionOutlined sx={{ fontSize: 20, color: "#737685" }} />,
      };
  }
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export default function DocumentsPage() {
  const { user } = useAuth();

  // Preview overlay tracker states
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    url: string;
    title: string;
  }>({
    open: false,
    url: "",
    title: "",
  });

  // Extract documents array safely from user context
  const documentsList = useMemo(() => {
    return (user as any)?.documents || [];
  }, [user]);

  // Dynamically group documents with strict TypeScript key structuring
  const groupedDocuments = useMemo(() => {
    return documentsList.reduce(
      (acc: Record<string, BackendDocument[]>, doc: BackendDocument) => {
        const groupKey = (doc.category || "OTHER").toUpperCase();
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(doc);
        return acc;
      },
      {} as Record<string, BackendDocument[]>,
    );
  }, [documentsList]);

  const handleOpenPreview = (doc: BackendDocument) => {
    setPreviewModal({
      open: true,
      url: doc.file_url,
      title: doc.display_name,
    });
  };

  const handleClosePreview = () => {
    setPreviewModal((prev) => ({ ...prev, open: false }));
  };

  // Programmatic download utility that works across Cloudinary origins
  const handleDownloadFile = async (
    e: React.MouseEvent,
    doc: BackendDocument,
  ) => {
    e.stopPropagation();
    try {
      const response = await fetch(doc.file_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = doc.file_name;
      document.body.appendChild(anchor);
      anchor.click();

      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download file directly:", error);
      // Fallback action: pop URL into an isolated frame if CORS prevents programmatic blob loading
      window.open(doc.file_url, "_blank");
    }
  };

  const isPdfPreview = previewModal.url.toLowerCase().endsWith(".pdf");

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
          My Documents
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Review and download verified identity credentials and professional
          career records.
        </Typography>
      </Box>

      {/* Primary Container Grid Mapping Engine */}
      {Object.keys(groupedDocuments).length === 0 ? (
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "rgba(195, 198, 214, 0.5)",
            p: 6,
            textAlign: "center",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No onboarding employee documentation modules mapped to your profile
            record yet.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={4}>
          {(Object.keys(groupedDocuments) as string[]).map((categoryKey) => {
            const docs = groupedDocuments[categoryKey] || [];
            const config = getCategoryConfig(categoryKey);

            return (
              <Box
                key={categoryKey}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                {/* Dynamic Category Section Sub-Header */}
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: "center",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.4)",
                    pb: 1.5,
                  }}
                >
                  {config.icon}
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    {config.title}
                  </Typography>
                  <Chip
                    label={`${docs.length} File${docs.length > 1 ? "s" : ""}`}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(0, 61, 155, 0.05)",
                      color: "#003d9b",
                      fontWeight: 700,
                      borderRadius: 1,
                    }}
                  />
                </Stack>

                {/* Sub-Grid Item Box Cards Loop */}
                <Grid container spacing={2.5}>
                  {docs.map((doc: BackendDocument) => (
                    <Grid
                      size={{ xs: 12, sm: 6, md: 4 }}
                      key={doc.file_public_id}
                    >
                      <Card
                        variant="outlined"
                        onClick={() => handleOpenPreview(doc)}
                        sx={{
                          borderRadius: 2,
                          borderColor: "rgba(195, 198, 214, 0.5)",
                          backgroundColor: "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                            borderColor: "#003d9b",
                          },
                        }}
                      >
                        <CardContent sx={{ p: "20px !important" }}>
                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              sx={{ alignItems: "center", minWidth: 0 }}
                            >
                              {/* Left Thumbnail Style File Icon Block */}
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 1.5,
                                  backgroundColor: "#f3f4f6",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {getFileIcon(doc.file_name)}
                              </Box>

                              {/* Label Text Details Block */}
                              <Box sx={{ minWidth: 0 }}>
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
                                  {doc.display_name}
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
                                  {doc.file_name}
                                </Typography>
                              </Box>
                            </Stack>

                            {/* Inline Operational Actions */}
                            <Stack
                              direction="row"
                              spacing={0.5}
                              sx={{ flexShrink: 0 }}
                            >
                              <Tooltip title="Preview Content">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPreview(doc);
                                  }}
                                  sx={{
                                    color: "text.secondary",
                                    "&:hover": {
                                      color: "#003d9b",
                                      backgroundColor: "rgba(0, 61, 155, 0.05)",
                                    },
                                  }}
                                >
                                  <VisibilityOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download File">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleDownloadFile(e, doc)}
                                  sx={{
                                    color: "text.secondary",
                                    "&:hover": {
                                      color: "#15803d",
                                      backgroundColor:
                                        "rgba(21, 128, 61, 0.05)",
                                    },
                                  }}
                                >
                                  <DownloadOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })}
        </Stack>
      )}

      {/* ==========================================
        4. DYNAMIC PREVIEW OVERLAY LIGHTBOX COMPONENT
       ========================================== */}
      <Dialog
        open={previewModal.open}
        onClose={handleClosePreview}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 0, height: "80vh", overflow: "hidden" },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            borderBottom: "1px solid rgba(195, 198, 214, 0.4)",
            py: 2,
            px: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {previewModal.title}
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            height: "100%",
            backgroundColor: "#e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {previewModal.url ? (
            isPdfPreview ? (
              <iframe
                src={`${previewModal.url}#toolbar=0`}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="PDF Preview Window"
              />
            ) : (
              <Box
                component="img"
                src={previewModal.url}
                alt="Document View"
                sx={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  p: 2,
                }}
              />
            )
          ) : null}
        </DialogContent>
        <DialogActions
          sx={{ p: 2, borderTop: "1px solid rgba(195, 198, 214, 0.4)", gap: 1 }}
        >
          <Button
            onClick={handleClosePreview}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: "rgba(195, 198, 214, 0.8)",
              color: "text.secondary",
            }}
          >
            Close Preview
          </Button>
          <Button
            variant="contained"
            disableElevation
            startIcon={<DownloadOutlined />}
            onClick={(e) => {
              const mockDoc = {
                file_url: previewModal.url,
                file_name: previewModal.title,
              } as BackendDocument;
              handleDownloadFile(e, mockDoc);
            }}
            sx={{
              backgroundColor: "#003d9b",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#0052cc" },
            }}
          >
            Download Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
