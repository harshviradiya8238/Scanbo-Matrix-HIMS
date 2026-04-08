"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Chip,
  Alert,
  Menu,
  MenuItem,
  IconButton,
} from "@/src/ui/components/atoms";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Save as SaveIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  FiberManualRecord as ActiveDotIcon,
  NotificationsActive as NotifIcon,
  FlashOn as StatIcon,
  Biotech as BiotechIcon,
  LocalHospital as HospitalIcon,
  Science as ScienceIcon,
  Person as PersonIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";
import { useLabTheme } from "../../../lab-theme";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  addResults,
  appendAudit,
  updateSampleStatus,
  addTestToSample,
  removeTestFromSample,
} from "@/src/store/slices/limsSlice";
import type { LabResultRow } from "../../../lab-types";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  criticalText: "#9F1239",
  criticalBg: "#FFF1F2",
  criticalBorder: "#FECDD3",
  criticalField: "#FFF1F2",
  criticalFieldBorder: "#FDA4AF",
  abnText: "#92400E",
  abnBg: "#FFFBEB",
  abnBorder: "#FDE68A",
  abnField: "#FFFBEB",
  abnFieldBorder: "#FCD34D",
  okText: "#0F766E",
  okBg: "#F0FDFA",
  okBorder: "#99F6E4",
  doneColor: "#0F766E",
  doneBg: "#F0FDFA",
  doneBorder: "#2DD4BF",
  activeColor: "#4338CA",
  activeBg: "#EEF2FF",
  activeBorder: "#818CF8",
  alertText: "#7C2D12",
  alertBg: "#FFF7ED",
  alertBorder: "#FED7AA",
  border: "#E2E8F0",
  surface: "#F8FAFC",
  surfaceHover: "#F1F5F9",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  white: "#FFFFFF",
  primaryBtn: "#1172BA",
};

const labelSx = {
  fontSize: "0.63rem",
  fontWeight: 700,
  color: T.textMuted,
  textTransform: "uppercase" as const,
  letterSpacing: "0.07em",
};

const PROGRESS_STEPS = [
  { id: "registered", label: "Registered" },
  { id: "received", label: "Received" },
  { id: "in_analysis", label: "In Analysis" },
  { id: "to_verify", label: "To Verify" },
  { id: "verified", label: "Verified" },
  { id: "published", label: "Published" },
];

const STATUS_TO_STEP: Record<string, number> = {
  registered: 0,
  received: 1,
  assigned: 2,
  analysed: 3,
  verified: 4,
  published: 5,
};

type FlagType = "Critical H" | "Critical L" | "High" | "Low" | "Normal";

interface Parameter {
  analysis: string;
  keyword: string;
  method: string;
  result: string;
  unit: string;
  refRange: string;
  flag: FlagType;
  status: string;
  isFormula?: boolean;
  testCode: string;
}

