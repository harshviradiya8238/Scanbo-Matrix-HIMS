export interface Department {
  id: string;
  name: string;
  shortCode: string;
  head: string;
  analysts: string;
  instruments: string;
  tatTarget: string;
  testsToday: number;
  tatCompliance: number;
  status: "Active" | "Inactive";
  iconType: string;
}
