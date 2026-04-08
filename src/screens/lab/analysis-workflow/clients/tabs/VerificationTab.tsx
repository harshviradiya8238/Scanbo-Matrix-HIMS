"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Checkbox,
} from "@/src/ui/components/atoms";
import { useTheme, alpha } from "@mui/material/styles";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Check as VerifyIcon,
  Close as RejectIcon,
  Science as ScienceIcon,
  WarningAmber as WarningIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { useLabTheme } from "../../../lab-theme";

const MOCK_VERIFICATION_ROWS = [
  {
    id: "REC-001",
    sampleId: "LAB-2025-5021",
    patient: "Priya Mehta",
    analysis: "Potassium (K⁺)",
    result: "6.9",
    unit: "mEq/L",
    refRange: "3.5–5.0",
    flag: "Critical H",
    qcStatus: "1:2s pass",
    enteredBy: "Auto (Instrument)",
    status: "to_verify",
  },
  {
    id: "REC-002",
    sampleId: "LAB-2025-5020",
    patient: "Raju Verma",
    analysis: "Haemoglobin",
    result: "4.2",
    unit: "g/dL",
    refRange: "13–17",
    flag: "Critical L",
    qcStatus: "1:2s pass",
    enteredBy: "M. Joseph",
    status: "to_verify",
  },
  {
    id: "REC-003",
    sampleId: "LAB-2025-5018",
    patient: "Ramesh Gupta",
    analysis: "HbA1c",
    result: "9.1",
    unit: "%",
    refRange: "<5.7%",
    flag: "High",
    qcStatus: "1:2s pass",
    enteredBy: "R. Sharma",
    status: "to_verify",
  },
  {
    id: "REC-004",
    sampleId: "LAB-2025-5015",
    patient: "Suresh Kumar",
    analysis: "Random Glucose",
    result: "98",
    unit: "mg/dL",
    refRange: "70–200",
    flag: "Normal",
    qcStatus: "1:3s fail",
    enteredBy: "K. Joseph",
    status: "to_verify",
  },
  {
    id: "REC-005",
    sampleId: "LAB-2025-5010",
    patient: "Anita Roy",
    analysis: "TSH",
    result: "3.1",
    unit: "mIU/L",
    refRange: "0.4–4.0",
    flag: "Normal",
    qcStatus: "1:2s pass",
    enteredBy: "Dr. Rajesh",
    status: "verified",
  },
];

// ─── Refined design tokens (no loud colors) ───────────────────────────────────
const T = {
  // Critical: deep rose (not fire-truck red)
  criticalText: "#9F1239",
  criticalBg: "#FFF1F2",
  criticalBorder: "#FECDD3",

  // High/Low: warm amber-brown (not orange-yellow)
  highText: "#92400E",
  highBg: "#FFFBEB",
  highBorder: "#FDE68A",

  // Normal / verified: cool teal-slate (not neon green)
  okText: "#0F766E",
  okBg: "#F0FDFA",
  okBorder: "#99F6E4",

  // QC fail: muted terracotta
  failText: "#7C2D12",
  failBg: "#FFF7ED",
  failBorder: "#FED7AA",

  // Neutral UI
  border: "#E2E8F0",
  surface: "#F8FAFC",
  surfaceHover: "#F1F5F9",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  white: "#FFFFFF",

  // Action buttons — indigo instead of electric blue
  verifyBtn: "#1172BA",
  verifyBtnHover: "#1172BA",
  rejectBtn: "#6B7280",
  rejectBtnHover: "#4B5563",
};

