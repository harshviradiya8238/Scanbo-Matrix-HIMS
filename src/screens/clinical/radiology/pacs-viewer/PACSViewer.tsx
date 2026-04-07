"use client";

import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  Slider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Chip,
  Button,
} from "@mui/material";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BRAND       = "#1172BA";
const BRAND_DARK  = "#0D5A94";
const BRAND_DEEPER = "#0A4472";
const BRAND_MID   = "#5BA4D4";
const VIEWER_BG   = "#0A0E14";
const DARK_BORDER = "rgba(255,255,255,0.1)";
const DARK_TEXT   = "rgba(255,255,255,0.65)";

// ─── Tool button ─────────────────────────────────────────────────────────────
function ToolBtn({
  id, active, danger, title, onClick, children,
}: {
  id?: string; active?: boolean; danger?: boolean; title: string;
  onClick?: () => void; children: React.ReactNode;
}) {
  return (
    <Tooltip title={title} placement="bottom">
      <Box
        onClick={onClick}
        sx={{
          width: 34, height: 34, borderRadius: "9px",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
          border: "1.5px solid",
          borderColor: danger ? "#FC8181" : active ? BRAND_MID : "transparent",
          bgcolor: danger ? "#E53E3E" : active ? BRAND : "transparent",
          transition: "all .15s",
          "& svg": { color: danger || active ? "#fff" : DARK_TEXT },
          "&:hover": {
            bgcolor: danger ? "#C53030" : active ? BRAND_DARK : "rgba(255,255,255,0.1)",
            borderColor: danger ? "#FC8181" : active ? BRAND_MID : "rgba(255,255,255,0.2)",
            "& svg": { color: "#fff" },
          },
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}

// ─── SVG icons (inline, no external deps) ─────────────────────────────────────
const Icon = ({ d, size = 16, viewBox = "0 0 16 16" }: { d: string; size?: number; viewBox?: string }) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d={d} />
  </svg>
);

const CircleIcon = ({ cx = 8, cy = 8, r = 5, extra = "" }) => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx={cx} cy={cy} r={r} />{extra && <path d={extra} />}
  </svg>
);

// ─── Thumb items ──────────────────────────────────────────────────────────────
const THUMBS = [
  "radial-gradient(circle at 60% 40%,#2a3a4e,#0A0E14)",
  "radial-gradient(circle at 50% 50%,#263040,#0A0E14)",
  "radial-gradient(circle at 45% 55%,#2a3a4e,#0A0E14)",
  "radial-gradient(circle at 55% 45%,#223040,#0A0E14)",
  "radial-gradient(circle at 50% 50%,#1E2A38,#0A0E14)",
  "radial-gradient(circle at 48% 52%,#243040,#0A0E14)",
  "radial-gradient(circle at 52% 48%,#1E2A38,#0A0E14)",
  "radial-gradient(circle at 50% 50%,#1E2A38,#0A0E14)",
];

// ─── DICOM data ───────────────────────────────────────────────────────────────
const DICOM_SECTIONS = [
  {
    title: "Patient",
    rows: [
      { label: "Patient", value: "Rajesh Kumar" },
      { label: "ID", value: "P10045" },
      { label: "DOB", value: "1978-04-12" },
      { label: "Sex", value: "M" },
    ],
  },
  {
    title: "Study",
    rows: [
      { label: "Modality", value: "CT" },
      { label: "Date", value: "2026-03-27" },
      { label: "Accession", value: "ACC-001" },
      { label: "Institution", value: "Apollo Mumbai" },
      { label: "Physician", value: "Dr. Sharma" },
      { label: "Study UID", value: "1.2.840.10008.5.1.4.1", mono: true },
    ],
  },
  {
    title: "Acquisition",
    rows: [
      { label: "KVP", value: "120 kV" },
      { label: "mAs", value: "250" },
      { label: "Slice Thick", value: "5.00 mm" },
      { label: "Pixel Spacing", value: "0.703\\0.703" },
      { label: "Rows×Cols", value: "512×512" },
      { label: "Bit Depth", value: "12-bit" },
      { label: "Manufacturer", value: "Siemens Healthineers" },
      { label: "Station", value: "CT_SCANNER_01" },
    ],
  },
];

// ─── Sample patients ─────────────────────────────────────────────────────────
const PATIENTS = [
  { id: "P10045", name: "Rajesh Kumar",   initials: "RK", dob: "1978-04-12", sex: "M", modality: "CT",  desc: "CT Chest w Contrast",  accession: "ACC-001", physician: "Dr. Sharma",  institution: "Apollo Mumbai", critical: true  },
  { id: "P10046", name: "Priya Menon",    initials: "PM", dob: "1990-07-22", sex: "F", modality: "MRI", desc: "MRI Brain w/wo Contrast", accession: "ACC-002", physician: "Dr. Nair",    institution: "Fortis Delhi",  critical: false },
  { id: "P10047", name: "Arun Sharma",    initials: "AS", dob: "1965-03-05", sex: "M", modality: "USG", desc: "USG Abdomen",           accession: "ACC-003", physician: "Dr. Patel",   institution: "Apollo Mumbai", critical: false },
  { id: "P10048", name: "Sunita Joshi",   initials: "SJ", dob: "1982-11-18", sex: "F", modality: "CT",  desc: "CT Abdomen Pelvis",    accession: "ACC-004", physician: "Dr. Mehta",   institution: "Max Saket",     critical: true  },
  { id: "P10049", name: "Vikram Reddy",   initials: "VR", dob: "1955-08-30", sex: "M", modality: "XR",  desc: "X-Ray Chest PA View",  accession: "ACC-005", physician: "Dr. Iyer",    institution: "Fortis Delhi",  critical: false },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function PACSViewer() {
  const [activeTool, setActiveTool] = useState("pan");
  const [layout, setLayout] = useState("1×1");
  const [activeThumb, setActiveThumb] = useState(0);
  const [rightTab, setRightTab] = useState(0);
  const [ww, setWw] = useState(1500);
  const [wl, setWl] = useState(-600);
  const [fps, setFps] = useState(8);
  const [patient, setPatient] = useState(PATIENTS[0]);
  const [changeOpen, setChangeOpen] = useState(false);
  const [search, setSearch] = useState("");

  const tools = [
    { id: "pan",      title: "Pan",          d: "M8 2v12M2 8h12M5 5l-3 3 3 3M11 5l3 3-3 3" },
    { id: "zoom",     title: "Zoom",         custom: "zoom" },
    { id: "bright",   title: "Brightness",   custom: "bright" },
    { id: "length",   title: "Measure Length", d: "M2 14L14 2M2 10v4h4M10 2h4v4" },
    { id: "freehand", title: "Freehand",     d: "M2 10c2-4 4-6 6-4s0 6 4 4" },
    { id: "rect",     title: "Rectangle ROI", custom: "rect" },
    { id: "ellipse",  title: "Ellipse ROI",  custom: "ellipse" },
  ];

  const tools2 = [
    { id: "zoomin",   title: "Zoom In",  custom: "zoomin" },
    { id: "zoomout",  title: "Zoom Out", custom: "zoomout" },
    { id: "undo",     title: "Undo",     d: "M3 7a5 5 0 105 5M3 3v4h4" },
    { id: "redo",     title: "Redo",     d: "M13 7a5 5 0 11-5 5M13 3v4h-4" },
    { id: "fliph",    title: "Flip H",   d: "M8 2v12M4 5L1 8l3 3M12 5l3 3-3 3" },
    { id: "wl",       title: "W/L",      custom: "wl" },
    { id: "annotate", title: "Annotate", d: "M3 13l2-4 7-7 2 2-7 7-4 2zM11 3l2 2" },
  ];

  function renderToolIcon(t: { id: string; title: string; d?: string; custom?: string }) {
    if (t.d) return <Icon d={t.d} />;
    if (t.custom === "zoom" || t.custom === "zoomin") {
      return (
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3M5 7h4M7 5v4" />
        </svg>
      );
    }
    if (t.custom === "zoomout") {
      return (
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3M5 7h4" />
        </svg>
      );
    }
    if (t.custom === "bright") {
      return (
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
        </svg>
      );
    }
    if (t.custom === "rect") {
      return (
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="12" height="10" rx="1.5" />
        </svg>
      );
    }
    if (t.custom === "ellipse") {
      return (
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <ellipse cx="8" cy="8" rx="6" ry="4" />
        </svg>
      );
    }
    if (t.custom === "wl") {
      return (
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6" /><path d="M8 4v4l3 2" />
        </svg>
      );
    }
    return null;
  }

  const ToolSep = () => (
    <Box sx={{ width: "1px", height: 28, bgcolor: DARK_BORDER, mx: "4px", flexShrink: 0 }} />
  );

  const DarkNavBtn = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <Box
      onClick={onClick}
      sx={{
        width: 26, height: 26, borderRadius: "7px",
        bgcolor: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0,
        "& svg": { color: "rgba(255,255,255,0.6)" },
        "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
      }}
    >
      {children}
    </Box>
  );

  return (
    // Direct flex child of AppLayout's <main> (overflowY:auto flex-column)
    // Using flex:1 here (not height:100%) to correctly fill constrained height
    <Box
      sx={{
        flex: 1, minHeight: 0,
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Single full-height viewer card */}
      <Box
        sx={{
          flex: 1, minHeight: 0,
          borderRadius: "16px",
          border: "1px solid #DDE8F0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Viewer Toolbar ── */}
        <Box
          sx={{
            bgcolor: BRAND_DEEPER, height: 52, flexShrink: 0,
            display: "flex", alignItems: "center", px: "14px", gap: "6px",
            borderBottom: `1px solid ${DARK_BORDER}`,
          }}
        >
          {/* Tool group 1 */}
          {tools.map((t) => (
            <ToolBtn
              key={t.id}
              title={t.title}
              active={activeTool === t.id}
              onClick={() => setActiveTool(t.id)}
            >
              {renderToolIcon(t)}
            </ToolBtn>
          ))}

          <ToolSep />

          {/* Tool group 2 */}
          {tools2.map((t) => (
            <ToolBtn
              key={t.id}
              title={t.title}
              active={activeTool === t.id}
              onClick={() => setActiveTool(t.id)}
            >
              {renderToolIcon(t)}
            </ToolBtn>
          ))}

          {/* OVL danger button */}
          <ToolBtn title="OVL" danger>
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6" /><path d="M8 4v4l3 2M5 8H3M13 8h-2" />
            </svg>
          </ToolBtn>

          {/* Reset */}
          <Box
            sx={{
              px: "14px", py: "6px", borderRadius: "9px",
              bgcolor: "rgba(255,255,255,0.1)",
              border: "1.5px solid rgba(255,255,255,0.2)",
              fontSize: "11.5px", fontWeight: 700, color: "#fff",
              cursor: "pointer", flexShrink: 0,
              "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
            }}
          >
            Reset
          </Box>

          <ToolSep />

          {/* Layout buttons */}
          <Stack direction="row" gap="3px">
            {["1×1", "1×2", "2×2"].map((l) => (
              <Box
                key={l}
                onClick={() => setLayout(l)}
                sx={{
                  px: "12px", py: "6px", borderRadius: "9px",
                  border: "1.5px solid",
                  borderColor: layout === l ? BRAND_MID : "rgba(255,255,255,0.2)",
                  fontSize: "11.5px", fontWeight: 700,
                  color: layout === l ? "#fff" : "rgba(255,255,255,0.7)",
                  bgcolor: layout === l ? BRAND : "transparent",
                  cursor: "pointer", whiteSpace: "nowrap",
                  transition: "all .15s",
                  "&:hover": {
                    bgcolor: layout === l ? BRAND_DARK : "rgba(255,255,255,0.1)",
                    color: "#fff",
                  },
                }}
              >
                {l}
              </Box>
            ))}
          </Stack>
        </Box>

        {/* ── Patient Info Bar ── */}
        <Box
          sx={{
            bgcolor: "#F5F8FB", height: 48, flexShrink: 0,
            display: "flex", alignItems: "center", px: "18px", gap: 0,
            borderBottom: "1px solid #DDE8F0",
          }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: BRAND, fontSize: 11, fontWeight: 700, mr: "10px", flexShrink: 0 }}>
            {patient.initials}
          </Avatar>
          <Box sx={{ flexShrink: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{patient.name}</Typography>
            <Typography sx={{ fontSize: 10.5, color: "#9AAFBF", mt: "1px" }}>DOB: {patient.dob} · {patient.sex} · ID: {patient.id}</Typography>
          </Box>

          {[
            { label: "Modality",    value: patient.modality },
            { label: "Date",        value: "2026-03-27" },
            { label: "Description", value: patient.desc },
            { label: "Accession",   value: patient.accession },
            { label: "Physician",   value: patient.physician },
            { label: "Institution", value: patient.institution },
          ].map((f) => (
            <React.Fragment key={f.label}>
              <Box sx={{ width: "1px", height: 28, bgcolor: "#DDE8F0", mx: "16px", flexShrink: 0 }} />
              <Box sx={{ flexShrink: 0 }}>
                <Typography sx={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "#9AAFBF" }}>
                  {f.label}
                </Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#0D1B2A", mt: "1px" }}>
                  {f.value}
                </Typography>
              </Box>
            </React.Fragment>
          ))}

          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            {patient.critical && (
              <Box sx={{
                px: "14px", py: "5px", borderRadius: "20px",
                bgcolor: "#FEE2E2", border: "1.5px solid #FCA5A5",
                color: "#991B1B", fontSize: "11.5px", fontWeight: 800, letterSpacing: "0.5px",
              }}>
                CRITICAL
              </Box>
            )}
            <Box
              onClick={() => { setSearch(""); setChangeOpen(true); }}
              sx={{
                px: "16px", py: "8px", borderRadius: "10px",
                bgcolor: BRAND, color: "#fff",
                fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", gap: "6px",
                cursor: "pointer", flexShrink: 0,
                "&:hover": { bgcolor: BRAND_DARK },
              }}
            >
              <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8" cy="6" r="3" /><path d="M3 14a5 5 0 0110 0M12 4l2 2-2 2" />
              </svg>
              Change Patient
            </Box>
          </Box>
        </Box>

        {/* ── Viewer Body ── */}
        <Box sx={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>

          {/* Thumbnail strip */}
          <Box
            sx={{
              width: 80, flexShrink: 0,
              bgcolor: "#0F1620",
              display: "flex", flexDirection: "column", alignItems: "center",
              py: "8px", gap: "6px",
              overflowY: "auto",
              borderRight: "1px solid #1E2A38",
              "&::-webkit-scrollbar": { width: 3 },
              "&::-webkit-scrollbar-thumb": { bgcolor: "#2A3A4E", borderRadius: 2 },
            }}
          >
            {THUMBS.map((bg, i) => (
              <Box
                key={i}
                onClick={() => setActiveThumb(i)}
                sx={{
                  width: 60, height: 60, borderRadius: "8px",
                  background: bg,
                  border: "2px solid",
                  borderColor: activeThumb === i ? BRAND : "transparent",
                  cursor: "pointer", position: "relative", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border-color .12s",
                  "&:hover": { borderColor: activeThumb === i ? BRAND : BRAND_MID },
                }}
              >
                {i < 4 && (
                  <Box sx={{ width: i === 0 ? 36 : i === 1 ? 32 : i === 2 ? 30 : 34, height: i === 0 ? 36 : i === 1 ? 32 : i === 2 ? 30 : 34, borderRadius: "50%", bgcolor: "#2A3A4E" }} />
                )}
                <Typography sx={{ position: "absolute", bottom: 3, right: 5, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
                  {i + 1}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Center: canvas + controls + status */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>

            {/* Canvas area */}
            <Box
              sx={{
                flex: 1, bgcolor: VIEWER_BG, position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: 0,
              }}
            >
              {/* Overlay TL */}
              <Box sx={{ position: "absolute", top: 12, left: 14, fontFamily: "monospace", fontSize: 12, lineHeight: 1.7, color: "#00E676" }}>
                {patient.name}<br />
                ID: {patient.id}<br />
                {patient.desc}<br />
                {patient.institution}
              </Box>
              {/* Overlay TR */}
              <Box sx={{ position: "absolute", top: 12, right: 14, textAlign: "right", fontFamily: "monospace", fontSize: 12, lineHeight: 1.7, color: "#64B5F6" }}>
                {patient.modality} &nbsp; 2026-03-27 &nbsp; VP1<br />
                Slice &nbsp;-120.0 mm
              </Box>

              {/* Simulated scan */}
              <Box sx={{
                width: 380, height: 380, borderRadius: "50%",
                background: "radial-gradient(circle at 60% 40%, #1a2535 0%, #0A0E14 70%)",
                border: "1px solid #1E2A38",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}>
                <Box sx={{
                  width: 220, height: 220, borderRadius: "50%",
                  background: "radial-gradient(circle at 55% 45%, #2a3a4e 0%, #111820 80%)",
                  border: "1px solid #2A3A4E",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: "#1E2A38", border: "1px solid #2E4A62" }} />
                </Box>
                {/* Rib lines */}
                {[
                  { bottom: "25%", left: "30%", width: "40%", rotate: "-8deg", opacity: 0.06 },
                  { bottom: "35%", left: "28%", width: "44%", rotate: "-6deg", opacity: 0.05 },
                  { bottom: "45%", left: "26%", width: "48%", rotate: "-4deg", opacity: 0.04 },
                ].map((r, i) => (
                  <Box key={i} sx={{
                    position: "absolute", bottom: r.bottom, left: r.left,
                    width: r.width, height: "1px",
                    bgcolor: `rgba(255,255,255,${r.opacity})`,
                    transform: `rotate(${r.rotate})`,
                  }} />
                ))}
              </Box>
            </Box>

            {/* Controls bar */}
            <Box
              sx={{
                bgcolor: "#111927", height: 44, flexShrink: 0,
                display: "flex", alignItems: "center", px: "14px", gap: "14px",
                borderTop: "1px solid #1E2A38",
              }}
            >
              {/* Frame navigation */}
              <Stack direction="row" alignItems="center" gap="8px">
                {[
                  "M8 1L2 5l6 4V1z",
                  "M7 2L4 5l3 3",
                  null, // play
                  "M3 2l3 3-3 3",
                  "M2 1l6 4-6 4V1z M8 1v8",
                ].map((d, i) => (
                  d === null ? (
                    <Box key="play" sx={{ width: 26, height: 26, borderRadius: "50%", bgcolor: BRAND, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                      <svg width={11} height={11} viewBox="0 0 10 10" fill="white"><path d="M3 2l6 3-6 3V2z" /></svg>
                    </Box>
                  ) : (
                    <Box key={i} sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}>
                      <svg width={11} height={11} viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2"><path d={d!} /></svg>
                    </Box>
                  )
                ))}
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>1/32</Typography>
              </Stack>

              <Box sx={{ width: "1px", height: 22, bgcolor: "rgba(255,255,255,0.1)", flexShrink: 0 }} />

              {/* WW */}
              <Stack direction="row" alignItems="center" gap="8px">
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>WW</Typography>
                <Box sx={{ width: 120 }}>
                  <Slider
                    size="small" min={0} max={3000} value={ww}
                    onChange={(_, v) => setWw(v as number)}
                    sx={{ color: BRAND, py: "4px", "& .MuiSlider-thumb": { width: 12, height: 12 } }}
                  />
                </Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: BRAND_MID, minWidth: 32, whiteSpace: "nowrap" }}>{ww}</Typography>
              </Stack>

              {/* WL */}
              <Stack direction="row" alignItems="center" gap="8px">
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>WL</Typography>
                <Box sx={{ width: 120 }}>
                  <Slider
                    size="small" min={-1000} max={1000} value={wl}
                    onChange={(_, v) => setWl(v as number)}
                    sx={{ color: BRAND, py: "4px", "& .MuiSlider-thumb": { width: 12, height: 12 } }}
                  />
                </Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: BRAND_MID, minWidth: 40, whiteSpace: "nowrap" }}>{wl}</Typography>
              </Stack>

              {/* FPS */}
              <Stack direction="row" alignItems="center" gap="8px">
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>FPS</Typography>
                <Box sx={{ width: 70 }}>
                  <Slider
                    size="small" min={1} max={30} value={fps}
                    onChange={(_, v) => setFps(v as number)}
                    sx={{ color: BRAND, py: "4px", "& .MuiSlider-thumb": { width: 12, height: 12 } }}
                  />
                </Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: BRAND_MID, minWidth: 20, whiteSpace: "nowrap" }}>{fps}</Typography>
              </Stack>

              <Box sx={{ width: "1px", height: 22, bgcolor: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>Slice: -120.0 mm</Typography>
            </Box>

            {/* Status bar */}
            <Box
              sx={{
                height: 32, bgcolor: BRAND_DEEPER, flexShrink: 0,
                display: "flex", alignItems: "center", px: "16px", gap: "20px",
              }}
            >
              {[
                { label: "Tool:", value: "PAN" },
                { label: "Layout:", value: layout },
                { label: "VP:", value: "1/1" },
                { label: "Frame:", value: "3/32" },
                { label: "Zoom:", value: "1.00×" },
                { label: "WW/WL:", value: `${ww}/${wl}` },
                { label: "Rot:", value: "0°" },
              ].map((s) => (
                <Typography key={s.label} sx={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>
                  {s.label} <Box component="span" sx={{ color: BRAND_MID }}>{s.value}</Box>
                </Typography>
              ))}
              <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)" }}>
                  PACS Viewer · {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} IST
                </Typography>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#9AAFBF" }} />
                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>STOPPED</Typography>
              </Box>
            </Box>
          </Box>

          {/* Right panel */}
          <Box sx={{ width: 220, minWidth: 220, bgcolor: "background.paper", borderLeft: "1px solid #DDE8F0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Tabs */}
            <Stack direction="row" sx={{ borderBottom: "1px solid #DDE8F0", flexShrink: 0 }}>
              {["DICOM", "W/L", "Series"].map((t, i) => (
                <Box
                  key={t}
                  onClick={() => setRightTab(i)}
                  sx={{
                    flex: 1, py: "11px", textAlign: "center",
                    fontSize: 11.5, fontWeight: 700,
                    color: rightTab === i ? BRAND : "#9AAFBF",
                    borderBottom: "2px solid",
                    borderColor: rightTab === i ? BRAND : "transparent",
                    cursor: "pointer", transition: "all .15s",
                    "&:hover": { color: "#5A7184", bgcolor: "#F5F8FB" },
                  }}
                >
                  {t}
                </Box>
              ))}
            </Stack>

            {/* Scrollable body */}
            <Box sx={{ flex: 1, overflowY: "auto", p: "14px", "&::-webkit-scrollbar": { width: 3 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#DDE8F0", borderRadius: 3 } }}>
              {rightTab === 0 && (
                <>
                  {DICOM_SECTIONS.map((section, si) => (
                    <React.Fragment key={section.title}>
                      <Typography sx={{
                        fontSize: 9.5, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", color: "#9AAFBF",
                        mb: "10px", mt: si === 0 ? 0 : "14px",
                        pt: si === 0 ? 0 : "10px",
                        borderTop: si === 0 ? "none" : "1px solid #DDE8F0",
                      }}>
                        {section.title}
                      </Typography>
                      {section.rows.map((row) => (
                        <Box key={row.label} sx={{ mb: "8px" }}>
                          <Typography sx={{ fontSize: 9.5, fontWeight: 600, color: "#9AAFBF", letterSpacing: "0.3px", textTransform: "uppercase" }}>
                            {row.label}
                          </Typography>
                          <Typography sx={{ fontSize: (row as any).mono ? 11 : 12.5, fontWeight: 600, color: (row as any).mono ? BRAND : "#0D1B2A", mt: "1px", fontFamily: (row as any).mono ? "monospace" : "inherit", wordBreak: "break-all" }}>
                            {row.value}
                          </Typography>
                        </Box>
                      ))}
                    </React.Fragment>
                  ))}

                  {/* Live viewport section */}
                  <Typography sx={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", color: "#9AAFBF", mb: "10px", mt: "14px", pt: "10px", borderTop: "1px solid #DDE8F0" }}>
                    Live Viewport
                  </Typography>
                  {[
                    { label: "Zoom", value: "1.00×" },
                    { label: "Rotation", value: "0°" },
                    { label: "Flip H", value: "Off" },
                    { label: "Flip V", value: "Off" },
                    { label: "WW", value: String(ww), brand: true },
                    { label: "WL", value: String(wl), brand: true },
                  ].map((r) => (
                    <Box key={r.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "8px" }}>
                      <Typography sx={{ fontSize: 10.5, color: "#9AAFBF", fontWeight: 500 }}>{r.label}</Typography>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: r.brand ? BRAND : "#0D1B2A" }}>{r.value}</Typography>
                    </Box>
                  ))}
                </>
              )}

              {rightTab === 1 && (
                <Box>
                  <Typography sx={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", color: "#9AAFBF", mb: "14px" }}>
                    Window / Level
                  </Typography>
                  {[
                    { label: "Window Width (WW)", min: 0, max: 3000, value: ww, onChange: (v: number) => setWw(v) },
                    { label: "Window Level (WL)", min: -1000, max: 1000, value: wl, onChange: (v: number) => setWl(v) },
                  ].map((s) => (
                    <Box key={s.label} sx={{ mb: "16px" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: "4px" }}>
                        <Typography sx={{ fontSize: 10.5, color: "#5A7184", fontWeight: 600 }}>{s.label}</Typography>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: BRAND }}>{s.value}</Typography>
                      </Box>
                      <Slider size="small" min={s.min} max={s.max} value={s.value} onChange={(_, v) => s.onChange(v as number)} sx={{ color: BRAND }} />
                    </Box>
                  ))}
                  {/* Presets */}
                  <Typography sx={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", color: "#9AAFBF", mb: "10px", mt: "8px" }}>
                    Presets
                  </Typography>
                  {[
                    { name: "Bone", ww: 2500, wl: 480 },
                    { name: "Lung", ww: 1500, wl: -600 },
                    { name: "Abdomen", ww: 350, wl: 40 },
                    { name: "Brain", ww: 80, wl: 40 },
                    { name: "Liver", ww: 150, wl: 30 },
                  ].map((p) => (
                    <Box
                      key={p.name}
                      onClick={() => { setWw(p.ww); setWl(p.wl); }}
                      sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: "8px", px: "10px", borderRadius: "8px", cursor: "pointer", mb: "4px", border: "1px solid #DDE8F0", "&:hover": { bgcolor: "#F5F8FB" } }}
                    >
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#0D1B2A" }}>{p.name}</Typography>
                      <Typography sx={{ fontSize: 10.5, color: "#9AAFBF" }}>{p.ww}/{p.wl}</Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {rightTab === 2 && (
                <Box>
                  <Typography sx={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", color: "#9AAFBF", mb: "14px" }}>
                    Series List
                  </Typography>
                  {THUMBS.map((bg, i) => (
                    <Box
                      key={i}
                      onClick={() => setActiveThumb(i)}
                      sx={{
                        display: "flex", alignItems: "center", gap: "10px",
                        py: "8px", px: "10px", borderRadius: "8px", cursor: "pointer", mb: "4px",
                        border: "1px solid",
                        borderColor: activeThumb === i ? BRAND : "#DDE8F0",
                        bgcolor: activeThumb === i ? "#E8F3FB" : "transparent",
                        "&:hover": { bgcolor: activeThumb === i ? "#E8F3FB" : "#F5F8FB" },
                      }}
                    >
                      <Box sx={{ width: 36, height: 36, borderRadius: "6px", background: bg, flexShrink: 0, border: "1px solid #1E2A38" }} />
                      <Box>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#0D1B2A" }}>Series {i + 1}</Typography>
                        <Typography sx={{ fontSize: 10, color: "#9AAFBF" }}>CT · 32 frames</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Change Patient Dialog ── */}
      <Dialog
        open={changeOpen}
        onClose={() => setChangeOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", border: "1px solid #DDE8F0" } }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 800, fontSize: 15 }}>
          Change Patient
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, mt: 0.5 }}>
            Search and select a patient to load their study
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, MRN, or accession..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <svg width={15} height={15} viewBox="0 0 16 16" fill="none" stroke="#9AAFBF" strokeWidth="2">
                    <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" />
                  </svg>
                </InputAdornment>
              ),
            }}
          />

          {/* Patient list */}
          <List disablePadding>
            {PATIENTS.filter((p) =>
              !search ||
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.id.toLowerCase().includes(search.toLowerCase()) ||
              p.accession.toLowerCase().includes(search.toLowerCase())
            ).map((p) => (
              <ListItemButton
                key={p.id}
                selected={p.id === patient.id}
                onClick={() => { setPatient(p); setChangeOpen(false); }}
                sx={{
                  borderRadius: "10px", mb: "6px",
                  border: "1px solid",
                  borderColor: p.id === patient.id ? BRAND : "#DDE8F0",
                  bgcolor: p.id === patient.id ? "#E8F3FB" : "transparent",
                  "&.Mui-selected": { bgcolor: "#E8F3FB" },
                  "&:hover": { bgcolor: p.id === patient.id ? "#E8F3FB" : "#F5F8FB" },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: BRAND, fontSize: 12, fontWeight: 700 }}>
                    {p.initials}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{p.name}</Typography>
                      <Typography sx={{ fontSize: 11, color: "#9AAFBF" }}>{p.id}</Typography>
                      {p.critical && (
                        <Box sx={{ px: "8px", py: "2px", borderRadius: "20px", bgcolor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", fontSize: 10, fontWeight: 800 }}>
                          CRITICAL
                        </Box>
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography sx={{ fontSize: 11.5, color: "#5A7184", mt: 0.25 }}>
                      {p.modality} · {p.desc} · {p.physician}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>

  );
}
