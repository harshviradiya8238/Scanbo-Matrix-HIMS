export interface AnalysisProfile {
  id: string;
  name: string;
  department: string;
  analytesCount: number;
  analytesList: string;
  sampleType: string;
  container: string;
  tat: string;
  price: string;
  monthlyUsage: number;
  maxUsage?: number;
}
