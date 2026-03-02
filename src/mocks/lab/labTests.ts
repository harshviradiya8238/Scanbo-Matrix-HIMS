import type { LabTestCatalogItem } from '@/src/screens/lab/lab-types';

export const MOCK_LAB_TESTS: LabTestCatalogItem[] = [
  { code: 'CBC', name: 'Complete Blood Count', dept: 'Hematology', method: 'Automated', tat: '2h', price: 350, analytes: ['WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'MCV', 'MCH', 'MCHC', 'Platelets'] },
  { code: 'LFT', name: 'Liver Function Test', dept: 'Biochemistry', method: 'Photometric', tat: '4h', price: 650, analytes: ['Total Bilirubin', 'Direct Bilirubin', 'ALT', 'AST', 'ALP', 'GGT', 'Total Protein', 'Albumin'] },
  { code: 'TFT', name: 'Thyroid Function Test', dept: 'Immunology', method: 'CLIA', tat: '6h', price: 900, analytes: ['TSH', 'Free T3', 'Free T4'] },
  { code: 'LP', name: 'Lipid Panel', dept: 'Biochemistry', method: 'Enzymatic', tat: '4h', price: 550, analytes: ['Total Cholesterol', 'Triglycerides', 'HDL', 'LDL', 'VLDL'] },
  { code: 'HBA1C', name: 'Glycated Hemoglobin', dept: 'Biochemistry', method: 'HPLC', tat: '3h', price: 450, analytes: ['HbA1c'] },
  { code: 'GLU', name: 'Fasting Glucose', dept: 'Biochemistry', method: 'Enzymatic', tat: '1h', price: 80, analytes: ['Fasting Glucose'] },
  { code: 'CS', name: 'Culture & Sensitivity', dept: 'Microbiology', method: 'Manual', tat: '48h', price: 800, analytes: ['Organism', 'Colony Count', 'Sensitivity'] },
  { code: 'HISTO', name: 'Histopathology', dept: 'Pathology', method: 'Manual', tat: '72h', price: 1200, analytes: ['Gross Description', 'Microscopy', 'Diagnosis'] },
  { code: 'UA', name: 'Urinalysis', dept: 'Biochemistry', method: 'Dipstick+Micro', tat: '1h', price: 150, analytes: ['Color', 'Clarity', 'pH', 'Specific Gravity', 'Glucose', 'Protein', 'Blood', 'Ketones', 'Nitrite', 'Leukocytes'] },
  { code: 'CSF', name: 'CSF Analysis', dept: 'Biochemistry', method: 'Manual', tat: '4h', price: 600, analytes: ['Appearance', 'Cell Count', 'Protein', 'Glucose', 'Chloride'] },
];