// ─── Flag badge ───────────────────────────────────────────────────────────────
function FlagBadge({ flag }: { flag: string }) {
  let text = T.okText,
    bg = T.okBg,
    border = T.okBorder;
  if (flag.includes("Critical")) {
    text = T.criticalText;
    bg = T.criticalBg;
    border = T.criticalBorder;
  } else if (flag === "High" || flag === "Low") {
    text = T.highText;
    bg = T.highBg;
    border = T.highBorder;
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        px: 1,
        py: 0.3,
        bgcolor: bg,
        color: text,
        border: `1px solid ${border}`,
        borderRadius: "6px",
      }}
    >
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: text,
          flexShrink: 0,
        }}
      />
      <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, lineHeight: 1 }}>
        {flag}
      </Typography>
    </Box>
  );
}

// ─── QC badge ─────────────────────────────────────────────────────────────────
function QcBadge({ status }: { status: string }) {
  const isFail = status.includes("fail");
  const text = isFail ? T.failText : T.okText;
  const bg = isFail ? T.failBg : T.okBg;
  const border = isFail ? T.failBorder : T.okBorder;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        px: 1,
        py: 0.3,
        bgcolor: bg,
        color: text,
        border: `1px solid ${border}`,
        borderRadius: "6px",
      }}
    >
      {isFail ? (
        <CancelIcon sx={{ fontSize: 11 }} />
      ) : (
        <CheckCircleIcon sx={{ fontSize: 11 }} />
      )}
      <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, lineHeight: 1 }}>
        {status}
      </Typography>
    </Box>
  );
}

// ─── Result value ─────────────────────────────────────────────────────────────
function ResultCell({ row }: { row: any }) {
  let color = T.textPrimary;
  if (row.flag.includes("Critical")) color = T.criticalText;
  else if (row.flag === "High" || row.flag === "Low") color = T.highText;

  return (
    <Stack direction="row" alignItems="baseline" spacing={0.5}>
      <Typography
        sx={{
          fontSize: "0.85rem",
          fontWeight: 700,
          color,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {row.result}
      </Typography>
      <Typography
        sx={{ fontSize: "0.68rem", fontWeight: 500, color: T.textMuted }}
      >
        {row.unit}
      </Typography>
    </Stack>
  );
}

// ─── Action cell ─────────────────────────────────────────────────────────────
function ActionCell({
  row,
  onVerify,
}: {
  row: any;
  onVerify: (id: string) => void;
}) {
  if (row.status === "verified") {
    return (
      <Stack direction="row" alignItems="center" spacing={0.6}>
        <CheckCircleIcon sx={{ fontSize: 14, color: T.okText }} />
        <Typography
          sx={{ fontSize: "0.72rem", fontWeight: 700, color: T.okText }}
        >
          Verified
        </Typography>
      </Stack>
    );
  }

  if (row.qcStatus.includes("fail")) {
    return (
      <Button
        variant="outlined"
        size="small"
        sx={{
          height: 26,
          fontSize: "0.68rem",
          fontWeight: 600,
          borderRadius: "7px",
          textTransform: "none",
          borderColor: T.failBorder,
          color: T.failText,
          bgcolor: T.failBg,
          "&:hover": { bgcolor: "#FEE2CC", borderColor: T.failText },
        }}
      >
        Rerun QC
      </Button>
    );
  }

  return (
    <Stack direction="row" spacing={0.75}>
      <Button
        size="small"
        variant="contained"
        startIcon={<VerifyIcon sx={{ fontSize: "12px !important" }} />}
        onClick={() => onVerify(row.id)}
        sx={{
          height: 26,
          minWidth: 64,
          fontSize: "0.68rem",
          fontWeight: 700,
          borderRadius: "7px",
          textTransform: "none",
          bgcolor: T.verifyBtn,
          boxShadow: "none",
          "&:hover": { bgcolor: T.verifyBtnHover, boxShadow: "none" },
        }}
      >
        Verify
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<RejectIcon sx={{ fontSize: "12px !important" }} />}
        sx={{
          height: 26,
          minWidth: 64,
          fontSize: "0.68rem",
          fontWeight: 600,
          borderRadius: "7px",
          textTransform: "none",
          borderColor: T.border,
          color: T.rejectBtn,
          "&:hover": { bgcolor: T.surfaceHover, borderColor: "#94A3B8" },
        }}
      >
        Reject
      </Button>
    </Stack>
  );
}

import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  autoVerifyNormalResults,
  verifyResult,
} from "@/src/store/slices/limsSlice";