// ─── Per-test default parameters ──────────────────────────────────────────────
const TEST_PARAMETERS: Record<string, Parameter[]> = {
  CBC: [
    {
      analysis: "Haemoglobin",
      keyword: "HGB",
      method: "Cyanmet",
      result: "",
      unit: "g/dL",
      refRange: "13.0–17.0",
      flag: "Normal",
      status: "Draft",
      testCode: "CBC",
    },
    {
      analysis: "WBC Count",
      keyword: "WBC",
      method: "Impedance",
      result: "",
      unit: "×10³/µL",
      refRange: "4.0–10.0",
      flag: "Normal",
      status: "Draft",
      testCode: "CBC",
    },
    {
      analysis: "Platelets",
      keyword: "PLT",
      method: "Impedance",
      result: "",
      unit: "×10³/µL",
      refRange: "150–400",
      flag: "Normal",
      status: "Draft",
      testCode: "CBC",
    },
  ],
  CMP: [
    {
      analysis: "Sodium (Na⁺)",
      keyword: "NA",
      method: "ISE",
      result: "",
      unit: "mEq/L",
      refRange: "136–145",
      flag: "Normal",
      status: "Draft",
      testCode: "CMP",
    },
    {
      analysis: "Potassium (K⁺)",
      keyword: "K",
      method: "ISE",
      result: "",
      unit: "mEq/L",
      refRange: "3.5–5.0",
      flag: "Normal",
      status: "Draft",
      testCode: "CMP",
    },
    {
      analysis: "Chloride (Cl⁻)",
      keyword: "CL",
      method: "ISE",
      result: "",
      unit: "mEq/L",
      refRange: "98–107",
      flag: "Normal",
      status: "Draft",
      testCode: "CMP",
    },
    {
      analysis: "Creatinine",
      keyword: "CREAT",
      method: "Enzymatic",
      result: "",
      unit: "mg/dL",
      refRange: "0.6–1.2",
      flag: "Normal",
      status: "Draft",
      testCode: "CMP",
    },
  ],
  Troponin: [
    {
      analysis: "Troponin I (hsTnI)",
      keyword: "TROPI",
      method: "Chemiluminescence",
      result: "",
      unit: "ng/L",
      refRange: "0–52",
      flag: "Normal",
      status: "Draft",
      testCode: "Troponin",
    },
  ],
  CRP: [
    {
      analysis: "C-Reactive Protein",
      keyword: "CRP",
      method: "Immunoturbidimetry",
      result: "",
      unit: "mg/L",
      refRange: "0–5",
      flag: "Normal",
      status: "Draft",
      testCode: "CRP",
    },
  ],
  PCT: [
    {
      analysis: "Procalcitonin",
      keyword: "PCT",
      method: "ECLIA",
      result: "",
      unit: "ng/mL",
      refRange: "0–0.5",
      flag: "Normal",
      status: "Draft",
      testCode: "PCT",
    },
  ],
  LFT: [
    {
      analysis: "ALT (SGPT)",
      keyword: "ALT",
      method: "Enzymatic",
      result: "",
      unit: "U/L",
      refRange: "0–40",
      flag: "Normal",
      status: "Draft",
      testCode: "LFT",
    },
    {
      analysis: "AST (SGOT)",
      keyword: "AST",
      method: "Enzymatic",
      result: "",
      unit: "U/L",
      refRange: "0–40",
      flag: "Normal",
      status: "Draft",
      testCode: "LFT",
    },
    {
      analysis: "Total Bilirubin",
      keyword: "TBIL",
      method: "Colorimetric",
      result: "",
      unit: "mg/dL",
      refRange: "0.2–1.2",
      flag: "Normal",
      status: "Draft",
      testCode: "LFT",
    },
  ],
  HBA1C: [
    {
      analysis: "HbA1c",
      keyword: "HBA1C",
      method: "HPLC",
      result: "",
      unit: "%",
      refRange: "4.0–5.6",
      flag: "Normal",
      status: "Draft",
      testCode: "HBA1C",
    },
  ],
  GLU: [
    {
      analysis: "Fasting Glucose",
      keyword: "GLU",
      method: "Enzymatic (GOD)",
      result: "",
      unit: "mg/dL",
      refRange: "70–100",
      flag: "Normal",
      status: "Draft",
      testCode: "GLU",
    },
  ],
  INSULIN: [
    {
      analysis: "Fasting Insulin",
      keyword: "INSUL",
      method: "Chemiluminescence",
      result: "",
      unit: "µIU/mL",
      refRange: "2–25",
      flag: "Normal",
      status: "Draft",
      testCode: "INSULIN",
    },
  ],
  UA: [
    {
      analysis: "Glucose (Urine)",
      keyword: "UGLU",
      method: "Dipstick",
      result: "",
      unit: "",
      refRange: "Negative",
      flag: "Normal",
      status: "Draft",
      testCode: "UA",
    },
    {
      analysis: "Protein (Urine)",
      keyword: "UPROT",
      method: "Dipstick",
      result: "",
      unit: "",
      refRange: "Negative",
      flag: "Normal",
      status: "Draft",
      testCode: "UA",
    },
    {
      analysis: "Ketones",
      keyword: "UKET",
      method: "Dipstick",
      result: "",
      unit: "",
      refRange: "Negative",
      flag: "Normal",
      status: "Draft",
      testCode: "UA",
    },
  ],
  RFT: [
    {
      analysis: "Urea",
      keyword: "UREA",
      method: "Enzymatic",
      result: "",
      unit: "mg/dL",
      refRange: "15–40",
      flag: "Normal",
      status: "Draft",
      testCode: "RFT",
    },
    {
      analysis: "Creatinine",
      keyword: "CREAT",
      method: "Jaffe",
      result: "",
      unit: "mg/dL",
      refRange: "0.6–1.2",
      flag: "Normal",
      status: "Draft",
      testCode: "RFT",
    },
    {
      analysis: "eGFR",
      keyword: "EGFR",
      method: "Calculated",
      result: "",
      unit: "mL/min/1.73m²",
      refRange: ">60",
      flag: "Normal",
      status: "Draft",
      testCode: "RFT",
      isFormula: true,
    },
  ],
  THYROID: [
    {
      analysis: "TSH",
      keyword: "TSH",
      method: "ECLIA",
      result: "",
      unit: "µIU/mL",
      refRange: "0.45–4.5",
      flag: "Normal",
      status: "Draft",
      testCode: "THYROID",
    },
    {
      analysis: "Free T4 (FT4)",
      keyword: "FT4",
      method: "ECLIA",
      result: "",
      unit: "ng/dL",
      refRange: "0.82–1.77",
      flag: "Normal",
      status: "Draft",
      testCode: "THYROID",
    },
    {
      analysis: "Free T3 (FT3)",
      keyword: "FT3",
      method: "ECLIA",
      result: "",
      unit: "pg/mL",
      refRange: "2.0–4.4",
      flag: "Normal",
      status: "Draft",
      testCode: "THYROID",
    },
  ],
};

