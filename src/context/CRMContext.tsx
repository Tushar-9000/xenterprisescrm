import React, { createContext, useContext, useState, useCallback } from 'react';
import { Lead, Project, Notification, Note, LeadStatus, ProjectStatus, Developer, LeadFolder, User, Activity, MOCK_DEVELOPERS, MOCK_USERS } from '@/types/crm';

interface CRMContextType {
  leads: Lead[];
  activities: Activity[];
  projects: Project[];
  notifications: Notification[];
  folders: LeadFolder[];
  users: User[];
  addFolder: (name: string, location: string) => void;
  deleteFolder: (folderId: string) => void;
  renameFolder: (folderId: string, name: string) => void;
  addLead: (lead: Omit<Lead, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (leadId: string, data: Partial<Pick<Lead, 'name' | 'email' | 'phone' | 'company' | 'source'>>) => void;
  deleteLead: (leadId: string) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus, userId: string) => void;
  assignLead: (leadId: string, userId: string) => void;
  addLeadNote: (leadId: string, note: Omit<Note, 'id' | 'createdAt'>) => void;
  addProject: (project: Omit<Project, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => void;
  deleteProject: (projectId: string) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  renameProject: (projectId: string, name: string) => void;
  setProjectDeadline: (projectId: string, deadline: string) => void;
  addProjectNote: (projectId: string, note: Omit<Note, 'id' | 'createdAt'>) => void;
  assignDeveloper: (projectId: string, developerId: string) => void;
  developers: Developer[];
  addDeveloper: (name: string) => void;
  removeDeveloper: (id: string) => void;
  updateDeveloper: (id: string, name: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  markNotificationRead: (notificationId: string) => void;
  getUnreadCount: (userId: string) => number;
}

const CRMContext = createContext<CRMContextType | null>(null);

export const useCRM = () => {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error('useCRM must be used within CRMProvider');
  return ctx;
};

const INITIAL_LEADS: Lead[] = [
  { id: 'l1', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+919876543210', company: 'TechCorp', status: 'New', source: 'Website', notes: [], createdAt: '2026-03-01', updatedAt: '2026-03-01' },
  { id: 'l2', name: 'Priya Patel', email: 'priya@example.com', phone: '+919876543211', company: 'DesignHub', status: 'Contacted', assignedTo: '4', source: 'Referral', notes: [], createdAt: '2026-03-02', updatedAt: '2026-03-03' },
  { id: 'l3', name: 'Amit Kumar', email: 'amit@example.com', phone: '+919876543212', company: 'StartupXYZ', status: 'Interested', assignedTo: '4', source: 'LinkedIn', notes: [{ id: 'n1', content: 'Very interested in our services', createdBy: '4', createdAt: '2026-03-04' }], followUpDate: '2026-03-10', createdAt: '2026-03-03', updatedAt: '2026-03-04' },
  { id: 'l4', name: 'Sneha Gupta', email: 'sneha@example.com', phone: '+919876543213', company: 'MediaPlus', status: 'Follow-up', assignedTo: '4', source: 'Cold Call', notes: [], followUpDate: '2026-03-08', createdAt: '2026-03-04', updatedAt: '2026-03-05' },
];

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>(MOCK_DEVELOPERS);
  const [folders, setFolders] = useState<LeadFolder[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [activities, setActivities] = useState<Activity[]>([]);

  const addActivity = (type: Activity['type'], title: string, description: string, userId?: string) => {
    setActivities(prev => [{ id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, title, description, userId, createdAt: new Date().toISOString() }, ...prev]);
  };

  const addNotification = (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    setNotifications(prev => [...prev, { ...n, id: `notif-${Date.now()}`, read: false, createdAt: new Date().toISOString() }]);
  };

  // Folder CRUD
  const addFolder = useCallback((name: string, location: string) => {
    setFolders(prev => [...prev, { id: `f-${Date.now()}`, name, location, createdAt: new Date().toISOString() }]);
    addActivity('folder_added', 'Folder Created', `Folder "${name}" created at ${location}`);
  }, []);

  const deleteFolder = useCallback((folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    setFolders(prev => prev.filter(f => f.id !== folderId));
    setLeads(prev => prev.filter(l => l.folderId !== folderId));
    addActivity('folder_deleted', 'Folder Deleted', `Folder "${folder?.name || folderId}" deleted`);
  }, [folders]);

  const renameFolder = useCallback((folderId: string, name: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name } : f));
  }, []);