// ─── Main component ───────────────────────────────────────────────────────────
export default function VerificationTab() {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const dispatch = useAppDispatch();
  const { results, samples } = useAppSelector((state) => state.lims);
  const [selected, setSelected] = React.useState<string[]>([]);

  // Function to map Redux results to the UI structure (simulated for now)
  // In a real app, you would query the data properly
  const displayRows = React.useMemo(() => {
    return results
      .filter((r) => r.status === "pending")
      .map((r) => {
        const s = samples.find((x) => x.id === r.sampleId);
        return {
          id: r.id,
          sampleId: r.sampleId,
          patient: s?.patient || "Unknown",
          analysis: r.analyte,
          result: r.result,
          unit: r.unit,
          refRange: `${r.refLow}–${r.refHigh}`,
          flag:
            r.flag === "NORMAL" ? "Normal" : r.flag === "HIGH" ? "High" : "Low",
          qcStatus: "1:2s pass", // Mock QC status
          enteredBy: r.analyst,
          status: "to_verify",
        };
      });
  }, [results, samples]);

  const handleAutoVerify = () => {
    dispatch(autoVerifyNormalResults({ verifiedBy: "System (Automation)" }));
  };

  const handleVerify = (id: string) => {
    dispatch(verifyResult({ resultId: id, verifiedBy: "Pathologist" }));
  };

  const toggle = (id: string) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const toggleAll = () =>
    setSelected((p) =>
      p.length === displayRows.length ? [] : displayRows.map((r) => r.id),
    );

  const criticalCount = displayRows.filter((r) =>
    r.flag.includes("Critical"),
  ).length;

  const normalResultsAvailable = displayRows.some((r) => r.flag === "Normal");

  const columns: CommonColumn<any>[] = [
    {
      field: "checked",
      headerName: "",
      width: 48,
      renderHeader: () => (
        <Checkbox
          size="small"
          checked={
            selected.length === displayRows.length && displayRows.length > 0
          }
          indeterminate={
            selected.length > 0 && selected.length < displayRows.length
          }
          onChange={toggleAll}
          sx={{
            p: 0.25,
            color: T.textMuted,
            "&.Mui-checked": { color: T.verifyBtn },
          }}
        />
      ),
      renderCell: (row) => (
        <Checkbox
          size="small"
          checked={selected.includes(row.id)}
          onChange={() => toggle(row.id)}
          onClick={(e) => e.stopPropagation()}
          sx={{
            p: 0.25,
            color: T.textMuted,
            "&.Mui-checked": { color: T.verifyBtn },
          }}
        />
      ),
    },
    {
      field: "sampleId",
      headerName: "Sample ID",
      width: 130,
      renderCell: (row) => (
        <Typography
          sx={{
            fontSize: "0.72rem",
            fontWeight: 600,
            color: T.verifyBtn,
            fontFamily: "monospace",
          }}
        >
          {row.sampleId}
        </Typography>
      ),
    },
    {
      field: "patient",
      headerName: "Patient",
      width: 160,
      renderCell: (row) => (
        <Typography
          sx={{ fontSize: "0.82rem", fontWeight: 700, color: T.textPrimary }}
        >
          {row.patient}
        </Typography>
      ),
    },
    {
      field: "analysis",
      headerName: "Analysis",
      width: 155,
      renderCell: (row) => (
        <Typography
          sx={{ fontSize: "0.78rem", fontWeight: 500, color: T.textSecondary }}
        >
          {row.analysis}
        </Typography>
      ),
    },
    {
      field: "result",
      headerName: "Result",
      width: 110,
      renderCell: (row) => <ResultCell row={row} />,
    },
    {
      field: "refRange",
      headerName: "Ref. Range",
      width: 110,
      renderCell: (row) => (
        <Typography
          sx={{
            fontSize: "0.72rem",
            color: T.textMuted,
            fontFamily: "monospace",
          }}
        >
          {row.refRange}
        </Typography>
      ),
    },
    {
      field: "flag",
      headerName: "Flag",
      width: 120,
      renderCell: (row) => <FlagBadge flag={row.flag} />,
    },
    {
      field: "qcStatus",
      headerName: "QC Status",
      width: 125,
      renderCell: (row) => <QcBadge status={row.qcStatus} />,
    },
    {
      field: "enteredBy",
      headerName: "Entered By",
      width: 155,
      renderCell: (row) => (
        <Typography
          sx={{ fontSize: "0.75rem", fontWeight: 500, color: T.textSecondary }}
        >
          {row.enteredBy}
        </Typography>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 175,
      align: "right",
      renderCell: (row) => <ActionCell row={row} onVerify={handleVerify} />,
    },
  ];

  return (
    <Stack spacing={2} sx={{}}>
      {/* ── Top bar ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          bgcolor: T.white,
          border: `1px solid ${T.border}`,
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "9px",
              bgcolor: "#EEF2FF",
              border: "1px solid #C7D2FE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ScienceIcon sx={{ fontSize: 17, color: T.verifyBtn }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: T.textPrimary,
              }}
            >
              Awaiting Verification
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mt: 0.3 }}
            >
              <Typography sx={{ fontSize: "0.72rem", color: T.textMuted }}>
                11 results pending
              </Typography>
              {criticalCount > 0 && (
                <>
                  <Box
                    sx={{
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      bgcolor: T.textMuted,
                    }}
                  />
                  <Stack direction="row" alignItems="center" spacing={0.4}>
                    <WarningIcon sx={{ fontSize: 12, color: T.criticalText }} />
                    <Typography
                      sx={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: T.criticalText,
                      }}
                    >
                      {criticalCount} critical
                    </Typography>
                  </Stack>
                </>
              )}
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            color="success"
            disabled={!normalResultsAvailable}
            onClick={handleAutoVerify}
            sx={{
              fontWeight: 700,
              fontSize: "0.78rem",
              textTransform: "none",
              borderRadius: "8px",
              height: 34,
              px: 2,
              borderColor: alpha(T.okText, 0.5),
              color: T.okText,
              "&:hover": { bgcolor: T.okBg, borderColor: T.okText },
            }}
          >
            Auto-Verify Normals
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<VerifyIcon sx={{ fontSize: 14 }} />}
            disabled={selected.length === 0}
            onClick={() => {
              selected.forEach(handleVerify);
              setSelected([]);
            }}
            sx={{
              bgcolor: T.verifyBtn,
              fontWeight: 700,
              fontSize: "0.78rem",
              textTransform: "none",
              borderRadius: "8px",
              height: 34,
              px: 2,
              boxShadow: "none",
              "&:hover": { bgcolor: T.verifyBtnHover, boxShadow: "none" },
            }}
          >
            Verify Selected{selected.length > 0 ? ` (${selected.length})` : ""}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RejectIcon sx={{ fontSize: 14 }} />}
            disabled={selected.length === 0}
            sx={{
              fontWeight: 600,
              fontSize: "0.78rem",
              textTransform: "none",
              borderRadius: "8px",
              height: 34,
              px: 2,
              borderColor: T.border,
              color: T.rejectBtn,
              "&:hover": { bgcolor: T.surfaceHover, borderColor: "#94A3B8" },
              "&.Mui-disabled": { color: T.textMuted, borderColor: T.border },
            }}
          >
            Bulk Reject
          </Button>
        </Stack>
      </Box>

      {/* ── Data grid ── */}

      <CommonDataGrid
        rows={displayRows}
        columns={columns}
        getRowId={(row) => row.id}
        hideToolbar
      />
    </Stack>
  );
}
