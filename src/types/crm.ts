export type UserRole = 'admin' | 'tech_lead' | 'sales_manager' | 'telecaller';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  dob?: string;
  address?: string;
  profilePic?: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  joiningDate?: string;
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
  folderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFolder {
  id: string;
  name: string;
  location: string;
  createdAt: string;
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
  name: string;
  leadId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: ProjectStatus;
  assignedTo: string;
  assignedDeveloper?: string;
  deadline?: string;
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

export type ProjectRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ProjectRequest {
  id: string;
  leadId: string;
  leadName: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  requestedBy: string;
  status: ProjectRequestStatus;
  rejectionReason?: string;
  createdAt: string;
}

export type ActivityType = 'lead_added' | 'lead_updated' | 'lead_deleted' | 'lead_status_changed' | 'lead_assigned' | 'lead_note_added' | 'project_added' | 'project_deleted' | 'project_status_changed' | 'project_renamed' | 'project_deadline_set' | 'developer_assigned' | 'developer_added' | 'developer_removed' | 'user_added' | 'user_removed' | 'folder_added' | 'folder_deleted' | 'project_request_created' | 'project_request_approved' | 'project_request_rejected';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  userId?: string;
  createdAt: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Super Admin',
  tech_lead: 'Tech Lead',
  sales_manager: 'Sales Manager',
  telecaller: 'Telecaller',
};

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin', email: 'admin@enterprisecrm.com', phone: '+919000000001', role: 'admin', joiningDate: '2025-01-01', password: 'Admin123' },
  { id: '2', name: 'Tushar', email: 'tushar@enterprisecrm.com', phone: '+919000000002', role: 'tech_lead', joiningDate: '2025-02-15', password: 'Tushar123' },
  { id: '3', name: 'Vansh', email: 'vansh@enterprisecrm.com', phone: '+919000000003', role: 'sales_manager', joiningDate: '2025-03-01', password: 'Vansh123' },
  { id: '4', name: 'Akanksha', email: 'akanksha@enterprisecrm.com', phone: '+919000000004', role: 'telecaller', joiningDate: '2025-04-10', password: 'Akanksha123' },
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
