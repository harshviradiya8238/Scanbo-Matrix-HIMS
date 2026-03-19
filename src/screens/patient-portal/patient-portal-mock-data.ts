import type {
  PatientProfile, HealthStat, Medication, LabResult, Appointment,
  Prescription, BillRecord, MedicalRecord, ChatContact, ChatMessage, Vital,
  LabRequisition, LabReport, FamilyMember, InsuranceDetail,
} from './patient-portal-types';

export const PATIENT: PatientProfile = {
  id: 'pp-1', name: 'Ravi Patel', initials: 'RP', pid: 'HC-20480124',
  dob: '1980-05-14', age: 45, gender: 'Male', bloodGroup: 'B+',
  phone: '+91 98765 43210', email: 'ravi.patel@gmail.com',
  address: '14, Shanti Nagar, Bardoli, Gujarat - 394601',
  avatarColor: '#0f766e',
  conditions: ['Type 2 Diabetes', 'Hypertension'],
  allergies: 'None Known', pastSurgeries: 'Appendectomy (2015)',
  currentMedications: 'Metoprolol, Metformin, Atorvastatin, Vit-D3',
  familyHistory: 'Cardiac (Father), Diabetes (Mother)',
  smokingAlcohol: 'Non-smoker, Occasional',
  lastCheckup: 'Feb 20, 2026',
  emergencyContactName: 'Priya Patel (Wife)',
  emergencyContactPhone: '+91 98765 44521',
};

export const HEALTH_STATS: HealthStat[] = [
  { id: 'hs-1', label: 'Heart Rate (bpm)', value: '72', badge: 'Normal', badgeType: 'good', iconBg: '#f0fdfa', emoji: '❤️' },
  { id: 'hs-2', label: 'Blood Pressure', value: '138/90', badge: 'Elevated', badgeType: 'warn', iconBg: '#eff6ff', emoji: '🩸' },
  { id: 'hs-3', label: 'HbA1c Level', value: '7.1%', badge: 'Stable', badgeType: 'good', iconBg: '#fef2f2', emoji: '🩻' },
  { id: 'hs-4', label: 'BMI Index', value: '26.4', badge: 'Overweight', badgeType: 'warn', iconBg: '#f5f3ff', emoji: '⚖️' },
];

export const MEDICATIONS: Medication[] = [
  { id: 'med-1', name: 'Metoprolol Succinate', dose: '50mg · Once daily (Morning)', timing: 'Ongoing', iconBg: '#fef2f2', emoji: '💊' },
  { id: 'med-2', name: 'Metformin HCl', dose: '500mg · Twice daily (after meals)', timing: 'Ongoing', iconBg: '#eff6ff', emoji: '💉' },
  { id: 'med-3', name: 'Atorvastatin', dose: '20mg · Once daily (Night)', timing: 'Ongoing', iconBg: '#f5f3ff', emoji: '🩹' },
  { id: 'med-4', name: 'Vitamin D3', dose: '60,000 IU · Once a week', timing: '8 weeks', iconBg: '#f0fdf4', emoji: '🌿' },
];

export const LAB_RESULTS: LabResult[] = [
  { id: 'lr-1', testName: 'Blood Glucose (F)', value: '108 mg/dL', refRange: '70-100', status: 'High', recordedAt: '2026-02-20 08:15 AM' },
  { id: 'lr-2', testName: 'HbA1c', value: '7.1%', refRange: '<5.7%', status: 'High', recordedAt: '2026-02-20 08:20 AM' },
  { id: 'lr-3', testName: 'Total Cholesterol', value: '185 mg/dL', refRange: '<200', status: 'Normal', recordedAt: '2026-02-20 08:25 AM' },
  { id: 'lr-4', testName: 'Hemoglobin', value: '13.5 g/dL', refRange: '13.5-17.5', status: 'Normal', recordedAt: '2026-02-20 08:30 AM' },
  { id: 'lr-5', testName: 'Vitamin D', value: '18 ng/mL', refRange: '20-50', status: 'Low', recordedAt: '2026-02-20 08:32 AM' },
  { id: 'lr-6', testName: 'Serum Creatinine', value: '0.9 mg/dL', refRange: '0.7-1.3', status: 'Normal', recordedAt: '2026-02-20 08:35 AM' },
];

