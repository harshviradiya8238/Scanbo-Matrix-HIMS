import type { LabClient } from '@/src/screens/lab/lab-types';

export const MOCK_LAB_CLIENTS: LabClient[] = [
  { id: 'CL-001', name: 'City Hospital', type: 'Hospital', contact: 'Dr. R. Shah', email: 'lab@cityhospital.com', phone: '+91-265-2222111', city: 'Surat', address: 'Ring Road, Surat 395002', active: true, credit: true, discount: 10, notes: '' },
  { id: 'CL-002', name: 'Metro Clinic', type: 'Clinic', contact: 'Ms. A. Patel', email: 'info@metroclinic.com', phone: '+91-265-3333222', city: 'Surat', address: 'Athwalines, Surat', active: true, credit: false, discount: 5, notes: '' },
  { id: 'CL-003', name: 'National Lab', type: 'Lab', contact: 'Dr. K. Mehta', email: 'lab@nationallab.com', phone: '+91-79-4444333', city: 'Ahmedabad', address: 'CG Road, Ahmedabad', active: true, credit: true, discount: 15, notes: '' },
  { id: 'CL-004', name: 'HealthCare Plus', type: 'Hospital', contact: 'Mr. V. Jain', email: 'hcp@healthcare.com', phone: '+91-22-5555444', city: 'Mumbai', address: 'Andheri, Mumbai', active: false, credit: false, discount: 0, notes: 'On hold' },
  { id: 'CL-005', name: 'Oncology Center', type: 'Specialist', contact: 'Dr. L. Bose', email: 'lab@oncocenter.com', phone: '+91-33-6666555', city: 'Kolkata', address: 'Park Street, Kolkata', active: true, credit: true, discount: 20, notes: '' },
];