  // Lead CRUD
  const addLead = useCallback((lead: Omit<Lead, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setLeads(prev => [...prev, { ...lead, id: `l-${Date.now()}`, notes: [], createdAt: now, updatedAt: now }]);
    addActivity('lead_added', 'Lead Added', `New lead "${lead.name}" from ${lead.source || 'unknown source'}`);
  }, []);

  const updateLead = useCallback((leadId: string, data: Partial<Pick<Lead, 'name' | 'email' | 'phone' | 'company' | 'source'>>) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...data, updatedAt: new Date().toISOString() } : l));
  }, []);

  const deleteLead = useCallback((leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
  }, []);

  const updateLeadStatus = useCallback((leadId: string, status: LeadStatus, userId: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id !== leadId) return l;
      const updated = { ...l, status, updatedAt: new Date().toISOString() };
      if (status === 'Converted') {
        const newProject: Project = {
          id: `p-${Date.now()}`,
          name: `${l.name} Project`,
          leadId: l.id,
          clientName: l.name,
          clientEmail: l.email,
          clientPhone: l.phone,
          status: 'Planning',
          assignedTo: '2',
          notes: l.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProjects(prev => [...prev, newProject]);
        addNotification({ title: 'Lead Converted', message: `${l.name} has been converted to a project`, type: 'conversion', userId: '2' });
        addNotification({ title: 'Lead Converted', message: `${l.name} has been converted to a project`, type: 'conversion', userId: '1' });
      }
      return updated;
    }));
  }, []);

  const assignLead = useCallback((leadId: string, userId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedTo: userId, updatedAt: new Date().toISOString() } : l));
    addNotification({ title: 'New Lead Assigned', message: `A new lead has been assigned to you`, type: 'assignment', userId });
  }, []);

  const addLeadNote = useCallback((leadId: string, note: Omit<Note, 'id' | 'createdAt'>) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes: [...l.notes, { ...note, id: `n-${Date.now()}`, createdAt: new Date().toISOString() }], updatedAt: new Date().toISOString() } : l));
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setProjects(prev => [...prev, { ...project, id: `p-${Date.now()}`, notes: [], createdAt: now, updatedAt: now }]);
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }, []);

  const updateProjectStatus = useCallback((projectId: string, status: ProjectStatus) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status, updatedAt: new Date().toISOString() } : p));
  }, []);

  const renameProject = useCallback((projectId: string, name: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name, updatedAt: new Date().toISOString() } : p));
  }, []);

  const setProjectDeadline = useCallback((projectId: string, deadline: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, deadline, updatedAt: new Date().toISOString() } : p));
  }, []);

  const addProjectNote = useCallback((projectId: string, note: Omit<Note, 'id' | 'createdAt'>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, notes: [...p.notes, { ...note, id: `n-${Date.now()}`, createdAt: new Date().toISOString() }], updatedAt: new Date().toISOString() } : p));
  }, []);

  const assignDeveloper = useCallback((projectId: string, developerId: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, assignedDeveloper: developerId, updatedAt: new Date().toISOString() } : p));
  }, []);

  const addDeveloper = useCallback((name: string) => {
    setDevelopers(prev => [...prev, { id: `d-${Date.now()}`, name }]);
  }, []);

  const removeDeveloper = useCallback((id: string) => {
    setDevelopers(prev => prev.filter(d => d.id !== id));
    setProjects(prev => prev.map(p => p.assignedDeveloper === id ? { ...p, assignedDeveloper: undefined } : p));
  }, []);

  const updateDeveloper = useCallback((id: string, name: string) => {
    setDevelopers(prev => prev.map(d => d.id === id ? { ...d, name } : d));
  }, []);

  // User CRUD
  const addUser = useCallback((user: Omit<User, 'id'>) => {
    setUsers(prev => [...prev, { ...user, id: `u-${Date.now()}` }]);
  }, []);

  const removeUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const updateUser = useCallback((userId: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  }, []);

  const getUnreadCount = useCallback((userId: string) => {
    return notifications.filter(n => n.userId === userId && !n.read).length;
  }, [notifications]);

  return (
    <CRMContext.Provider value={{
      leads, projects, notifications, folders, users, activities,
      addFolder, deleteFolder, renameFolder,
      addLead, updateLead, deleteLead, updateLeadStatus, assignLead, addLeadNote,
      addProject, deleteProject, updateProjectStatus, renameProject, setProjectDeadline, addProjectNote, assignDeveloper,
      markNotificationRead, getUnreadCount,
      developers, addDeveloper, removeDeveloper, updateDeveloper,
      addUser, removeUser, updateUser,
    }}>
      {children}
    </CRMContext.Provider>
  );
};