export const LAB_REQUISITIONS: LabRequisition[] = [
  { id: 'req-1', requisitionNo: 'REQ-2026-041', date: 'Mar 10, 2026', time: '10:30 AM', orderedBy: 'Dr. Priya Sharma', lab: 'SRL Diagnostics', tests: ['CBC', 'HbA1c', 'Lipid Panel'], status: 'Sent to Lab', shareMethod: 'digital', ocrExtracted: false, notes: 'Fasting sample required' },
  { id: 'req-2', requisitionNo: 'REQ-2026-028', date: 'Feb 20, 2026', time: '09:00 AM', orderedBy: 'Dr. Arvind Mehta', lab: 'Metropolis', tests: ['Blood Glucose (F)', 'Insulin Fasting'], status: 'Completed', shareMethod: 'physical', uploadedFile: 'req-feb20.pdf', ocrExtracted: true, notes: '' },
  { id: 'req-3', requisitionNo: 'REQ-2026-015', date: 'Jan 10, 2026', time: '11:00 AM', orderedBy: 'Dr. Sneha Rao', lab: undefined, tests: ['Thyroid Profile (T3/T4/TSH)', 'Vitamin D', 'Vitamin B12'], status: 'Pending', shareMethod: undefined, ocrExtracted: false, notes: 'Patient to choose lab' },
];

export const LAB_REPORTS: LabReport[] = [
  { id: 'lrep-1', reportNo: 'RPT-2026-089', date: 'Mar 11, 2026', time: '02:15 PM', lab: 'SRL Diagnostics', orderedBy: 'Dr. Priya Sharma', category: 'Haematology', tests: ['CBC', 'ESR'], status: 'Normal', uploadType: 'digital', sharedWith: ['Dr. Priya Sharma'] },
  { id: 'lrep-2', reportNo: 'RPT-2026-072', date: 'Feb 20, 2026', time: '11:40 AM', lab: 'SRL Diagnostics', orderedBy: 'Dr. Arvind Mehta', category: 'Biochemistry', tests: ['HbA1c', 'Blood Glucose', 'Lipid Panel'], status: 'Needs Review', uploadType: 'scan', uploadedFile: 'lipid-feb20.jpg', ocrExtracted: true, sharedWith: ['Dr. Arvind Mehta', 'Dr. Sneha Rao'] },
  { id: 'lrep-3', reportNo: 'RPT-2026-058', date: 'Jan 12, 2026', time: '09:30 AM', lab: 'Metropolis', orderedBy: 'Dr. Sneha Rao', category: 'Endocrinology', tests: ['Thyroid Profile (T3/T4/TSH)', 'Vitamin D', 'Vitamin B12'], status: 'Normal', uploadType: 'manual', sharedWith: [] },
];

export const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'fm-1', name: 'Priya Patel', relation: 'Wife', dob: '1982-08-22', age: 43, gender: 'Female', bloodGroup: 'O+', phone: '+91 98765 44521', email: 'priya.patel@gmail.com', address: '14, Shanti Nagar, Bardoli', conditions: ['Hypothyroidism'], allergies: 'Penicillin', avatarColor: '#7c3aed', patientId: 'HC-20480125', status: 'Active' },
  { id: 'fm-2', name: 'Rohan Patel', relation: 'Son', dob: '2010-03-15', age: 16, gender: 'Male', bloodGroup: 'B+', phone: '', email: '', address: '', conditions: [], allergies: 'None', avatarColor: '#0369a1', patientId: 'HC-20480126', status: 'Active' },
];

export const INSURANCE_DETAILS: InsuranceDetail[] = [
  { id: 'ins-1', provider: 'Star Health Insurance', policyNo: 'STAR-2024-88721', validTill: 'Mar 2027', coverage: '₹5 Lakh', status: 'Active' },
  { id: 'ins-2', provider: 'PMJAY Ayushman Bharat', policyNo: 'PMJAY-GJ-00124', validTill: 'Dec 2026', coverage: '₹5 Lakh (Govt)', status: 'Active' },
];

