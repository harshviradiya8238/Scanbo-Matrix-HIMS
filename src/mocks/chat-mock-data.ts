// Common Chat Types
export interface ChatContact {
  id: string;
  name: string;
  role: 'doctor' | 'patient';
  department?: string;
  initials: string;
  color: string;
  unreadCount: number;
  online?: boolean;
}

export interface ChatMessage {
  id: string;
  contactId: string;
  text: string;
  time: string;
  direction: 'in' | 'out';
}

// -----------------------------
// ALL CONTACTS (Doctor + Patient)
// -----------------------------

export const CHAT_CONTACTS: ChatContact[] = [
  // Doctors (Patient side me dikhenge)
  {
    id: 'doc-1',
    name: 'Dr. Rakesh Mehta',
    role: 'doctor',
    department: 'Cardiology',
    initials: 'RM',
    color: '#1976d2',
    unreadCount: 2,
    online: true
  },
  {
    id: 'doc-2',
    name: 'Dr. Priya Sharma',
    role: 'doctor',
    department: 'Dermatology',
    initials: 'PS',
    color: '#9c27b0',
    unreadCount: 0,
    online: false
  },

  // Patients (Doctor side me dikhenge)
  {
    id: 'pat-1',
    name: 'Rahul Verma',
    role: 'patient',
    department: 'OPD Patient',
    initials: 'RV',
    color: '#ff9800',
    unreadCount: 1,
    online: true
  },
  {
    id: 'pat-2',
    name: 'Sneha Patel',
    role: 'patient',
    department: 'IPD Patient',
    initials: 'SP',
    color: '#4caf50',
    unreadCount: 0,
    online: false
  }
];

// -----------------------------
// ALL MESSAGES
// -----------------------------

export const CHAT_MESSAGES: Record<string, ChatMessage[]> = {

  // Doctor Conversations (Patient side)
  'doc-1': [
    {
      id: 'm1',
      contactId: 'doc-1',
      text: 'Hello Doctor, I am feeling chest pain.',
      time: '09:10 AM',
      direction: 'out'
    },
    {
      id: 'm2',
      contactId: 'doc-1',
      text: 'Since when are you experiencing this?',
      time: '09:12 AM',
      direction: 'in'
    }
  ],

  'doc-2': [
    {
      id: 'm3',
      contactId: 'doc-2',
      text: 'Doctor, my skin allergy has increased.',
      time: '10:00 AM',
      direction: 'out'
    }
  ],

  // Patient Conversations (Doctor side)
  'pat-1': [
    {
      id: 'd1',
      contactId: 'pat-1',
      text: 'Good morning Doctor.',
      time: '08:45 AM',
      direction: 'in'
    },
    {
      id: 'd2',
      contactId: 'pat-1',
      text: 'Good morning. How can I help you?',
      time: '08:47 AM',
      direction: 'out'
    }
  ],

  'pat-2': [
    {
      id: 'd3',
      contactId: 'pat-2',
      text: 'Doctor, I need my discharge summary.',
      time: '11:15 AM',
      direction: 'in'
    }
  ]
};