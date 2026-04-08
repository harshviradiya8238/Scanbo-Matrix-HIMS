export interface CalculatedAnalysis {
  id: string;
  keyword: string;
  name: string;
  formula: string;
  unit: string;
  refRange: string;
  department: string;
  status: "Active" | "Inactive";
}