export const APPOINTMENTS: Appointment[] = [
  { id: 'a-1', doctorName: 'Dr. Priya Sharma', department: 'Cardiology', location: 'Apollo Clinic', date: '2026-03-03', day: '03', month: 'Mar', time: '10:30 AM', token: '#04', type: 'in-person', patient: 'Ravi Patel', status: 'upcoming' },
  { id: 'a-2', doctorName: 'Dr. Arvind Mehta', department: 'Endocrinology', location: 'Main Hospital', date: '2026-03-11', day: '11', month: 'Mar', time: '9:00 AM', token: '#02', type: 'in-person', patient: 'Ravi Patel', status: 'upcoming' },
  { id: 'a-3', doctorName: 'Dr. Sneha Rao', department: 'General Medicine', location: 'Clinic B', date: '2026-02-18', day: '18', month: 'Feb', time: '11:00 AM', token: '#06', type: 'in-person', patient: 'Ravi Patel', status: 'completed' },
  { id: 'a-4', doctorName: 'Dr. Meena Iyer', department: 'Dermatology', location: 'Skin Clinic', date: '2026-01-05', day: '05', month: 'Jan', time: '3:00 PM', token: '#08', type: 'in-person', patient: 'Ravi Patel', status: 'completed' },
  { id: 'a-5', doctorName: 'Dr. Rajesh Kumar', department: 'Orthopedics', location: 'Main Hospital', date: '2026-02-05', day: '05', month: 'Feb', time: '2:00 PM', token: '#03', type: 'in-person', patient: 'Ravi Patel', status: 'cancelled' },
];

export const PRESCRIPTIONS: Prescription[] = [
  { id: 'rx-1', date: 'Feb 18, 2026', doctor: 'Dr. Sneha Rao', department: 'General Medicine', diagnosis: 'Hypertension + T2DM Follow-up', medications: ['Metoprolol 50mg', 'Metformin 500mg', 'Atorvastatin 20mg'], status: 'Active' },
  { id: 'rx-2', date: 'Jan 10, 2026', doctor: 'Dr. Priya Sharma', department: 'Cardiology', diagnosis: 'Cardiac Evaluation', medications: ['Metoprolol 25mg (increased to 50mg)', 'Aspirin 75mg'], status: 'Completed' },
  { id: 'rx-3', date: 'Dec 5, 2025', doctor: 'Dr. Arvind Mehta', department: 'Endocrinology', diagnosis: 'Diabetes Management', medications: ['Metformin 500mg', 'Vitamin D3 60K IU weekly'], status: 'Active' },
];

export const BILLS: BillRecord[] = [
  { id: 'b-1', invoiceNo: '#INV-2026-089', date: 'Feb 20, 2026', description: 'Lab Tests - CBC, HbA1c, Lipid Panel', amount: '₹2,450', status: 'Pending' },
  { id: 'b-2', invoiceNo: '#INV-2026-072', date: 'Feb 18, 2026', description: 'Consultation - Dr. Sneha Rao', amount: '₹800', status: 'Paid' },
  { id: 'b-3', invoiceNo: '#INV-2026-058', date: 'Jan 10, 2026', description: 'Cardiology Consultation + ECG', amount: '₹3,200', status: 'Paid' },
  { id: 'b-4', invoiceNo: '#INV-2025-412', date: 'Dec 5, 2025', description: 'Endocrinology Consultation', amount: '₹1,500', status: 'Paid' },
];

export const MEDICAL_RECORDS: MedicalRecord[] = [
  { id: 'mr-1', date: 'Feb 20, 2026', time: '11:40 AM', type: 'Lab', title: 'Blood Work - CBC, HbA1c, Lipid Panel', doctor: 'SRL Diagnostics', summary: 'HbA1c elevated at 7.1%. Vitamin D low. Rest normal.' },
  { id: 'mr-2', date: 'Feb 18, 2026', time: '10:00 AM', type: 'Visit', title: 'Follow-up Consultation', doctor: 'Dr. Sneha Rao', summary: 'BP monitoring advised. Metoprolol increased. Advised lifestyle modification.' },
  { id: 'mr-3', date: 'Jan 12, 2026', time: '09:30 AM', type: 'Imaging', title: 'Chest X-Ray', doctor: 'Apollo Radiology', summary: 'Clear. No abnormalities detected.' },
  { id: 'mr-4', date: 'Jan 10, 2026', time: '03:15 PM', type: 'Visit', title: 'Cardiology Consultation', doctor: 'Dr. Priya Sharma', summary: 'ECG normal. BP elevated. Started on Metoprolol.' },
  { id: 'mr-5', date: 'Oct 18, 2025', time: '02:00 PM', type: 'Procedure', title: 'ECG Report', doctor: 'Cardiology Dept', summary: 'Normal sinus rhythm. No ST-T changes.' },
  { id: 'mr-6', date: 'Dec 5, 2025', time: '11:00 AM', type: 'Prescription', title: 'Diabetes Management Plan', doctor: 'Dr. Arvind Mehta', summary: 'Started Vitamin D3 supplementation. Metformin continued.' },
];

