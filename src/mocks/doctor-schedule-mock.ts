/**
 * Doctor Schedule types and data helpers.
 * Dummy data removed – use API/state for doctors and schedule blocks.
 */

export type ScheduleBlockType = 'availability' | 'break' | 'leave' | 'show all';

export interface ScheduleBlock {
  id: string;
  type: ScheduleBlockType;
  doctorId: string;
  doctorName: string;
  specialty: string;
  startTime: string;
  endTime: string;
  date: string;
  description?: string;
  dayIndex: number;
}

export interface DoctorScheduleListItem {
  id: string;
  doctorId: string;
  name: string;
  specialty: string;
  department: string;
  initials: string;
  hasAvailability: boolean;
  hasBreak: boolean;
  hasLeave: boolean;
}

const DUMMY_DOCTORS: Omit<DoctorScheduleListItem, 'hasAvailability' | 'hasBreak' | 'hasLeave'>[] = [
  { id: 'doc-1', doctorId: 'doc-1', name: 'Dr. Rajesh Kumar', specialty: 'General Medicine', department: 'General Medicine', initials: 'RK' },
  { id: 'doc-2', doctorId: 'doc-2', name: 'Dr. Priya Sharma', specialty: 'Cardiology', department: 'Cardiology', initials: 'PS' },
  { id: 'doc-3', doctorId: 'doc-3', name: 'Dr. Amit Patel', specialty: 'Orthopedics', department: 'Orthopedics', initials: 'AP' },
  { id: 'doc-4', doctorId: 'doc-4', name: 'Dr. Sneha Reddy', specialty: 'Pediatrics', department: 'Pediatrics', initials: 'SR' },
  { id: 'doc-5', doctorId: 'doc-5', name: 'Dr. Vikram Singh', specialty: 'Dermatology', department: 'Dermatology', initials: 'VS' },
  { id: 'doc-6', doctorId: 'doc-6', name: 'Dr. Anjali Desai', specialty: 'Gynecology', department: 'Gynecology', initials: 'AD' },
  { id: 'doc-7', doctorId: 'doc-7', name: 'Dr. Suresh Nair', specialty: 'ENT', department: 'ENT', initials: 'SN' },
  { id: 'doc-8', doctorId: 'doc-8', name: 'Dr. Kavita Mehta', specialty: 'Psychiatry', department: 'Psychiatry', initials: 'KM' },
  { id: 'doc-9', doctorId: 'doc-9', name: 'Dr. Rohan Joshi', specialty: 'General Medicine', department: 'General Medicine', initials: 'RJ' },
  { id: 'doc-10', doctorId: 'doc-10', name: 'Dr. Neha Gupta', specialty: 'Ophthalmology', department: 'Ophthalmology', initials: 'NG' },
  { id: 'doc-yash', doctorId: 'doc-yash', name: 'Dr. Yash', specialty: 'General Medicine', department: 'General Medicine', initials: 'Y' },
];

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Gynecology',
  'ENT',
  'Psychiatry',
  'Ophthalmology',
];

