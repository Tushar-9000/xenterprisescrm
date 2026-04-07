import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Lead, Project, Notification, Note, LeadStatus, ProjectStatus, Developer, LeadFolder, User, Activity, ProjectRequest } from '@/types/crm';
import { db as supabase } from '@/integrations/supabase/db';

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
  addUser: (user: Omit<User, 'id'>) => string;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  getUnreadCount: (userId: string) => number;
  addProjectRequest: (request: Omit<ProjectRequest, 'id' | 'status' | 'createdAt'>) => void;
  approveProjectRequest: (requestId: string) => void;
  rejectProjectRequest: (requestId: string, reason: string) => void;
  refreshData: () => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

export const useCRM = () => {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error('useCRM must be used within CRMProvider');
  return ctx;
};

const mapDbUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  username: row.username || undefined,
  email: row.email,
  phone: row.phone || undefined,
  dob: row.dob || undefined,
  address: row.address || undefined,
  profilePic: row.profile_pic || undefined,
  password: row.password || undefined,
  role: row.role,
  avatar: row.avatar || undefined,
  joiningDate: row.joining_date || undefined,
});

const mapDbLead = (row: any, notes: Note[]): Lead => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  company: row.company || undefined,
  status: row.status,
  assignedTo: row.assigned_to || undefined,
  source: row.source || undefined,
  socialMedia: row.social_media || undefined,
  notes,
  followUpDate: row.follow_up_date || undefined,
  folderId: row.folder_id || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapDbProject = (row: any, notes: Note[]): Project => ({
  id: row.id,
  name: row.name,
  leadId: row.lead_id || undefined,
  clientName: row.client_name,
  clientEmail: row.client_email,
  clientPhone: row.client_phone,
  status: row.status,
  assignedTo: row.assigned_to,
  assignedDeveloper: row.assigned_developer || undefined,
  deadline: row.deadline || undefined,
  notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [folders, setFolders] = useState<LeadFolder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);

  const loadAll = useCallback(async () => {
    const [usersRes, foldersRes, leadsRes, notesRes, projectsRes, devsRes, notifsRes, actsRes, reqsRes] = await Promise.all([
      supabase.from('users').select('*').order('created_at'),
      supabase.from('lead_folders').select('*').order('created_at'),
      supabase.from('leads').select('*').order('created_at'),
      supabase.from('notes').select('*').order('created_at'),
      supabase.from('projects').select('*').order('created_at'),
      supabase.from('developers').select('*').order('created_at'),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }),
      supabase.from('activities').select('*').order('created_at', { ascending: false }),
      supabase.from('project_requests').select('*').order('created_at', { ascending: false }),
    ]);

    if (usersRes.data) setUsers(usersRes.data.map(mapDbUser));
    if (foldersRes.data) setFolders(foldersRes.data.map((f: any) => ({ id: f.id, name: f.name, location: f.location, createdAt: f.created_at })));
    
    const allNotes: any[] = notesRes.data || [];
    if (leadsRes.data) {
      setLeads(leadsRes.data.map((l: any) => {
        const leadNotes = allNotes.filter(n => n.lead_id === l.id).map((n: any) => ({ id: n.id, content: n.content, createdBy: n.created_by, createdAt: n.created_at }));
        return mapDbLead(l, leadNotes);
      }));
    }
    if (projectsRes.data) {
      setProjects(projectsRes.data.map((p: any) => {
        const projNotes = allNotes.filter(n => n.project_id === p.id).map((n: any) => ({ id: n.id, content: n.content, createdBy: n.created_by, createdAt: n.created_at }));
        return mapDbProject(p, projNotes);
      }));
    }
    if (devsRes.data) setDevelopers(devsRes.data.map((d: any) => ({ id: d.id, name: d.name })));
    if (notifsRes.data) setNotifications(notifsRes.data.map((n: any) => ({ id: n.id, title: n.title, message: n.message, type: n.type, read: n.read, userId: n.user_id, createdAt: n.created_at })));
    if (actsRes.data) setActivities(actsRes.data.map((a: any) => ({ id: a.id, type: a.type, title: a.title, description: a.description, userId: a.user_id || undefined, createdAt: a.created_at })));
    if (reqsRes.data) setProjectRequests(reqsRes.data.map((r: any) => ({ id: r.id, leadId: r.lead_id, leadName: r.lead_name, projectName: r.project_name, clientName: r.client_name, clientEmail: r.client_email, clientPhone: r.client_phone, description: r.description, requestedBy: r.requested_by, status: r.status, rejectionReason: r.rejection_reason || undefined, createdAt: r.created_at })));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const refreshData = useCallback(() => { loadAll(); }, [loadAll]);

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch {}
  }, []);

  const addActivityDb = async (type: Activity['type'], title: string, description: string, userId?: string) => {
    const { data } = await supabase.from('activities').insert({ type, title, description, user_id: userId || null }).select().single();
    if (data) {
      setActivities(prev => [{ id: data.id, type: data.type, title: data.title, description: data.description, userId: data.user_id || undefined, createdAt: data.created_at }, ...prev]);
    }
  };

  const addNotificationDb = async (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const { data } = await supabase.from('notifications').insert({ title: n.title, message: n.message, type: n.type, user_id: n.userId, read: false }).select().single();
    if (data) {
      setNotifications(prev => [{ id: data.id, title: data.title, message: data.message, type: data.type, read: data.read, userId: data.user_id, createdAt: data.created_at }, ...prev]);
      playNotificationSound();
    }
  };

  const notifyByRole = async (roles: string[], title: string, message: string, type: Notification['type'] = 'info', excludeUserId?: string) => {
    const targets = users.filter(u => roles.includes(u.role) && u.id !== excludeUserId);
    for (const u of targets) {
      await addNotificationDb({ title, message, type, userId: u.id });
    }
  };

  // Folder CRUD
  const addFolder = useCallback(async (name: string, location: string) => {
    const { data } = await supabase.from('lead_folders').insert({ name, location }).select().single();
    if (data) {
      setFolders(prev => [...prev, { id: data.id, name: data.name, location: data.location, createdAt: data.created_at }]);
      addActivityDb('folder_added', 'Folder Created', `Folder "${name}" created at ${location}`);
      notifyByRole(['admin', 'sales_manager'], 'Folder Created', `New folder "${name}" created at ${location}`);
    }
  }, [users]);

  const deleteFolder = useCallback(async (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    await supabase.from('leads').delete().eq('folder_id', folderId);
    await supabase.from('lead_folders').delete().eq('id', folderId);
    setFolders(prev => prev.filter(f => f.id !== folderId));
    setLeads(prev => prev.filter(l => l.folderId !== folderId));
    addActivityDb('folder_deleted', 'Folder Deleted', `Folder "${folder?.name || folderId}" deleted`);
    notifyByRole(['admin', 'sales_manager'], 'Folder Deleted', `Folder "${folder?.name || folderId}" was deleted`);
  }, [folders, users]);

  const renameFolder = useCallback(async (folderId: string, name: string) => {
    await supabase.from('lead_folders').update({ name }).eq('id', folderId);
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name } : f));
  }, []);

  // Lead CRUD
  const addLead = useCallback(async (lead: Omit<Lead, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await supabase.from('leads').insert({
      name: lead.name, email: lead.email, phone: lead.phone,
      company: lead.company || null, status: lead.status as any,
      assigned_to: lead.assignedTo || null, source: lead.source || null,
      social_media: (lead.socialMedia || {}) as any, follow_up_date: lead.followUpDate || null,
      folder_id: lead.folderId || null,
    } as any).select().single();
    if (data) {
      setLeads(prev => [...prev, mapDbLead(data, [])]);
      addActivityDb('lead_added', 'Lead Added', `New lead "${lead.name}" from ${lead.source || 'unknown source'}`);
      notifyByRole(['admin', 'sales_manager'], 'New Lead Added', `"${lead.name}" added from ${lead.source || 'unknown source'}`);
    }
  }, [users]);

  const updateLead = useCallback(async (leadId: string, data: Partial<Pick<Lead, 'name' | 'email' | 'phone' | 'company' | 'source'>>) => {
    const dbData: any = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.phone !== undefined) dbData.phone = data.phone;
    if (data.company !== undefined) dbData.company = data.company;
    if (data.source !== undefined) dbData.source = data.source;
    await supabase.from('leads').update(dbData).eq('id', leadId);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...data, updatedAt: new Date().toISOString() } : l));
  }, []);

  const deleteLead = useCallback(async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    await supabase.from('leads').delete().eq('id', leadId);
    setLeads(prev => prev.filter(l => l.id !== leadId));
    addActivityDb('lead_deleted', 'Lead Deleted', `Lead "${lead?.name || leadId}" removed`);
    notifyByRole(['admin', 'sales_manager'], 'Lead Deleted', `Lead "${lead?.name || leadId}" was removed`);
  }, [leads, users]);

  const updateLeadStatus = useCallback(async (leadId: string, status: LeadStatus, userId: string) => {
    await supabase.from('leads').update({ status }).eq('id', leadId);
    setLeads(prev => prev.map(l => {
      if (l.id !== leadId) return l;
      const updated = { ...l, status, updatedAt: new Date().toISOString() };
      if (status === 'Converted') {
        addActivityDb('lead_status_changed', 'Lead Converted', `"${l.name}" marked as converted`, userId);
        notifyByRole(['admin', 'sales_manager'], 'Lead Converted', `"${l.name}" has been converted`, 'conversion', userId);
      } else {
        addActivityDb('lead_status_changed', 'Lead Status Updated', `"${l.name}" status changed to ${status}`, userId);
        notifyByRole(['admin', 'sales_manager'], 'Lead Status Changed', `"${l.name}" status → ${status}`, 'info', userId);
      }
      return updated;
    }));
  }, [users]);

  const assignLead = useCallback(async (leadId: string, userId: string) => {
    const lead = leads.find(l => l.id === leadId);
    const assignee = users.find(u => u.id === userId);
    await supabase.from('leads').update({ assigned_to: userId }).eq('id', leadId);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedTo: userId, updatedAt: new Date().toISOString() } : l));
    addNotificationDb({ title: 'New Lead Assigned', message: `Lead "${lead?.name || ''}" has been assigned to you`, type: 'assignment', userId });
    notifyByRole(['admin'], 'Lead Assigned', `"${lead?.name || leadId}" assigned to ${assignee?.name || userId}`, 'info');
    addActivityDb('lead_assigned', 'Lead Assigned', `"${lead?.name || leadId}" assigned to ${assignee?.name || userId}`, userId);
  }, [leads, users]);

  const addLeadNote = useCallback(async (leadId: string, note: Omit<Note, 'id' | 'createdAt'>) => {
    const lead = leads.find(l => l.id === leadId);
    const { data } = await supabase.from('notes').insert({ content: note.content, created_by: note.createdBy, lead_id: leadId }).select().single();
    if (data) {
      const newNote: Note = { id: data.id, content: data.content, createdBy: data.created_by, createdAt: data.created_at };
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes: [...l.notes, newNote], updatedAt: new Date().toISOString() } : l));
      if (lead?.assignedTo && lead.assignedTo !== note.createdBy) {
        addNotificationDb({ title: 'New Note on Lead', message: `A note was added to "${lead.name}"`, type: 'info', userId: lead.assignedTo });
      }
    }
  }, [leads]);

  // Project Request workflow
  const addProjectRequest = useCallback(async (request: Omit<ProjectRequest, 'id' | 'status' | 'createdAt'>) => {
    const { data } = await supabase.from('project_requests').insert({
      lead_id: request.leadId, lead_name: request.leadName, project_name: request.projectName,
      client_name: request.clientName, client_email: request.clientEmail, client_phone: request.clientPhone,
      description: request.description, requested_by: request.requestedBy, status: 'pending',
    }).select().single();
    if (data) {
      setProjectRequests(prev => [{ id: data.id, leadId: data.lead_id, leadName: data.lead_name, projectName: data.project_name, clientName: data.client_name, clientEmail: data.client_email, clientPhone: data.client_phone, description: data.description, requestedBy: data.requested_by, status: data.status, createdAt: data.created_at }, ...prev]);
      const admins = users.filter(u => u.role === 'admin');
      for (const admin of admins) {
        await addNotificationDb({ title: 'New Project Request', message: `"${request.projectName}" from ${request.clientName} needs approval`, type: 'info', userId: admin.id });
      }
      addActivityDb('project_request_created', 'Project Request Submitted', `"${request.projectName}" submitted for admin approval`, request.requestedBy);
    }
  }, [users]);

  const approveProjectRequest = useCallback(async (requestId: string) => {
    const request = projectRequests.find(r => r.id === requestId);
    if (!request) return;
    await supabase.from('project_requests').update({ status: 'approved' }).eq('id', requestId);
    setProjectRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' as const } : r));
    
    const techLead = users.find(u => u.role === 'tech_lead');
    const lead = leads.find(l => l.id === request.leadId);
    
    const { data: projData } = await supabase.from('projects').insert({
      name: request.projectName, lead_id: request.leadId || null,
      client_name: request.clientName, client_email: request.clientEmail,
      client_phone: request.clientPhone, status: 'Planning',
      assigned_to: techLead?.id || '',
    }).select().single();
    
    if (projData) {
      // Copy lead notes to project
      if (lead?.notes?.length) {
        for (const n of lead.notes) {
          await supabase.from('notes').insert({ content: n.content, created_by: n.createdBy, project_id: projData.id });
        }
      }
      const projNotes = lead?.notes || [];
      setProjects(prev => [...prev, mapDbProject(projData, projNotes)]);
    }
    
    if (techLead) {
      await addNotificationDb({ title: 'New Project Assigned', message: `"${request.projectName}" has been approved and assigned to you`, type: 'conversion', userId: techLead.id });
    }
    await addNotificationDb({ title: 'Request Approved', message: `Your project request "${request.projectName}" has been approved`, type: 'info', userId: request.requestedBy });
    addActivityDb('project_request_approved', 'Project Request Approved', `"${request.projectName}" approved and assigned to ${techLead?.name || 'Tech Lead'}`);
  }, [projectRequests, users, leads]);

  const rejectProjectRequest = useCallback(async (requestId: string, reason: string) => {
    const request = projectRequests.find(r => r.id === requestId);
    if (!request) return;
    await supabase.from('project_requests').update({ status: 'rejected', rejection_reason: reason }).eq('id', requestId);
    setProjectRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' as const, rejectionReason: reason } : r));
    await addNotificationDb({ title: 'Request Rejected', message: `Your project request "${request.projectName}" was rejected: ${reason}`, type: 'info', userId: request.requestedBy });
    addActivityDb('project_request_rejected', 'Project Request Rejected', `"${request.projectName}" rejected — ${reason}`);
  }, [projectRequests]);

  const addProject = useCallback(async (project: Omit<Project, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await supabase.from('projects').insert({
      name: project.name, lead_id: project.leadId || null,
      client_name: project.clientName, client_email: project.clientEmail,
      client_phone: project.clientPhone, status: project.status,
      assigned_to: project.assignedTo, assigned_developer: project.assignedDeveloper || null,
      deadline: project.deadline || null,
    }).select().single();
    if (data) {
      setProjects(prev => [...prev, mapDbProject(data, [])]);
      addActivityDb('project_added', 'Project Created', `New project "${project.name}" for ${project.clientName}`);
      notifyByRole(['admin', 'tech_lead'], 'New Project Created', `"${project.name}" for ${project.clientName}`);
    }
  }, [users]);

  const deleteProject = useCallback(async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    await supabase.from('projects').delete().eq('id', projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    addActivityDb('project_deleted', 'Project Deleted', `Project "${project?.name || projectId}" removed`);
    notifyByRole(['admin', 'tech_lead'], 'Project Deleted', `"${project?.name || projectId}" was removed`);
  }, [projects, users]);

  const updateProjectStatus = useCallback(async (projectId: string, status: ProjectStatus) => {
    const project = projects.find(p => p.id === projectId);
    await supabase.from('projects').update({ status }).eq('id', projectId);
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status, updatedAt: new Date().toISOString() } : p));
    addActivityDb('project_status_changed', 'Project Status Updated', `"${project?.name || projectId}" status changed to ${status}`);
    notifyByRole(['admin', 'tech_lead'], 'Project Status Changed', `"${project?.name || projectId}" → ${status}`);
  }, [projects, users]);

  const renameProject = useCallback(async (projectId: string, name: string) => {
    await supabase.from('projects').update({ name }).eq('id', projectId);
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name, updatedAt: new Date().toISOString() } : p));
  }, []);

  const setProjectDeadline = useCallback(async (projectId: string, deadline: string) => {
    const project = projects.find(p => p.id === projectId);
    await supabase.from('projects').update({ deadline }).eq('id', projectId);
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, deadline, updatedAt: new Date().toISOString() } : p));
    notifyByRole(['admin', 'tech_lead'], 'Deadline Set', `"${project?.name || projectId}" deadline: ${deadline}`);
  }, [projects, users]);

  const addProjectNote = useCallback(async (projectId: string, note: Omit<Note, 'id' | 'createdAt'>) => {
    const project = projects.find(p => p.id === projectId);
    const { data } = await supabase.from('notes').insert({ content: note.content, created_by: note.createdBy, project_id: projectId }).select().single();
    if (data) {
      const newNote: Note = { id: data.id, content: data.content, createdBy: data.created_by, createdAt: data.created_at };
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, notes: [...p.notes, newNote], updatedAt: new Date().toISOString() } : p));
      if (project?.assignedTo && project.assignedTo !== note.createdBy) {
        addNotificationDb({ title: 'New Note on Project', message: `A note was added to "${project.name}"`, type: 'info', userId: project.assignedTo });
      }
    }
  }, [projects]);

  const assignDeveloper = useCallback(async (projectId: string, developerId: string) => {
    const project = projects.find(p => p.id === projectId);
    const dev = developers.find(d => d.id === developerId);
    await supabase.from('projects').update({ assigned_developer: developerId }).eq('id', projectId);
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, assignedDeveloper: developerId, updatedAt: new Date().toISOString() } : p));
    addActivityDb('developer_assigned', 'Developer Assigned', `${dev?.name || developerId} assigned to "${project?.name || projectId}"`);
    notifyByRole(['admin', 'tech_lead'], 'Developer Assigned', `${dev?.name || developerId} assigned to "${project?.name || projectId}"`);
  }, [projects, developers, users]);

  const addDeveloper = useCallback(async (name: string) => {
    const { data } = await supabase.from('developers').insert({ name }).select().single();
    if (data) {
      setDevelopers(prev => [...prev, { id: data.id, name: data.name }]);
      addActivityDb('developer_added', 'Developer Added', `Developer "${name}" added`);
      notifyByRole(['admin', 'tech_lead'], 'Developer Added', `New developer "${name}" added`);
    }
  }, [users]);

  const removeDeveloper = useCallback(async (id: string) => {
    const dev = developers.find(d => d.id === id);
    await supabase.from('developers').delete().eq('id', id);
    setDevelopers(prev => prev.filter(d => d.id !== id));
    await supabase.from('projects').update({ assigned_developer: null }).eq('assigned_developer', id);
    setProjects(prev => prev.map(p => p.assignedDeveloper === id ? { ...p, assignedDeveloper: undefined } : p));
    addActivityDb('developer_removed', 'Developer Removed', `Developer "${dev?.name || id}" removed`);
    notifyByRole(['admin', 'tech_lead'], 'Developer Removed', `Developer "${dev?.name || id}" was removed`);
  }, [developers, users]);

  const updateDeveloper = useCallback(async (id: string, name: string) => {
    await supabase.from('developers').update({ name }).eq('id', id);
    setDevelopers(prev => prev.map(d => d.id === id ? { ...d, name } : d));
  }, []);

  const addUser = useCallback((user: Omit<User, 'id'>): string => {
    const id = crypto.randomUUID();
    supabase.from('users').insert({
      id, name: user.name, username: user.username || null, email: user.email,
      phone: user.phone || null, dob: user.dob || null, address: user.address || null,
      profile_pic: user.profilePic || null, password: user.password || null,
      role: user.role, avatar: user.avatar || null, joining_date: user.joiningDate || null,
    }).then(() => {
      loadAll();
    });
    setUsers(prev => [...prev, { ...user, id }]);
    addActivityDb('user_added', 'User Added', `New user "${user.name}" (${user.role}) added`);
    notifyByRole(['admin'], 'New User Added', `"${user.name}" joined as ${user.role}`);
    return id;
  }, [users]);

  const removeUser = useCallback(async (userId: string) => {
    const removed = users.find(u => u.id === userId);
    await supabase.from('users').delete().eq('id', userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    addActivityDb('user_removed', 'User Removed', `User "${removed?.name || userId}" removed`);
    notifyByRole(['admin'], 'User Removed', `"${removed?.name || userId}" was removed`);
  }, [users]);

  const updateUser = useCallback(async (userId: string, data: Partial<User>) => {
    const dbData: any = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.username !== undefined) dbData.username = data.username;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.phone !== undefined) dbData.phone = data.phone;
    if (data.dob !== undefined) dbData.dob = data.dob;
    if (data.address !== undefined) dbData.address = data.address;
    if (data.profilePic !== undefined) dbData.profile_pic = data.profilePic;
    if (data.role !== undefined) dbData.role = data.role;
    if (data.avatar !== undefined) dbData.avatar = data.avatar;
    if (data.joiningDate !== undefined) dbData.joining_date = data.joiningDate;
    await supabase.from('users').update(dbData).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
  }, []);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(async (userId: string) => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
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
      markNotificationRead, markAllNotificationsRead, getUnreadCount,
      developers, addDeveloper, removeDeveloper, updateDeveloper,
      addUser, removeUser, updateUser,
      addProjectRequest, approveProjectRequest, rejectProjectRequest,
      refreshData,
    }}>
      {children}
    </CRMContext.Provider>
  );
};
