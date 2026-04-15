"use client";

import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Chip,
  Grid,
  Divider,
  TextField,
  alpha,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  AccountBalance as AccountBalanceIcon,
  AssignmentInd as AssignmentIndIcon,
  PriorityHigh as PriorityHighIcon,
  Add as AddIcon,
  HourglassEmpty as HourglassIcon,
  LocalHospital as LocalHospitalIcon,
} from "@mui/icons-material";

// Components
import { WorkspaceHeaderCard, StatTile, CustomCardTabs } from "@/src/ui/components/molecules";
import PageTemplate from "@/src/ui/components/PageTemplate";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";

const COLORS = {
  bg: "#F8FAFC", // Clean, minimal hospital white-smoke
  surface: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  accentBright: "#1172BA", // Scanbo Blue
  accentSoft: "#EAF4FF", // Very light brand blue
  pending: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" }, // Warm Amber
  accepted: { bg: "#ECFDF5", text: "#065F46", border: "#D1FAE5" }, // Clean Teal/Emerald
  rejected: { bg: "#FFF1F2", text: "#9F1239", border: "#FFE4E6" }, // Soft Rose/Crimson
  textPrimary: "#0F172A", // Deep Slate for max readability
  textSecondary: "#475569", // Medium Slate
  textMuted: "#94A3B8", // Light Slate for details
};


const REQUESTS = [
  {
    id: "FAR-009",
    patientName: "Rahul Sharma",
    patientId: "P-20241101",
    department: "Oncology",
    doctor: "Dr. Arjun Mehta",
    billAmount: 85000,
    requestedAmount: 60000,
    scheme: "Ayushman Bharat",
    priority: "High",
    docs: "3 verified",
    doctorNote:
      "Patient is a genuine case. Stage 3 diagnosis confirmed. Family is financially distressed. I strongly recommend approval of the PM-JAY scheme assistance.",
    status: "Doctor Approved",
    type: "Govt. Scheme",
  },
  {
    id: "FAR-007",
    patientName: "Sunita Patel",
    patientId: "P-20241088",
    department: "Oncology",
    doctor: "Dr. Arjun Mehta",
    billAmount: 120000,
    requestedAmount: 80000,
    patientPays: 40000,
    status: "Doctor Approved",
    type: "Charity",
  },
];

