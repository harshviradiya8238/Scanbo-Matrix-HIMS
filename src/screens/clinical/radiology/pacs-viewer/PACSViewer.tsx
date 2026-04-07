"use client";
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Divider,
  Slider,
  Tooltip,
  Chip,
  Button,
  ButtonGroup,
  Stack,
  Tabs,
  Tab,
  Avatar,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  Brightness6,
  PanTool,
  CropSquare,
  RadioButtonUnchecked,
  Timeline,
  Straighten,
  Menu as MenuIcon,
  Search,
  Image as ImageIcon,
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  InvertColors,
  AutoFixHigh,
  Flip,
  ArrowBack,
  ArrowForward,
  Delete,
  SwapHoriz,
  Person,
} from "@mui/icons-material";
import { PageTemplate } from "@/src/ui/components";

// ─── THEME ───────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1172BA", light: "#1565C0", dark: "#0A337A" },
    secondary: { main: "#006064" },
    background: { default: "#ECF0F5", paper: "#FFFFFF" },
    text: { primary: "#0E1628", secondary: "#4A5568" },
    divider: "#DDE3ED",
  },
  typography: {
    fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
    h6: { fontWeight: 700 },
    subtitle2: { fontWeight: 600 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#1172BA",
          color: "#fff",
          boxShadow: "0 2px 8px rgba(13,71,161,.25)",
        },
      },
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, minHeight: 42 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: "#F0F4F8",
          fontSize: "0.75rem",
          color: "#4A5568",
          padding: "6px 10px",
        },
        body: { fontSize: "0.78rem", padding: "4px 10px" },
      },
    },
    MuiTooltip: { styleOverrides: { tooltip: { fontSize: "0.72rem" } } },
    MuiSlider: { styleOverrides: { root: { padding: "8px 0" } } },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 700, fontSize: "0.72rem" } },
    },
  },
});

// ─── TYPES ───────────────────────────────────────────────────────────────────
type ToolId = "pan" | "zoom" | "wl" | "measure" | "angle" | "rect" | "ellipse";
type LayoutId = "1x1" | "1x2" | "2x2";
type StudyStatus = "pending" | "reviewed" | "critical";

interface Study {
  id: string;
  patientName: string;
  patientId: string;
  dob: string;
  sex: string;
  modality: string;
  studyDate: string;
  description: string;
  seriesCount: number;
  imageCount: number;
  status: StudyStatus;
  accessionNo: string;
  referringPhysician: string;
  institution: string;
}

interface VpState {
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
  ww: number;
  wl: number;
  invert: boolean;
  flipH: boolean;
  frameIdx: number;
}

interface Pt {
  x: number;
  y: number;
}

interface Annotation {
  id: string;
  type: "measure" | "angle" | "rect" | "ellipse";
  points: Pt[];
  color: string;
}

