import React, { createContext, useContext, useState, useCallback } from 'react';
import { Lead, Project, Notification, Note, LeadStatus, ProjectStatus, Developer, LeadFolder, User, Activity, ProjectRequest, MOCK_USERS } from '@/types/crm';

interface CRMContextType {
  leads: Lead[];
  activities: Activity[];
  projects: Project[];
  notifications: Notification[];
  folders: LeadFolder[];
  users: User[];
  projectRequests: ProjectRequest[];
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
  addProjectRequest: (request: Omit<ProjectRequest, 'id' | 'status' | 'createdAt'>) => void;
  approveProjectRequest: (requestId: string) => void;
  rejectProjectRequest: (requestId: string, reason: string) => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

export const useCRM = () => {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error('useCRM must be used within CRMProvider');
  return ctx;
};

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [folders, setFolders] = useState<LeadFolder[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);

  const addActivity = (type: Activity['type'], title: string, description: string, userId?: string) => {
    setActivities(prev => [{ id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, title, description, userId, createdAt: new Date().toISOString() }, ...prev]);
  };

  const addNotification = (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    setNotifications(prev => [...prev, { ...n, id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`, read: false, createdAt: new Date().toISOString() }]);
  };

  const notifyByRole = (roles: string[], title: string, message: string, type: Notification['type'] = 'info', excludeUserId?: string) => {
    users.filter(u => roles.includes(u.role) && u.id !== excludeUserId).forEach(u => {
      addNotification({ title, message, type, userId: u.id });
    });
  };

  // Folder CRUD
  const addFolder = useCallback((name: string, location: string) => {
    setFolders(prev => [...prev, { id: `f-${Date.now()}`, name, location, createdAt: new Date().toISOString() }]);
    addActivity('folder_added', 'Folder Created', `Folder "${name}" created at ${location}`);
    notifyByRole(['admin', 'sales_manager'], 'Folder Created', `New folder "${name}" created at ${location}`);
  }, [users]);

  const deleteFolder = useCallback((folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    setFolders(prev => prev.filter(f => f.id !== folderId));
    setLeads(prev => prev.filter(l => l.folderId !== folderId));
    addActivity('folder_deleted', 'Folder Deleted', `Folder "${folder?.name || folderId}" deleted`);
    notifyByRole(['admin', 'sales_manager'], 'Folder Deleted', `Folder "${folder?.name || folderId}" was deleted`);
  }, [folders, users]);

  const renameFolder = useCallback((folderId: string, name: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name } : f));
  }, []);

  // Lead CRUD
  const addLead = useCallback((lead: Omit<Lead, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setLeads(prev => [...prev, { ...lead, id: `l-${Date.now()}`, notes: [], createdAt: now, updatedAt: now }]);
    addActivity('lead_added', 'Lead Added', `New lead "${lead.name}" from ${lead.source || 'unknown source'}`);
    notifyByRole(['admin', 'sales_manager'], 'New Lead Added', `"${lead.name}" added from ${lead.source || 'unknown source'}`);
  }, [users]);

  const updateLead = useCallback((leadId: string, data: Partial<Pick<Lead, 'name' | 'email' | 'phone' | 'company' | 'source'>>) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...data, updatedAt: new Date().toISOString() } : l));
  }, []);

  const deleteLead = useCallback((leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    setLeads(prev => prev.filter(l => l.id !== leadId));
    addActivity('lead_deleted', 'Lead Deleted', `Lead "${lead?.name || leadId}" removed`);
    notifyByRole(['admin', 'sales_manager'], 'Lead Deleted', `Lead "${lead?.name || leadId}" was removed`);
  }, [leads, users]);

  const updateLeadStatus = useCallback((leadId: string, status: LeadStatus, userId: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id !== leadId) return l;
      const updated = { ...l, status, updatedAt: new Date().toISOString() };
      if (status === 'Converted') {
        addActivity('lead_status_changed', 'Lead Converted', `"${l.name}" marked as converted — awaiting project request`, userId);
      } else {
        addActivity('lead_status_changed', 'Lead Status Updated', `"${l.name}" status changed to ${status}`, userId);
      }
      return updated;
    }));
  }, []);

  const assignLead = useCallback((leadId: string, userId: string) => {
    const lead = leads.find(l => l.id === leadId);
    const assignee = users.find(u => u.id === userId);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedTo: userId, updatedAt: new Date().toISOString() } : l));
    addNotification({ title: 'New Lead Assigned', message: `A new lead has been assigned to you`, type: 'assignment', userId });
    addActivity('lead_assigned', 'Lead Assigned', `"${lead?.name || leadId}" assigned to ${assignee?.name || userId}`, userId);
  }, [leads, users]);

  const addLeadNote = useCallback((leadId: string, note: Omit<Note, 'id' | 'createdAt'>) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes: [...l.notes, { ...note, id: `n-${Date.now()}`, createdAt: new Date().toISOString() }], updatedAt: new Date().toISOString() } : l));
  }, []);

  // Project Request workflow
  const addProjectRequest = useCallback((request: Omit<ProjectRequest, 'id' | 'status' | 'createdAt'>) => {
    const id = `pr-${Date.now()}`;
    setProjectRequests(prev => [...prev, { ...request, id, status: 'pending', createdAt: new Date().toISOString() }]);
    // Notify all admins
    users.filter(u => u.role === 'admin').forEach(admin => {
      addNotification({ title: 'New Project Request', message: `"${request.projectName}" from ${request.clientName} needs approval`, type: 'info', userId: admin.id });
    });
    addActivity('project_request_created', 'Project Request Submitted', `"${request.projectName}" submitted for admin approval`, request.requestedBy);
  }, [users]);

  const approveProjectRequest = useCallback((requestId: string) => {
    const request = projectRequests.find(r => r.id === requestId);
    if (!request) return;
    setProjectRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' as const } : r));
    // Create the project and assign to tech lead
    const techLead = users.find(u => u.role === 'tech_lead');
    const now = new Date().toISOString();
    const lead = leads.find(l => l.id === request.leadId);
    const newProject: Project = {
      id: `p-${Date.now()}`,
      name: request.projectName,
      leadId: request.leadId,
      clientName: request.clientName,
      clientEmail: request.clientEmail,
      clientPhone: request.clientPhone,
      status: 'Planning',
      assignedTo: techLead?.id || '2',
      notes: lead?.notes || [],
      createdAt: now,
      updatedAt: now,
    };
    setProjects(prev => [...prev, newProject]);
    // Notify tech lead
    if (techLead) {
      addNotification({ title: 'New Project Assigned', message: `"${request.projectName}" has been approved and assigned to you`, type: 'conversion', userId: techLead.id });
    }
    // Notify requester
    addNotification({ title: 'Request Approved', message: `Your project request "${request.projectName}" has been approved`, type: 'info', userId: request.requestedBy });
    addActivity('project_request_approved', 'Project Request Approved', `"${request.projectName}" approved and assigned to ${techLead?.name || 'Tech Lead'}`);
  }, [projectRequests, users, leads]);

  const rejectProjectRequest = useCallback((requestId: string, reason: string) => {
    const request = projectRequests.find(r => r.id === requestId);
    if (!request) return;
    setProjectRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' as const, rejectionReason: reason } : r));
    addNotification({ title: 'Request Rejected', message: `Your project request "${request.projectName}" was rejected: ${reason}`, type: 'info', userId: request.requestedBy });
    addActivity('project_request_rejected', 'Project Request Rejected', `"${request.projectName}" rejected — ${reason}`);
  }, [projectRequests]);

  const addProject = useCallback((project: Omit<Project, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setProjects(prev => [...prev, { ...project, id: `p-${Date.now()}`, notes: [], createdAt: now, updatedAt: now }]);
    addActivity('project_added', 'Project Created', `New project "${project.name}" for ${project.clientName}`);
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    addActivity('project_deleted', 'Project Deleted', `Project "${project?.name || projectId}" removed`);
  }, [projects]);

  const updateProjectStatus = useCallback((projectId: string, status: ProjectStatus) => {
    const project = projects.find(p => p.id === projectId);
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status, updatedAt: new Date().toISOString() } : p));
    addActivity('project_status_changed', 'Project Status Updated', `"${project?.name || projectId}" status changed to ${status}`);
  }, [projects]);

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
      leads, projects, notifications, folders, users, activities, projectRequests,
      addFolder, deleteFolder, renameFolder,
      addLead, updateLead, deleteLead, updateLeadStatus, assignLead, addLeadNote,
      addProject, deleteProject, updateProjectStatus, renameProject, setProjectDeadline, addProjectNote, assignDeveloper,
      markNotificationRead, getUnreadCount,
      developers, addDeveloper, removeDeveloper, updateDeveloper,
      addUser, removeUser, updateUser,
      addProjectRequest, approveProjectRequest, rejectProjectRequest,
    }}>
      {children}
    </CRMContext.Provider>
  );
};
