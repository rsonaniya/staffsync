import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
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
} from "@mui/material";
import {
  ArrowBack,
  CloudUploadOutlined,
  DeleteOutlined,
  AddCircleOutlined,
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
  WarningAmberRounded,
  CheckCircleOutlined, // 🚀 Added for Complete Onboarding Button
  FolderOpenOutlined, // 🚀 Added for Empty State
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
// 🚀 IMPORT NEW RBAC UTILITY
import { checkEditPermission, type SystemRole } from "../utils/permissions";
import FullScreenLoader from "../components/FullScreenLoader";

// ==========================================
// 1. TYPES & CONSTANTS
// ==========================================

export type DocumentCategory =
  | "IDENTITY"
  | "ADDRESS"
  | "EDUCATION"
  | "EMPLOYMENT"
  | "FINANCIAL"
  | "OTHER";

export interface UserDocumentResponse {
  id: number;
  user_id: number;
  category: string;
  display_name: string;
  file_name: string;
  file_url: string;
  file_public_id: string;
  uploaded_at: string;
}

interface DocumentRowItem {
  localId: string;
  category: DocumentCategory | "";
  display_name: string;
  file: File | null;
}

const inputStyles = {
  backgroundColor: "#f3f4f6",
  borderRadius: "4px 4px 0 0",
  "&:before": { borderBottom: "1px solid #c3c6d6" },
  "&:hover:not(.Mui-disabled):before": { borderBottom: "1px solid #737685" },
  "&:after": { borderBottom: "2px solid #003d9b" },
};

const getFileIcon = (fileName: string) => {
  const lowered = fileName.toLowerCase();
  if (lowered.endsWith(".pdf"))
    return <PictureAsPdfOutlined sx={{ color: "#ba1a1a" }} />;
  if (
    lowered.endsWith(".jpg") ||
    lowered.endsWith(".jpeg") ||
    lowered.endsWith(".png") ||
    lowered.endsWith(".webp")
  ) {
    return <ImageOutlined sx={{ color: "#003d9b" }} />;
  }
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

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

export default function EmployeeDocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const targetId = id || currentUser?.id;
  const isOwnProfile = !id;

  // 🚀 RBAC: We use our utility to determine if they can edit this specific user
  const [fetchedTargetRole, setFetchedTargetRole] = useState<SystemRole | null>(
    null,
  );
  const canEdit = checkEditPermission(
    currentUser?.role,
    fetchedTargetRole || undefined,
  );

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [existingDocs, setExistingDocs] = useState<UserDocumentResponse[]>([]);
  const [stagedDocs, setStagedDocs] = useState<DocumentRowItem[]>([]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [modalData, setModalData] = useState<DocumentRowItem>({
    localId: "",
    category: "",
    display_name: "",
    file: null,
  });

  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    url: string;
    title: string;
  }>({ open: false, url: "", title: "" });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const fetchExistingDocs = async () => {
    try {
      const res = await axiosInstance.get(`/user/documents/${targetId}`);
      setExistingDocs(res.data || []);
    } catch (error) {
      console.log("No existing documents found or failed to fetch.");
      setExistingDocs([]);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (!targetId) return;

    const initializePage = async () => {
      try {
        if (!isOwnProfile) {
          // Fetch target role for security matrix
          const userRes = await axiosInstance.get(`/user/${targetId}`);
          const targetRole = userRes.data.role;
          setFetchedTargetRole(targetRole);

          if (!checkEditPermission(currentUser?.role, targetRole)) {
            showToast(
              "You do not have administrative clearance to edit this profile.",
              "error",
            );
            navigate(`/employees/${targetId}/view/documents`, {
              replace: true,
            });
            return;
          }
        } else {
          setFetchedTargetRole(currentUser?.role || null);
        }

        await fetchExistingDocs();
      } catch (error) {
        showToast("Failed to initialize documents vault.", "error");
        if (!isOwnProfile) navigate("/employees");
      }
    };

    initializePage();
  }, [targetId, isOwnProfile, currentUser?.role, navigate, showToast]);
  useEffect(() => {
    if (!previewModal.open) {
      setZoom(1);
      setRotation(0);
    }
  }, [previewModal.open, previewModal.url]);

  const groupedDocuments = useMemo(() => {
    return existingDocs.reduce(
      (acc: Record<string, UserDocumentResponse[]>, doc) => {
        const groupKey = (doc.category || "OTHER").toUpperCase();
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(doc);
        return acc;
      },
      {},
    );
  }, [existingDocs]);

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    const tempId = deleteTargetId; // Capture ID before resetting state
    setDeleteTargetId(null);
    try {
      await axiosInstance.delete(`/user/documents/${tempId}`);
      showToast("Document deleted successfully.", "success");
      fetchExistingDocs();
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || "Failed to delete document.",
        "error",
      );
    }
  };

  const handleModalSubmit = () => {
    if (!modalData.category || !modalData.display_name || !modalData.file) {
      showToast(
        "Please complete all fields and attach a file before adding.",
        "error",
      );
      return;
    }
    setStagedDocs((prev) => [...prev, modalData]);
    setIsUploadModalOpen(false);
  };

  const handleUploadStagedDocs = async () => {
    if (stagedDocs.length === 0) return;
    setIsUploading(true);
    const multipartFormData = new FormData();
    stagedDocs.forEach((row) => {
      if (row.file) {
        multipartFormData.append("files", row.file);
        multipartFormData.append("categories", row.category);
        multipartFormData.append("display_names", row.display_name.trim());
      }
    });

    try {
      await axiosInstance.post(
        `/user/documents/${targetId}`,
        multipartFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      showToast("Documents uploaded successfully!", "success");
      setStagedDocs([]);

      // 🚀 REDIRECT TO DIRECTORY AFTER SUCCESSFUL UPLOAD (ONBOARDING COMPLETE)
      if (!isOwnProfile) {
        navigate("/employees");
      } else {
        fetchExistingDocs(); // Only refresh if the employee is updating their own profile
      }
    } catch (error: any) {
      const msg = Array.isArray(error.response?.data?.detail)
        ? error.response.data.detail[0]?.msg
        : error.response?.data?.detail || "Failed to upload documents.";
      showToast(msg, "error");
    } finally {
      setIsUploading(false);
    }
  };
  const handleDownloadFile = async (
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

  if (initialLoading)
    return <FullScreenLoader message="Fetching user document vault..." />;

  // 🚀 Final Failsafe
  if (
    !isOwnProfile &&
    !checkEditPermission(currentUser?.role, fetchedTargetRole || undefined)
  )
    return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        marginTop: "64px",
        height: "calc(100vh - 64px)",
        width: "100%",
        px: { xs: 2, md: 4, lg: 5 },
        pt: 4,
      }}
    >
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
          >
            {isOwnProfile ? "My Documents" : "Employee Documents Vault"}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {isOwnProfile
              ? "Review and download your verified identity credentials and professional career records."
              : "Review existing files and attach new verified identity and compliance credentials."}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ flex: 1, overflowY: "auto", px: 0.5, pb: 4 }}>
        {/* EXISTING DOCUMENTS SECTION */}
        {existingDocs.length > 0 ? (
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
            >
              {isOwnProfile ? "Verified Records" : "Uploaded Server Documents"}
            </Typography>

            <Stack spacing={4}>
              {(Object.keys(groupedDocuments) as string[]).map(
                (categoryKey) => {
                  const docs = groupedDocuments[categoryKey] || [];
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

                      <Grid container spacing={2.5}>
                        {docs.map((doc) => (
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
                                backgroundColor: "#ffffff",
                                cursor: "pointer",
                                "&:hover": {
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                                  borderColor: "#003d9b",
                                },
                              }}
                            >
                              <CardContent sx={{ p: "20px !important" }}>
                                <Stack
                                  sx={{
                                    flexDirection: "row",
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
                                          "&:hover": {
                                            color: "#003d9b",
                                            backgroundColor:
                                              "rgba(0, 61, 155, 0.05)",
                                          },
                                        }}
                                      >
                                        <VisibilityOutlined fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Download">
                                      <IconButton
                                        size="small"
                                        onClick={(e) =>
                                          handleDownloadFile(
                                            e,
                                            doc.file_url,
                                            doc.file_name,
                                          )
                                        }
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
                                    {canEdit && (
                                      <Tooltip title="Delete Permanently">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteTargetId(doc.id);
                                          }}
                                          sx={{
                                            color: "text.secondary",
                                            "&:hover": {
                                              color: "#dc2626",
                                              backgroundColor:
                                                "rgba(220, 38, 38, 0.05)",
                                            },
                                          }}
                                        >
                                          <DeleteOutlined fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Stack>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  );
                },
              )}
            </Stack>
            {canEdit && <Divider sx={{ mt: 4 }} />}
          </Box>
        ) : (
          /* 🚀 NEW: Contextual Empty State for Creation Mode */
          <Box sx={{ mb: 4 }}>
            {canEdit && !isOwnProfile ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                  px: 3,
                  backgroundColor: "#ffffff",
                  borderRadius: 3,
                  border: "2px dashed rgba(195, 198, 214, 0.8)",
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    backgroundColor: "rgba(0, 61, 155, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    color: "#003d9b",
                  }}
                >
                  <FolderOpenOutlined fontSize="large" />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}
                >
                  Pending Document Verification
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "text.secondary", maxWidth: 500, mb: 3 }}
                >
                  No documents have been uploaded yet. The system requires at
                  least one verified identity or employment record to dispatch
                  the account activation email.
                </Typography>
              </Box>
            ) : (
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderColor: "rgba(195, 198, 214, 0.5)",
                  p: 6,
                  textAlign: "center",
                  mb: 4,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  {isOwnProfile
                    ? "No verified documents have been uploaded to your profile yet."
                    : "No verified documents have been uploaded to this profile yet."}
                </Typography>
              </Card>
            )}
          </Box>
        )}

        {/* STAGE NEW DOCUMENTS (ONLY VISIBLE TO HR/ADMINS) */}
        {canEdit && (
          <>
            <Stack
              sx={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Stage New Documents
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddCircleOutlined />}
                onClick={() => {
                  setModalData({
                    localId: crypto.randomUUID(),
                    category: "",
                    display_name: "",
                    file: null,
                  });
                  setIsUploadModalOpen(true);
                }}
                disabled={isUploading}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#003d9b",
                  borderColor: "rgba(0, 61, 155, 0.4)",
                  "&:hover": {
                    borderColor: "#003d9b",
                    backgroundColor: "rgba(0, 61, 155, 0.05)",
                  },
                }}
              >
                Stage Document
              </Button>
            </Stack>

            {stagedDocs.length === 0 ? (
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderStyle: "dashed",
                  borderColor: "rgba(195, 198, 214, 0.8)",
                  p: 5,
                  textAlign: "center",
                  backgroundColor: "transparent",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No new documents staged for upload. Click "Stage Document" to
                  attach files.
                </Typography>
              </Card>
            ) : (
              <Stack spacing={2}>
                {stagedDocs.map((row) => (
                  <Card
                    key={row.localId}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      borderColor: "rgba(195, 198, 214, 0.5)",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <CardContent
                      sx={{
                        p: "16px !important",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {row.file ? (
                          getFileIcon(row.file.name)
                        ) : (
                          <DescriptionOutlined />
                        )}
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "text.primary" }}
                          >
                            {row.display_name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {row.category} • {row.file?.name}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        color="error"
                        disabled={isUploading}
                        onClick={() =>
                          setStagedDocs((prev) =>
                            prev.filter((r) => r.localId !== row.localId),
                          )
                        }
                        sx={{
                          border: "1px solid rgba(220, 38, 38, 0.2)",
                          "&:hover": {
                            backgroundColor: "rgba(220, 38, 38, 0.05)",
                          },
                        }}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* 🚀 DYNAMIC STICKY FOOTER */}
      {/* 
          Logic: 
          - Always shows the "Complete Onboarding" button for admins on other profiles.
          - Only shows upload button if there are staged docs.
      */}
      {(!isOwnProfile || stagedDocs.length > 0) && (
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            mt: "auto",
            pt: 2,
            pb: 3,
            borderTop: "1px solid rgba(195, 198, 214, 0.5)",
            backgroundColor: "#f8f9fb",
            position: "sticky",
            bottom: 0,
            zIndex: 10,
          }}
        >
          <Box>
            {!isOwnProfile && (
              <Button
                variant="outlined"
                onClick={() => navigate("/employees")}
                disabled={isUploading}
                startIcon={<ArrowBack />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  color: "#434654",
                  borderColor: "rgba(195, 198, 214, 0.8)",
                }}
              >
                Back to Directory
              </Button>
            )}
          </Box>

          <Stack direction="row" spacing={2}>
            {canEdit && stagedDocs.length > 0 && (
              <Button
                variant="contained"
                onClick={handleUploadStagedDocs}
                disableElevation
                disabled={isUploading}
                startIcon={<CloudUploadOutlined />}
                sx={{
                  backgroundColor: "#003d9b",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                  borderRadius: 2,
                  "&:hover": { backgroundColor: "#0052cc" },
                }}
              >
                {isUploading ? "Uploading Batch..." : "Upload Staged Documents"}
              </Button>
            )}

            {/* 🚀 NEW: Complete Onboarding Button with Validation */}
            {!isOwnProfile && canEdit && stagedDocs.length === 0 && (
              <Tooltip
                title={
                  existingDocs.length === 0
                    ? "Upload at least one document to proceed"
                    : "Finish onboarding sequence"
                }
              >
                <span>
                  <Button
                    variant="contained"
                    disableElevation
                    disabled={existingDocs.length === 0}
                    onClick={() => navigate("/employees")}
                    startIcon={<CheckCircleOutlined />}
                    sx={{
                      backgroundColor: "#15803d",
                      textTransform: "none",
                      fontWeight: 600,
                      px: 4,
                      borderRadius: 2,
                      "&:hover": { backgroundColor: "#166534" },
                      "&.Mui-disabled": {
                        backgroundColor: "rgba(21, 128, 61, 0.4)",
                        color: "#ffffff",
                      },
                    }}
                  >
                    Complete Onboarding
                  </Button>
                </span>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      )}

      {/* UPLOAD MODAL & PREVIEW MODALS REMAIN EXACTLY THE SAME */}
      <Dialog
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            borderBottom: "1px solid rgba(195, 198, 214, 0.4)",
            pb: 2,
          }}
        >
          Stage Document Attachment
        </DialogTitle>
        <DialogContent sx={{ pt: "24px !important" }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                variant="filled"
                label="Document Category *"
                value={modalData.category}
                onChange={(e) =>
                  setModalData({
                    ...modalData,
                    category: e.target.value as DocumentCategory,
                  })
                }
                slotProps={{ input: { sx: inputStyles } }}
              >
                <MenuItem value="IDENTITY">Identity Verification</MenuItem>
                <MenuItem value="ADDRESS">Address & Residency Proof</MenuItem>
                <MenuItem value="EDUCATION">Academic Certifications</MenuItem>
                <MenuItem value="EMPLOYMENT">Work History & Contracts</MenuItem>
                <MenuItem value="FINANCIAL">Tax & Banking Records</MenuItem>
                <MenuItem value="OTHER">Other Supplemental Records</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                component="label"
                variant="contained"
                disableElevation
                fullWidth
                startIcon={<CloudUploadOutlined />}
                sx={{
                  height: 56,
                  backgroundColor: modalData.file ? "#f0fdf4" : "#f3f4f6",
                  color: modalData.file ? "#166534" : "text.secondary",
                  border: modalData.file
                    ? "1px solid #bbf7d0"
                    : "1px solid rgba(195, 198, 214, 0.4)",
                  textTransform: "none",
                  fontWeight: 600,
                  justifyContent: "flex-start",
                  px: 2,
                  "&:hover": {
                    backgroundColor: modalData.file ? "#e0f2fe" : "#e5e7eb",
                  },
                }}
              >
                <Box
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  {modalData.file ? getFileIcon(modalData.file.name) : null}
                  {modalData.file
                    ? modalData.file.name
                    : "Choose File Attachment *"}
                </Box>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp, application/pdf"
                  hidden
                  onChange={(e) => {
                    const fileObj = e.target.files?.[0] || null;
                    if (fileObj) {
                      const acceptedTypes = [
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                        "application/pdf",
                      ];
                      if (!acceptedTypes.includes(fileObj.type)) {
                        showToast("Invalid format.", "error");
                        e.target.value = "";
                        return;
                      }
                      if (fileObj.size < 102400 || fileObj.size > 5242880) {
                        showToast(
                          "Size must be between 100KB and 5MB.",
                          "error",
                        );
                        e.target.value = "";
                        return;
                      }
                      const cleanLabel =
                        fileObj.name.substring(
                          0,
                          fileObj.name.lastIndexOf("."),
                        ) || fileObj.name;
                      setModalData((prev) => ({
                        ...prev,
                        file: fileObj,
                        display_name: prev.display_name || cleanLabel,
                      }));
                    }
                  }}
                />
              </Button>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                variant="filled"
                label="UI Display Label *"
                placeholder="e.g., Degree Certificate"
                value={modalData.display_name}
                onChange={(e) =>
                  setModalData({ ...modalData, display_name: e.target.value })
                }
                slotProps={{ input: { sx: inputStyles } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={() => setIsUploadModalOpen(false)}
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleModalSubmit}
            variant="contained"
            disableElevation
            sx={{
              backgroundColor: "#003d9b",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { backgroundColor: "#0052cc" },
            }}
          >
            Add to Batch
          </Button>
        </DialogActions>
      </Dialog>

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
              handleDownloadFile(e, previewModal.url, previewModal.title)
            }
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

      <Dialog
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "flex-start" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "rgba(186, 26, 26, 0.1)",
              color: "#ba1a1a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <WarningAmberRounded />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}
            >
              Delete Document?
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.5 }}
            >
              Are you sure you want to permanently remove this document? This
              action cannot be undone and the file will be lost from the vault.
            </Typography>
          </Box>
        </Box>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setDeleteTargetId(null)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            disableElevation
            sx={{
              backgroundColor: "#ba1a1a",
              color: "#ffffff",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": { backgroundColor: "#93000a" },
            }}
          >
            Delete Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
