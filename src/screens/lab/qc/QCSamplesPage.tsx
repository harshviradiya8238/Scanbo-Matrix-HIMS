"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  TextField,
  Divider,
} from "@/src/ui/components/atoms";
import { useTheme, alpha } from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  TrendingUp as ChartIcon,
} from "@mui/icons-material";
import PageTemplate from "@/src/ui/components/PageTemplate";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import CommonDialog from "@/src/ui/components/molecules/CommonDialog";

const T = {
  border: "#E2E8F0",
  surface: "#F8FAFC",
  surfaceHover: "#F1F5F9",
  white: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  // Status Colors
  okText: "#0F766E",
  okBg: "#F0FDFA",
  okBorder: "#99F6E4",

  failText: "#9F1239",
  failBg: "#FFF1F2",
  failBorder: "#FECDD3",

  warningText: "#92400E",
  warningBg: "#FFFBEB",
  warningBorder: "#FDE68A",

  // Level Colors
  level1Text: "#1172BA",
  level1Bg: "#EEF2FF",
  level1Border: "#C7D2FE",

  level2Text: "#92400E",
  level2Bg: "#FFFBEB",
  level2Border: "#FDE68A",

  level3Text: "#5B21B6",
  level3Bg: "#F5F3FF",
  level3Border: "#DDD6FE",
};

interface QCSample {
  id: string;
  material: string;
  level: "Level 1" | "Level 2" | "Level 3";
  instrument: string;
  analysis: string;
  expected: string;
  observed: string;
  westgard: string;
  westgardStatus: "pass" | "fail" | "warning";
  result: "Pass" | "Fail" | "Warning";
}

const MOCK_QC: QCSample[] = [
  {
    id: "QC-B-221",
    material: "Seronorm L1",
    level: "Level 1",
    instrument: "Cobas 6000",
    analysis: "Glucose",
    expected: "95.0",
    observed: "96.2",
    westgard: "1₂ₛ",
    westgardStatus: "pass",
    result: "Pass",
  },
  {
    id: "QC-B-222",
    material: "Seronorm L2",
    level: "Level 2",
    instrument: "Cobas 6000",
    analysis: "Glucose",
    expected: "185.0",
    observed: "220.4",
    westgard: "1₃ₛ",
    westgardStatus: "fail",
    result: "Fail",
  },
  {
    id: "QC-H-080",
    material: "XN-Check L1",
    level: "Level 1",
    instrument: "Sysmex XN",
    analysis: "WBC",
    expected: "6.0",
    observed: "5.9",
    westgard: "1₂ₛ",
    westgardStatus: "pass",
    result: "Pass",
  },
  {
    id: "QC-H-081",
    material: "XN-Check L2",
    level: "Level 2",
    instrument: "Sysmex XN",
    analysis: "HGB",
    expected: "14.5",
    observed: "14.2",
    westgard: "2₂ₛ",
    westgardStatus: "warning",
    result: "Warning",
  },
];

