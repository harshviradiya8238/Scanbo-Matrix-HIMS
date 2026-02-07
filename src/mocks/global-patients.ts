export type GlobalPatientStatus = 'Active' | 'Inactive' | 'Admitted' | 'Discharged' | 'Billing Hold';
export type GlobalPatientGender = 'Male' | 'Female' | 'Other';

export interface GlobalPatient {
  mrn: string;
  name: string;
  age: number;
  gender: GlobalPatientGender;
  ageGender: string;
  phone: string;
  city: string;
  department: string;
  primaryDoctor: string;
  status: GlobalPatientStatus;
  lastVisit: string;
  nextAppointment?: string | null;
  tags: string[];
}

const buildPatient = (patient: Omit<GlobalPatient, 'ageGender'>): GlobalPatient => ({
  ...patient,
  ageGender: `${patient.age} / ${patient.gender}`,
});

export const GLOBAL_PATIENTS: GlobalPatient[] = [
  buildPatient({
    mrn: 'MRN-245781',
    name: 'Aarav Nair',
    age: 34,
    gender: 'Male',
    phone: '+91 98100 44110',
    city: 'Mumbai',
    department: 'General Medicine',
    primaryDoctor: 'Dr. Nisha Rao',
    status: 'Active',
    lastVisit: '2026-02-04',
    nextAppointment: '2026-02-10',
    tags: ['Diabetic', 'High Risk'],
  }),
  buildPatient({
    mrn: 'MRN-245799',
    name: 'Meera Joshi',
    age: 28,
    gender: 'Female',
    phone: '+91 98100 44111',
    city: 'Pune',
    department: 'General Medicine',
    primaryDoctor: 'Dr. Nisha Rao',
    status: 'Active',
    lastVisit: '2026-02-04',
    nextAppointment: '2026-02-12',
    tags: ['VIP'],
  }),
  buildPatient({
    mrn: 'MRN-245802',
    name: 'Ravi Iyer',
    age: 52,
    gender: 'Male',
    phone: '+91 98100 44112',
    city: 'Bengaluru',
    department: 'Cardiology',
    primaryDoctor: 'Dr. Rohan Mehta',
    status: 'Active',
    lastVisit: '2026-02-04',
    nextAppointment: '2026-02-14',
    tags: ['Hypertension'],
  }),
  buildPatient({
    mrn: 'MRN-245811',
    name: 'Fatima Khan',
    age: 41,
    gender: 'Female',
    phone: '+91 98100 44113',
    city: 'Hyderabad',
    department: 'ENT',
    primaryDoctor: 'Dr. Sana Khan',
    status: 'Active',
    lastVisit: '2026-02-04',
    nextAppointment: '2026-02-16',
    tags: [],
  }),
  buildPatient({
    mrn: 'MRN-245990',
    name: 'Rahul Menon',
    age: 58,
    gender: 'Male',
    phone: '+91 98765 44211',
    city: 'Chennai',
    department: 'Internal Medicine',
    primaryDoctor: 'Dr. Nisha Rao',
    status: 'Admitted',
    lastVisit: '2026-02-02',
    nextAppointment: null,
    tags: ['High Risk'],
  }),
  buildPatient({
    mrn: 'MRN-245991',
    name: 'Sneha Patil',
    age: 42,
    gender: 'Female',
    phone: '+91 98761 22341',
    city: 'Nashik',
    department: 'Surgery',
    primaryDoctor: 'Dr. Sameer Kulkarni',
    status: 'Admitted',
    lastVisit: '2026-02-03',
    nextAppointment: null,
    tags: ['Post-op'],
  }),
  buildPatient({
    mrn: 'MRN-245994',
    name: 'Arvind Sharma',
    age: 64,
    gender: 'Male',
    phone: '+91 99882 15509',
    city: 'Delhi',
    department: 'Cardiology',
    primaryDoctor: 'Dr. K. Anand',
    status: 'Admitted',
    lastVisit: '2026-02-02',
    nextAppointment: null,
    tags: ['High Risk', 'Cardiac'],
  }),
  buildPatient({
    mrn: 'MRN-245998',
    name: 'Neha Sinha',
    age: 35,
    gender: 'Female',
    phone: '+91 99670 31542',
    city: 'Indore',
    department: 'Endocrinology',
    primaryDoctor: 'Dr. Vidya Iyer',
    status: 'Admitted',
    lastVisit: '2026-02-04',
    nextAppointment: null,
    tags: ['Diabetic'],
  }),
  buildPatient({
    mrn: 'MRN-246002',
    name: 'Pooja Menon',
    age: 30,
    gender: 'Female',
    phone: '+91 98100 44117',
    city: 'Kochi',
    department: 'General Medicine',
    primaryDoctor: 'Dr. Nisha Rao',
    status: 'Active',
    lastVisit: '2026-02-05',
    nextAppointment: '2026-02-15',
    tags: [],
  }),
  buildPatient({
    mrn: 'MRN-246003',
    name: 'Vikram Bedi',
    age: 47,
    gender: 'Male',
    phone: '+91 98100 44118',
    city: 'Jaipur',
    department: 'ENT',
    primaryDoctor: 'Dr. Sana Khan',
    status: 'Active',
    lastVisit: '2026-02-05',
    nextAppointment: '2026-02-17',
    tags: [],
  }),
];

const normalize = (value: string) => value.toLowerCase().trim();

export const getPatientByMrn = (mrn?: string | null) => {
  if (!mrn) return undefined;
  const query = normalize(mrn);
  return GLOBAL_PATIENTS.find((patient) => normalize(patient.mrn) === query);
};

export const searchPatients = (query: string, limit = 8) => {
  const normalized = normalize(query);
  if (!normalized) return [];

  return GLOBAL_PATIENTS.filter((patient) => {
    const haystack = [
      patient.mrn,
      patient.name,
      patient.phone,
      patient.department,
      patient.primaryDoctor,
      patient.city,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  }).slice(0, limit);
};