/** Day index: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6 */
export function getDayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Availability by day (no date) – repeats every week */
interface AvailabilityByDay {
  doctorId: string;
  doctorName: string;
  specialty: string;
  dayIndex: number;
  startTime: string;
  endTime: string;
}
const AVAILABILITY_BY_DAY: AvailabilityByDay[] = [
  ...([0, 2, 4] as const).flatMap((dayIndex) => [
    { doctorId: 'doc-1', doctorName: 'Dr. Rajesh Kumar', specialty: 'General Medicine', dayIndex, startTime: '09:00', endTime: '13:00' },
    { doctorId: 'doc-2', doctorName: 'Dr. Priya Sharma', specialty: 'Cardiology', dayIndex, startTime: '10:00', endTime: '14:00' },
    { doctorId: 'doc-3', doctorName: 'Dr. Amit Patel', specialty: 'Orthopedics', dayIndex, startTime: '14:00', endTime: '18:00' },
  ]),
  ...([1, 2, 3, 4, 5] as const).flatMap((dayIndex) => [
    { doctorId: 'doc-6', doctorName: 'Dr. Anjali Desai', specialty: 'Gynecology', dayIndex, startTime: '09:00', endTime: '12:00' },
    { doctorId: 'doc-7', doctorName: 'Dr. Suresh Nair', specialty: 'ENT', dayIndex, startTime: '14:00', endTime: '17:00' },
  ]),
  ...([0, 3, 6] as const).flatMap((dayIndex) => [
    { doctorId: 'doc-8', doctorName: 'Dr. Kavita Mehta', specialty: 'Psychiatry', dayIndex, startTime: '10:00', endTime: '16:00' },
    { doctorId: 'doc-9', doctorName: 'Dr. Rohan Joshi', specialty: 'General Medicine', dayIndex, startTime: '08:00', endTime: '12:00' },
    { doctorId: 'doc-10', doctorName: 'Dr. Neha Gupta', specialty: 'Ophthalmology', dayIndex, startTime: '11:00', endTime: '15:00' },
  ]),
  ...([1, 2, 3, 4, 5] as const).flatMap((dayIndex) => [
    { doctorId: 'doc-yash', doctorName: 'Dr. Yash', specialty: 'General Medicine', dayIndex, startTime: '09:00', endTime: '13:00' },
  ]),
];

/** Break by day (no date) – repeats every week */
interface BreakByDay {
  doctorId: string;
  doctorName: string;
  specialty: string;
  dayIndex: number;
  startTime: string;
  endTime: string;
  description?: string;
}
const BREAK_BY_DAY: BreakByDay[] = [
  ...([1, 2, 3, 4, 5] as const).flatMap((dayIndex) => [
    { doctorId: 'doc-1', doctorName: 'Dr. Rajesh Kumar', specialty: 'General Medicine', dayIndex, startTime: '13:00', endTime: '14:00', description: 'Lunch' },
    { doctorId: 'doc-yash', doctorName: 'Dr. Yash', specialty: 'General Medicine', dayIndex, startTime: '13:00', endTime: '14:00', description: 'Lunch' },
  ]),
];

/** Doctors list for sidebar – replace with API when ready */
export function getDoctorScheduleList(weekStart: Date): DoctorScheduleListItem[] {
  const blocks = getScheduleBlocksForWeek(weekStart);
  return DUMMY_DOCTORS.map((d) => {
    const docBlocks = blocks.filter((b) => b.doctorId === d.doctorId);
    return {
      ...d,
      hasAvailability: docBlocks.some((b) => b.type === 'availability'),
      hasBreak: docBlocks.some((b) => b.type === 'break'),
      hasLeave: docBlocks.some((b) => b.type === 'leave'),
    };
  });
}

