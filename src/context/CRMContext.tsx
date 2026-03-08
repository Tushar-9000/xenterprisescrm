import React, { createContext, useContext, useState, useCallback } from 'react';
import { Lead, Project, Notification, Note, LeadStatus, ProjectStatus, Developer, MOCK_DEVELOPERS } from '@/types/crm';

interface CRMContextType {
  leads: Lead[];
  projects: Project[];
  notifications: Notification[];
  addLead: (lead: Omit<Lead, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => void;
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

  const addNotification = (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    setNotifications(prev => [...prev, { ...n, id: `notif-${Date.now()}`, read: false, createdAt: new Date().toISOString() }]);
  };

  const addLead = useCallback((lead: Omit<Lead, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setLeads(prev => [...prev, { ...lead, id: `l-${Date.now()}`, notes: [], createdAt: now, updatedAt: now }]);
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
          assignedTo: '2', // Tech Lead
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

  const addProjectNote = useCallback((projectId: string, note: Omit<Note, 'id' | 'createdAt'>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, notes: [...p.notes, { ...note, id: `n-${Date.now()}`, createdAt: new Date().toISOString() }], updatedAt: new Date().toISOString() } : p));
  }, []);

  const assignDeveloper = useCallback((projectId: string, developerId: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, assignedDeveloper: developerId, updatedAt: new Date().toISOString() } : p));
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  }, []);

  const getUnreadCount = useCallback((userId: string) => {
    return notifications.filter(n => n.userId === userId && !n.read).length;
  }, [notifications]);

  return (
    <CRMContext.Provider value={{ leads, projects, notifications, addLead, updateLeadStatus, assignLead, addLeadNote, addProject, deleteProject, updateProjectStatus, addProjectNote, assignDeveloper, markNotificationRead, getUnreadCount }}>
      {children}
    </CRMContext.Provider>
  );
};
