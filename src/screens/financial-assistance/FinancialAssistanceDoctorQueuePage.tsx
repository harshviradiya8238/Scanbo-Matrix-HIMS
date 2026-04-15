"use client";

import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Chip,
  Grid,
  alpha,
  Avatar,
  Paper,
  Badge,
  TextField,
  MenuItem,
  Select,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HelpOutline as HelpIcon,
  Visibility as ViewIcon,
  HourglassEmpty as HourglassIcon,
  LocalHospital as HospitalIcon,
  MedicalServices as MedicalIcon,
  ForwardToInbox as ForwardIcon,
  FolderOpen as FolderIcon,
  AccountTree as FlowIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  ReceiptLong as BillIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

import { StatTile } from "@/src/ui/components/molecules";
import PageTemplate from "@/src/ui/components/PageTemplate";

// ── DESIGN TOKENS ───────────────────────────────────────────────────
const COLORS = {
  bg: "#F0F4F8",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  accent: "#1172BA",
  accentDark: "#0284C7",
  accentMuted: "#E0F2FE",
  pending: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  accepted: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  recommended: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  rejected: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
};

// ── HELPERS ─────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const statusMeta = (status: string) => {
  switch (status) {
    case "Awaiting Review":
    case "Pending":
      return COLORS.pending;
    case "Recommended":
    case "Accepted":
      return COLORS.recommended;
    case "Rejected":
      return COLORS.rejected;
    default:
      return { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" };
  }
};

// ─── Mock Data ────────────────────────────────────────────────────────
const DOCTOR_REQUESTS = [
  {
    id: "FAR-009",
    patientName: "Rahul Sharma",
    patientId: "P-20241101",
    department: "Oncology",
    submittedDate: "15 Mar 2025",
    priority: "High Priority",
    billAmount: 85000,
    requestedAmount: 60000,
    scheme: "Ayushman Bharat",
    diagnosis: "Stage 3 Carcinoma",
    status: "Awaiting Review",
    type: "Govt. Scheme",
    admissionType: "IPD",
    treatingDoctor: "Dr. Arjun Mehta",
    documents: [
      { name: "aadhar_rahul.pdf", type: "pdf" },
      { name: "ayushman_card.jpg", type: "image" },
      { name: "income_cert.pdf", type: "pdf" },
      { name: "income_cert.pdf", type: "pdf" },
      { name: "income_cert.pdf", type: "pdf" }, { name: "income_cert.pdf", type: "pdf" },
    ],
    doctorNote:
      "Patient is a genuine case. Stage 3 diagnosis confirmed. Family is financially distressed. I strongly recommend approval of the PM-JAY scheme assistance.",
  },
  {
    id: "FAR-007",
    patientName: "Sunita Patel",
    patientId: "P-20241088",
    department: "Oncology",
    submittedDate: "12 Mar 2025",
    billAmount: 120000,
    requestedAmount: 80000,
    diagnosis: "Breast Cancer",
    income: "Below ₹15k/month",
    status: "Awaiting Review",
    type: "Charity",
    admissionType: "IPD",
    treatingDoctor: "Dr. Arjun Mehta",
    documents: [
      { name: "income_statement.pdf", type: "pdf" },
      { name: "ration_card.jpg", type: "image" },
    ],
    doctorNote:
      "Patient requires urgent chemotherapy. Financial assistance recommended for treatment cycles.",
  },
  {
    id: "FAR-005",
    patientName: "Mahesh Yadav",
    patientId: "P-20241075",
    department: "Oncology",
    reviewedDate: "10 Mar 2025",
    billAmount: 45000,
    requestedAmount: 30000,
    status: "Recommended",
    type: "NGO",
    admissionType: "OPD",
    treatingDoctor: "Dr. Arjun Mehta",
    documents: [{ name: "ngo_recommedation.pdf", type: "pdf" }],
    doctorNote: "Patient follows up regularly. Support recommended.",
  },
];

