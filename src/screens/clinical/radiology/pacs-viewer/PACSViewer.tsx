"use client";

import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Slider,
} from "@mui/material";
import { DICOM_SECTIONS, PATIENTS, THUMBS } from "./utils/data";
import PatientChangeDialog from "./components/PatientChangeDialog";
import PatientInfoBar from "./components/PatientInfoBar";
import { BRAND, BRAND_DEEPER, BRAND_MID, VIEWER_BG } from "./utils/tokens";
import ViewerToolbar from "./components/ViewerToolbar";

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
        <ViewerToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          layout={layout}
          setLayout={setLayout}
        />

        <PatientInfoBar
          patient={patient}
          onChangePatient={() => { setSearch(""); setChangeOpen(true); }}
        />

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

      <PatientChangeDialog
        open={changeOpen}
        onClose={() => setChangeOpen(false)}
        patient={patient}
        search={search}
        setSearch={setSearch}
        setPatient={setPatient}
      />
    </Box>

  );
}