export default function QCSamplesPage() {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeView, setActiveView] = React.useState<"list" | "visual">("list");

  const TREND_DATA = [
    { date: "01 Mar", value: 95.2, status: "pass" },
    { date: "02 Mar", value: 94.8, status: "pass" },
    { date: "03 Mar", value: 96.1, status: "pass" },
    { date: "04 Mar", value: 95.5, status: "pass" },
    { date: "05 Mar", value: 97.8, status: "pass" },
    { date: "06 Mar", value: 99.2, status: "warning" }, // >2SD
    { date: "07 Mar", value: 96.4, status: "pass" },
    { date: "08 Mar", value: 95.1, status: "pass" },
    { date: "09 Mar", value: 94.2, status: "pass" },
    { date: "10 Mar", value: 93.8, status: "pass" },
    { date: "11 Mar", value: 92.1, status: "warning" }, // <2SD
    { date: "12 Mar", value: 95.4, status: "pass" },
    { date: "13 Mar", value: 96.2, status: "pass" },
    { date: "14 Mar", value: 101.4, status: "fail" }, // >3SD
    { date: "15 Mar", value: 95.8, status: "pass" },
  ];

  const MEAN = 95.0;
  const SD = 2.0;

  const getYSize = (val: number) => {
    // Range: Mean +/- 4SD (8 SD total)
    // Map val to percentage of height (0 to 100)
    const min = MEAN - 4 * SD;
    const max = MEAN + 4 * SD;
    const percent = ((val - min) / (max - min)) * 100;
    return 100 - percent; // SVG Y is top-down
  };

  const getStatusColor = (status: QCSample["result"]) => {
    switch (status) {
      case "Pass":
        return "#16a34a";
      case "Fail":
        return "#dc2626";
      case "Warning":
        return "#ea580c";
      default:
        return "#64748b";
    }
  };

  const columns: CommonColumn<QCSample>[] = [
    {
      headerName: "QC ID",
      field: "id",
      width: 120,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {row.id}
        </Typography>
      ),
    },
    {
      headerName: "MATERIAL",
      field: "material",
      width: 150,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.material}
        </Typography>
      ),
    },
    {
      headerName: "LEVEL",
      field: "level",
      width: 120,
      renderCell: (row) => {
        const c =
          row.level === "Level 1"
            ? { text: T.level1Text, bg: T.level1Bg, border: T.level1Border }
            : row.level === "Level 2"
              ? { text: T.level2Text, bg: T.level2Bg, border: T.level2Border }
              : { text: T.level3Text, bg: T.level3Bg, border: T.level3Border };

        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.25,
              py: 0.4,
              bgcolor: c.bg,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: "6px",
            }}
          >
            <Box
              sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: c.text }}
            />
            <Typography
              sx={{ fontSize: "0.68rem", fontWeight: 700, lineHeight: 1 }}
            >
              {row.level}
            </Typography>
          </Box>
        );
      },
    },
    {
      headerName: "INSTRUMENT",
      field: "instrument",
      width: 130,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {row.instrument}
        </Typography>
      ),
    },
    {
      headerName: "ANALYSIS",
      field: "analysis",
      width: 120,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.analysis}
        </Typography>
      ),
    },
    {
      headerName: "EXPECTED",
      field: "expected",
      width: 100,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {row.expected}
        </Typography>
      ),
    },
    {
      headerName: "OBSERVED",
      field: "observed",
      width: 100,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 800,
            color: row.westgardStatus === "fail" ? "#dc2626" : "text.primary",
          }}
        >
          {row.observed}
        </Typography>
      ),
    },
    {
      headerName: "WESTGARD",
      field: "westgard",
      width: 100,
      renderCell: (row) => {
        const c =
          row.westgardStatus === "fail"
            ? {
                text: T.failText,
                bg: T.failBg,
                border: T.failBorder,
                Icon: CancelIcon,
              }
            : row.westgardStatus === "warning"
              ? {
                  text: T.warningText,
                  bg: T.warningBg,
                  border: T.warningBorder,
                  Icon: WarningIcon,
                }
              : {
                  text: T.okText,
                  bg: T.okBg,
                  border: T.okBorder,
                  Icon: CheckCircleIcon,
                };

        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1,
              py: 0.4,
              bgcolor: c.bg,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: "6px",
            }}
          >
            <c.Icon sx={{ fontSize: 13 }} />
            <Typography
              sx={{ fontSize: "0.68rem", fontWeight: 700, lineHeight: 1 }}
            >
              {row.westgard}
            </Typography>
          </Box>
        );
      },
    },
    {
      headerName: "RESULT",
      field: "result",
      width: 100,
      renderCell: (row) => {
        const c =
          row.result === "Pass"
            ? { text: T.okText, bg: T.okBg, border: T.okBorder }
            : row.result === "Fail"
              ? { text: T.failText, bg: T.failBg, border: T.failBorder }
              : {
                  text: T.warningText,
                  bg: T.warningBg,
                  border: T.warningBorder,
                };

        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.25,
              py: 0.4,
              bgcolor: c.bg,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: "6px",
            }}
          >
            <Box
              sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: c.text }}
            />
            <Typography
              sx={{ fontSize: "0.68rem", fontWeight: 700, lineHeight: 1 }}
            >
              {row.result}
            </Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <PageTemplate title="Quality Control Console" currentPageTitle="QC Samples">
      <Stack spacing={2.5}>
        <WorkspaceHeaderCard sx={{ p: 2, borderRadius: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}
              >
                QC Samples Monitoring
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Analyze internal quality control results using Westgard rules
                and Levey-Jennings charts.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Stack
                direction="row"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  p: 0.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <Button
                  size="small"
                  onClick={() => setActiveView("list")}
                  sx={{
                    borderRadius: 1.5,
                    px: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor:
                      activeView === "list" ? "primary.main" : "transparent",
                    color: activeView === "list" ? "white" : "text.secondary",
                    "&:hover": {
                      bgcolor:
                        activeView === "list"
                          ? "primary.dark"
                          : alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  List View
                </Button>
                <Button
                  size="small"
                  onClick={() => setActiveView("visual")}
                  sx={{
                    borderRadius: 1.5,
                    px: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor:
                      activeView === "visual" ? "primary.main" : "transparent",
                    color: activeView === "visual" ? "white" : "text.secondary",
                    "&:hover": {
                      bgcolor:
                        activeView === "visual"
                          ? "primary.dark"
                          : alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  Visual QC
                </Button>
              </Stack>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsModalOpen(true)}
                sx={{ borderRadius: 1.5, px: 2, fontWeight: 700 }}
              >
                Add QC Sample
              </Button>
            </Stack>
          </Stack>
        </WorkspaceHeaderCard>

        {activeView === "list" ? (
          <CommonDataGrid<QCSample>
            rows={MOCK_QC}
            columns={columns}
            getRowId={(row) => row.id}
            hideSearch={false}
          />
        ) : (
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 2.5,
              border: "1px solid",
              borderColor: "divider",
              p: 3,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 4 }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "primary.main",
                  }}
                >
                  <ChartIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Levey-Jennings Trend Analysis
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Glucose — Cobas 6000 (Level 1)
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2}>
                {[
                  { label: "Target", val: MEAN, color: "primary.main" },
                  { label: "SD", val: SD, color: "text.secondary" },
                  { label: "CV%", val: "2.1%", color: "text.secondary" },
                ].map((s) => (
                  <Box key={s.label} sx={{ textAlign: "right" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "text.disabled",
                        display: "block",
                      }}
                    >
                      {s.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 800, color: s.color }}
                    >
                      {s.val}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>

            <Box sx={{ height: 400, position: "relative", px: 4 }}>
              {/* Y-Axis Labels */}
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 40,
                  width: 40,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  pr: 1,
                }}
              >
                {[4, 3, 2, 1, 0, -1, -2, -3, -4].map((s) => (
                  <Typography
                    key={s}
                    variant="caption"
                    sx={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: s === 0 ? "primary.main" : "text.disabled",
                    }}
                  >
                    {s > 0 ? `+${s}s` : s === 0 ? "Mean" : `${s}s`}
                  </Typography>
                ))}
              </Box>

              {/* Chart Grid */}
              <Box
                sx={{
                  position: "absolute",
                  left: 40,
                  right: 0,
                  top: 0,
                  bottom: 40,
                  borderLeft: "1px solid",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                {/* Mean Line */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    right: 0,
                    height: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.4),
                    zIndex: 0,
                  }}
                />

                {/* SD Lines */}
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <Box
                      sx={{
                        position: "absolute",
                        top: `${50 - s * 12.5}%`,
                        left: 0,
                        right: 0,
                        borderTop: "1px dashed",
                        borderColor:
                          s === 3
                            ? alpha("#dc2626", 0.3)
                            : s === 2
                              ? alpha("#ea580c", 0.3)
                              : "divider",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: `${50 + s * 12.5}%`,
                        left: 0,
                        right: 0,
                        borderTop: "1px dashed",
                        borderColor:
                          s === 3
                            ? alpha("#dc2626", 0.3)
                            : s === 2
                              ? alpha("#ea580c", 0.3)
                              : "divider",
                      }}
                    />
                  </React.Fragment>
                ))}

                {/* SVG Data Line and Points */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1000 100"
                  preserveAspectRatio="none"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    overflow: "visible",
                  }}
                >
                  <path
                    d={TREND_DATA.map(
                      (d, i) =>
                        `${i === 0 ? "M" : "L"} ${(i * 1000) / (TREND_DATA.length - 1)} ${getYSize(d.value)}`,
                    ).join(" ")}
                    fill="none"
                    stroke={theme.palette.primary.main}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0.6 }}
                  />
                  {TREND_DATA.map((d, i) => {
                    const x = (i * 1000) / (TREND_DATA.length - 1);
                    const y = getYSize(d.value);
                    const color =
                      d.status === "fail"
                        ? "#dc2626"
                        : d.status === "warning"
                          ? "#ea580c"
                          : "#16a34a";
                    return (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r="6"
                          fill={color}
                          stroke="#fff"
                          strokeWidth="2"
                          style={{ cursor: "pointer", transition: "all 0.2s" }}
                        />
                        {/* Tooltip Target */}
                        <rect
                          x={x - 10}
                          y={y - 10}
                          width="20"
                          height="20"
                          fill="transparent"
                          style={{ cursor: "pointer" }}
                        >
                          <title>{`${d.date}: ${d.value} (${d.status.toUpperCase()})`}</title>
                        </rect>
                      </g>
                    );
                  })}
                </svg>
              </Box>

              {/* X-Axis Labels */}
              <Box
                sx={{
                  position: "absolute",
                  left: 40,
                  right: 0,
                  bottom: 0,
                  height: 30,
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                }}
              >
                {TREND_DATA.map((d, i) => (
                  <Typography
                    key={i}
                    variant="caption"
                    sx={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color: "text.disabled",
                      transform: "rotate(-45deg)",
                      transformOrigin: "left top",
                    }}
                  >
                    {d.date}
                  </Typography>
                ))}
              </Box>
            </Box>

            <Stack
              direction="row"
              spacing={4}
              sx={{
                mt: 8,
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#16a34a",
                    mr: 1,
                  }}
                />{" "}
                Within Limits
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#ea580c",
                    mr: 1,
                  }}
                />{" "}
                Rule Breach (&gt;2SD)
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#dc2626",
                    mr: 1,
                  }}
                />{" "}
                Action Limit (&gt;3SD)
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Download Chart PDF
              </Typography>
            </Stack>
          </Box>
        )}
      </Stack>

      <CommonDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add QC Sample"
        maxWidth="sm"
        content={
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  mb: 0.5,
                  display: "block",
                }}
              >
                QC Material
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Seronorm Level 1"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  mb: 0.5,
                  display: "block",
                }}
              >
                Instrument
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Cobas 6000"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  mb: 0.5,
                  display: "block",
                }}
              >
                Analyses
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Glucose, HbA1c..."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  mb: 0.5,
                  display: "block",
                }}
              >
                Westgard Rules to Apply
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="1₂ₛ + 1₃ₛ + 2₂ₛ + R₄ₛ"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
          </Stack>
        }
        actions={
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="flex-end"
            sx={{ width: "100%" }}
          >
            <Button
              variant="outlined"
              onClick={() => setIsModalOpen(false)}
              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setIsModalOpen(false)}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              Add QC Sample
            </Button>
          </Stack>
        }
      />
    </PageTemplate>
  );
}
