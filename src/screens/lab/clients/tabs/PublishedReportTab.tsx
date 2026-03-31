"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Grid,
  MenuItem,
  Chip,
} from "@/src/ui/components/atoms";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Description as PreviewIcon,
  Publish as PublishIcon,
  Email as EmailIcon,
  Send as SendIcon,
  CheckCircleOutline as VerifiedIcon,
} from "@mui/icons-material";
import { useLabTheme } from "../../lab-theme";

const MOCK_READY_TO_PUBLISH = [
  {
    id: "REC-101",
    sampleId: "LAB-2025-5019",
    patient: "Nisha Patel",
    tests: "Thyroid Profile",
    verifiedBy: "Dr. Rajesh",
    verifiedAt: "09:50 AM",
  },
  {
    id: "REC-102",
    sampleId: "LAB-2025-5012",
    patient: "Anita Roy",
    tests: "CBC",
    verifiedBy: "Dr. Rajesh",
    verifiedAt: "10:05 AM",
  },
  {
    id: "REC-103",
    sampleId: "LAB-2025-5009",
    patient: "Vikram Shah",
    tests: "Lipid Profile",
    verifiedBy: "Dr. Mehta",
    verifiedAt: "10:22 AM",
  },
];

// Design tokens
const C = {
  primary: "#1172BA",
  primaryLight: "#EFF6FF",
  primaryMid: "#DBEAFE",
  success: "#15803D",
  successLight: "#F0FDF4",
  successMid: "#DCFCE7",
  warning: "#B45309",
  warningLight: "#FFFBEB",
  border: "#E2E8F0",
  surface: "#F8FAFC",
  surfaceHover: "#F1F5F9",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  white: "#FFFFFF",
};

const labelSx = {
  fontSize: "0.7rem",
  fontWeight: 700,
  color: C.textMuted,
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
};

const sectionCard = {
  bgcolor: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: "14px",
  boxShadow: "0 1px 4px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.02)",
  overflow: "hidden",
  height: "100%",
};