export const VITALS: Vital[] = [
  { id: 'v-1', label: 'SpO\u2082', value: '98', unit: '%', fillPercent: 98, color: '#22c55e' },
  { id: 'v-2', label: 'Temperature', value: '98.6', unit: '\u00b0F', fillPercent: 72, color: '#3b82f6' },
  { id: 'v-3', label: 'Weight', value: '78', unit: 'kg', fillPercent: 60, color: '#f59e0b' },
  { id: 'v-4', label: 'Blood Group', value: 'B+', unit: '', fillPercent: 100, color: '#ef4444' },
];

export const CHAT_CONTACTS: ChatContact[] = [
  { id: 'c-1', name: 'Dr. Priya Sharma', department: 'Cardiology', initials: 'PS', color: '#0f766e', lastMessage: 'See you on March 3rd', unreadCount: 1, online: true },
  { id: 'c-2', name: 'Dr. Arvind Mehta', department: 'Endocrinology', initials: 'AM', color: '#059669', lastMessage: 'Please check your glucose daily', unreadCount: 2, online: false },
  { id: 'c-3', name: 'Dr. Sneha Rao', department: 'General Medicine', initials: 'SR', color: '#7c3aed', lastMessage: 'Reports look great!', unreadCount: 0, online: false },
  { id: 'c-4', name: 'Scanbo Support', department: 'Help & Support', initials: 'SS', color: '#d97706', lastMessage: 'How can we help you today?', unreadCount: 0, online: true },
];

export const CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'c-1': [
    { id: 'm1', contactId: 'c-1', text: 'Good morning! How are you feeling after starting the Metoprolol?', time: '9:42 AM', direction: 'in' },
    { id: 'm2', contactId: 'c-1', text: 'Good morning Doctor! I feel much better. The dizziness has reduced significantly.', time: '9:48 AM', direction: 'out' },
    { id: 'm3', contactId: 'c-1', text: 'Great news! Please take it every morning at the same time and avoid caffeine.', time: '9:50 AM', direction: 'in' },
    { id: 'm4', contactId: 'c-1', text: 'Yes Doctor. Should I monitor BP twice daily?', time: '10:02 AM', direction: 'out' },
    { id: 'm5', contactId: 'c-1', text: 'Yes - morning and evening. Bring the log to our appointment on March 3rd.', time: '10:05 AM', direction: 'in' },
  ],
  'c-2': [
    { id: 'm6', contactId: 'c-2', text: 'Your HbA1c is a bit elevated. Let us adjust your Metformin dose.', time: '2:30 PM', direction: 'in' },
    { id: 'm7', contactId: 'c-2', text: 'Should I increase the morning dose or add an evening dose?', time: '2:45 PM', direction: 'out' },
    { id: 'm8', contactId: 'c-2', text: 'Please check your glucose daily and we will decide at your next visit.', time: '3:00 PM', direction: 'in' },
  ],
  'c-3': [
    { id: 'm9', contactId: 'c-3', text: 'Reports look great! Keep up the good work with the diet.', time: '11:00 AM', direction: 'in' },
    { id: 'm10', contactId: 'c-3', text: 'Thank you, Doctor! I will continue the same routine.', time: '11:15 AM', direction: 'out' },
  ],
  'c-4': [
    { id: 'm11', contactId: 'c-4', text: 'Welcome to Scanbo Support! How can we help you today?', time: '8:00 AM', direction: 'in' },
  ],
};