function inferFlag(keyword: string, value: string): FlagType {
  const v = parseFloat(value);
  if (isNaN(v)) return "Normal";
  const ranges: Record<string, [number, number]> = {
    HGB: [13.0, 17.5],
    WBC: [4.0, 10.0],
    PLT: [150, 400],
    NA: [136, 145],
    K: [3.5, 5.0],
    CL: [98, 107],
    CREAT: [0.6, 1.2],
    TROPI: [0, 52],
    CRP: [0, 5],
    PCT: [0, 0.5],
    ALT: [0, 40],
    AST: [0, 40],
    TBIL: [0.2, 1.2],
    HBA1C: [4.0, 5.6],
    GLU: [70, 100],
    INSUL: [2, 25],
    UREA: [15, 40],
    EGFR: [60, 999],
    TSH: [0.45, 4.5],
    FT4: [0.82, 1.77],
    FT3: [2.0, 4.4],
  };
  const r = ranges[keyword];
  if (!r) return "Normal";
  if (v < r[0] * 0.7 || v > r[1] * 1.5)
    return keyword === "K" && v > 6.0
      ? "Critical H"
      : v < r[0] * 0.5
        ? "Critical L"
        : "High";
  if (v < r[0]) return "Low";
  if (v > r[1]) return "High";
  return "Normal";
}

function getFlagTokens(flag: FlagType) {
  if (flag === "Critical H" || flag === "Critical L")
    return {
      text: T.criticalText,
      bg: T.criticalBg,
      border: T.criticalBorder,
      fieldBg: T.criticalField,
      fieldBorder: T.criticalFieldBorder,
    };
  if (flag === "High" || flag === "Low")
    return {
      text: T.abnText,
      bg: T.abnBg,
      border: T.abnBorder,
      fieldBg: T.abnField,
      fieldBorder: T.abnFieldBorder,
    };
  return {
    text: T.okText,
    bg: T.okBg,
    border: T.okBorder,
    fieldBg: T.white,
    fieldBorder: T.border,
  };
}

function FlagBadge({ flag }: { flag: FlagType }) {
  const f = getFlagTokens(flag);
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.3,
        bgcolor: f.bg,
        color: f.text,
        border: `1px solid ${f.border}`,
        borderRadius: "6px",
      }}
    >
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: f.text,
          flexShrink: 0,
        }}
      />
      <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, lineHeight: 1 }}>
        {flag}
      </Typography>
    </Box>
  );
}

