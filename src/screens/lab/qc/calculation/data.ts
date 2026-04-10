import type { CalculatedAnalysis } from "./types";

export const DUMMY_DATA: CalculatedAnalysis[] = [
  {
    id: "1",
    keyword: "AG",
    name: "Anion Gap",
    formula: "Na - Cl - HCO3",
    unit: "mEq/L",
    refRange: "8-16",
    department: "Biochemistry",
    status: "Active",
  },
  {
    id: "2",
    keyword: "eGFR",
    name: "Estimated GFR",
    formula: "186 x Cr^-1.154 x Age^-0.203",
    unit: "mL/min",
    refRange: ">60",
    department: "Biochemistry",
    status: "Active",
  },
  {
    id: "3",
    keyword: "MCHC",
    name: "Mean Cell Hb Concentration",
    formula: "(HGB / HCT) x 100",
    unit: "g/dL",
    refRange: "32-36",
    department: "Haematology",
    status: "Inactive",
  },
];