// ─── Main Page ────────────────────────────────────────────────────────
export default function FinancialAssistanceDoctorQueuePage() {
  const [requests, setRequests] = React.useState<any[]>(DOCTOR_REQUESTS);
  const [selectedId, setSelectedId] = React.useState<string>(
    requests[0]?.id || "",
  );
  const [activeFilter, setActiveFilter] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      activeFilter === "All" ||
      (activeFilter === "Pending" && r.status === "Awaiting Review") ||
      (activeFilter === "Accepted" && r.status === "Recommended") ||
      (activeFilter === "Rejected" && r.status === "Rejected");
    return matchesSearch && matchesStatus;
  });

  const selectedReq = requests.find((r) => r.id === selectedId) || requests[0];

  // Stats calculation
  const totalCount = requests.length;
  const pendingCount = requests.filter(
    (r) => r.status === "Awaiting Review",
  ).length;
  const recommendedCount = requests.filter(
    (r) => r.status === "Recommended",
  ).length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  const handleRecommend = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Recommended" } : r)),
    );
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)),
    );
  };

  // ── Internal Components ──────────────────────────────────────────

  const RequestListItem = ({ req, active }: { req: any; active: boolean }) => {
    const sm = statusMeta(req.status);

    return (
      <Box
        onClick={() => setSelectedId(req.id)}
        sx={{
          p: 1.5,
          borderRadius: 3.5,
          cursor: "pointer",
          border: `1.5px solid ${active ? COLORS.accent : COLORS.border}`,
          bgcolor: active ? alpha(COLORS.accent, 0.05) : "transparent",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          mb: 1,
          "&:hover": {
            bgcolor: active ? alpha(COLORS.accent, 0.08) : "#F8FAFC",
            borderColor: active ? COLORS.accent : COLORS.borderStrong,
          },
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" spacing={1.2} alignItems="flex-start">
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: active ? COLORS.accent : alpha(COLORS.accent, 0.1),
                color: active ? "#fff" : COLORS.accent,
                fontSize: 14,
                fontWeight: 800,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              {initials(req.patientName)}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: COLORS.textPrimary,
                      fontFamily: "'Sora', sans-serif",
                      lineHeight: 1.2,
                    }}
                  >
                    {req.patientName}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: COLORS.textSecondary,
                      fontFamily: "monospace",
                    }}
                  >
                    MRN-{req.patientId.split("-")[1]}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 1,
                    py: 0.2,
                    borderRadius: 1.2,
                    bgcolor: sm.bg,
                    border: `1px solid ${sm.border}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 8,
                      fontWeight: 900,
                      color: sm.text,
                      letterSpacing: 0.5,
                    }}
                  >
                    {req.status === "Awaiting Review"
                      ? "PENDING"
                      : req.status.toUpperCase()}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon sx={{ fontSize: 15, color: COLORS.textMuted }} />
            <Typography sx={{ fontSize: 11, color: COLORS.textSecondary }}>
              <Box component="span" sx={{ fontWeight: 800 }}>
                {req.treatingDoctor}
              </Box>
              {" · "}
              {req.submittedDate || "2023-10-25 11:00 AM"}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            {[req.type, req.admissionType].map((tag, idx) => (
              <Box
                key={idx}
                sx={{
                  px: 1.2,
                  py: 0.3,
                  borderRadius: 1.2,
                  bgcolor: "#F1F5F9", // Subtle grey background
                  border: `1px solid ${COLORS.border}`, // Thin border
                }}
              >
                <Typography
                  sx={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: COLORS.textSecondary,
                  }}
                >
                  {tag}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>
    );
  };

  return (
    <PageTemplate title="Financial Assistance" fullHeight>
      <Box
        sx={{
          display: "flex",
          height: "100%",
          overflow: "hidden",
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 340, // Slightly narrower sidebar
            display: "flex",
            flexDirection: "column",
            borderRadius: 4,
            border: `1px solid ${COLORS.border}`,
            bgcolor: "#fff",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2.5, pb: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2.5 }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: COLORS.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BillIcon sx={{ color: "#fff", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: COLORS.textPrimary,
                      fontFamily: "'Sora', sans-serif",
                      lineHeight: 1.2,
                    }}
                  >
                    Financial Requests
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.textSecondary,
                    }}
                  >
                    Oncology Department
                  </Typography>
                </Box>
              </Stack>
              <Badge badgeContent={2} color="warning">
                <IconButton
                  sx={{
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: 3,
                    p: 1,
                  }}
                >
                  <FilterIcon
                    sx={{ fontSize: 20, color: COLORS.textSecondary }}
                  />
                </IconButton>
              </Badge>
            </Stack>

            <TextField
              fullWidth
              size="small"
              placeholder="Search patient or MRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ fontSize: 20, color: COLORS.textMuted }}
                    />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3, bgcolor: "#F8FAFC" },
              }}
              sx={{ mb: 2 }}
            />

            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
              {["All", "Pending", "Accepted", "Rejected"].map((f) => (
                <Button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  sx={{
                    flex: 1,
                    py: 0.8,
                    borderRadius: 2,
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "none",
                    border: `1.5px solid ${activeFilter === f ? COLORS.accent : COLORS.border}`,
                    bgcolor:
                      activeFilter === f
                        ? alpha(COLORS.accent, 0.05)
                        : "transparent",
                    color:
                      activeFilter === f ? COLORS.accent : COLORS.textSecondary,
                    "&:hover": {
                      bgcolor: alpha(COLORS.accent, 0.08),
                    },
                  }}
                >
                  {f}
                </Button>
              ))}
            </Stack>

            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 900,
                color: COLORS.textMuted,
                letterSpacing: 1,
                mb: 1.5,
              }}
            >
              FILTER BY DEPARTMENT AND DATE
            </Typography>

            <Stack spacing={1.5} sx={{ mb: 2.5 }}>
              <Select
                fullWidth
                size="small"
                defaultValue="all"
                sx={{ borderRadius: 3, bgcolor: "#F8FAFC" }}
              >
                <MenuItem value="all">All Departments</MenuItem>
                <MenuItem value="onc">Oncology</MenuItem>
                <MenuItem value="card">Cardiology</MenuItem>
              </Select>
              <Select
                fullWidth
                size="small"
                defaultValue="all"
                sx={{ borderRadius: 3, bgcolor: "#F8FAFC" }}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
              </Select>
            </Stack>

            <Divider sx={{ mx: -2.5, mb: 1.5 }} />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.textSecondary,
                }}
              >
                {filteredRequests.length} results
              </Typography>
              <Button
                size="small"
                sx={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: COLORS.textSecondary,
                  textTransform: "none",
                }}
                endIcon={<FlowIcon sx={{ fontSize: 14 }} />}
              >
                Newest
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              px: 2.5,
              pb: 3,
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: COLORS.border,
                borderRadius: 10,
              },
            }}
          >
            {filteredRequests.map((req) => (
              <RequestListItem
                key={req.id}
                req={req}
                active={selectedId === req.id}
              />
            ))}
          </Box>
        </Box>

        <Stack
          spacing={1}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Grid container spacing={1}>
            {[
              {
                label: "TOTAL REQUESTS",
                value: totalCount,
                tone: "primary" as const,
                icon: <FolderIcon sx={{ fontSize: 24 }} />,
              },
              {
                label: "PENDING REVIEW",
                value: pendingCount,
                tone: "warning" as const,
                icon: <HourglassIcon sx={{ fontSize: 24 }} />,
              },
              {
                label: "RECOMMENDED",
                value: recommendedCount,
                tone: "success" as const,
                icon: <CheckCircleIcon sx={{ fontSize: 24 }} />,
              },
              {
                label: "REJECTED CASES",
                value: rejectedCount,
                tone: "error" as const,
                icon: <CancelIcon sx={{ fontSize: 24 }} />,
              },
            ].map((s) => (
              <Grid item xs={3} key={s.label}>
                <StatTile
                  label={s.label}
                  value={s.value === 0 ? "0" : s.value.toString()}
                  tone={s.tone}
                  icon={s.icon}
                  variant="soft"
                // sx={{ bgcolor: "#fff" }}
                />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ flex: 1, display: "flex", gap: 1, minHeight: 0 }}>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                bgcolor: "#fff",
                borderRadius: 4,
                border: `1px solid ${COLORS.border}`,
                overflow: "hidden",
              }}
            >
              {selectedReq ? (
                <>
                  {/* Fixed Header & Info & Search Area */}
                  <Box sx={{ p: 2, pb: 0 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 1.5 }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              sx={{
                                width: 44,
                                height: 44,
                                bgcolor: COLORS.accent,
                                fontSize: 16,
                                fontWeight: 800,
                                fontFamily: "'Sora', sans-serif",
                                border: "3px solid #fff",
                                boxShadow: "0 6px 12px -3px rgba(17, 114, 186, 0.25)",
                              }}
                            >
                              {initials(selectedReq.patientName)}
                            </Avatar>
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 18,
                                  fontWeight: 800,
                                  color: COLORS.textPrimary,
                                  fontFamily: "'Sora', sans-serif",
                                  mb: 0.2,
                                }}
                              >
                                {selectedReq.patientName}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: COLORS.textSecondary,
                                }}
                              >
                                MRN-{selectedReq.patientId.split("-")[1]} ·{" "}
                                {selectedReq.documents?.length} documents
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                px: 1.2,
                                py: 0.5,
                                borderRadius: 1.5,
                                bgcolor: statusMeta(selectedReq.status).bg,
                                border: `1.5px solid ${statusMeta(selectedReq.status).border}`,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 10,
                                  fontWeight: 900,
                                  color: statusMeta(selectedReq.status).text,
                                  letterSpacing: 0.5,
                                }}
                              >
                                {selectedReq.status.toUpperCase()}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1.5,
                                bgcolor: "#F8FAFC",
                                border: `1px solid ${COLORS.border}`,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  color: COLORS.textSecondary,
                                  fontFamily: "monospace",
                                }}
                              >
                                {selectedReq.id}
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                        <Divider sx={{ mx: -2, my: 1.5 }} />

                        <Grid container>
                          <Grid item xs={6} sx={{ pr: 2, borderRight: `1px solid ${COLORS.border}` }}>
                            <Typography
                              sx={{
                                fontSize: 10,
                                fontWeight: 900,
                                color: COLORS.textMuted,
                                letterSpacing: 1,
                                mb: 1.5,
                                textTransform: "uppercase",
                              }}
                            >
                              Assistance Info
                            </Typography>
                            <Stack spacing={1}>
                              {[
                                {
                                  icon: <BillIcon sx={{ fontSize: 16 }} />,
                                  label: "Request ID",
                                  val: selectedReq.id,
                                  color: COLORS.textPrimary,
                                },
                                {
                                  icon: <HourglassIcon sx={{ fontSize: 16 }} />,
                                  label: "Received",
                                  val:
                                    selectedReq.submittedDate ||
                                    "2023-10-25 11:00 AM",
                                },
                                {
                                  icon: <FolderIcon sx={{ fontSize: 16 }} />,
                                  label: "Total Docs",
                                  val: `${selectedReq.documents?.length} uploaded`,
                                },
                              ].map((item, idx) => (
                                <Stack
                                  key={idx}
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                  >
                                    <Box
                                      sx={{
                                        color: COLORS.textMuted,
                                        display: "flex",
                                      }}
                                    >
                                      {item.icon}
                                    </Box>
                                    <Typography
                                      sx={{
                                        fontSize: 13,
                                        color: COLORS.textSecondary,
                                        fontWeight: 600,
                                      }}
                                    >
                                      {item.label}
                                    </Typography>
                                  </Stack>
                                  <Typography
                                    sx={{
                                      fontSize: 13,
                                      fontWeight: 800,
                                      color: item.color || COLORS.textPrimary,
                                    }}
                                  >
                                    {item.val}
                                  </Typography>
                                </Stack>
                              ))}
                            </Stack>
                          </Grid>
                          <Grid item xs={6} sx={{ pl: 2 }}>
                            <Typography
                              sx={{
                                fontSize: 10,
                                fontWeight: 900,
                                color: COLORS.textMuted,
                                letterSpacing: 1,
                                mb: 1.5,
                                textTransform: "uppercase",
                              }}
                            >
                              Clinical & Dept
                            </Typography>
                            <Stack spacing={1}>
                              {[
                                {
                                  icon: <PersonIcon sx={{ fontSize: 16 }} />,
                                  label: "Doctor",
                                  val: selectedReq.treatingDoctor,
                                },
                                {
                                  icon: <HospitalIcon sx={{ fontSize: 16 }} />,
                                  label: "Department",
                                  val: selectedReq.department,
                                },
                                {
                                  icon: <MedicalIcon sx={{ fontSize: 16 }} />,
                                  label: "Admission",
                                  val: selectedReq.admissionType,
                                },
                              ].map((item, idx) => (
                                <Stack
                                  key={idx}
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                  >
                                    <Box
                                      sx={{
                                        color: COLORS.textMuted,
                                        display: "flex",
                                      }}
                                    >
                                      {item.icon}
                                    </Box>
                                    <Typography
                                      sx={{
                                        fontSize: 13,
                                        color: COLORS.textSecondary,
                                        fontWeight: 600,
                                      }}
                                    >
                                      {item.label}
                                    </Typography>
                                  </Stack>
                                  <Typography
                                    sx={{
                                      fontSize: 13,
                                      fontWeight: 800,
                                      color: COLORS.textPrimary,
                                    }}
                                  >
                                    {item.val}
                                  </Typography>
                                </Stack>
                              ))}
                            </Stack>
                          </Grid>
                        </Grid>

                        <Divider sx={{ mx: -2, mt: 1.5, mb: 0 }} />
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 900,
                            color: COLORS.textPrimary,
                            fontFamily: "'Sora', sans-serif",
                            mb: 1.5,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Verifiable Evidence
                        </Typography>

                        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                          <TextField
                            sx={{ flex: 1 }}
                            size="small"
                            placeholder="Search documents..."
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon
                                    sx={{ fontSize: 18, color: COLORS.textMuted }}
                                  />
                                </InputAdornment>
                              ),
                              sx: { borderRadius: 3, bgcolor: "#F8FAFC" },
                            }}
                          />
                          <Stack direction="row" spacing={1}>
                            {["All", "Govt", "Identity", "Income"].map((t) => (
                              <Chip
                                key={t}
                                label={t}
                                onClick={() => { }}
                                variant="outlined"
                                sx={{
                                  height: 36,
                                  borderRadius: 2.5,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  px: 1,
                                  bgcolor:
                                    t === "All"
                                      ? alpha(COLORS.accent, 0.05)
                                      : "transparent",
                                  borderColor:
                                    t === "All" ? COLORS.accent : COLORS.border,
                                  color:
                                    t === "All"
                                      ? COLORS.accent
                                      : COLORS.textSecondary,
                                }}
                              />
                            ))}
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Scrollable Document List & Notes */}
                  <Box
                    sx={{
                      flex: 1,
                      overflowY: "auto",
                      px: 2,
                      pb: 1.5,
                      "&::-webkit-scrollbar": { width: 4 },
                      "&::-webkit-scrollbar-thumb": {
                        bgcolor: COLORS.border,
                        borderRadius: 10,
                      },
                    }}
                  >
                    <Grid container spacing={2}>
                      {(selectedReq.documents || []).map(
                        (doc: any, i: number) => (
                          <Grid item xs={6} key={i}>
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 4,
                                border: `1px solid ${COLORS.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                bgcolor: "#F8FAFC",
                                transition: "all 0.2s",
                                "&:hover": {
                                  borderColor: COLORS.accent,
                                  bgcolor: alpha(COLORS.accent, 0.02),
                                },
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Box
                                  sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 3,
                                    bgcolor:
                                      doc.type === "image"
                                        ? "#FEF3C7"
                                        : "#E0F2FE",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color:
                                      doc.type === "image"
                                        ? "#92400E"
                                        : "#0369A1",
                                  }}
                                >
                                  {doc.type === "image" ? (
                                    <ImageIcon sx={{ fontSize: 20 }} />
                                  ) : (
                                    <FileIcon sx={{ fontSize: 20 }} />
                                  )}
                                </Box>
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: 13,
                                      fontWeight: 800,
                                      color: COLORS.textPrimary,
                                    }}
                                  >
                                    {doc.name}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: 11,
                                      fontWeight: 600,
                                      color: COLORS.textMuted,
                                    }}
                                  >
                                    Uploaded by Patient
                                  </Typography>
                                </Box>
                              </Stack>
                              <IconButton size="small">
                                <ViewIcon
                                  sx={{ fontSize: 18, color: COLORS.textMuted }}
                                />
                              </IconButton>
                            </Box>
                          </Grid>
                        ),
                      )}
                    </Grid>

                    <Box
                      sx={{
                        mt: 3,
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: alpha(COLORS.pending.bg, 0.4),
                        border: `1px dashed ${COLORS.pending.border}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13.5,
                          color: COLORS.textPrimary,
                          fontWeight: 500,
                          fontStyle: "italic",
                          lineHeight: 1.6,
                        }}
                      >
                        "{selectedReq.doctorNote}"
                      </Typography>
                    </Box>
                  </Box>

                  {/* Fixed Action Buttons */}
                  <Box sx={{ p: 2, pt: 1.5, borderTop: `1px solid ${COLORS.border}` }}>
                    <Stack direction="row" spacing={1.5} justifyContent="center">
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<FolderIcon />}
                        sx={{
                          flex: 1,
                          py: 1.5,
                          borderRadius: 3,
                          borderColor: COLORS.border,
                          color: COLORS.textSecondary,
                          fontWeight: 800,
                          textTransform: "none",
                        }}
                      >
                        Print Form
                      </Button>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => handleReject(selectedReq.id)}
                        sx={{
                          flex: 1,
                          py: 1.5,
                          borderRadius: 3,
                          bgcolor: "#F43F5E",
                          color: "#fff",
                          fontWeight: 800,
                          textTransform: "none",
                          "&:hover": { bgcolor: "#E11D48" },
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => handleRecommend(selectedReq.id)}
                        sx={{
                          flex: 2,
                          py: 1.5,
                          borderRadius: 3,
                          bgcolor: "#10B981",
                          color: "#fff",
                          fontWeight: 800,
                          textTransform: "none",
                          "&:hover": { bgcolor: "#059669" },
                        }}
                      >
                        Recommend Case
                      </Button>
                    </Stack>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ color: COLORS.textMuted }}>
                    Select a request to review details
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ width: 330, height: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  position: "sticky",
                  top: 0,
                  borderRadius: 4,
                  border: `1px solid ${COLORS.border}`,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    p: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  <BillIcon sx={{ fontSize: 20, color: COLORS.accent }} />
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: COLORS.textPrimary,
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    Assistance Summary
                  </Typography>
                </Box>

                <Box sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      // bgcolor: "#1E293B",
                      // color: "#fff",
                      border: `2px dotted ${COLORS.border}`,
                      mb: 3,
                    }}
                  >
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 11,
                            // color: "rgba(255,255,255,0.6)",
                            fontWeight: 700,
                          }}
                        >
                          GROSS BILL
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                          ₹{selectedReq?.billAmount.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 11,
                            // color: "rgba(255,255,255,0.6)",
                            fontWeight: 700,
                          }}
                        >
                          ASSISTANCE
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: "#FDA4AF",
                          }}
                        >
                          −₹{selectedReq?.requestedAmount.toLocaleString()}
                        </Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 10,
                            // color: "rgba(255,255,255,0.5)",
                            fontWeight: 800,
                            mb: 0.5,
                          }}
                        >
                          NET PAYABLE
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 28,
                            fontWeight: 900,
                            color: "#2DD4BF",
                          }}
                        >
                          ₹
                          {(
                            (selectedReq?.billAmount || 0) -
                            (selectedReq?.requestedAmount || 0)
                          ).toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 900,
                      color: COLORS.textMuted,
                      letterSpacing: 1,
                      mb: 2,
                    }}
                  >
                    PAYMENT STATUS
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(COLORS.pending.bg, 0.4),
                      border: `1.5px solid ${COLORS.pending.border}`,
                      mb: 3,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: COLORS.pending.text,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: COLORS.pending.text,
                        }}
                      >
                        Bill Generated · Pending Payment
                      </Typography>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: `1px solid ${COLORS.border}`,
                      bgcolor: "#F8FAFC",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: COLORS.textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      Documents to verify
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: COLORS.textPrimary,
                      }}
                    >
                      {selectedReq?.documents?.length} files
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Stack>
      </Box>
    </PageTemplate>
  );
}
