/**
 * Shared Chat Types
 * Interface definitions for chat contacts and messages
 */

export interface ChatContact {
  id: string;
  name: string;
  department: string;
  initials: string;
  color: string;
  lastMessage?: string;
  unreadCount: number;
  online: boolean;
  role?: string;
}

export interface ChatMessage {
  id: string;
  contactId: string;
  text: string;
  time: string;
  direction: 'in' | 'out';
  status?: 'sent' | 'received' | 'read';
}