function ProgressStepper({ activeStep }: { activeStep: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", px: 3, py: 2 }}>
      {PROGRESS_STEPS.map((step, i) => {
        const done = i < activeStep;
        const active = i === activeStep;
        return (
          <React.Fragment key={step.id}>
            <Stack alignItems="center" spacing={0.75} sx={{ minWidth: 64 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                  bgcolor: done ? T.doneBg : active ? T.activeBg : T.surface,
                  border: `2px solid ${done ? T.doneBorder : active ? T.activeBorder : T.border}`,
                  transition: "all 0.2s",
                }}
              >
                {done && (
                  <CheckCircleIcon sx={{ fontSize: 15, color: T.doneColor }} />
                )}
                {active && (
                  <ActiveDotIcon sx={{ fontSize: 10, color: T.activeColor }} />
                )}
                {!done && !active && (
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: T.border,
                    }}
                  />
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: active ? 700 : 600,
                  textAlign: "center",
                  color: done
                    ? T.doneColor
                    : active
                      ? T.activeColor
                      : T.textMuted,
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </Typography>
            </Stack>
            {i < PROGRESS_STEPS.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  alignSelf: "flex-start",
                  mt: "14px",
                  bgcolor: done ? T.doneBorder : T.border,
                  transition: "background 0.3s",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

// ─── Helper to parse ward info from notes ────────────────────────────────────
function parseNote(notes?: string) {
  if (!notes) return { ward: "—", bed: "—", consultant: "—", dx: "—" };
  return {
    ward:
      notes.match(/Ward ([^,|]+)/)?.[1]?.trim() ??
      notes.match(/WARD-(\w+)/)?.[1]?.replace(/-/g, " ") ??
      notes.split("|")[0]?.trim() ??
      "—",
    bed: notes.match(/Bed ([^\s|,]+)/)?.[1]?.trim() ?? "—",
    consultant: notes.match(/Consultant:\s*([^|]+)/)?.[1]?.trim() ?? "—",
    dx: notes.match(/Dx:\s*([^|]+)/)?.[1]?.trim() ?? "—",
  };
}

// ─── Default fallback sample (when no sampleId provided — existing demo) ─────
const FALLBACK_PARAMS: Parameter[] = [
  {
    analysis: "Haemoglobin",
    keyword: "HGB",
    method: "Cyanmet",
    result: "10.2",
    unit: "g/dL",
    refRange: "13.0–17.0",
    flag: "Low",
    status: "Draft",
    testCode: "CBC",
  },
  {
    analysis: "WBC Count",
    keyword: "WBC",
    method: "Impedance",
    result: "12.4",
    unit: "×10³/µL",
    refRange: "4.0–10.0",
    flag: "High",
    status: "Draft",
    testCode: "CBC",
  },
  {
    analysis: "Sodium (Na⁺)",
    keyword: "NA",
    method: "ISE",
    result: "142",
    unit: "mEq/L",
    refRange: "135–145",
    flag: "Normal",
    status: "Draft",
    testCode: "CMP",
  },
  {
    analysis: "Potassium (K⁺)",
    keyword: "K",
    method: "ISE",
    result: "4.5",
    unit: "mEq/L",
    refRange: "3.5–5.0",
    flag: "Normal",
    status: "Draft",
    testCode: "CMP",
  },
  {
    analysis: "Chloride (Cl⁻)",
    keyword: "CL",
    method: "ISE",
    result: "101",
    unit: "mEq/L",
    refRange: "98–107",
    flag: "Normal",
    status: "Draft",
    testCode: "CMP",
  },
  {
    analysis: "Anion Gap",
    keyword: "AG",
    method: "Calculated",
    result: "36.5",
    unit: "mEq/L",
    refRange: "8–16",
    flag: "High",
    status: "Draft",
    testCode: "CMP",
    isFormula: true,
  },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function ResultEntryTab({ sampleId }: { sampleId?: string }) {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const dispatch = useAppDispatch();
  const {
    samples,
    results,
    tests: testCatalog,
  } = useAppSelector((s) => s.lims);
  const router = useRouter();

  const switchableSamples = samples.filter((s) => s.status !== "published");

  const handleSwitchSample = (newId: string) => {
    router.push(`/lab/analysis-results?sampleId=${newId}&tab=entry`);
  };

  // Find the actual sample from Redux
  const sample = sampleId ? samples.find((s) => s.id === sampleId) : null;

  // Build parameter rows from the sample's tests
  const initialParams = React.useMemo<Parameter[]>(() => {
    if (!sample) return FALLBACK_PARAMS;
    // For each test code on the sample, look up existing results or use defaults
    const rows: Parameter[] = [];
    sample.tests.forEach((testCode) => {
      const templateRows = TEST_PARAMETERS[testCode] ?? [];
      templateRows.forEach((tmpl) => {
        // Check if we already have a result in Redux for this analyte
        const existing = results.find(
          (r) => r.sampleId === sample.id && r.analyte === tmpl.analysis,
        );
        const resultVal = existing?.result ?? "";
        const flag = resultVal ? inferFlag(tmpl.keyword, resultVal) : tmpl.flag;
        rows.push({
          ...tmpl,
          result: resultVal,
          flag,
          status: existing ? "Entered" : "Draft",
        });
      });
    });
    // If no template found, show a generic entry row for each test
    if (rows.length === 0) {
      sample.tests.forEach((tc) => {
        rows.push({
          analysis: tc,
          keyword: tc,
          method: "Manual",
          result: "",
          unit: "",
          refRange: "—",
          flag: "Normal",
          status: "Draft",
          testCode: tc,
        });
      });
    }
    return rows;
  }, [sample, results]);

  const [params, setParams] = React.useState<Parameter[]>(initialParams);
  const [saved, setSaved] = React.useState(false);
  const [addMenuAnchor, setAddMenuAnchor] = React.useState<null | HTMLElement>(
    null,
  );

  const handleAddPanel = (panelCode: string) => {
    setAddMenuAnchor(null);
    if (sample) {
      dispatch(addTestToSample({ sampleId: sample.id, testCode: panelCode }));
    } else {
      const templateRows = TEST_PARAMETERS[panelCode] ?? [];
      setParams((prev) => {
        const existingKeywords = new Set(prev.map((p) => p.keyword));
        const newRows = templateRows.filter(
          (r) => !existingKeywords.has(r.keyword),
        );
        return [...prev, ...newRows];
      });
    }
  };

  const handleRemovePanel = (panelCode: string) => {
    if (
      window.confirm(
        `Are you sure you want to remove the ${panelCode} panel and its results?`,
      )
    ) {
      if (sample) {
        dispatch(
          removeTestFromSample({ sampleId: sample.id, testCode: panelCode }),
        );
      } else {
        setParams((prev) => prev.filter((p) => p.testCode !== panelCode));
      }
    }
  };

  // Re-initialise if sample changes
  React.useEffect(() => {
    setParams(initialParams);
    setSaved(false);
  }, [sampleId, initialParams]);

  const handleResultChange = (keyword: string, val: string) => {
    setParams((prev) =>
      prev.map((p) => {
        if (p.keyword !== keyword) return p;
        const flag = inferFlag(keyword, val);
        return { ...p, result: val, flag };
      }),
    );
  };

  const handleSaveDraft = () => {
    setSaved(true);
    // In real app: persist draft
  };

  const handleSubmit = () => {
    if (!sample) return;
    const ts = new Date().toISOString().slice(0, 16).replace("T", " ");
    const rows: LabResultRow[] = params
      .filter((p) => p.result !== "")
      .map((p, i) => ({
        id: `R-${sample.id}-${p.keyword}-${i}`,
        sampleId: sample.id,
        test: p.testCode,
        analyte: p.analysis,
        result: p.result,
        unit: p.unit,
        refLow: "",
        refHigh: "",
        flag:
          p.flag === "High" || p.flag === "Critical H"
            ? "HIGH"
            : p.flag === "Low" || p.flag === "Critical L"
              ? "LOW"
              : "NORMAL",
        status: "pending",
        analyst: sample.analyst ?? "Lab Tech",
        enteredAt: ts,
        verifiedBy: null,
      }));
    if (rows.length > 0) {
      dispatch(addResults(rows));
      dispatch(updateSampleStatus({ sampleId: sample.id, status: "analysed" }));
      dispatch(
        appendAudit({
          ts,
          event: `Results submitted for ${sample.id} (${rows.length} analytes)`,
          user: sample.analyst ?? "Lab Tech",
          sampleId: sample.id,
        }),
      );
      setSaved(true);
    }
  };

  const activeStep = sample ? (STATUS_TO_STEP[sample.status] ?? 2) : 2;
  const { ward, bed, consultant, dx } = sample
    ? parseNote(sample.notes)
    : { ward: "—", bed: "—", consultant: "—", dx: "—" };
  const hasCritical = params.some(
    (p) => p.flag === "Critical H" || p.flag === "Critical L",
  );
  const isStat = sample?.priority === "STAT" || sample?.priority === "URGENT";
  const testLabel = sample?.tests.join(" + ") ?? "CBC + Electrolytes";

  return (
    <Stack spacing={2}>
      {/* ── Alert banner ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: T.alertBg,
          border: `1px solid ${T.alertBorder}`,
          borderRadius: "10px",
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "7px",
            flexShrink: 0,
            bgcolor: "#FEE2CC",
            border: `1px solid ${T.alertBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NotifIcon sx={{ fontSize: 15, color: T.alertText }} />
        </Box>
        <Typography
          sx={{ fontSize: "0.8rem", fontWeight: 600, color: T.alertText }}
        >
          {sample ? (
            <>
              IPD order for{" "}
              <Box component="span" sx={{ fontWeight: 800 }}>
                {sample.patient}
              </Box>{" "}
              — Ward {ward}, Bed {bed} · Consultant: {consultant}
            </>
          ) : (
            <>
              7 samples pending result entry —{" "}
              <Box component="span" sx={{ fontWeight: 800 }}>
                2 are STAT, enter immediately.
              </Box>
            </>
          )}
        </Typography>
      </Box>

      {/* ── Patient info strip (shown only for IPD orders) ── */}
      {sample && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            px: 2,
            py: 1.5,
            bgcolor: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: "12px",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              icon: <PersonIcon sx={{ fontSize: 14, color: T.activeColor }} />,
              label: "Patient",
              value: sample.patient,
            },
            {
              icon: <HospitalIcon sx={{ fontSize: 14, color: "#ef4444" }} />,
              label: "Ward / Bed",
              value: `${ward} · ${bed}`,
            },
            {
              icon: <ScienceIcon sx={{ fontSize: 14, color: T.okText }} />,
              label: "Sample Type",
              value: sample.type,
            },
            {
              icon: <BiotechIcon sx={{ fontSize: 14, color: T.abnText }} />,
              label: "Diagnosis",
              value: dx,
            },
            {
              icon: <PersonIcon sx={{ fontSize: 14, color: T.textMuted }} />,
              label: "Consulting Dr.",
              value: consultant,
            },
          ].map((item) => (
            <Box key={item.label} sx={{ minWidth: 140 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ mb: 0.25 }}
              >
                {item.icon}
                <Typography
                  sx={{
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    color: T.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  {item.label}
                </Typography>
              </Stack>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: T.textPrimary,
                }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* ── Main result entry card ── */}
      <Box
        sx={{
          bgcolor: T.white,
          border: `1px solid ${T.border}`,
          borderRadius: "14px",
          boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Card header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            bgcolor: T.surface,
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "9px",
                bgcolor: T.activeBg,
                border: `1px solid ${T.activeBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BiotechIcon sx={{ fontSize: 17, color: T.activeColor }} />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 800,
                    color: T.textPrimary,
                  }}
                >
                  {sample?.id ?? "LAB-2025-5021"}
                </Typography>
                <Box
                  sx={{
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    bgcolor: T.textMuted,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: T.textSecondary,
                  }}
                >
                  {sample?.patient ?? "Priya Mehta"}
                </Typography>
              </Stack>
              <Typography
                sx={{ fontSize: "0.72rem", color: T.textMuted, mt: 0.2 }}
              >
                {testLabel}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {isStat && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1.25,
                  py: 0.4,
                  bgcolor: T.criticalBg,
                  border: `1px solid ${T.criticalBorder}`,
                  borderRadius: "7px",
                }}
              >
                <StatIcon sx={{ fontSize: 12, color: T.criticalText }} />
                <Typography
                  sx={{
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    color: T.criticalText,
                  }}
                >
                  {sample?.priority ?? "STAT"}
                </Typography>
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.25,
                py: 0.4,
                bgcolor: T.activeBg,
                border: `1px solid ${T.activeBorder}`,
                borderRadius: "7px",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: T.activeColor,
                }}
              >
                {sample?.analyst ?? "Sysmex XN-1000"}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={(e) => setAddMenuAnchor(e.currentTarget)}
              sx={{
                fontSize: "0.75rem",
                textTransform: "none",
                borderRadius: "8px",
                borderColor: T.activeBorder,
                color: T.activeColor,
                height: 32,
              }}
            >
              Add Test
            </Button>
            <Menu
              anchorEl={addMenuAnchor}
              open={Boolean(addMenuAnchor)}
              onClose={() => setAddMenuAnchor(null)}
              PaperProps={{
                sx: {
                  mt: 1,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  borderRadius: "10px",
                },
              }}
            >
              {Object.keys(TEST_PARAMETERS).map((code) => (
                <MenuItem
                  key={code}
                  onClick={() => handleAddPanel(code)}
                  sx={{ fontSize: "0.85rem", py: 1, px: 2 }}
                >
                  {code} Panel
                </MenuItem>
              ))}
            </Menu>

            <Box sx={{ width: 1.5, height: 24, bgcolor: T.border, mx: 0.5 }} />

            <TextField
              select
              size="small"
              value={sampleId ?? ""}
              onChange={(e) => handleSwitchSample(e.target.value)}
              sx={{
                width: 250,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  bgcolor: T.white,
                  height: 32,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                },
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: (v: any) => {
                  if (!v) return "Switch Sample...";
                  const s = samples.find((x) => x.id === v);
                  return s ? `${s.id} — ${s.patient}` : v;
                },
              }}
            >
              {switchableSamples.map((s) => (
                <MenuItem
                  key={s.id}
                  value={s.id}
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderBottom: `1px solid ${alpha(T.border, 0.5)}`,
                    "&:last-child": { borderBottom: 0 },
                  }}
                >
                  <Box>
                    <Typography
                      sx={{ fontSize: "0.82rem", fontWeight: 700, mb: 0.2 }}
                    >
                      {s.id}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        sx={{ fontSize: "0.7rem", color: T.textSecondary }}
                      >
                        {s.patient}
                      </Typography>
                      <Chip
                        label={s.status}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: "0.55rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      />
                    </Stack>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        {/* Progress stepper */}
        <Box sx={{ borderBottom: `1px solid ${T.border}` }}>
          <ProgressStepper activeStep={activeStep} />
        </Box>

        {/* Results table */}
        <Box sx={{ px: 1.5, py: 1 }}>
          <TableContainer>
            <Table
              size="small"
              sx={{ borderCollapse: "separate", borderSpacing: "0 3px" }}
            >
              <TableHead>
                <TableRow>
                  {[
                    "Analysis",
                    "Keyword",
                    "Method",
                    "Result",
                    "Unit",
                    "Ref Range",
                    "Flag",
                    "Status",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        ...labelSx,
                        py: 1.5,
                        border: "none",
                        bgcolor: T.surface,
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(
                  params.reduce(
                    (acc, p) => {
                      const group = p.testCode || "Other";
                      if (!acc[group]) acc[group] = [];
                      acc[group].push(p);
                      return acc;
                    },
                    {} as Record<string, Parameter[]>,
                  ),
                ).map(([group, groupParams]) => (
                  <React.Fragment key={group}>
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        sx={{
                          py: 0.5,
                          px: 2,
                          bgcolor: alpha(T.activeBg, 0.4),
                          borderBottom: `1px solid ${T.activeBorder} !important`,
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              fontWeight: 800,
                              color: T.activeColor,
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            {group} Panel
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleRemovePanel(group)}
                            sx={{
                              color: T.criticalText,
                              "&:hover": { bgcolor: alpha(T.criticalBg, 0.6) },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    {groupParams.map((param, i) => {
                      const f = getFlagTokens(param.flag);
                      const isCritical = param.flag.includes("Critical");
                      const isAbn =
                        param.flag === "High" || param.flag === "Low";
                      return (
                        <TableRow
                          key={param.keyword + i}
                          sx={{
                            bgcolor: isCritical
                              ? alpha(T.criticalBg, 0.5)
                              : T.white,
                            "& td": {
                              border: "none",
                              py: 0.8,
                              borderBottom: `1px solid ${T.border} !important`,
                            },
                            "& td:first-of-type": {
                              borderLeft: `2px solid ${isCritical ? T.criticalText : isAbn ? T.abnFieldBorder : "transparent"} !important`,
                            },
                          }}
                        >
                          <TableCell>
                            <Typography
                              sx={{ fontSize: "0.82rem", fontWeight: 700 }}
                            >
                              {param.analysis}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{ fontSize: "0.72rem", color: T.activeColor }}
                            >
                              {param.keyword}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{ fontSize: "0.75rem", color: T.textMuted }}
                            >
                              {param.method}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={param.result}
                              disabled={param.isFormula}
                              onChange={(e) =>
                                handleResultChange(
                                  param.keyword,
                                  e.target.value,
                                )
                              }
                              placeholder="0.00"
                              sx={{
                                width: 90,
                                "& .MuiOutlinedInput-root": {
                                  height: 28,
                                  fontSize: "0.8rem",
                                  fontWeight: 700,
                                  bgcolor: param.isFormula
                                    ? T.surface
                                    : f.fieldBg,
                                  color: f.text,
                                  "& fieldset": { borderColor: f.fieldBorder },
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 500 }}
                            >
                              {param.unit}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              sx={{ color: T.textSecondary }}
                            >
                              {param.refRange}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <FlagBadge flag={param.flag} />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={param.status}
                              sx={{
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                bgcolor:
                                  param.status === "Entered"
                                    ? T.okBg
                                    : T.activeBg,
                                color:
                                  param.status === "Entered"
                                    ? T.okText
                                    : T.activeColor,
                                borderRadius: "5px",
                                height: 20,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderTop: `1px solid ${T.border}`,
            bgcolor: T.surface,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {hasCritical && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.75,
                bgcolor: alpha(T.criticalBg, 0.7),
                border: `1px solid ${T.criticalBorder}`,
                borderRadius: "8px",
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": { opacity: 1 },
                  "50%": { opacity: 0.7 },
                  "100%": { opacity: 1 },
                },
              }}
            >
              <NotifIcon sx={{ fontSize: 13, color: T.criticalText }} />
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: T.criticalText,
                }}
              >
                Critical value detected — physician notification triggered
              </Typography>
            </Box>
          )}
          {saved && !hasCritical && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.75,
                bgcolor: T.okBg,
                border: `1px solid ${T.okBorder}`,
                borderRadius: "8px",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 14, color: T.okText }} />
              <Typography
                sx={{ fontSize: "0.72rem", fontWeight: 600, color: T.okText }}
              >
                Results submitted — sample moved to Analysis stage
              </Typography>
            </Box>
          )}
          <Box sx={{ ml: "auto" }}>
            <Stack direction="row" spacing={1.25}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SaveIcon sx={{ fontSize: 15 }} />}
                onClick={handleSaveDraft}
                sx={{ fontSize: "0.78rem", textTransform: "none" }}
              >
                Save Draft
              </Button>
              <Button
                variant="contained"
                size="small"
                endIcon={<SendIcon sx={{ fontSize: 15 }} />}
                onClick={handleSubmit}
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textTransform: "none",
                  bgcolor: T.primaryBtn,
                }}
              >
                Submit
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}
