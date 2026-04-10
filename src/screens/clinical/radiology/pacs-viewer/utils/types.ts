export interface ToolDef {
  id: string;
  title: string;
  d?: string;
  custom?: string;
}

export interface PacsPatient {
  id: string;
  name: string;
  initials: string;
  dob: string;
  sex: string;
  modality: string;
  desc: string;
  accession: string;
  physician: string;
  institution: string;
  critical: boolean;
}

export interface DicomRow {
  label: string;
  value: string;
  mono?: boolean;
}

export interface DicomSection {
  title: string;
  rows: DicomRow[];
}
