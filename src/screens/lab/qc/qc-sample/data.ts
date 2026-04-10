import type { QCSample, QCTrendPoint } from "./types";

export const MOCK_QC: QCSample[] = [
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

export const TREND_DATA: QCTrendPoint[] = [
  { date: "01 Mar", value: 95.2, status: "pass" },
  { date: "02 Mar", value: 94.8, status: "pass" },
  { date: "03 Mar", value: 96.1, status: "pass" },
  { date: "04 Mar", value: 95.5, status: "pass" },
  { date: "05 Mar", value: 97.8, status: "pass" },
  { date: "06 Mar", value: 99.2, status: "warning" },
  { date: "07 Mar", value: 96.4, status: "pass" },
  { date: "08 Mar", value: 95.1, status: "pass" },
  { date: "09 Mar", value: 94.2, status: "pass" },
  { date: "10 Mar", value: 93.8, status: "pass" },
  { date: "11 Mar", value: 92.1, status: "warning" },
  { date: "12 Mar", value: 95.4, status: "pass" },
  { date: "13 Mar", value: 96.2, status: "pass" },
  { date: "14 Mar", value: 101.4, status: "fail" },
  { date: "15 Mar", value: 95.8, status: "pass" },
];

export const MEAN = 95.0;
export const SD = 2.0;

export const CHART_SD_LABELS = [4, 3, 2, 1, 0, -1, -2, -3, -4];
export const CHART_SD_LINES = [1, 2, 3];

export const CHART_SUMMARY_ITEMS = [
  { label: "Target", val: MEAN, color: "primary.main" },
  { label: "SD", val: SD, color: "text.secondary" },
  { label: "CV%", val: "2.1%", color: "text.secondary" },
];

export const CHART_LEGEND_ITEMS = [
  { label: "Within Limits", color: "#16a34a" },
  { label: "Rule Breach (>2SD)", color: "#ea580c" },
  { label: "Action Limit (>3SD)", color: "#dc2626" },
];
