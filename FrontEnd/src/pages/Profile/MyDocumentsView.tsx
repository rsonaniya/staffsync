import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider,
  Grid,
  Button,
} from "@mui/material";
import {
  DescriptionOutlined,
  ImageOutlined,
  PictureAsPdfOutlined,
  BadgeOutlined,
  LocationOnOutlined,
  SchoolOutlined,
  WorkspacePremiumOutlined,
  AccountBalanceOutlined,
  VisibilityOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateRightOutlined,
  RestartAltOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { axiosInstance } from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const getFileIcon = (fileName: string) => {
  const lowered = fileName.toLowerCase();
  if (lowered.endsWith(".pdf"))
    return <PictureAsPdfOutlined sx={{ color: "#ba1a1a" }} />;
  if (
    lowered.endsWith(".jpg") ||
    lowered.endsWith(".jpeg") ||
    lowered.endsWith(".png") ||
    lowered.endsWith(".webp")
  )
    return <ImageOutlined sx={{ color: "#003d9b" }} />;
  return <DescriptionOutlined sx={{ color: "#737685" }} />;
};

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

export default function MyDocumentsView() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const targetId = id || currentUser?.id;

  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<any[]>([]);

  const [previewModal, setPreviewModal] = useState({
    open: false,
    url: "",
    title: "",
  });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await axiosInstance.get(`/user/documents/${targetId}`);
        setDocs(res.data || []);
      } catch (error) {
        setDocs([]);
      } finally {
        setLoading(false);
      }
    };
    if (targetId) fetchDocs();
  }, [targetId]);

  useEffect(() => {
    if (!previewModal.open) {
      setZoom(1);
      setRotation(0);
    }
  }, [previewModal.open, previewModal.url]);

  const groupedDocs = useMemo(() => {
    return docs.reduce((acc: any, doc: any) => {
      const groupKey = (doc.category || "OTHER").toUpperCase();
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(doc);
      return acc;
    }, {});
  }, [docs]);

  const handleDownload = async (
    e: React.MouseEvent,
    docUrl: string,
    docName: string,
  ) => {
    e.stopPropagation();
    try {
      const response = await fetch(docUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = docName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(docUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 64px)",
        }}
      >
        <CircularProgress size={40} sx={{ color: "#003d9b", mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Fetching user document vault...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: "64px", px: { xs: 2, md: 4, lg: 5 }, pt: 4, pb: 4 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
      >
        My Documents
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>
        Review and download your verified identity credentials and professional
        career records.
      </Typography>

      {docs.length === 0 ? (
        <Card
          variant="outlined"
          sx={{ borderRadius: 3, p: 6, textAlign: "center" }}
        >
          <Typography color="text.secondary">
            No verified documents have been uploaded to your profile yet.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={4}>
          {(Object.keys(groupedDocs) as string[]).map((categoryKey) => {
            const group = groupedDocs[categoryKey];
            const config = getCategoryConfig(categoryKey);

            return (
              <Box
                key={categoryKey}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Stack
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(195, 198, 214, 0.4)",
                    pb: 1.5,
                    gap: 1.5,
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
                    label={`${group.length} File${group.length > 1 ? "s" : ""}`}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(0, 61, 155, 0.05)",
                      color: "#003d9b",
                      fontWeight: 700,
                      borderRadius: 1,
                    }}
                  />
                </Stack>

                <Grid container spacing={2.5}>
                  {group.map((doc: any) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id}>
                      <Card
                        variant="outlined"
                        onClick={() =>
                          setPreviewModal({
                            open: true,
                            url: doc.file_url,
                            title: doc.display_name,
                          })
                        }
                        sx={{
                          borderRadius: 2,
                          borderColor: "rgba(195, 198, 214, 0.5)",
                          cursor: "pointer",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                            borderColor: "#003d9b",
                          },
                        }}
                      >
                        <CardContent
                          sx={{
                            p: "20px !important",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                          }}
                        >
                          <Stack
                            sx={{
                              flexDirection: "row",
                              alignItems: "center",
                              minWidth: 0,
                              gap: 2,
                            }}
                          >
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
                          <Stack
                            sx={{
                              flexDirection: "row",
                              flexShrink: 0,
                              gap: 0.5,
                            }}
                          >
                            <Tooltip title="Preview">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewModal({
                                    open: true,
                                    url: doc.file_url,
                                    title: doc.display_name,
                                  });
                                }}
                                sx={{
                                  color: "text.secondary",
                                  "&:hover": { color: "#003d9b" },
                                }}
                              >
                                <VisibilityOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton
                                size="small"
                                onClick={(e) =>
                                  handleDownload(e, doc.file_url, doc.file_name)
                                }
                                sx={{
                                  color: "text.secondary",
                                  "&:hover": { color: "#15803d" },
                                }}
                              >
                                <DownloadOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
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

      {/* Lightbox Modal */}
      <Dialog
        open={previewModal.open}
        onClose={() => setPreviewModal({ ...previewModal, open: false })}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 0,
              height: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            borderBottom: "1px solid rgba(195, 198, 214, 0.4)",
            py: 1.5,
            px: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#ffffff",
          }}
        >
          <Typography sx={{ fontWeight: 700, textTransform: "capitalize" }}>
            {previewModal.title.toLowerCase()}
          </Typography>
          {!previewModal.url.toLowerCase().endsWith(".pdf") && (
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f3f4f6",
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                gap: 1,
              }}
            >
              <Tooltip title="Zoom In">
                <IconButton
                  size="small"
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                >
                  <ZoomInOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom Out">
                <IconButton
                  size="small"
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                >
                  <ZoomOutOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Rotate 90°">
                <IconButton
                  size="small"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                >
                  <RotateRightOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 0.5, my: 0.75 }}
              />
              <Tooltip title="Reset View">
                <IconButton
                  size="small"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                  }}
                >
                  <RestartAltOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
          <IconButton
            onClick={() => setPreviewModal({ ...previewModal, open: false })}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseOutlined fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            flexGrow: 1,
            backgroundColor: "#e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "auto",
            position: "relative",
          }}
        >
          {previewModal.url &&
            (previewModal.url.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={`${previewModal.url}#toolbar=1&view=FitH`}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="PDF Preview Window"
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                }}
              >
                <Box
                  component="img"
                  src={previewModal.url}
                  alt="Document Preview"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    userSelect: "none",
                    pointerEvents: "none",
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </Box>
            ))}
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            borderTop: "1px solid rgba(195, 198, 214, 0.4)",
            gap: 1,
            backgroundColor: "#ffffff",
          }}
        >
          <Button
            onClick={() => setPreviewModal({ ...previewModal, open: false })}
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
            onClick={(e) =>
              handleDownload(e, previewModal.url, previewModal.title)
            }
            sx={{
              backgroundColor: "#003d9b",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Download Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
