export type UserRole = 'admin' | 'tech_lead' | 'sales_manager' | 'telecaller';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Follow-up' | 'Interested' | 'Not Interested' | 'Converted';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: LeadStatus;
  assignedTo?: string;
  source?: string;
  notes: Note[];
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export type ProjectStatus = 'Planning' | 'In Progress' | 'Review' | 'Completed' | 'On Hold';

export interface Project {
  id: string;
  leadId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: ProjectStatus;
  assignedTo: string;
  assignedDeveloper?: string;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'follow_up' | 'assignment' | 'conversion' | 'info';
  read: boolean;
  userId: string;
  createdAt: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Super Admin',
  tech_lead: 'Tech Lead',
  sales_manager: 'Sales Manager',
  telecaller: 'Telecaller',
};

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin', email: 'admin@enterprisecrm.com', role: 'admin' },
  { id: '2', name: 'Tushar', email: 'tushar@enterprisecrm.com', role: 'tech_lead' },
  { id: '3', name: 'Vansh', email: 'vansh@enterprisecrm.com', role: 'sales_manager' },
  { id: '4', name: 'Akanksha', email: 'akanksha@enterprisecrm.com', role: 'telecaller' },
];

export interface Developer {
  id: string;
  name: string;
}

export const MOCK_DEVELOPERS: Developer[] = [
  { id: 'd1', name: 'Rohit Verma' },
  { id: 'd2', name: 'Neha Singh' },
  { id: 'd3', name: 'Karan Mehta' },
  { id: 'd4', name: 'Divya Joshi' },
];
