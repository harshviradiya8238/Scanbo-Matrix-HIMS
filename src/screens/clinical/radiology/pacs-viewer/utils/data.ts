import type { DicomSection, PacsPatient, ToolDef } from "./types";

export const THUMBS = [
  "radial-gradient(circle at 60% 40%,#2a3a4e,#0A0E14)",
  "radial-gradient(circle at 50% 50%,#263040,#0A0E14)",
  "radial-gradient(circle at 45% 55%,#2a3a4e,#0A0E14)",
  "radial-gradient(circle at 55% 45%,#223040,#0A0E14)",
  "radial-gradient(circle at 50% 50%,#1E2A38,#0A0E14)",
  "radial-gradient(circle at 48% 52%,#243040,#0A0E14)",
  "radial-gradient(circle at 52% 48%,#1E2A38,#0A0E14)",
  "radial-gradient(circle at 50% 50%,#1E2A38,#0A0E14)",
];

export const DICOM_SECTIONS: DicomSection[] = [
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

export const PATIENTS: PacsPatient[] = [
  { id: "P10045", name: "Rajesh Kumar", initials: "RK", dob: "1978-04-12", sex: "M", modality: "CT", desc: "CT Chest w Contrast", accession: "ACC-001", physician: "Dr. Sharma", institution: "Apollo Mumbai", critical: true },
  { id: "P10046", name: "Priya Menon", initials: "PM", dob: "1990-07-22", sex: "F", modality: "MRI", desc: "MRI Brain w/wo Contrast", accession: "ACC-002", physician: "Dr. Nair", institution: "Fortis Delhi", critical: false },
  { id: "P10047", name: "Arun Sharma", initials: "AS", dob: "1965-03-05", sex: "M", modality: "USG", desc: "USG Abdomen", accession: "ACC-003", physician: "Dr. Patel", institution: "Apollo Mumbai", critical: false },
  { id: "P10048", name: "Sunita Joshi", initials: "SJ", dob: "1982-11-18", sex: "F", modality: "CT", desc: "CT Abdomen Pelvis", accession: "ACC-004", physician: "Dr. Mehta", institution: "Max Saket", critical: true },
  { id: "P10049", name: "Vikram Reddy", initials: "VR", dob: "1955-08-30", sex: "M", modality: "XR", desc: "X-Ray Chest PA View", accession: "ACC-005", physician: "Dr. Iyer", institution: "Fortis Delhi", critical: false },
];

export const TOOLS: ToolDef[] = [
  { id: "pan", title: "Pan", d: "M8 2v12M2 8h12M5 5l-3 3 3 3M11 5l3 3-3 3" },
  { id: "zoom", title: "Zoom", custom: "zoom" },
  { id: "bright", title: "Brightness", custom: "bright" },
  { id: "length", title: "Measure Length", d: "M2 14L14 2M2 10v4h4M10 2h4v4" },
  { id: "freehand", title: "Freehand", d: "M2 10c2-4 4-6 6-4s0 6 4 4" },
  { id: "rect", title: "Rectangle ROI", custom: "rect" },
  { id: "ellipse", title: "Ellipse ROI", custom: "ellipse" },
];

export const SECONDARY_TOOLS: ToolDef[] = [
  { id: "zoomin", title: "Zoom In", custom: "zoomin" },
  { id: "zoomout", title: "Zoom Out", custom: "zoomout" },
  { id: "undo", title: "Undo", d: "M3 7a5 5 0 105 5M3 3v4h4" },
  { id: "redo", title: "Redo", d: "M13 7a5 5 0 11-5 5M13 3v4h-4" },
  { id: "fliph", title: "Flip H", d: "M8 2v12M4 5L1 8l3 3M12 5l3 3-3 3" },
  { id: "wl", title: "W/L", custom: "wl" },
  { id: "annotate", title: "Annotate", d: "M3 13l2-4 7-7 2 2-7 7-4 2zM11 3l2 2" },
];
