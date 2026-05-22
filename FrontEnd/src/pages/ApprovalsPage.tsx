import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Search,
  CheckCircleOutlined,
  HighlightOff,
  MoreVert,
  FilterList,
} from "@mui/icons-material";

// ==========================================
// 1. DUMMY DATA
// ==========================================

const PENDING_REQUESTS = [
  {
    id: "REQ-8821",
    employee: "Alice Wong",
    type: "Annual Leave",
    date: "Oct 20 - Oct 22",
    status: "Pending",
  },
  {
    id: "REQ-8822",
    employee: "Bob Smith",
    type: "Regularization",
    date: "Oct 15",
    status: "Pending",
  },
  {
    id: "REQ-8823",
    employee: "Charlie Day",
    type: "Sick Leave",
    date: "Oct 18",
    status: "Pending",
  },
];

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

export default function ApprovalsPage() {
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
          Approvals
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Review and process incoming requests from the organization.
        </Typography>
      </Box>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: "rgba(195, 198, 214, 0.5)",
          overflow: "hidden",
        }}
      >
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid rgba(195, 198, 214, 0.5)",
          }}
        >
          <TextField
            placeholder="Search requests..."
            size="small"
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f3f4f6",
                borderRadius: 2,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              borderColor: "rgba(195, 198, 214, 0.5)",
            }}
          >
            Filter
          </Button>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
              <TableRow>
                {[
                  "Request ID",
                  "Employee",
                  "Type",
                  "Date Range",
                  "Status",
                  "Actions",
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "text.disabled",
                      textTransform: "uppercase",
                      py: 2,
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {PENDING_REQUESTS.map((req) => (
                <TableRow
                  key={req.id}
                  sx={{ "&:hover": { backgroundColor: "#F0F7FF" } }}
                >
                  <TableCell sx={{ fontWeight: 600, color: "#003d9b" }}>
                    {req.id}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{req.employee}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {req.type}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {req.date}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={req.status}
                      size="small"
                      sx={{
                        backgroundColor: "#fff8e1",
                        color: "#854e0e",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ flexDirection: "row", gap: 1 }}>
                      <IconButton
                        size="small"
                        sx={{
                          color: "#15803d",
                          "&:hover": { backgroundColor: "#dcfce7" },
                        }}
                      >
                        <CheckCircleOutlined />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          color: "#ba1a1a",
                          "&:hover": { backgroundColor: "#fee2e2" },
                        }}
                      >
                        <HighlightOff />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
