export interface QCSample {
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

export type QCSampleView = "list" | "visual";

export interface QCTrendPoint {
  date: string;
  value: number;
  status: "pass" | "fail" | "warning";
}
