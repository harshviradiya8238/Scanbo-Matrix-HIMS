export interface ValidatedMethod {
  id: string;
  name: string;
  linkedAnalysis: string;
  principle: string;
  instrument: string;
  standard: string;
  department: string;
  validatedOn: string;
  status: "Active" | "Inactive";
}