export default function PublishedReportTab() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);

  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedRows.length === MOCK_READY_TO_PUBLISH.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(MOCK_READY_TO_PUBLISH.map((r) => r.id));
    }
  };

  return (
    <Stack spacing={2.5} >
      <Grid container spacing={2.5} alignItems="stretch">
        {/* ── Left: Ready to Publish ── */}
        <Grid item xs={12} md={7}>
          <Box sx={sectionCard}>
            {/* Section header */}
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: `1px solid ${C.border}`,
                bgcolor: C.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    bgcolor: C.warningLight,
                    border: `1px solid #FDE68A`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 900, color: C.warning }}>
                    !
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: C.textPrimary, lineHeight: 1.2 }}>
                    Ready to Publish
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: C.textMuted, mt: 0.2 }}>
                    Verified reports pending release
                  </Typography>
                </Box>
              </Stack>
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: "13px !important", color: `${C.success} !important` }} />}
                label="28 verified"
                size="small"
                sx={{
                  bgcolor: C.successLight,
                  color: C.success,
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  border: `1px solid ${C.successMid}`,
                  borderRadius: "8px",
                  height: 26,
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            </Box>

            {/* Table */}
            <TableContainer sx={{ px: 1 }}>
              <Table size="small" sx={{ borderCollapse: "separate", borderSpacing: "0 2px" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ py: 1.5, px: 1, border: "none" }}>
                      <Checkbox
                        size="small"
                        checked={selectedRows.length === MOCK_READY_TO_PUBLISH.length}
                        indeterminate={
                          selectedRows.length > 0 &&
                          selectedRows.length < MOCK_READY_TO_PUBLISH.length
                        }
                        onChange={toggleAll}
                        sx={{ p: 0.25, color: C.textMuted }}
                      />
                    </TableCell>
                    {["Sample ID", "Patient", "Tests", "Verified By", "Time", "Action"].map((h) => (
                      <TableCell key={h} sx={{ ...labelSx, py: 1.5, border: "none" }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_READY_TO_PUBLISH.map((row) => {
                    const selected = selectedRows.includes(row.id);
                    return (
                      <TableRow
                        key={row.id}
                        onClick={() => toggleRow(row.id)}
                        sx={{
                          cursor: "pointer",
                          bgcolor: selected ? C.primaryLight : C.white,
                          borderRadius: "8px",
                          transition: "background 0.15s",
                          "& td": {
                            border: "none",
                            borderTop: `1px solid ${selected ? C.primaryMid : C.border}`,
                            borderBottom: `1px solid ${selected ? C.primaryMid : C.border}`,
                          },
                          "& td:first-of-type": {
                            borderLeft: `2px solid ${selected ? C.primary : "transparent"}`,
                            borderRadius: "8px 0 0 8px",
                          },
                          "& td:last-of-type": { borderRadius: "0 8px 8px 0" },
                          "&:hover": {
                            bgcolor: selected ? C.primaryMid : C.surfaceHover,
                          },
                        }}
                      >
                        <TableCell sx={{ py: 1.2, px: 1 }}>
                          <Checkbox
                            size="small"
                            checked={selected}
                            onChange={() => toggleRow(row.id)}
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              p: 0.25,
                              color: selected ? C.primary : C.textMuted,
                              "&.Mui-checked": { color: C.primary },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.2 }}>
                          <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: C.primary, fontFamily: "monospace" }}>
                            {row.sampleId}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.2 }}>
                          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: C.textPrimary }}>
                            {row.patient}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.2 }}>
                          <Chip
                            label={row.tests}
                            size="small"
                            sx={{
                              bgcolor: "#F1F5F9",
                              color: C.textSecondary,
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              height: 20,
                              borderRadius: "5px",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.2 }}>
                          <Typography sx={{ fontSize: "0.75rem", color: C.textSecondary, fontWeight: 500 }}>
                            {row.verifiedBy}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.2 }}>
                          <Typography sx={{ fontSize: "0.72rem", color: C.textMuted, fontFamily: "monospace" }}>
                            {row.verifiedAt}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.2 }}>
                          <Stack direction="row" spacing={0.75} onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<PreviewIcon sx={{ fontSize: "12px !important" }} />}
                              sx={{
                                height: 26,
                                fontSize: "0.67rem",
                                fontWeight: 600,
                                borderRadius: "7px",
                                textTransform: "none",
                                borderColor: C.primary,
                                color: C.primary,
                                minWidth: 84,
                                "&:hover": { bgcolor: C.primaryLight },
                              }}
                            >
                              Preview
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                height: 26,
                                fontSize: "0.67rem",
                                fontWeight: 700,
                                borderRadius: "7px",
                                textTransform: "none",
                                bgcolor: "#34bf89ff",
                                minWidth: 60,
                                boxShadow: "none",
                                "&:hover": { bgcolor: "#34bf89ff", boxShadow: "none" },
                              }}
                            >
                              Publish
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer actions */}
            <Box
              sx={{
                px: 2.5,
                py: 2,
                mt: 1,
                borderTop: `1px solid ${C.border}`,
                bgcolor: C.surface,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Button
                variant="contained"
                startIcon={<PublishIcon sx={{ fontSize: 16 }} />}
                disabled={selectedRows.length === 0}
                sx={{
                  bgcolor: "#34bf89ff",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  textTransform: "none",
                  borderRadius: "9px",
                  boxShadow: "none",
                  height: 38,
                  px: 2.5,
                  "&:hover": { bgcolor: "#34bf89ff", boxShadow: "none" },
                  "&.Mui-disabled": { bgcolor: "#D1FAE5", color: "#86EFAC" },
                }}
              >
                Publish Selected{selectedRows.length > 0 ? ` (${selectedRows.length})` : ""}
              </Button>
              <Button
                variant="outlined"
                startIcon={<EmailIcon sx={{ fontSize: 16 }} />}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  textTransform: "none",
                  borderRadius: "9px",
                  height: 38,
                  px: 2.5,
                  borderColor: C.border,
                  color: C.textSecondary,
                  "&:hover": { bgcolor: C.surfaceHover, borderColor: "#CBD5E1" },
                }}
              >
                Email Reports
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* ── Right: Email Dispatch ── */}
        <Grid item xs={12} md={5}>
          <Box sx={sectionCard}>
            {/* Header */}
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: `1px solid ${C.border}`,
                bgcolor: C.surface,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: C.primaryLight,
                  border: `1px solid ${C.primaryMid}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EmailIcon sx={{ fontSize: 16, color: C.primary }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: C.textPrimary, lineHeight: 1.2 }}>
                  Email Dispatch
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: C.textMuted, mt: 0.2 }}>
                  Send report to patient or doctor
                </Typography>
              </Box>
            </Box>

            {/* Form body */}
            <Box sx={{ p: 2.5 }}>
              <Stack spacing={2.5}>
                {/* To */}
                <Box>
                  <Typography sx={{ ...labelSx, mb: 0.75 }}>To (Patient / Contact)</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    defaultValue="priya.mehta@email.com"
                  />
                </Box>

                {/* CC */}
                <Box>
                  <Typography sx={{ ...labelSx, mb: 0.75 }}>CC</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Doctor, referring physician..."
                  />
                </Box>

                {/* Template + Format */}
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography sx={{ ...labelSx, mb: 0.75 }}>Report Template</Typography>
                    <TextField select fullWidth size="small" defaultValue="Default Report" >
                      <MenuItem value="Default Report">Default Report</MenuItem>
                      <MenuItem value="Detailed Report">Detailed Report</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ ...labelSx, mb: 0.75 }}>Paper Format</Typography>
                    <TextField select fullWidth size="small" defaultValue="A4 Portrait" >
                      <MenuItem value="A4 Portrait">A4 Portrait</MenuItem>
                      <MenuItem value="Letter">Letter</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                {/* Message */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                    <Typography sx={labelSx}>Message</Typography>
                    <Typography sx={{ fontSize: "0.65rem", color: C.textMuted }}>Auto-filled</Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    defaultValue="Dear Patient, your laboratory results are ready. Please find the report attached."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        alignItems: "flex-start",
                      },
                    }}
                  />
                </Box>

                {/* CTA */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<SendIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    mt: 0.5,
                    bgcolor: C.primary,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    borderRadius: "10px",
                    height: 44,
                   
                  }}
                >
                  Send &amp; Publish
                </Button>
              </Stack>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}