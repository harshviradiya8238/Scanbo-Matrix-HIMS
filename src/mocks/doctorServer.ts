export type DoctorStatus = 'Active' | 'On Leave' | 'Inactive' | 'Suspended' | 'Pending Verification';
export type DoctorType = 'Consultant' | 'Visiting' | 'Resident' | 'Intern' | 'Telemedicine';

export interface DoctorRow {
  id: string;
  doctorId: string;
  firstName: string;
  lastName: string;
  name: string;
  prefix: string;
  designation: string;
  primarySpecialization: string;
  department: string;
  qualifications: string;
  yearsOfExperience: number;
  doctorType: DoctorType;
  status: DoctorStatus;
  gender: string;
  age: number;
  mobile: string;
  email: string;
  consultationFee: number;
  availableDays: string;
  telemedicine: boolean;
  registrationCountry: 'india' | 'international';
  licenseNumber: string;
  licenseExpiry: string;
  joinedDate: string;
  lastActive: string;
  totalPatients: number;
  todayAppointments: number;
  rating: number;
  languages: string;
}

export interface DoctorMetrics {
  total: number;
  activeToday: number;
  onLeave: number;
  consultants: number;
  telemedicine: number;
}

const seededRandom = (seed: number) => {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const firstNames = [
  'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anjali', 'Rohit', 'Deepa',
  'Arjun', 'Kavitha', 'Sanjay', 'Meena', 'Anil', 'Pooja', 'Suresh',
  'James', 'Maria', 'Michael', 'Sarah', 'David',
];
const lastNames = [
  'Kumar', 'Sharma', 'Patel', 'Singh', 'Verma', 'Gupta', 'Reddy', 'Nair',
  'Iyer', 'Joshi', 'Mehta', 'Shah', 'Agarwal', 'Malhotra', 'Bose',
  'Anderson', 'Martinez', 'Chen', 'Williams', 'Khan',
];
const specializations = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Gynecology & Obstetrics', 'Pediatrics',
  'Oncology', 'Gastroenterology', 'Pulmonology', 'Nephrology', 'Endocrinology',
  'Dermatology', 'Psychiatry', 'Ophthalmology', 'ENT', 'General Medicine',
  'General Surgery', 'Radiology', 'Anesthesiology', 'Emergency Medicine', 'Critical Care',
];
const departments = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Gynecology', 'Pediatrics',
  'Oncology', 'Gastroenterology', 'Pulmonology', 'Nephrology', 'Endocrinology',
  'Dermatology', 'Psychiatry', 'Ophthalmology', 'ENT', 'Internal Medicine',
  'General Surgery', 'Radiology', 'Anesthesiology', 'Emergency', 'ICU',
];
const designations = [
  'Senior Consultant', 'Consultant', 'Junior Consultant', 'Associate Professor',
  'Assistant Professor', 'Registrar', 'Senior Resident', 'Head of Department',
];
const qualificationsList = [
  'MBBS, MD (Cardiology)', 'MBBS, MS (General Surgery)', 'MBBS, DM (Neurology)',
  'MBBS, MD (General Medicine)', 'MBBS, MS (Orthopedics)', 'MBBS, DNB (Pediatrics)',
  'MBBS, MD, DM (Oncology)', 'MBBS, FRCS', 'MBBS, MRCP', 'MD, PhD',
  'MBBS, MS, MCh', 'MBBS, DA (Anesthesia)', 'MBBS, DNB (Radiology)',
];
const statuses: DoctorStatus[] = ['Active', 'Active', 'Active', 'On Leave', 'Inactive', 'Pending Verification'];
const doctorTypes: DoctorType[] = ['Consultant', 'Consultant', 'Visiting', 'Resident', 'Telemedicine'];
const languagesList = [
  'English, Hindi', 'English, Tamil', 'English, Telugu', 'English, Malayalam',
  'English, Marathi', 'English, Gujarati', 'English, Kannada', 'English, Bengali',
  'English, Arabic', 'English, Hindi, Urdu',
];
const daysSets = [
  'Mon,Tue,Wed,Thu,Fri', 'Mon,Tue,Wed,Thu,Fri,Sat', 'Mon,Wed,Fri',
  'Tue,Thu,Sat', 'Mon,Tue,Thu,Fri', 'Wed,Thu,Fri,Sat',
];

