import { GridFilterItem, GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { GLOBAL_PATIENTS } from '@/src/mocks/global-patients';

export type PatientStatus = 'Active' | 'Inactive' | 'Admitted' | 'Discharged' | 'Billing Hold';
export type PatientGender = 'Male' | 'Female' | 'Other';

export interface PatientRow {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  city: string;
  lastVisit: string;
  nextAppointment?: string | null;
  status: PatientStatus;
  outstandingBalance: number;
  tags: string[];
  createdAt: string;
  department: string;
  doctor: string;
  allergies: string[];
  alerts: string[];
  lastVitals: string;
  lastVisitNote: string;
}

export type PatientQuery = {
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
  quickFilter?: string;
};

const firstNames = ['Aarav', 'Isha', 'Liam', 'Mia', 'Noah', 'Olivia', 'Emma', 'Lucas', 'Sophia', 'Aria'];
const lastNames = ['Singh', 'Patel', 'Garcia', 'Brown', 'Khan', 'Kim', 'Jones', 'Wilson', 'Taylor', 'Nguyen'];
const cities = ['San Francisco', 'Austin', 'Chicago', 'Seattle', 'Denver', 'Boston', 'Atlanta', 'Miami'];
const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Dermatology'];
const doctors = ['Dr. Rao', 'Dr. Chen', 'Dr. Kim', 'Dr. Martinez', 'Dr. Singh', 'Dr. Patel'];
const tagPool = ['VIP', 'High Risk', 'Diabetic', 'Hypertension', 'Pregnancy', 'Allergy'];
const statuses: PatientStatus[] = ['Active', 'Inactive', 'Admitted', 'Discharged', 'Billing Hold'];
const genders: PatientGender[] = ['Male', 'Female', 'Other'];

const seededRandom = (seed: number) => {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const formatDate = (date: Date) => date.toISOString();

const buildSeedPatients = (now: Date): PatientRow[] =>
  GLOBAL_PATIENTS.map((patient, index) => {
    const rand = seededRandom(index + 101);
    const nameParts = patient.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];
    const createdAt = new Date(now.getTime() - (index + 10) * 1000 * 60 * 60 * 24 * 12);
    const lastVisit = patient.lastVisit ? new Date(patient.lastVisit) : createdAt;
    const nextAppointment = patient.nextAppointment ? new Date(patient.nextAppointment) : null;
    const outstandingBalance = Math.round((rand() * 900 + 150) * 100) / 100;

    return {
      id: `P-SEED-${String(index + 1).padStart(3, '0')}`,
      mrn: patient.mrn,
      firstName,
      lastName,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      city: patient.city,
      lastVisit: formatDate(lastVisit),
      nextAppointment: nextAppointment ? formatDate(nextAppointment) : null,
      status: patient.status,
      outstandingBalance,
      tags: patient.tags,
      createdAt: formatDate(createdAt),
      department: patient.department,
      doctor: patient.primaryDoctor,
      allergies: patient.tags.includes('Diabetic') ? ['Metformin'] : [],
      alerts: patient.status === 'Admitted' ? ['Inpatient'] : [],
      lastVitals: `BP ${Math.floor(rand() * 30 + 110)}/${Math.floor(rand() * 20 + 70)}, HR ${Math.floor(rand() * 30 + 65)}`,
      lastVisitNote: 'Follow-up visit completed with stable vitals.',
    } satisfies PatientRow;
  });

const buildPatients = (count: number) => {
  const now = new Date();
  const seeded = buildSeedPatients(now);
  const remaining = Math.max(0, count - seeded.length);

  const generated = Array.from({ length: remaining }).map((_, index) => {
    const rand = seededRandom(index + 1);
    const firstName = firstNames[Math.floor(rand() * firstNames.length)];
    const lastName = lastNames[Math.floor(rand() * lastNames.length)];
    const age = Math.floor(rand() * 60) + 18;
    const gender = genders[Math.floor(rand() * genders.length)];
    const status = statuses[Math.floor(rand() * statuses.length)];
    const city = cities[Math.floor(rand() * cities.length)];
    const department = departments[Math.floor(rand() * departments.length)];
    const doctor = doctors[Math.floor(rand() * doctors.length)];
    const createdAt = new Date(now.getTime() - rand() * 1000 * 60 * 60 * 24 * 365);
    const lastVisit = new Date(now.getTime() - rand() * 1000 * 60 * 60 * 24 * 180);
    const nextAppointment = rand() > 0.6
      ? new Date(now.getTime() + rand() * 1000 * 60 * 60 * 24 * 30)
      : null;
    const outstandingBalance = Math.round(rand() * 1200 * 100) / 100;
    const tags = tagPool.filter(() => rand() > 0.7).slice(0, 3);
    const id = `P-${String(index + 1).padStart(4, '0')}`;

    return {
      id,
      mrn: `MRN-${String(3000 + index)}`,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      age,
      gender,
      phone: `+1 (415) ${Math.floor(rand() * 900 + 100)}-${Math.floor(rand() * 9000 + 1000)}`,
      city,
      lastVisit: formatDate(lastVisit),
      nextAppointment: nextAppointment ? formatDate(nextAppointment) : null,
      status,
      outstandingBalance,
      tags,
      createdAt: formatDate(createdAt),
      department,
      doctor,
      allergies: rand() > 0.7 ? ['Penicillin'] : [],
      alerts: rand() > 0.75 ? ['Fall risk'] : [],
      lastVitals: `BP ${Math.floor(rand() * 40 + 100)}/${Math.floor(rand() * 30 + 60)}, HR ${Math.floor(rand() * 40 + 60)}`,
      lastVisitNote: 'Patient reported improvement in symptoms with current medication plan.',
    } satisfies PatientRow;
  });

  return [...seeded, ...generated];
};

export const patientData = buildPatients(40);

const applyFilterItem = (rows: PatientRow[], item: GridFilterItem) => {
  const { field, operator, value } = item;
  if (!field || value === undefined || value === null || value === '') return rows;

  return rows.filter((row) => {
    const rowValue = (row as any)[field];
    if (operator === 'contains') {
      return String(rowValue).toLowerCase().includes(String(value).toLowerCase());
    }
    if (operator === 'equals') {
      return String(rowValue) === String(value);
    }
    if (operator === 'isAnyOf' && Array.isArray(value)) {
      return value.includes(rowValue);
    }
    if (operator === '>=') {
      return Number(rowValue) >= Number(value);
    }
    if (operator === '<=') {
      return Number(rowValue) <= Number(value);
    }
    if (operator === 'after') {
      return new Date(rowValue).getTime() >= new Date(String(value)).getTime();
    }
    if (operator === 'before') {
      return new Date(rowValue).getTime() <= new Date(String(value)).getTime();
    }
    return true;
  });
};

const applyFilters = (rows: PatientRow[], filterModel: GridFilterModel) => {
  let filtered = [...rows];
  filterModel.items?.forEach((item) => {
    filtered = applyFilterItem(filtered, item);
  });

  if (filterModel.quickFilterValues && filterModel.quickFilterValues.length > 0) {
    const query = filterModel.quickFilterValues.join(' ').toLowerCase();
    filtered = filtered.filter((row) =>
      [row.name, row.mrn, row.phone, row.city].some((field) =>
        field.toLowerCase().includes(query)
      )
    );
  }

  return filtered;
};

const applySorting = (rows: PatientRow[], sortModel: GridSortModel) => {
  if (!sortModel.length) return rows;
  return [...rows].sort((a, b) => {
    for (const sort of sortModel) {
      const field = sort.field as keyof PatientRow;
      const direction = sort.sort === 'desc' ? -1 : 1;
      const toSortable = (value: PatientRow[keyof PatientRow]) => {
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return value.join(', ');
        return value;
      };
      const aValue = toSortable(a[field]);
      const bValue = toSortable(b[field]);
      if (aValue === bValue) continue;
      return aValue > bValue ? direction : -direction;
    }
    return 0;
  });
};

let debounceTimer: NodeJS.Timeout | null = null;

export const fetchPatients = (query: PatientQuery): Promise<{ rows: PatientRow[]; total: number }> => {
  return new Promise((resolve) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      const filtered = applyFilters(patientData, query.filterModel);
      const sorted = applySorting(filtered, query.sortModel);
      const total = sorted.length;
      const start = query.paginationModel.page * query.paginationModel.pageSize;
      const end = start + query.paginationModel.pageSize;
      const paginated = sorted.slice(start, end);
      setTimeout(() => {
        resolve({ rows: paginated, total });
      }, 400);
    }, 250);
  });
};

export const patientMetrics = {
  total: patientData.length,
  todayRegistrations: 8,
  pendingBills: 34,
  admitted: patientData.filter((row) => row.status === 'Admitted').length,
};