/** Schedule blocks for a date range. Availability & break come from day-based rules (no date in mock); leave is day-based for demo. */
export function getScheduleBlocksForRange(start: Date, end: Date): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = [];
  const pad = (n: number) => String(n).padStart(2, '0');
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const endTime = new Date(end);
  endTime.setHours(23, 59, 59, 999);
  while (cursor <= endTime) {
    const dateStr = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`;
    const d = getDayIndex(cursor);
    // Availability: from day-based mock (no date in data, only day)
    for (const av of AVAILABILITY_BY_DAY) {
      if (av.dayIndex === d) {
        blocks.push({
          id: `av-${av.doctorId}-${dateStr}`,
          type: 'availability',
          doctorId: av.doctorId,
          doctorName: av.doctorName,
          specialty: av.specialty,
          startTime: av.startTime,
          endTime: av.endTime,
          date: dateStr,
          dayIndex: d,
        });
      }
    }
    // Break: from day-based mock (no date in data, only day)
    for (const br of BREAK_BY_DAY) {
      if (br.dayIndex === d) {
        blocks.push({
          id: `br-${br.doctorId}-${dateStr}`,
          type: 'break',
          doctorId: br.doctorId,
          doctorName: br.doctorName,
          specialty: br.specialty,
          startTime: br.startTime,
          endTime: br.endTime,
          date: dateStr,
          description: br.description,
          dayIndex: d,
        });
      }
    }
    // Leave: still by day for demo (doc-4 Tue, doc-5 Thu, doc-yash Wed)
    if (d === 2) {
      blocks.push({ id: `lv-4-${dateStr}`, type: 'leave', doctorId: 'doc-4', doctorName: 'Dr. Sneha Reddy', specialty: 'Pediatrics', startTime: '09:00', endTime: '18:00', date: dateStr, dayIndex: d });
    }
    if (d === 4) {
      blocks.push({ id: `lv-5-${dateStr}`, type: 'leave', doctorId: 'doc-5', doctorName: 'Dr. Vikram Singh', specialty: 'Dermatology', startTime: '09:00', endTime: '18:00', date: dateStr, dayIndex: d });
    }
    if (d === 3) {
      blocks.push({ id: `lv-yash-${dateStr}`, type: 'leave', doctorId: 'doc-yash', doctorName: 'Dr. Yash', specialty: 'General Medicine', startTime: '09:00', endTime: '18:00', date: dateStr, dayIndex: d });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return blocks;
}

/** Schedule blocks for one week (for sidebar summary). Uses same day-based availability/break. */
export function getScheduleBlocksForWeek(weekStart: Date): ScheduleBlock[] {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  return getScheduleBlocksForRange(weekStart, end);
}

/** Department filter options – replace with API when ready */
export function getDepartments(): string[] {
  return [...DEPARTMENTS];
}

export function getScheduleSummary(blocks: ScheduleBlock[]) {
  const available = blocks.filter((b) => b.type === 'availability').length;
  const onBreak = blocks.filter((b) => b.type === 'break').length;
  const onLeave = blocks.filter((b) => b.type === 'leave').length;
  return { available, onBreak, onLeave };
}

// ─── Booked appointments (patient appointments – like Google Calendar) ────────
export interface BookedAppointment {
  id: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  doctorId: string;
  doctorName: string;
  department: string;
  mrn: string;
  phone: string;
  complaint: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
}

const MOCK_APPOINTMENTS: BookedAppointment[] = [
  // ── doc-1 (Dr. Rajesh Kumar): availability Mon/Wed/Fri 09:00–13:00 ──
  { id: 'apt-1',  patientName: 'Ravi Patel',       date: '2026-03-02', startTime: '09:30', endTime: '10:00', doctorId: 'doc-1',    doctorName: 'Dr. Rajesh Kumar', department: 'General Medicine', mrn: 'MRN-480101', phone: '+91 98765 00001', complaint: 'Fever and cold',        status: 'Scheduled' },
  { id: 'apt-2',  patientName: 'Meena Iyer',        date: '2026-03-02', startTime: '10:00', endTime: '10:30', doctorId: 'doc-1',    doctorName: 'Dr. Rajesh Kumar', department: 'General Medicine', mrn: 'MRN-480102', phone: '+91 98765 00002', complaint: 'Headache follow-up',    status: 'Scheduled' },
  { id: 'apt-3',  patientName: 'Suresh Kamath',     date: '2026-03-02', startTime: '11:00', endTime: '11:30', doctorId: 'doc-1',    doctorName: 'Dr. Rajesh Kumar', department: 'General Medicine', mrn: 'MRN-480103', phone: '+91 98765 00003', complaint: 'BP check',              status: 'Completed' },
  { id: 'apt-4',  patientName: 'Leela Nair',         date: '2026-03-04', startTime: '09:00', endTime: '09:30', doctorId: 'doc-1',    doctorName: 'Dr. Rajesh Kumar', department: 'General Medicine', mrn: 'MRN-480104', phone: '+91 98765 00004', complaint: 'Skin rash',             status: 'Scheduled' },
  { id: 'apt-5',  patientName: 'Arjun Sharma',       date: '2026-03-04', startTime: '10:30', endTime: '11:00', doctorId: 'doc-1',    doctorName: 'Dr. Rajesh Kumar', department: 'General Medicine', mrn: 'MRN-480105', phone: '+91 98765 00005', complaint: 'Chest cold',            status: 'Scheduled' },
  { id: 'apt-6',  patientName: 'Kavya Reddy',        date: '2026-03-04', startTime: '12:00', endTime: '12:30', doctorId: 'doc-1',    doctorName: 'Dr. Rajesh Kumar', department: 'General Medicine', mrn: 'MRN-480106', phone: '+91 98765 00006', complaint: 'Fatigue',               status: 'Cancelled' },
  { id: 'apt-7',  patientName: 'Dhruv Mehta',        date: '2026-03-06', startTime: '09:00', endTime: '09:30', doctorId: 'doc-1',    doctorName: 'Dr. Rajesh Kumar', department: 'General Medicine', mrn: 'MRN-480107', phone: '+91 98765 00007', complaint: 'Cough & cold',          status: 'Scheduled' },
  { id: 'apt-8',  patientName: 'Ananya Singh',       date: '2026-03-06', startTime: '11:30', endTime: '12:00', doctorId: 'doc-1',    doctorName: 'Dr. Rajesh Kumar', department: 'General Medicine', mrn: 'MRN-480108', phone: '+91 98765 00008', complaint: 'General checkup',       status: 'Scheduled' },

  // ── doc-2 (Dr. Priya Sharma): availability Mon/Wed/Fri 10:00–14:00 ──
  { id: 'apt-9',  patientName: 'Kunal Agarwal',     date: '2026-03-02', startTime: '10:00', endTime: '10:30', doctorId: 'doc-2',    doctorName: 'Dr. Priya Sharma',  department: 'Cardiology',       mrn: 'MRN-480109', phone: '+91 98765 00009', complaint: 'Chest pain',            status: 'Scheduled' },
  { id: 'apt-10', patientName: 'Renu Shah',           date: '2026-03-02', startTime: '11:30', endTime: '12:00', doctorId: 'doc-2',    doctorName: 'Dr. Priya Sharma',  department: 'Cardiology',       mrn: 'MRN-480110', phone: '+91 98765 00010', complaint: 'Palpitations',          status: 'Completed' },
  { id: 'apt-11', patientName: 'Tarun Bose',          date: '2026-03-04', startTime: '10:00', endTime: '10:30', doctorId: 'doc-2',    doctorName: 'Dr. Priya Sharma',  department: 'Cardiology',       mrn: 'MRN-480111', phone: '+91 98765 00011', complaint: 'Echo follow-up',        status: 'Scheduled' },
  { id: 'apt-12', patientName: 'Nisha Varma',         date: '2026-03-04', startTime: '13:00', endTime: '13:30', doctorId: 'doc-2',    doctorName: 'Dr. Priya Sharma',  department: 'Cardiology',       mrn: 'MRN-480112', phone: '+91 98765 00012', complaint: 'BP management',         status: 'Scheduled' },
  { id: 'apt-13', patientName: 'Shyam Pillai',        date: '2026-03-06', startTime: '10:30', endTime: '11:00', doctorId: 'doc-2',    doctorName: 'Dr. Priya Sharma',  department: 'Cardiology',       mrn: 'MRN-480113', phone: '+91 98765 00013', complaint: 'Shortness of breath',   status: 'Scheduled' },

  // ── doc-3 (Dr. Amit Patel): availability Mon/Wed/Fri 14:00–18:00 ──
  { id: 'apt-14', patientName: 'Pooja Desai',         date: '2026-03-02', startTime: '14:00', endTime: '14:30', doctorId: 'doc-3',    doctorName: 'Dr. Amit Patel',    department: 'Orthopedics',      mrn: 'MRN-480114', phone: '+91 98765 00014', complaint: 'Knee pain',             status: 'Scheduled' },
  { id: 'apt-15', patientName: 'Raj Verma',            date: '2026-03-04', startTime: '15:00', endTime: '15:30', doctorId: 'doc-3',    doctorName: 'Dr. Amit Patel',    department: 'Orthopedics',      mrn: 'MRN-480115', phone: '+91 98765 00015', complaint: 'Back pain',             status: 'Scheduled' },
  { id: 'apt-16', patientName: 'Geeta Joshi',          date: '2026-03-06', startTime: '16:00', endTime: '16:30', doctorId: 'doc-3',    doctorName: 'Dr. Amit Patel',    department: 'Orthopedics',      mrn: 'MRN-480116', phone: '+91 98765 00016', complaint: 'Shoulder stiffness',    status: 'Scheduled' },

  // ── doc-6 (Dr. Anjali Desai): availability Tue–Sat 09:00–12:00 ──
  { id: 'apt-17', patientName: 'Priti Jain',           date: '2026-03-03', startTime: '09:00', endTime: '09:30', doctorId: 'doc-6',    doctorName: 'Dr. Anjali Desai',  department: 'Gynecology',       mrn: 'MRN-480117', phone: '+91 98765 00017', complaint: 'Routine checkup',       status: 'Scheduled' },
  { id: 'apt-18', patientName: 'Roshni Kumar',          date: '2026-03-05', startTime: '10:00', endTime: '10:30', doctorId: 'doc-6',    doctorName: 'Dr. Anjali Desai',  department: 'Gynecology',       mrn: 'MRN-480118', phone: '+91 98765 00018', complaint: 'Prenatal visit',        status: 'Scheduled' },

  // ── doc-7 (Dr. Suresh Nair): availability Tue–Sat 14:00–17:00 ──
  { id: 'apt-19', patientName: 'Mahesh Rao',            date: '2026-03-03', startTime: '14:00', endTime: '14:30', doctorId: 'doc-7',    doctorName: 'Dr. Suresh Nair',   department: 'ENT',              mrn: 'MRN-480119', phone: '+91 98765 00019', complaint: 'Ear pain',              status: 'Scheduled' },
  { id: 'apt-20', patientName: 'Reema Kapoor',           date: '2026-03-05', startTime: '15:00', endTime: '15:30', doctorId: 'doc-7',    doctorName: 'Dr. Suresh Nair',   department: 'ENT',              mrn: 'MRN-480120', phone: '+91 98765 00020', complaint: 'Tonsillitis',           status: 'Completed' },

  // ── doc-yash (Dr. Yash): availability Tue–Sat 09:00–13:00 ──
  { id: 'apt-21', patientName: 'Aditya Menon',          date: '2026-03-03', startTime: '09:30', endTime: '10:00', doctorId: 'doc-yash', doctorName: 'Dr. Yash',           department: 'General Medicine', mrn: 'MRN-480121', phone: '+91 98765 00021', complaint: 'Fever & body ache',     status: 'Scheduled' },
  { id: 'apt-22', patientName: 'Shalini Gupta',          date: '2026-03-03', startTime: '10:30', endTime: '11:00', doctorId: 'doc-yash', doctorName: 'Dr. Yash',           department: 'General Medicine', mrn: 'MRN-480122', phone: '+91 98765 00022', complaint: 'Diabetes review',       status: 'Scheduled' },
  { id: 'apt-23', patientName: 'Faiz Khan',               date: '2026-03-05', startTime: '09:00', endTime: '09:30', doctorId: 'doc-yash', doctorName: 'Dr. Yash',           department: 'General Medicine', mrn: 'MRN-480123', phone: '+91 98765 00023', complaint: 'Follow-up visit',       status: 'Scheduled' },
  { id: 'apt-24', patientName: 'Divya Lal',               date: '2026-03-05', startTime: '11:00', endTime: '11:30', doctorId: 'doc-yash', doctorName: 'Dr. Yash',           department: 'General Medicine', mrn: 'MRN-480124', phone: '+91 98765 00024', complaint: 'Vitamin D deficiency',  status: 'Scheduled' },
  { id: 'apt-25', patientName: 'Harish Tiwari',           date: '2026-03-07', startTime: '10:00', endTime: '10:30', doctorId: 'doc-yash', doctorName: 'Dr. Yash',           department: 'General Medicine', mrn: 'MRN-480125', phone: '+91 98765 00025', complaint: 'Thyroid checkup',       status: 'Scheduled' },
];

/** Booked patient appointments for calendar – replace with API when ready */
export function getAppointmentsForRange(start: Date, end: Date, doctorId?: string | null): BookedAppointment[] {
  const pad = (n: number) => String(n).padStart(2, '0');
  const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const startStr = toStr(start);
  const endStr = toStr(end);
  let list = MOCK_APPOINTMENTS.filter((a) => a.date >= startStr && a.date <= endStr);
  if (doctorId) list = list.filter((a) => a.doctorId === doctorId);
  return list;
}