const buildDoctorData = (): DoctorRow[] => {
  const now = new Date();
  return Array.from({ length: 60 }, (_, i) => {
    const rand = seededRandom(i + 42);
    const fIdx = Math.floor(rand() * firstNames.length);
    const lIdx = Math.floor(rand() * lastNames.length);
    const spIdx = Math.floor(rand() * specializations.length);
    const desigIdx = Math.floor(rand() * designations.length);
    const qualIdx = Math.floor(rand() * qualificationsList.length);
    const statusIdx = Math.floor(rand() * statuses.length);
    const typeIdx = Math.floor(rand() * doctorTypes.length);
    const langIdx = Math.floor(rand() * languagesList.length);
    const daysIdx = Math.floor(rand() * daysSets.length);
    const gender = rand() > 0.45 ? 'Male' : 'Female';
    const prefix = 'Dr.';
    const firstName = firstNames[fIdx];
    const lastName = lastNames[lIdx];
    const exp = Math.floor(rand() * 28) + 2;
    const age = 28 + exp + Math.floor(rand() * 5);
    const telemedicine = rand() > 0.55;
    const country: 'india' | 'international' = rand() > 0.2 ? 'india' : 'international';
    const joinedDaysAgo = Math.floor(rand() * 1800) + 30;
    const lastActiveDaysAgo = Math.floor(rand() * 10);

    return {
      id: `D-${String(i + 1).padStart(3, '0')}`,
      doctorId: `DOC-${String(i + 1).padStart(4, '0')}`,
      firstName,
      lastName,
      name: `${prefix} ${firstName} ${lastName}`,
      prefix,
      designation: designations[desigIdx],
      primarySpecialization: specializations[spIdx],
      department: departments[spIdx],
      qualifications: qualificationsList[qualIdx],
      yearsOfExperience: exp,
      doctorType: doctorTypes[typeIdx],
      status: statuses[statusIdx],
      gender,
      age,
      mobile: `+91 ${Math.floor(rand() * 9000000000 + 1000000000)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@hospital.com`,
      consultationFee: Math.floor(rand() * 1500 + 300),
      availableDays: daysSets[daysIdx],
      telemedicine,
      registrationCountry: country,
      licenseNumber: country === 'india'
        ? `MCI-${Math.floor(rand() * 90000 + 10000)}`
        : `LIC-${Math.floor(rand() * 900000 + 100000)}`,
      licenseExpiry: new Date(now.getTime() + (rand() * 1000 + 180) * 86400000).toISOString().split('T')[0],
      joinedDate: new Date(now.getTime() - joinedDaysAgo * 86400000).toISOString().split('T')[0],
      lastActive: new Date(now.getTime() - lastActiveDaysAgo * 86400000).toISOString().split('T')[0],
      totalPatients: Math.floor(rand() * 1800 + 50),
      todayAppointments: Math.floor(rand() * 18),
      rating: Math.round((3.5 + rand() * 1.5) * 10) / 10,
      languages: languagesList[langIdx],
    };
  });
};

export const doctorData: DoctorRow[] = buildDoctorData();

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

export const searchDoctors = (query: string, limit = 8): DoctorRow[] => {
  const q = normalize(query);
  if (!q) return [];
  return doctorData
    .filter((d) => {
      const haystack = [
        d.doctorId,
        d.name,
        d.firstName,
        d.lastName,
        d.mobile,
        d.email,
        d.primarySpecialization,
        d.department,
        d.designation,
        d.licenseNumber,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, limit);
};

export const getDoctorById = (id: string): DoctorRow | undefined =>
  doctorData.find((d) => d.id === id || d.doctorId === id);

export const doctorMetrics: DoctorMetrics = {
  total: doctorData.length,
  activeToday: doctorData.filter((d) => d.status === 'Active').length,
  onLeave: doctorData.filter((d) => d.status === 'On Leave').length,
  consultants: doctorData.filter((d) => d.doctorType === 'Consultant').length,
  telemedicine: doctorData.filter((d) => d.telemedicine).length,
};
