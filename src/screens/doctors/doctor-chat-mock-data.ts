import { ChatContact, ChatMessage } from '@/src/core/chat/types';

export const DOCTOR_CHAT_CONTACTS: ChatContact[] = [
  { id: 'dc-1', name: 'Dr. Priya Sharma', department: 'Cardiology', initials: 'PS', color: '#0f766e', lastMessage: 'Let\'s discuss the case tomorrow', unreadCount: 0, online: true, role: 'Doctor' },
  { id: 'dc-2', name: 'Dr. Arvind Mehta', department: 'Endocrinology', initials: 'AM', color: '#059669', lastMessage: 'Patient 102 reports low glucose', unreadCount: 2, online: false, role: 'Doctor' },
  { id: 'dc-3', name: 'Staff Nurse - Anjali', department: 'OPD - Block A', initials: 'AN', color: '#7c3aed', lastMessage: 'Vitals updated for Mr. Patel', unreadCount: 0, online: true, role: 'Nurse' },
  { id: 'dc-4', name: 'Anil Kumar (Patient)', department: 'Cardiology Follow-up', initials: 'AK', color: '#d97706', lastMessage: 'Doctor, when should I take the medicine?', unreadCount: 1, online: true, role: 'Patient' },
  { id: 'dc-5', name: 'Lab - Rajesh', department: 'Diagnostics', initials: 'LR', color: '#2563eb', lastMessage: 'CT Scan reports are ready', unreadCount: 0, online: false, role: 'Lab Technician' },
];

export const DOCTOR_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'dc-1': [
    { id: 'dm1', contactId: 'dc-1', text: 'Hi Priya, did you review the ECG for the patient in Room 302?', time: '2:15 PM', direction: 'out' },
    { id: 'dm2', contactId: 'dc-1', text: 'Yes, looking at it now. It looks like a slight ST elevation.', time: '2:18 PM', direction: 'in' },
    { id: 'dm3', contactId: 'dc-1', text: 'Let\'s discuss the case tomorrow morning during rounds.', time: '2:20 PM', direction: 'in' },
  ],
  'dc-2': [
    { id: 'dm4', contactId: 'dc-2', text: 'Dr. Arvind, the patient in bed 102 is reporting low glucose.', time: '4:30 PM', direction: 'in' },
    { id: 'dm5', contactId: 'dc-2', text: 'Provide glucose immediately and monitor for the next hour.', time: '4:35 PM', direction: 'out' },
  ],
  'dc-3': [
    { id: 'dm6', contactId: 'dc-3', text: 'Nurse Anjali, please update the vitals for MR. Patel.', time: '10:00 AM', direction: 'out' },
    { id: 'dm7', contactId: 'dc-3', text: 'Vitals updated for Mr. Patel. BP is slightly high.', time: '10:15 AM', direction: 'in' },
  ],
  'dc-4': [
    { id: 'dm8', contactId: 'dc-4', text: 'Doctor, when should I take the medicine?', time: '11:45 AM', direction: 'in' },
  ],
};