interface Frame {
  seed: number;
  slicePos: number;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const STUDIES: Study[] = [
  {
    id: "S1",
    patientName: "Rajesh Kumar",
    patientId: "P10045",
    dob: "1978-04-12",
    sex: "M",
    modality: "CT",
    studyDate: "2026-03-27",
    description: "CT Chest w Contrast",
    seriesCount: 4,
    imageCount: 256,
    status: "critical",
    accessionNo: "ACC-001",
    referringPhysician: "Dr. Sharma",
    institution: "Apollo Mumbai",
  },
  {
    id: "S2",
    patientName: "Priya Mehta",
    patientId: "P10046",
    dob: "1990-08-22",
    sex: "F",
    modality: "MRI",
    studyDate: "2026-03-27",
    description: "MRI Brain w/wo Contrast",
    seriesCount: 6,
    imageCount: 320,
    status: "pending",
    accessionNo: "ACC-002",
    referringPhysician: "Dr. Patel",
    institution: "Fortis Delhi",
  },
  {
    id: "S3",
    patientName: "Amit Singh",
    patientId: "P10047",
    dob: "1965-11-03",
    sex: "M",
    modality: "XR",
    studyDate: "2026-03-26",
    description: "Chest PA and Lateral",
    seriesCount: 2,
    imageCount: 2,
    status: "reviewed",
    accessionNo: "ACC-003",
    referringPhysician: "Dr. Gupta",
    institution: "AIIMS Delhi",
  },
  {
    id: "S4",
    patientName: "Sunita Verma",
    patientId: "P10048",
    dob: "1982-06-17",
    sex: "F",
    modality: "US",
    studyDate: "2026-03-26",
    description: "Abdomen Ultrasound",
    seriesCount: 3,
    imageCount: 45,
    status: "pending",
    accessionNo: "ACC-004",
    referringPhysician: "Dr. Joshi",
    institution: "Kokilaben Mumbai",
  },
  {
    id: "S5",
    patientName: "Deepak Nair",
    patientId: "P10049",
    dob: "1955-02-28",
    sex: "M",
    modality: "MG",
    studyDate: "2026-03-25",
    description: "Screening Mammography",
    seriesCount: 4,
    imageCount: 8,
    status: "reviewed",
    accessionNo: "ACC-005",
    referringPhysician: "Dr. Reddy",
    institution: "Manipal Bangalore",
  },
  {
    id: "S6",
    patientName: "Kavya Iyer",
    patientId: "P10050",
    dob: "1988-09-05",
    sex: "F",
    modality: "NM",
    studyDate: "2026-03-25",
    description: "Bone Scan Whole Body",
    seriesCount: 2,
    imageCount: 12,
    status: "pending",
    accessionNo: "ACC-006",
    referringPhysician: "Dr. Pillai",
    institution: "KIMS Hyderabad",
  },
  {
    id: "S7",
    patientName: "Arjun Patel",
    patientId: "P10051",
    dob: "1972-12-30",
    sex: "M",
    modality: "CT",
    studyDate: "2026-03-24",
    description: "CT Abdomen Pelvis",
    seriesCount: 3,
    imageCount: 180,
    status: "critical",
    accessionNo: "ACC-007",
    referringPhysician: "Dr. Shah",
    institution: "Apollo Chennai",
  },
  {
    id: "S8",
    patientName: "Meena Krishnan",
    patientId: "P10052",
    dob: "1995-03-14",
    sex: "F",
    modality: "MRI",
    studyDate: "2026-03-24",
    description: "MRI Knee Left",
    seriesCount: 5,
    imageCount: 240,
    status: "reviewed",
    accessionNo: "ACC-008",
    referringPhysician: "Dr. Kumar",
    institution: "Max Delhi",
  },
];

function makeFrames(count: number): Frame[] {
  return Array.from({ length: count }, (_, i) => ({
    seed: i * 137 + 42,
    slicePos: -120 + i * (240 / count),
  }));
}

// ─── CANVAS DRAW ENGINE ──────────────────────────────────────────────────────
function rng(seed: number, n: number): number {
  return Math.abs(Math.sin(seed * n + n * 0.3173)) % 1;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  frame: Frame,
  vp: VpState,
  anns: Annotation[],
  curAnn: Partial<Annotation> | null,
  study: Study,
  overlay: boolean,
) {
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  const s = frame.seed;
  ctx.translate(W / 2 + vp.panX, H / 2 + vp.panY);
  ctx.rotate((vp.rotation * Math.PI) / 180);
  ctx.scale(vp.zoom * (vp.flipH ? -1 : 1), vp.zoom);
  ctx.translate(-W / 2, -H / 2);

  if (study.modality === "CT" || study.modality === "XR") {
    const bg = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 200);
    bg.addColorStop(0, `rgba(${55 + rng(s, 1) * 30},${52 + rng(s, 2) * 22},${48},1)`);
    bg.addColorStop(0.65, "rgba(30,28,25,.95)");
    bg.addColorStop(1, "rgba(8,8,8,.9)");
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, W * 0.42, H * 0.47, 0, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    [[W / 2 - 85, -0.1],[W / 2 + 85, 0.1]].forEach(([lx, tilt]) => {
      const lg = ctx.createRadialGradient(lx, H / 2 - 10, 5, lx, H / 2 - 10, 82);
      lg.addColorStop(0, `rgba(${18 + rng(s, 4) * 14},${18 + rng(s, 5) * 10},16,0.95)`);
      lg.addColorStop(1, "rgba(6,6,6,.5)");
      ctx.beginPath();
      ctx.ellipse(lx, H / 2 - 10, 72 + rng(s, 6) * 10, 96 + rng(s, 7) * 10, tilt, 0, Math.PI * 2);
      ctx.fillStyle = lg;
      ctx.fill();
    });
    const hg = ctx.createRadialGradient(W / 2 - 14, H / 2, 4, W / 2 - 14, H / 2, 54);
    hg.addColorStop(0, `rgba(${78 + rng(s, 12) * 22},${68 + rng(s, 13) * 15},58,1)`);
    hg.addColorStop(1, "rgba(42,38,33,.8)");
    ctx.beginPath();
    ctx.ellipse(W / 2 - 14, H / 2, 50 + rng(s, 14) * 8, 65 + rng(s, 15) * 8, 0.15, 0, Math.PI * 2);
    ctx.fillStyle = hg;
    ctx.fill();
    const spg = ctx.createRadialGradient(W / 2 + 5, H / 2 + 24, 2, W / 2 + 5, H / 2 + 24, 18);
    spg.addColorStop(0, "rgba(210,200,188,1)");
    spg.addColorStop(1, "rgba(128,118,108,.6)");
    ctx.beginPath();
    ctx.ellipse(W / 2 + 5, H / 2 + 24, 16 + rng(s, 16) * 4, 20 + rng(s, 17) * 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = spg;
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const ry = H / 2 - 88 + i * 37 + rng(s + i, 20) * 5;
      ctx.beginPath();
      ctx.arc(W / 2 - 8, ry, 116 + i * 3, -0.65, 0.65);
      ctx.strokeStyle = `rgba(165,155,145,${0.24 + i * 0.04})`;
      ctx.lineWidth = 2 + rng(s, i + 30) * 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(W / 2 + 8, ry, 114 + i * 3, Math.PI - 0.65, Math.PI + 0.65);
      ctx.strokeStyle = `rgba(165,155,145,${0.24 + i * 0.04})`;
      ctx.lineWidth = 2 + rng(s, i + 40) * 1.5;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(W / 2, H / 2 - 62);
    ctx.bezierCurveTo(W / 2 + 32, H / 2 - 50, W / 2 + 42, H / 2, W / 2 + 10, H / 2 + 62);
    ctx.strokeStyle = `rgba(148,96,88,${0.45 + rng(s, 50) * 0.3})`;
    ctx.lineWidth = 6 + rng(s, 51) * 4;
    ctx.stroke();
    for (let n = 0; n < 250; n++) {
      const nx = rng(s + n * 3, 1) * W, ny = rng(s + n * 3, 2) * H;
      const nr = rng(s + n * 3, 3) * 180 + 18;
      ctx.fillStyle = `rgba(${nr},${nr - 5},${nr - 10},.035)`;
      ctx.beginPath();
      ctx.arc(nx, ny, rng(s + n, 200) * 2.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (vp.invert) {
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "difference";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
  } else if (study.modality === "MRI") {
    const bg = ctx.createRadialGradient(W / 2, H / 2, 8, W / 2, H / 2, 185);
    bg.addColorStop(0, `rgba(${98 + rng(s, 1) * 32},${88 + rng(s, 2) * 28},${78 + rng(s, 3) * 22},1)`);
    bg.addColorStop(0.55, "rgba(55,50,45,.95)");
    bg.addColorStop(1, "rgba(8,8,8,.9)");
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, W * 0.37, H * 0.43, 0, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, W * 0.35, H * 0.41, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(135,125,115,.38)";
    ctx.lineWidth = 9;
    ctx.stroke();
    const vg = ctx.createRadialGradient(W / 2, H / 2, 1, W / 2, H / 2, 35);
    vg.addColorStop(0, "rgba(8,8,14,1)");
    vg.addColorStop(1, "rgba(4,4,9,.8)");
    [[-9, -6, -0.22],[9, -6, 0.22]].forEach(([ox, oy, tilt]) => {
      ctx.beginPath();
      ctx.ellipse(W / 2 + ox, H / 2 + oy, 22 + rng(s, 12) * 8, 30 + rng(s, 13) * 8, tilt, 0, Math.PI * 2);
      ctx.fillStyle = vg;
      ctx.fill();
    });
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.moveTo(W / 2 + (rng(s + i, 20) - 0.5) * 200, H / 2 + (rng(s + i, 21) - 0.5) * 180);
      ctx.quadraticCurveTo(W / 2 + (rng(s + i, 22) - 0.5) * 70, H / 2 + (rng(s + i, 23) - 0.5) * 70, W / 2 + (rng(s + i, 24) - 0.5) * 95, H / 2 + (rng(s + i, 25) - 0.5) * 95);
      ctx.strokeStyle = "rgba(18,16,14,.58)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2 + 98, 20, 30, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(78,73,68,.9)";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2 + 138, 68, 34, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(68,63,58,.9)";
    ctx.fill();
    if (vp.invert) {
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "difference";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
  } else if (study.modality === "US") {
    const ug = ctx.createRadialGradient(W / 2, H * 0.35, 4, W / 2, H * 0.6, 155);
    ug.addColorStop(0, "rgba(68,68,68,.9)");
    ug.addColorStop(1, "rgba(4,4,4,.95)");
    ctx.beginPath();
    ctx.moveTo(W * 0.1, H * 0.05);
    ctx.lineTo(W * 0.9, H * 0.05);
    ctx.lineTo(W * 0.95, H * 0.95);
    ctx.lineTo(W * 0.05, H * 0.95);
    ctx.closePath();
    ctx.fillStyle = ug;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2 + 18, 88 + rng(s, 1) * 22, 64 + rng(s, 2) * 16, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(195,195,195,.68)";
    ctx.lineWidth = 2;
    ctx.stroke();
    for (let n = 0; n < 1800; n++) {
      const px = rng(s + n * 7, 1) * W, py = rng(s + n * 7, 2) * H;
      const pr = rng(s + n * 7, 3) * 148 + 8;
      ctx.fillStyle = `rgba(${pr},${pr},${pr},${rng(s + n * 7, 4) * 0.38})`;
      ctx.beginPath();
      ctx.arc(px, py, rng(s + n, 5) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    const gg = ctx.createRadialGradient(W / 2, H / 2, 8, W / 2, H / 2, 195);
    gg.addColorStop(0, `rgba(${55 + rng(s, 1) * 45},${55 + rng(s, 2) * 45},${55 + rng(s, 3) * 45},1)`);
    gg.addColorStop(1, "rgba(4,4,4,.95)");
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, W * 0.4, H * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = gg;
    ctx.fill();
    for (let n = 0; n < 450; n++) {
      const px = rng(s + n * 5, 1) * W, py = rng(s + n * 5, 2) * H;
      const pr = rng(s + n * 5, 3) * 100 + 10;
      ctx.fillStyle = `rgba(${pr},${pr},${pr},.038)`;
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (vp.invert) {
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "difference";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  ctx.restore();

  const allAnns = [...anns, ...(curAnn ? [curAnn as Annotation] : [])];
  allAnns.forEach((ann) => {
    if (!ann.points || ann.points.length < 1) return;
    ctx.save();
    ctx.strokeStyle = ann.color;
    ctx.fillStyle = ann.color;
    ctx.lineWidth = 1.8;
    ctx.font = "bold 12px 'IBM Plex Mono', monospace";
    if (ann.type === "measure" && ann.points.length >= 2) {
      const [p1, p2] = ann.points;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      [p1, p2].forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      const d = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      ctx.fillText(`${(d * 0.35).toFixed(1)} mm`, (p1.x + p2.x) / 2 + 4, (p1.y + p2.y) / 2 - 6);
    }
    if (ann.type === "angle" && ann.points.length >= 3) {
      const [p1, p2, p3] = ann.points;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.stroke();
      const a1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
      const a2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
      const deg = Math.abs((((a2 - a1) * 180) / Math.PI + 360) % 360);
      ctx.beginPath();
      ctx.arc(p2.x, p2.y, 20, Math.min(a1, a2), Math.max(a1, a2));
      ctx.stroke();
      ctx.fillText(`${Math.min(deg, 360 - deg).toFixed(1)}°`, p2.x + 24, p2.y - 8);
      [p1, p2, p3].forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    if (ann.type === "rect" && ann.points.length >= 2) {
      const [p1, p2] = ann.points;
      const rw = p2.x - p1.x, rh = p2.y - p1.y;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(p1.x, p1.y, rw, rh);
      ctx.setLineDash([]);
      ctx.fillText(`${Math.abs(rw * 0.35).toFixed(1)}×${Math.abs(rh * 0.35).toFixed(1)} mm`, p1.x + 4, p1.y - 5);
    }
    if (ann.type === "ellipse" && ann.points.length >= 2) {
      const [p1, p2] = ann.points;
      const rx = Math.abs(p2.x - p1.x) / 2, ry = Math.abs(p2.y - p1.y) / 2;
      const ecx = (p1.x + p2.x) / 2, ecy = (p1.y + p2.y) / 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.ellipse(ecx, ecy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText(`${(Math.PI * rx * ry * 0.35 * 0.35).toFixed(1)} mm²`, ecx - rx + 4, ecy - ry - 5);
    }
    ctx.restore();
  });

  if (overlay) {
    ctx.save();
    ctx.font = "bold 12px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "rgba(72,228,72,.88)";
    [study.patientName, `ID: ${study.patientId}`, study.description, study.institution].forEach((t, i) =>
      ctx.fillText(t, 10, 18 + i * 14)
    );
    ctx.fillStyle = "rgba(72,180,255,.88)";
    const mr = `${study.modality}  ${study.studyDate}`;
    ctx.fillText(mr, W - ctx.measureText(mr).width - 10, 18);
    const sl = `Slice ${frame.slicePos.toFixed(1)} mm`;
    ctx.fillText(sl, W - ctx.measureText(sl).width - 10, 32);
    ctx.fillStyle = "rgba(255,220,50,.82)";
    ctx.fillText(`WW:${vp.ww} WL:${vp.wl}`, 10, H - 30);
    ctx.fillText(`Zoom:${vp.zoom.toFixed(2)}×  Rot:${vp.rotation}°`, 10, H - 16);
    ctx.fillStyle = "rgba(195,195,195,.72)";
    const fi = `Fr ${vp.frameIdx + 1}`;
    ctx.fillText(fi, W - ctx.measureText(fi).width - 10, H - 16);
    ctx.restore();
  }
}

// ─── VIEWPORT ────────────────────────────────────────────────────────────────
const ANN_COLORS = ["#FFD600", "#FF4081", "#00E5FF", "#69FF47", "#FF6D00"];
let colorCursor = 0;

const Viewport: React.FC<{
  study: Study;
  vp: VpState;
  frames: Frame[];
  active: boolean;
  tool: ToolId;
  overlay: boolean;
  onChange: (p: Partial<VpState>) => void;
  onActivate: () => void;
  label: string;
}> = ({ study, vp, frames, active, tool, overlay, onChange, onActivate, label }) => {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const contRef = useRef<HTMLDivElement>(null);
  const [anns, setAnns] = useState<Annotation[]>([]);
  const [cur, setCur] = useState<Partial<Annotation> | null>(null);
  const drag = useRef({ on: false, sx: 0, sy: 0, spx: 0, spy: 0, sww: 0, swl: 0, szoom: 1 });
  const angPhase = useRef<0 | 1 | 2>(0);

  useLayoutEffect(() => {
    const cv = cvRef.current;
    const ct = contRef.current;
    if (!cv || !ct) return;
    cv.width = ct.clientWidth;
    cv.height = ct.clientHeight;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    drawFrame(ctx, cv.width, cv.height, frames[vp.frameIdx] ?? frames[0], vp, anns, cur, study, overlay);
  }, [vp, anns, cur, study, frames, overlay]);

  const pos = (e: React.MouseEvent<HTMLCanvasElement>): Pt => {
    const r = cvRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    onActivate();
    const p = pos(e);
    drag.current = { on: true, sx: p.x, sy: p.y, spx: vp.panX, spy: vp.panY, sww: vp.ww, swl: vp.wl, szoom: vp.zoom };
    if (tool === "measure" || tool === "rect" || tool === "ellipse") {
      setCur({ type: tool, points: [p], color: ANN_COLORS[colorCursor % ANN_COLORS.length], id: String(Date.now()) });
    }
    if (tool === "angle") {
      if (angPhase.current === 0) {
        setCur({ type: "angle", points: [p], color: ANN_COLORS[colorCursor % ANN_COLORS.length], id: String(Date.now()) });
        angPhase.current = 1;
      } else if (angPhase.current === 1) {
        setCur((prev) => prev ? { ...prev, points: [...(prev.points ?? []), p] } : prev);
        angPhase.current = 2;
      }
    }
  };

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const p = pos(e);
    if (tool === "angle" && angPhase.current === 2) {
      setCur((prev) => prev && prev.points && prev.points.length >= 2 ? { ...prev, points: [prev.points[0], prev.points[1], p] } : prev);
    }
    if (!drag.current.on) return;
    const dx = p.x - drag.current.sx, dy = p.y - drag.current.sy;
    if (tool === "pan") onChange({ panX: drag.current.spx + dx, panY: drag.current.spy + dy });
    if (tool === "zoom") onChange({ zoom: Math.max(0.1, Math.min(10, drag.current.szoom - dy * 0.012)) });
    if (tool === "wl") onChange({ ww: Math.max(1, drag.current.sww + dx * 6), wl: drag.current.swl + dy * 2 });
    if ((tool === "measure" || tool === "rect" || tool === "ellipse") && cur)
      setCur((prev) => prev ? { ...prev, points: [prev.points![0], p] } : prev);
  };

  const onUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drag.current.on = false;
    if ((tool === "measure" || tool === "rect" || tool === "ellipse") && cur?.points && cur.points.length >= 2) {
      setAnns((a) => [...a, cur as Annotation]);
      setCur(null);
      colorCursor++;
    }
  };

  const cursorMap: Record<ToolId, string> = {
    pan: drag.current.on ? "grabbing" : "grab",
    zoom: "ns-resize", wl: "crosshair", measure: "crosshair",
    angle: "crosshair", rect: "crosshair", ellipse: "crosshair",
  };

  return (
    <Box
      ref={contRef}
      onClick={onActivate}
      sx={{
        position: "relative", width: "100%", height: "100%",
        border: active ? "2px solid #1565C0" : "2px solid rgba(0,0,0,.3)",
        borderRadius: "4px", overflow: "hidden", bgcolor: "#000",
      }}
    >
      <canvas
        ref={cvRef}
        style={{ width: "100%", height: "100%", display: "block", cursor: cursorMap[tool] }}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onClick={() => {
          if (tool === "angle" && angPhase.current === 2 && cur?.points && cur.points.length >= 3) {
            setAnns((a) => [...a, cur as Annotation]);
            setCur(null);
            angPhase.current = 0;
            colorCursor++;
          }
        }}
        onWheel={(e) => {
          e.preventDefault();
          onChange({ frameIdx: Math.max(0, Math.min(frames.length - 1, vp.frameIdx + (e.deltaY > 0 ? 1 : -1))) });
        }}
        onContextMenu={(e) => e.preventDefault()}
      />
      <Box sx={{ position: "absolute", top: 6, right: 6 }}>
        <Chip label={label} size="small" sx={{ bgcolor: "rgba(0,0,0,.6)", color: "#fff", fontSize: "0.68rem", height: 18 }} />
      </Box>
      {anns.length > 0 && (
        <Box sx={{ position: "absolute", bottom: 6, right: 6 }}>
          <Chip
            label={`${anns.length} ann`}
            size="small"
            onDelete={() => setAnns([])}
            deleteIcon={<Delete sx={{ fontSize: "13px !important" }} />}
            sx={{ bgcolor: "rgba(255,214,0,.78)", color: "#000", fontSize: "0.68rem", height: 20 }}
          />
        </Box>
      )}
    </Box>
  );
};

// ─── PATIENT CHANGE DIALOG ────────────────────────────────────────────────────
const MOD_COLOR: Record<string, [string, string]> = {
  CT: ["#DBEAFE", "#1D4ED8"], MRI: ["#D1FAE5", "#065F46"], XR: ["#FEF3C7", "#92400E"],
  US: ["#E0E7FF", "#3730A3"], MG: ["#FCE7F3", "#9D174D"], NM: ["#FDE8D8", "#9A3412"],
};

const PatientDialog: React.FC<{
  open: boolean;
  studies: Study[];
  current: string;
  onSelect: (s: Study) => void;
  onClose: () => void;
}> = ({ open, studies, current, onSelect, onClose }) => {
  const [q, setQ] = useState("");
  const filtered = studies.filter(
    (s) =>
      s.patientName.toLowerCase().includes(q.toLowerCase()) ||
      s.patientId.includes(q) ||
      s.modality.toLowerCase().includes(q.toLowerCase()) ||
      s.description.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1, fontSize: "1rem", fontWeight: 700 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Person sx={{ color: "primary.main" }} />
          Select Patient Study
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search patient, ID, modality…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 16, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { fontSize: "0.85rem", borderRadius: 1.5 } }}
        />
        <List dense sx={{ maxHeight: 400, overflow: "auto" }}>
          {filtered.map((s) => {
            const [bg, fg] = MOD_COLOR[s.modality] ?? ["#F3F4F6", "#374151"];
            return (
              <ListItem key={s.id} disablePadding>
                <ListItemButton
                  selected={s.id === current}
                  onClick={() => { onSelect(s); onClose(); }}
                  sx={{
                    borderRadius: 1.5, mb: 0.5,
                    "&.Mui-selected": { bgcolor: "#EBF4FF", borderLeft: "3px solid #0D47A1" },
                    border: s.id === current ? "none" : "1px solid #EEE",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#0D47A1", width: 36, height: 36, fontSize: ".8rem", fontWeight: 700 }}>
                      {s.patientName[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Typography sx={{ fontSize: ".85rem", fontWeight: 700 }}>{s.patientName}</Typography>
                        <Chip label={s.modality} size="small" sx={{ bgcolor: bg, color: fg, height: 17, fontSize: ".68rem" }} />
                        <Chip
                          label={s.status}
                          size="small"
                          sx={{
                            height: 17, fontSize: ".65rem",
                            bgcolor: s.status === "critical" ? "#FEE2E2" : s.status === "reviewed" ? "#D1FAE5" : "#FEF3C7",
                            color: s.status === "critical" ? "#B91C1C" : s.status === "reviewed" ? "#065F46" : "#92400E",
                          }}
                        />
                      </Stack>
                    }
                    secondary={
                      <Typography sx={{ fontSize: ".75rem", color: "text.secondary" }}>
                        {s.patientId} · {s.description} · {s.studyDate} · {s.institution}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
    </Dialog>
  );
};

// ─── THUMBNAIL STRIP ─────────────────────────────────────────────────────────
const ThumbStrip: React.FC<{
  frames: Frame[];
  active: number;
  onSel: (i: number) => void;
  study: Study;
}> = ({ frames, active, onSel, study }) => {
  const refs = useRef<(HTMLCanvasElement | null)[]>([]);
  useEffect(() => {
    frames.forEach((f, i) => {
      const cv = refs.current[i];
      if (!cv) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      drawFrame(ctx, 80, 80, f, { zoom: 0.38, panX: 0, panY: 0, rotation: 0, ww: 1500, wl: -600, invert: false, flipH: false, frameIdx: i }, [], null, study, false);
    });
  }, [frames, study]);
  return (
    <Box
      sx={{
        width: 96, display: "flex", flexDirection: "column", alignItems: "center",
        overflowY: "auto", borderRight: "1px solid", borderColor: "divider",
        bgcolor: "#F0F4F8", py: 0.8, gap: 0.6, flexShrink: 0,
      }}
    >
      {frames.map((_, i) => (
        <Box
          key={i}
          onClick={() => onSel(i)}
          sx={{
            width: 80, height: 80,
            border: active === i ? "2.5px solid #0D47A1" : "2px solid transparent",
            borderRadius: "4px", overflow: "hidden", cursor: "pointer", flexShrink: 0,
            position: "relative", "&:hover": { border: "2px solid #1565C0" },
          }}
        >
          <canvas
            ref={(el) => { refs.current[i] = el; }}
            width={80}
            height={80}
            style={{ width: "100%", height: "100%", display: "block", background: "#000" }}
          />
          <Typography sx={{ position: "absolute", bottom: 2, right: 3, fontSize: ".6rem", color: "rgba(100,220,100,.85)", fontFamily: "monospace", lineHeight: 1 }}>
            {i + 1}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ─── INFO PANEL ───────────────────────────────────────────────────────────────
const WL_PRESETS = [
  { label: "Lung", ww: 1500, wl: -600 },
  { label: "Mediastinum", ww: 350, wl: 50 },
  { label: "Bone", ww: 2000, wl: 300 },
  { label: "Brain", ww: 80, wl: 40 },
  { label: "Liver", ww: 160, wl: 60 },
  { label: "Soft Tissue", ww: 400, wl: 50 },
  { label: "Abdomen", ww: 400, wl: 50 },
  { label: "Angio", ww: 600, wl: 300 },
];

const InfoPanel: React.FC<{
  study: Study;
  vp: VpState;
  onChange: (p: Partial<VpState>) => void;
}> = ({ study, vp, onChange }) => {
  const [tab, setTab] = useState(0);
  return (
    <Box sx={{ width: 260, display: "flex", flexDirection: "column", borderLeft: "1px solid", borderColor: "divider", bgcolor: "#fff", flexShrink: 0 }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ minHeight: 42, borderBottom: "1px solid", borderColor: "divider", "& .MuiTabs-indicator": { height: 2 }, "& .MuiTab-root": { minHeight: 42, fontSize: ".75rem", px: 1.5 } }}
      >
        <Tab label="DICOM" />
        <Tab label="W/L" />
        <Tab label="Series" />
      </Tabs>
      <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
        {tab === 0 && (
          <>
            <Typography sx={{ fontSize: ".68rem", fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: ".06em", mb: 0.8 }}>
              DICOM Tags
            </Typography>
            {[
              ["Patient", study.patientName], ["ID", study.patientId], ["DOB", study.dob], ["Sex", study.sex],
              ["Modality", study.modality], ["Date", study.studyDate], ["Accession", study.accessionNo],
              ["Institution", study.institution], ["Physician", study.referringPhysician],
              ["Study UID", "1.2.840.10008.5.1.4.1"], ["KVP", "120 kV"], ["mAs", "250"],
              ["Slice Thick", "5.00 mm"], ["Pixel Spacing", "0.703\\0.703"], ["Rows×Cols", "512×512"],
              ["Bit Depth", "12-bit"], ["Manufacturer", "Siemens Healthineers"], ["Station", "CT_SCANNER_01"],
            ].map(([k, v]) => (
              <Box key={k} sx={{ py: 0.4, borderBottom: "1px solid #F0F4F8" }}>
                <Typography sx={{ fontSize: ".65rem", color: "#718096" }}>{k}</Typography>
                <Typography sx={{ fontSize: ".76rem", fontWeight: 600, color: "#0E1628", wordBreak: "break-all" }}>{v}</Typography>
              </Box>
            ))}
            <Box mt={1.5}>
              <Typography sx={{ fontSize: ".68rem", fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: ".06em", mb: 0.8 }}>
                Live Viewport
              </Typography>
              {[
                ["Zoom", `${vp.zoom.toFixed(2)}×`], ["Rotation", `${vp.rotation}°`],
                ["WW / WL", `${vp.ww} / ${vp.wl}`], ["Pan X", `${vp.panX.toFixed(0)} px`],
                ["Pan Y", `${vp.panY.toFixed(0)} px`], ["Invert", vp.invert ? "ON" : "off"], ["Flip H", vp.flipH ? "ON" : "off"],
              ].map(([k, v]) => (
                <Box key={k} sx={{ py: 0.4, borderBottom: "1px solid #F0F4F8" }}>
                  <Typography sx={{ fontSize: ".65rem", color: "#718096" }}>{k}</Typography>
                  <Typography sx={{ fontSize: ".76rem", fontWeight: 600, color: "#0D47A1" }}>{v}</Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
        {tab === 1 && (
          <>
            <Typography sx={{ fontSize: ".68rem", fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: ".06em", mb: 1.2 }}>
              Window / Level
            </Typography>
            {([
              { label: "Window Width", key: "ww", min: 1, max: 4000, step: 10 },
              { label: "Window Center", key: "wl", min: -1000, max: 1000, step: 5 },
              { label: "Zoom", key: "zoom", min: 0.1, max: 5, step: 0.05 },
              { label: "Rotation°", key: "rotation", min: 0, max: 359, step: 1 },
            ] as { label: string; key: keyof VpState; min: number; max: number; step: number }[]).map(({ label, key, min, max, step }) => (
              <Box key={key} mb={1.4}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: ".76rem", fontWeight: 600 }}>{label}</Typography>
                  <Typography sx={{ fontSize: ".72rem", color: "#0D47A1", fontWeight: 700 }}>
                    {(vp[key] as number).toFixed(key === "zoom" ? 2 : 0)}
                  </Typography>
                </Stack>
                <Slider
                  size="small"
                  value={vp[key] as number}
                  min={min} max={max} step={step}
                  onChange={(_, v) => onChange({ [key]: v })}
                  sx={{ color: "primary.main", "& .MuiSlider-thumb": { width: 13, height: 13 } }}
                />
              </Box>
            ))}
            <Stack spacing={1} mt={0.5}>
              {[{ label: "Invert", key: "invert" }, { label: "Flip H", key: "flipH" }].map(({ label, key }) => (
                <Stack key={key} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: ".78rem" }}>{label}</Typography>
                  <Button
                    size="small"
                    variant={vp[key as keyof VpState] ? "contained" : "outlined"}
                    onClick={() => onChange({ [key]: !vp[key as keyof VpState] })}
                    sx={{ minWidth: 52, height: 26, fontSize: ".7rem", py: 0 }}
                  >
                    {vp[key as keyof VpState] ? "ON" : "OFF"}
                  </Button>
                </Stack>
              ))}
            </Stack>
            <Box mt={2}>
              <Typography sx={{ fontSize: ".68rem", fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: ".06em", mb: 0.8 }}>
                Presets
              </Typography>
              <Stack spacing={0.5}>
                {WL_PRESETS.map((p) => (
                  <Button
                    key={p.label}
                    size="small"
                    variant="outlined"
                    onClick={() => onChange({ ww: p.ww, wl: p.wl })}
                    sx={{ justifyContent: "flex-start", fontSize: ".74rem", py: 0.2, px: 1, height: 28 }}
                  >
                    {p.label}
                    <Typography component="span" sx={{ fontSize: ".65rem", ml: "auto", color: "text.secondary" }}>
                      {p.ww}/{p.wl}
                    </Typography>
                  </Button>
                ))}
              </Stack>
            </Box>
          </>
        )}
        {tab === 2 && (
          <>
            <Typography sx={{ fontSize: ".68rem", fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: ".06em", mb: 0.8 }}>
              Series List
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Imgs</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: study.seriesCount }).map((_, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>Series {i + 1}</TableCell>
                      <TableCell>{Math.round(study.imageCount / study.seriesCount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </Box>
  );
};

// ─── TOOLS CONFIG ─────────────────────────────────────────────────────────────
const TOOLS: { id: ToolId; label: string; icon: React.ReactNode; shortcut: string; desc: string }[] = [
  { id: "pan", label: "Pan", icon: <PanTool sx={{ fontSize: 16 }} />, shortcut: "P", desc: "Drag to pan" },
  { id: "zoom", label: "Zoom", icon: <ZoomIn sx={{ fontSize: 16 }} />, shortcut: "Z", desc: "Drag up/down to zoom" },
  { id: "wl", label: "W/L", icon: <Brightness6 sx={{ fontSize: 16 }} />, shortcut: "W", desc: "Drag: left/right=WW, up/down=WL" },
  { id: "measure", label: "Measure", icon: <Straighten sx={{ fontSize: 16 }} />, shortcut: "M", desc: "Click two points to measure distance" },
  { id: "angle", label: "Angle", icon: <Timeline sx={{ fontSize: 16 }} />, shortcut: "A", desc: "3 clicks to measure angle" },
  { id: "rect", label: "Rect ROI", icon: <CropSquare sx={{ fontSize: 16 }} />, shortcut: "R", desc: "Draw rectangle ROI" },
  { id: "ellipse", label: "Ellipse ROI", icon: <RadioButtonUnchecked sx={{ fontSize: 16 }} />, shortcut: "E", desc: "Draw ellipse ROI" },
];

const DEF: VpState = { zoom: 1, panX: 0, panY: 0, rotation: 0, ww: 1500, wl: -600, invert: false, flipH: false, frameIdx: 0 };

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PACSViewer() {
  const [study, setStudy] = useState<Study>(STUDIES[0]);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [tool, setTool] = useState<ToolId>("pan");
  const [layout, setLayout] = useState<LayoutId>("1x1");
  const [activeVp, setActiveVp] = useState(0);
  const [overlay, setOverlay] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [fps, setFps] = useState(8);
  const [snack, setSnack] = useState("");
  const [vps, setVps] = useState<VpState[]>(Array.from({ length: 4 }, () => ({ ...DEF })));

  const frames = useMemo(() => makeFrames(Math.min(study.imageCount, 32)), [study]);
  const vpCount = layout === "1x1" ? 1 : layout === "1x2" ? 2 : 4;
  const avp = vps[activeVp];

  const updVp = useCallback(
    (idx: number, p: Partial<VpState>) => setVps((prev) => prev.map((v, i) => (i === idx ? { ...v, ...p } : v))),
    []
  );
  const updActive = (p: Partial<VpState>) => updVp(activeVp, p);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () => setVps((prev) => prev.map((v, i) => i === activeVp ? { ...v, frameIdx: (v.frameIdx + 1) % frames.length } : v)),
      1000 / fps
    );
    return () => clearInterval(t);
  }, [playing, fps, activeVp, frames.length]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const tmap: Record<string, ToolId> = { p: "pan", z: "zoom", w: "wl", m: "measure", a: "angle", r: "rect", e: "ellipse" };
      if (tmap[e.key.toLowerCase()]) { setTool(tmap[e.key.toLowerCase()]); return; }
      if (e.key === " ") { e.preventDefault(); setPlaying((v) => !v); return; }
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        setVps((prev) => prev.map((v, i) => i === activeVp ? { ...v, frameIdx: Math.min(v.frameIdx + 1, frames.length - 1) } : v));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        setVps((prev) => prev.map((v, i) => i === activeVp ? { ...v, frameIdx: Math.max(v.frameIdx - 1, 0) } : v));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [activeVp, frames.length]);

  const resetAll = () => {
    setVps(Array.from({ length: 4 }, () => ({ ...DEF })));
    setSnack("All viewports reset");
  };

  return (
    <PageTemplate title="PACS Viewer" subtitle="View and analyze medical images." currentPageTitle="PACS Viewer">
      <ThemeProvider theme={theme}>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", bgcolor: "#1172BA" }}>

          {/* ── APP BAR ─────────────────────────────────────────────────────── */}
          <AppBar position="static" elevation={0}>
            <Toolbar variant="dense" sx={{ gap: 0.8, minHeight: 52, flexWrap: "nowrap" }}>

              {/* <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,.2)", mx: 0.5 }} /> */}

              {/* TOOL BUTTONS */}
              {TOOLS.map((t) => (
                <Tooltip key={t.id} title={<><strong>{t.label}</strong> ({t.shortcut})<br />{t.desc}</>} placement="bottom">
                  <IconButton
                    size="small"
                    onClick={() => setTool(t.id)}
                    sx={{
                      bgcolor: tool === t.id ? "rgba(255,255,255,.2)" : "transparent",
                      color: tool === t.id ? "#fff" : "rgba(255,255,255,.6)",
                      border: tool === t.id ? "1px solid rgba(255,255,255,.35)" : "1px solid transparent",
                      borderRadius: 1, width: 32, height: 32,
                      "&:hover": { bgcolor: "rgba(255,255,255,.14)", color: "#fff" },
                    }}
                  >
                    {t.icon}
                  </IconButton>
                </Tooltip>
              ))}
              <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,.2)", mx: 0.5 }} />

              {/* QUICK ACTIONS */}
              {[
                { tip: "Zoom In", icon: <ZoomIn sx={{ fontSize: 17 }} />, fn: () => updActive({ zoom: Math.min(avp.zoom + 0.25, 10) }) },
                { tip: "Zoom Out", icon: <ZoomOut sx={{ fontSize: 17 }} />, fn: () => updActive({ zoom: Math.max(avp.zoom - 0.25, 0.1) }) },
                { tip: "Rotate Left", icon: <RotateLeft sx={{ fontSize: 17 }} />, fn: () => updActive({ rotation: (avp.rotation - 90 + 360) % 360 }) },
                { tip: "Rotate Right", icon: <RotateRight sx={{ fontSize: 17 }} />, fn: () => updActive({ rotation: (avp.rotation + 90) % 360 }) },
              ].map(({ tip, icon, fn }) => (
                <Tooltip key={tip} title={tip}>
                  <IconButton size="small" onClick={fn} sx={{ color: "rgba(255,255,255,.68)", "&:hover": { color: "#fff" } }}>
                    {icon}
                  </IconButton>
                </Tooltip>
              ))}
              <Tooltip title={`Flip H ${avp.flipH ? "(ON)" : ""}`}>
                <IconButton size="small" onClick={() => updActive({ flipH: !avp.flipH })} sx={{ color: avp.flipH ? "#FFD600" : "rgba(255,255,255,.68)" }}>
                  <Flip sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={`Invert ${avp.invert ? "(ON)" : ""}`}>
                <IconButton size="small" onClick={() => updActive({ invert: !avp.invert })} sx={{ color: avp.invert ? "#FFD600" : "rgba(255,255,255,.68)" }}>
                  <InvertColors sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Auto W/L">
                <IconButton size="small" onClick={() => { updActive({ ww: 1500, wl: -600 }); setSnack("Auto W/L applied"); }} sx={{ color: "rgba(255,255,255,.68)" }}>
                  <AutoFixHigh sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Toggle Overlay">
                <IconButton size="small" onClick={() => setOverlay((v) => !v)} sx={{ color: overlay ? "#FFD600" : "rgba(255,255,255,.68)" }}>
                  <Typography sx={{ fontSize: ".7rem", fontWeight: 700 }}>OVL</Typography>
                </IconButton>
              </Tooltip>
              <Button
                size="small"
                variant="outlined"
                onClick={resetAll}
                sx={{ color: "#fff", borderColor: "rgba(255,255,255,.38)", minWidth: 52, height: 28, fontSize: ".7rem", py: 0, "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,.1)" } }}
              >
                Reset
              </Button>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,.2)", mx: 0.5 }} />

              {/* LAYOUTS */}
              <ButtonGroup size="small">
                {(["1x1", "1x2", "2x2"] as LayoutId[]).map((l) => (
                  <Button
                    key={l}
                    onClick={() => setLayout(l)}
                    sx={{
                      minWidth: 40, px: 0.6, fontSize: ".7rem", py: 0.2, height: 28,
                      color: "#fff", borderColor: "rgba(255,255,255,.35) !important",
                      bgcolor: layout === l ? "rgba(255,255,255,.22) !important" : "transparent",
                    }}
                  >
                    {l}
                  </Button>
                ))}
              </ButtonGroup>
            </Toolbar>
          </AppBar>

          {/* ── PATIENT BANNER ───────────────────────────────────────────────── */}
          <Box
            sx={{
              px: 2.5, py: 1, bgcolor: "#EBF4FF", borderBottom: "1px solid #BFDBFE",
              display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap", minHeight: 52, flexShrink: 0,
            }}
          >
            <Avatar sx={{ bgcolor: "#0D47A1", width: 36, height: 36, fontSize: ".85rem", fontWeight: 700 }}>
              {study.patientName[0]}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: ".88rem", fontWeight: 700, color: "#0E1628", lineHeight: 1.2 }}>
                {study.patientName}
              </Typography>
              <Typography sx={{ fontSize: ".7rem", color: "#4A5568" }}>
                DOB: {study.dob} · {study.sex} · ID: {study.patientId}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            {[
              ["Modality", study.modality],
              ["Date", study.studyDate],
              ["Description", study.description],
              ["Accession", study.accessionNo],
              ["Physician", study.referringPhysician],
              ["Institution", study.institution],
            ].map(([k, v]) => (
              <Box key={k}>
                <Typography sx={{ fontSize: ".62rem", color: "#718096" }}>{k}</Typography>
                <Typography sx={{ fontSize: ".78rem", fontWeight: 700, color: "#0E1628" }}>{v}</Typography>
              </Box>
            ))}
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
              <Chip
                label={study.status.toUpperCase()}
                size="small"
                color={study.status === "critical" ? "error" : study.status === "reviewed" ? "success" : "warning"}
                sx={{ fontSize: ".72rem", height: 22 }}
              />
              {/* ── CHANGE PATIENT BUTTON ── */}
              <Button
                variant="contained"
                size="small"
                startIcon={<SwapHoriz sx={{ fontSize: 16 }} />}
                onClick={() => setPatientDialogOpen(true)}
                sx={{ height: 30, fontSize: ".75rem", fontWeight: 700, borderRadius: 1.5, bgcolor: "#1172BA", "&:hover": { bgcolor: "#0A337A" } }}
              >
                Change Patient
              </Button>
            </Box>
          </Box>

          {/* ── MAIN ────────────────────────────────────────────────────────── */}
          <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <ThumbStrip frames={frames} active={avp.frameIdx} onSel={(i) => updVp(activeVp, { frameIdx: i })} study={study} />

            {/* VIEWPORT COLUMN */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
              {/* CINE BAR */}
              <Box
                sx={{
                  px: 1.5, py: 0.6, bgcolor: "#F7FAFC", borderBottom: "1px solid", borderColor: "divider",
                  display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0,
                }}
              >
                <IconButton size="small" onClick={() => updVp(activeVp, { frameIdx: 0 })}>
                  <SkipPrevious sx={{ fontSize: 17 }} />
                </IconButton>
                <IconButton size="small" onClick={() => updVp(activeVp, { frameIdx: Math.max(avp.frameIdx - 1, 0) })}>
                  <ArrowBack sx={{ fontSize: 17 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setPlaying((v) => !v)}
                  sx={{ bgcolor: "primary.main", color: "#fff", width: 28, height: 28, "&:hover": { bgcolor: "primary.dark" } }}
                >
                  {playing ? <Pause sx={{ fontSize: 15 }} /> : <PlayArrow sx={{ fontSize: 15 }} />}
                </IconButton>
                <IconButton size="small" onClick={() => updVp(activeVp, { frameIdx: Math.min(avp.frameIdx + 1, frames.length - 1) })}>
                  <ArrowForward sx={{ fontSize: 17 }} />
                </IconButton>
                <IconButton size="small" onClick={() => updVp(activeVp, { frameIdx: frames.length - 1 })}>
                  <SkipNext sx={{ fontSize: 17 }} />
                </IconButton>
                <Typography sx={{ fontSize: ".74rem", color: "text.secondary", minWidth: 58 }}>
                  {avp.frameIdx + 1}/{frames.length}
                </Typography>
                <Slider
                  size="small" value={avp.frameIdx} min={0} max={frames.length - 1} step={1}
                  onChange={(_, v) => updVp(activeVp, { frameIdx: v as number })}
                  sx={{ flex: 1, maxWidth: 200, color: "primary.main", py: 0, "& .MuiSlider-thumb": { width: 12, height: 12 } }}
                />
                <Divider orientation="vertical" flexItem />
                <Typography sx={{ fontSize: ".72rem", color: "text.secondary" }}>WW</Typography>
                <Slider
                  size="small" value={avp.ww} min={1} max={4000}
                  onChange={(_, v) => updVp(activeVp, { ww: v as number })}
                  sx={{ width: 78, color: "primary.main", py: 0, "& .MuiSlider-thumb": { width: 12, height: 12 } }}
                />
                <Typography sx={{ fontSize: ".7rem", color: "primary.main", fontWeight: 700, minWidth: 34 }}>{avp.ww}</Typography>
                <Typography sx={{ fontSize: ".72rem", color: "text.secondary" }}>WL</Typography>
                <Slider
                  size="small" value={avp.wl} min={-1000} max={1000}
                  onChange={(_, v) => updVp(activeVp, { wl: v as number })}
                  sx={{ width: 78, color: "secondary.main", py: 0, "& .MuiSlider-thumb": { width: 12, height: 12 } }}
                />
                <Typography sx={{ fontSize: ".7rem", color: "secondary.main", fontWeight: 700, minWidth: 38 }}>{avp.wl}</Typography>
                <Divider orientation="vertical" flexItem />
                <Typography sx={{ fontSize: ".72rem", color: "text.secondary" }}>FPS</Typography>
                <Slider
                  size="small" value={fps} min={1} max={24} step={1}
                  onChange={(_, v) => setFps(v as number)}
                  sx={{ width: 55, py: 0, "& .MuiSlider-thumb": { width: 12, height: 12 } }}
                />
                <Typography sx={{ fontSize: ".7rem", fontWeight: 700, minWidth: 20 }}>{fps}</Typography>
                <Divider orientation="vertical" flexItem />
                <Typography sx={{ fontSize: ".72rem", color: "text.secondary" }}>
                  Slice: {(frames[avp.frameIdx] ?? frames[0]).slicePos.toFixed(1)} mm
                </Typography>
              </Box>

              {/* VIEWPORT GRID */}
              <Box
                sx={{
                  flex: 1, p: 0.6, display: "grid", gap: 0.6, bgcolor: "#94A3B8",
                  gridTemplateColumns: vpCount === 1 ? "1fr" : "1fr 1fr",
                  gridTemplateRows: vpCount <= 2 ? "1fr" : "1fr 1fr",
                }}
              >
                {Array.from({ length: vpCount }).map((_, i) => (
                  <Viewport
                    key={i}
                    study={study}
                    vp={vps[i]}
                    frames={frames}
                    active={activeVp === i}
                    tool={tool}
                    overlay={overlay}
                    onChange={(p) => updVp(i, p)}
                    onActivate={() => setActiveVp(i)}
                    label={`VP ${i + 1}`}
                  />
                ))}
              </Box>
            </Box>

            <InfoPanel study={study} vp={avp} onChange={updActive} />
          </Box>

          {/* ── STATUS BAR ──────────────────────────────────────────────────── */}
          <Box sx={{ px: 2.5, py: 0.4, bgcolor: "#1172BA", display: "flex", alignItems: "center", gap: 2.5, flexShrink: 0 }}>
            {[
              ["Tool", tool.toUpperCase()], ["Layout", layout], ["VP", `${activeVp + 1}/${vpCount}`],
              ["Frame", `${avp.frameIdx + 1}/${frames.length}`], ["Zoom", `${avp.zoom.toFixed(2)}×`],
              ["WW/WL", `${avp.ww}/${avp.wl}`], ["Rot", `${avp.rotation}°`],
            ].map(([k, v]) => (
              <Typography key={k} sx={{ fontSize: ".68rem", color: "rgba(255,255,255,.55)" }}>
                {k}: <strong style={{ color: "#fff" }}>{v}</strong>
              </Typography>
            ))}
            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontSize: ".65rem", color: "white" }}>
              PACS Viewer · {new Date().toLocaleTimeString("en-IN")} IST · {playing ? "▶ PLAYING" : "⏸ STOPPED"}
            </Typography>
          </Box>

          {/* ── PATIENT CHANGE DIALOG ────────────────────────────────────────── */}
          <PatientDialog
            open={patientDialogOpen}
            studies={STUDIES}
            current={study.id}
            onSelect={(s) => {
              setStudy(s);
              setVps(Array.from({ length: 4 }, () => ({ ...DEF })));
              setPlaying(false);
              setSnack(`Patient changed to ${s.patientName}`);
            }}
            onClose={() => setPatientDialogOpen(false)}
          />

          <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
            <Alert severity="info" onClose={() => setSnack("")} sx={{ fontSize: ".82rem" }}>
              {snack}
            </Alert>
          </Snackbar>
        </Box>
      </ThemeProvider>
    </PageTemplate>
  );
}