export default function FinancialAssistanceFinanceDeskPage() {
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [newRequestOpen, setNewRequestOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<any>(null);

  const handleReview = (req: any) => {
    setSelectedRequest(req);
    setReviewOpen(true);
  };



  /* ── Table Columns (Using project's standard CommonColumn) ── */
  const columns: CommonColumn<any>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
      renderCell: (row) => (
        <Typography
          sx={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}
        >
          {row.id}
        </Typography>
      ),
    },
    {
      field: "patientName",
      headerName: "PATIENT",
      width: 200,
      renderCell: (row) => (
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
            {row.patientName}
          </Typography>
          <Typography sx={{ fontSize: 11, color: COLORS.textMuted }}>
            {row.patientId}
          </Typography>
        </Box>
      ),
    },
    {
      field: "billAmount",
      headerName: "BILL",
      width: 120,
      renderCell: (row) => (
        <Typography sx={{ fontSize: 13 }}>
          ₹{row.billAmount.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "requestedAmount",
      headerName: "ASSISTANCE",
      width: 120,
      renderCell: (row) => (
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#BE123C" }}>
          ₹{row.requestedAmount.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "type",
      headerName: "TYPE",
      width: 120,
      renderCell: (row) => (
        <Chip
          label={row.type}
          size="small"
          sx={{
            height: 20,
            fontSize: 10,
            fontWeight: 700,
            bgcolor:
              row.type === "Govt. Scheme"
                ? "#E0F2FE"
                : row.type === "Charity"
                  ? "#FCE7F3"
                  : "#F3E8FF",
            color:
              row.type === "Govt. Scheme"
                ? "#0369A1"
                : row.type === "Charity"
                  ? "#BE185D"
                  : "#7E22CE",
            borderRadius: "4px",
          }}
        />
      ),
    },
    {
      field: "status",
      headerName: "STATUS",
      width: 150,
      renderCell: (row) => (
        <Chip
          label={row.status}
          size="small"
          sx={{
            height: 20,
            fontSize: 10,
            fontWeight: 700,
            bgcolor: row.status === "Doctor Approved" ? "#FFF7ED" : "#F0FDF4",
            color: row.status === "Doctor Approved" ? "#C2410C" : "#166534",
            borderRadius: "4px",
          }}
        />
      ),
    },
    {
      field: "action",
      headerName: "ACTION",
      width: 120,
      renderCell: (row) => (
        <Button
          size="small"
          variant="contained"
          onClick={() => handleReview(row)}
          sx={{
            bgcolor: "success.main",
            textTransform: "none",
            fontSize: 11,
            py: 0.5,
            px: 2,
            borderRadius: "6px",
            "&:hover": { bgcolor: "#065F46" },
          }}
        >
          Approve
        </Button>
      ),
    },
  ];

  const auditLogs = [
    {
      id: 1,
      text: "FAR-009 submitted by patient Rahul Sharma — Govt. scheme ₹60,000 requested",
      time: "just now",
      icon: "arrow",
    },
    {
      id: 2,
      text: "FAR-008 approved by Finance Head — ₹15,000 discount granted to Vijay Kumar",
      time: "2 hrs ago",
      icon: "check",
    },
    {
      id: 3,
      text: "FAR-007 recommended by Dr. Arjun Mehta — forwarded to Finance",
      time: "3 hrs ago",
      icon: "recommend",
    },
    {
      id: 4,
      text: "FAR-006 rejected — Insurance claim incomplete documents",
      time: "Yesterday",
      icon: "close",
    },
  ];

  return (
    <PageTemplate
      title="Financial Assistance"
      subtitle="Final approval, rejection & disbursement tracking for medical assistance requests."
      currentPageTitle="Finance Desk"
      fullHeight
    >
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <WorkspaceHeaderCard>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 900, color: "primary.main", mb: 0.5 }}
            >
              Finance Desk
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reviewing 5 pending recommendation cases for final disbursement
              approval.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setNewRequestOpen(true)}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              fontSize: 12,
              px: 3,
              fontWeight: 700,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              boxShadow: (t: any) => `0 4px 12px ${alpha(t.palette.primary.main, 0.2)}`,
            }}
          >
            New Request
          </Button>
        </Stack>
      </WorkspaceHeaderCard>

     
      <Grid container spacing={1} >
        <Grid item xs={12} sm={6} md={3}>
          <StatTile
            label="APPROVED THIS MONTH"
            value="₹4.2L"
            subtitle="38 cases approved"
            tone="success"
            icon={<CheckCircleIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatTile
            label="PENDING FINAL APPROVAL"
            value="5"
            subtitle="Recommended by Doctors"
            tone="warning"
            icon={<HourglassIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatTile
            label="REJECTED"
            value="5"
            subtitle="This month"
            tone="error"
            icon={<CancelIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatTile
            label="GOVT. SCHEME CASES"
            value="21"
            subtitle="Ayushman + others"
            tone="info"
            icon={<AccountBalanceIcon />}
          />
        </Grid>
      </Grid>

    
      <CustomCardTabs
        sx={{ flex: 1, minHeight: 0 }}
        items={[
          {
            label: "Pending Approval",
            icon: <HourglassIcon />,
            child: (
              <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: COLORS.accentSoft,
                    border: `1px solid ${alpha(COLORS.accentBright, 0.2)}`,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <InfoIcon sx={{ color: COLORS.accentBright, fontSize: 18 }} />
                  <Typography
                    sx={{ fontSize: 13, color: COLORS.accentBright, fontWeight: 500 }}
                  >
                    Those requests have been{" "}
                    <strong style={{ fontWeight: 700 }}>
                      recommended by the treating Doctor/HOD
                    </strong>{" "}
                    and are awaiting your final approval.
                  </Typography>
                </Box>
                <Grid container spacing={2} sx={{mt:0.5}}>
                  {REQUESTS.map((req) => (
                    <Grid item xs={12} md={6} key={req.id}>
                      <Box
                        sx={{
                          bgcolor: COLORS.surface,
                          borderRadius: "12px",
                          border: `1px solid ${COLORS.border}`,
                          p: 3,
                          height: "100%",
                          position: "relative",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Chip
                          label={req.status}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            bgcolor: "#FFF7ED",
                            color: "#C2410C",
                            fontSize: 10,
                            fontWeight: 700,
                            borderRadius: "4px",
                          }}
                        />

                        <Box sx={{ mb: 2 }}>
                          <Typography
                            sx={{
                              fontSize: 16,
                              fontWeight: 800,
                              color: COLORS.textPrimary,
                            }}
                          >
                            {req.patientName}{" "}
                            <span
                              style={{
                                color: COLORS.textMuted,
                                fontWeight: 500,
                                fontSize: 12,
                              }}
                            >
                              {req.patientId}
                            </span>
                          </Typography>
                          <Typography
                            sx={{ fontSize: 12, color: COLORS.textSecondary }}
                          >
                            {req.id} • {req.department} •{" "}
                            <span style={{ color: COLORS.accentBright }}>
                              By {req.doctor}
                            </span>
                          </Typography>
                        </Box>

                        <Grid
                          container
                          spacing={2}
                          sx={{ mb: Number(req.doctorNote ? 2 : 3) }}
                        >
                          <Grid item xs={6}>
                            <Typography
                              sx={{
                                fontSize: 10,
                                color: COLORS.textMuted,
                                fontWeight: 700,
                                mb: 0.5,
                              }}
                            >
                              BILL AMOUNT
                            </Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                              ₹{req.billAmount.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              sx={{
                                fontSize: 10,
                                color: COLORS.textMuted,
                                fontWeight: 700,
                                mb: 0.5,
                              }}
                            >
                              REQUESTED
                            </Typography>
                            <Typography
                              sx={{ fontSize: 14, fontWeight: 700, color: "#BE123C" }}
                            >
                              ₹{req.requestedAmount.toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>

                        {req.doctorNote && (
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: "#F0FDF4",
                              border: "1px solid #BBF7D0",
                              borderRadius: "8px",
                              mb: 3,
                              flexGrow: 1,
                            }}
                          >
                            <Typography
                              sx={{ fontSize: 11, color: "#166534", lineHeight: 1.4 }}
                            >
                              "{req.doctorNote}"
                            </Typography>
                          </Box>
                        )}

                        <Stack direction="row" spacing={1} sx={{ mt: "auto" }} flexWrap="wrap" justifyContent="flex-end" useFlexGap>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              border: `1px solid ${COLORS.border}`,
                              color: COLORS.textPrimary,
                              textTransform: "none",
                              borderRadius: "8px",
                              fontWeight: 700,
                              fontSize: 11,
                              minWidth: 0,
                            }}
                          >
                            Details
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            sx={{
                              bgcolor: alpha("#F97316", 0.1),
                              color: "#C2410C",
                              textTransform: "none",
                              borderRadius: "8px",
                              fontWeight: 700,
                              fontSize: 11,
                              boxShadow: "none",
                              "&:hover": { bgcolor: alpha("#F97316", 0.2) },
                            }}
                          >
                            Partial
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            sx={{
                              bgcolor: COLORS.rejected.bg,
                              color: COLORS.rejected.text,
                              textTransform: "none",
                              borderRadius: "8px",
                              fontWeight: 700,
                              fontSize: 11,
                              boxShadow: "none",
                              "&:hover": { bgcolor: alpha(COLORS.rejected.bg, 0.8) },
                            }}
                          >
                            Reject
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleReview(req)}
                            sx={{
                              bgcolor: "success.main",
                              color: "#fff",
                              textTransform: "none",
                              borderRadius: "8px",
                              fontWeight: 700,
                              fontSize: 11,
                              boxShadow: "none",
                              "&:hover": { bgcolor: "success.main" },
                            }}
                          >
                            Approve
                          </Button>
                        </Stack>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ),
          },
          {
            label: "All Requests",
            child: (
                <CommonDataGrid
                  showSerialNo
                  rows={Array(8)
                    .fill(0)
                    .map((_, i) => ({
                      ...REQUESTS[0],
                      id: `FAR-00${9 - i}`,
                      patientName:
                        [
                          "Rahul Sharma",
                          "Vijay Kumar",
                          "Sunita Patel",
                          "Ananya Singh",
                          "Mahesh Yadav",
                          "Kiran Devi",
                          "Om Prakash",
                          "Aarti Pal",
                        ][i] || "Rahul Sharma",
                      status:
                        i % 3 === 0
                          ? "Doctor Approved"
                          : i % 3 === 1
                            ? "Approved"
                            : "Rejected",
                    }))}
                  columns={columns}
                  searchPlaceholder="Search by patient, ID, bill..."
                  tableHeight="100%"
                />
            ),
          },
          {
            label: "Audit Log",
            child: (
              <Box
                sx={{
                  bgcolor: COLORS.surface,
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.border}`,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: `1px solid ${COLORS.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                    Audit Log
                  </Typography>
                </Box>
                <Stack sx={{ p: 2 }}>
                  {auditLogs.map((log) => (
                    <Box
                      key={log.id}
                      sx={{
                        py: 1.5,
                        borderBottom:
                          log.id !== 4 ? `1px solid ${COLORS.border}` : "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        {log.icon === "arrow" && (
                          <PriorityHighIcon
                            sx={{ color: "#F97316", fontSize: 18 }}
                          />
                        )}
                        {log.icon === "check" && (
                          <CheckCircleIcon
                            sx={{ color: "#16A34A", fontSize: 18 }}
                          />
                        )}
                        {log.icon === "recommend" && (
                          <AssignmentIndIcon
                            sx={{ color: "#EAB308", fontSize: 18 }}
                          />
                        )}
                        {log.icon === "close" && (
                          <CancelIcon sx={{ color: "#BE123C", fontSize: 18 }} />
                        )}
                        <Typography
                          sx={{ fontSize: 13, color: COLORS.textPrimary }}
                        >
                          <strong style={{ fontWeight: 800 }}>
                            {log.text.split(" ")[0]}
                          </strong>{" "}
                          {log.text.slice(log.text.indexOf(" "))}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 11, color: COLORS.textMuted }}>
                        {log.time}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ),
          },
        ]}
      />

      {/* Case Review / Approval Dialog */}
      <CommonDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        maxWidth="md"
        title="Case Approval"
        subtitle={
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
            Reference No: <span style={{ color: "#38BDF8" }}>{selectedRequest?.id}</span>
          </Typography>
        }
        icon={<LocalHospitalIcon sx={{ color: "#38BDF8", fontSize: 26 }} />}
        titleSx={{
          background: "linear-gradient(135deg, #1172BA 0%, #0A4472 100%)",
          color: "#fff",
          "& .MuiTypography-root": { color: "#fff" },
          "& .MuiIconButton-root": { color: "rgba(255,255,255,0.6)" },
        }}
        PaperProps={{
          sx: {
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 25px 70px rgba(15,23,42,0.18)",
            bgcolor: "#F8FAFC",
          },
        }}
        contentSx={{ p: 4 }}
        actionsSx={{ p: 4, pt: 0, mt: 0 }}
        actions={
          <>
            <Button
              onClick={() => setReviewOpen(false)}
              sx={{
                color: "#64748B",
                fontWeight: 700,
                textTransform: "none",
                fontSize: 14,
              }}
            >
              Wait for more info
            </Button>
            <Button
              variant="outlined"
              sx={{
                fontWeight: 700,
                px: 3,
                borderRadius: "14px",
                textTransform: "none",
              }}
            >
              Decline Case
            </Button>
            <Button
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: 800,
                fontSize: 15,
                px: 4,
                py: 1.25,
                borderRadius: "14px",
              }}
            >
              Authorize Clearance
            </Button>
          </>
        }
      >
        <Box>
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#64748B",
                      letterSpacing: 1,
                      mb: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    Patient Profile & Referral
                  </Typography>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: "18px",
                      bgcolor: "#fff",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "#94A3B8",
                            fontWeight: 700,
                          }}
                        >
                          FULL NAME
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "#1E293B",
                          }}
                        >
                          {selectedRequest?.patientName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "#94A3B8",
                            fontWeight: 700,
                          }}
                        >
                          PATIENT ID
                        </Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                          {selectedRequest?.patientId}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "#94A3B8",
                            fontWeight: 700,
                          }}
                        >
                          UNIT
                        </Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                          {selectedRequest?.department}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "#94A3B8",
                            fontWeight: 700,
                          }}
                        >
                          REFERRING DOCTOR
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#0369A1",
                          }}
                        >
                          {selectedRequest?.doctor}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#64748B",
                      letterSpacing: 1,
                      mb: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    Clinical Justification
                  </Typography>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: "16px",
                      bgcolor: "#EBF5FC",
                      border: "1px dashed #1172BA",
                      position: "relative",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#0C4A6E",
                        fontStyle: "italic",
                        lineHeight: 1.6,
                      }}
                    >
                      "
                      {selectedRequest?.doctorNote ||
                        "Clinical recommendation provided for immediate financial clearance based on patient socio-economic status."}
                      "
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#64748B",
                      letterSpacing: 1,
                      mb: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    Verification Path
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={3}
                    sx={{ position: "relative" }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        left: 16,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        bgcolor: "#E2E8F0",
                        zIndex: 0,
                      }}
                    />
                    <Stack spacing={2} sx={{ flex: 1 }}>
                      {[
                        {
                          label: "Case Registered",
                          time: "15 Mar, 10:30 AM",
                          status: "complete",
                        },
                        {
                          label: "Doctor Recommendation",
                          time: "16 Mar, 02:45 PM",
                          status: "complete",
                        },
                        {
                          label: "Finance Audit",
                          time: "Processing...",
                          status: "active",
                        },
                      ].map((step, idx) => (
                        <Stack
                          key={idx}
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          sx={{ position: "relative", zIndex: 1 }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor:
                                step.status === "complete"
                                  ? "#059669"
                                  : step.status === "active"
                                    ? COLORS.accentBright
                                    : "#CBD5E1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                            }}
                          >
                            {step.status === "complete" ? (
                              <CheckCircleIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <Typography
                                sx={{ fontSize: 12, fontWeight: 900 }}
                              >
                                {idx + 1}
                              </Typography>
                            )}
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 700,
                                color:
                                  step.status === "active"
                                    ? "#0284C7"
                                    : "#334155",
                              }}
                            >
                              {step.label}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>
                              {step.time}
                            </Typography>
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: "24px",
                    bgcolor: "#0A4472",
                    color: "#fff",
                    boxShadow: "0 20px 40px rgba(10, 68, 114, 0.2)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.4)",
                      mb: 2.5,
                      letterSpacing: 1,
                    }}
                  >
                    SETTLEMENT PLAN
                  </Typography>

                  <Stack spacing={2.5}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}
                      >
                        Gross Medical Bill
                      </Typography>
                      <Typography sx={{ fontSize: 16, fontWeight: 800 }}>
                        ₹{selectedRequest?.billAmount?.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "#38BDF8",
                            fontWeight: 600,
                          }}
                        >
                          Assistance Package
                        </Typography>
                        <Typography
                          sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}
                        >
                          {selectedRequest?.type || "Standard Assistance"}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{ fontSize: 18, fontWeight: 900, color: "#F43F5E" }}
                      >
                        − ₹{selectedRequest?.requestedAmount?.toLocaleString()}
                      </Typography>
                    </Box>

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        bgcolor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.6)",
                          mb: 0.5,
                        }}
                      >
                        PATIENT RESPONSIBILITY
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 32,
                          fontWeight: 900,
                          color: "#10B981",
                          letterSpacing: -1,
                        }}
                      >
                        ₹
                        {(
                          (selectedRequest?.billAmount || 0) -
                          (selectedRequest?.requestedAmount || 0)
                        ).toLocaleString()}
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Chip
                          size="small"
                          label={`${Math.round(((selectedRequest?.requestedAmount || 0) / (selectedRequest?.billAmount || 1)) * 100)}% Discounted`}
                          sx={{
                            bgcolor: "rgba(16,185,129,0.15)",
                            color: "#10B981",
                            fontWeight: 800,
                            fontSize: 10,
                            height: 20,
                          }}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#64748B",
                      mb: 1,
                      px: 1,
                    }}
                  >
                    FINAL OVERRIDE
                  </Typography>
                  <TextField
                    fullWidth
                    label="Approved Amount"
                    type="number"
                    defaultValue={selectedRequest?.requestedAmount}
                    InputProps={{
                      startAdornment: (
                        <Typography
                          sx={{ mr: 1, fontWeight: 700, color: "#64748B" }}
                        >
                          ₹
                        </Typography>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "16px",
                        bgcolor: "#fff",
                        fontWeight: 700,
                        fontSize: 15,
                        "& fieldset": { borderColor: "#E2E8F0" },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#64748B",
                      mb: 1,
                      px: 1,
                    }}
                  >
                    INTERNAL NOTE
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Verification remarks..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "16px",
                        bgcolor: "#fff",
                        fontSize: 13,
                        "& fieldset": { borderColor: "#E2E8F0" },
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </CommonDialog>
      {/* New Request Dialog */}
      <CommonDialog
        open={newRequestOpen}
        onClose={() => setNewRequestOpen(false)}
        maxWidth="sm"
        title="Generate Assistance Request"
        subtitle="Initiate a new medical support request for patient review."
        confirmLabel="Submit Request to Doctor Review"
        onConfirm={() => setNewRequestOpen(false)}
        confirmButtonProps={{
          sx: {
            py: 1.2,
            borderRadius: "10px",
            fontWeight: 800,
            textTransform: "none",
            fontSize: 14,
            boxShadow: "0 10px 15px -3px rgba(17, 114, 186, 0.25)",
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}
        contentSx={{ p: 1 }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, mb: 1 }}>
              PATIENT SEARCH
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by MRN or Name (e.g. MRN-24599)"
              InputProps={{
                startAdornment: (
                  <AssignmentIndIcon sx={{ color: "text.disabled", mr: 1, fontSize: 18 }} />
                ),
              }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, mb: 1 }}>
                BILL AMOUNT
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="₹ 0.00"
                InputProps={{
                  startAdornment: (
                    <Typography sx={{ mr: 1, fontSize: 13, fontWeight: 700, color: "text.secondary" }}>
                      ₹
                    </Typography>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, mb: 1 }}>
                REQUESTED ASSISTANCE
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="₹ 0.00"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: alpha("#BE123C", 0.02),
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Typography sx={{ mr: 1, fontSize: 13, fontWeight: 700, color: "#BE123C" }}>
                      ₹
                    </Typography>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, mb: 1 }}>
              ASSISTANCE SCHEME / TYPE
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {["Ayushman Bharat", "Charity", "Trust Relief", "Staff Discount"].map((s) => (
                <Chip
                  key={s}
                  label={s}
                  onClick={() => {}}
                  sx={{
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: 11,
                    bgcolor: s === "Ayushman Bharat" ? alpha(COLORS.accentBright, 0.1) : "transparent",
                    color: s === "Ayushman Bharat" ? COLORS.accentBright : COLORS.textSecondary,
                    border: `1px solid ${s === "Ayushman Bharat" ? COLORS.accentBright : COLORS.border}`,
                    "&:hover": { bgcolor: alpha(COLORS.accentBright, 0.05) }
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, mb: 1 }}>
              JUSTIFICATION / REMARKS
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Provide a brief explanation for the assistance request..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: 13,
                  borderRadius: "12px",
                }
              }}
            />
          </Box>
        </Box>
      </CommonDialog>
    </Stack>
  </PageTemplate>
  );
}
