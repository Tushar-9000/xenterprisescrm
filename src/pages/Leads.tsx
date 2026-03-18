import { useState, useRef } from 'react';
import { isValidEmail, isValidPhone, sanitizePhone } from '@/lib/validation';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { LeadStatus, Lead, LeadSocialMedia } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FolderPlus, Trash2, Pencil, ArrowLeft, Upload, Download, FolderOpen, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
);
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);

const SocialMediaInputs = ({ social, onChange }: { social: LeadSocialMedia; onChange: (s: LeadSocialMedia) => void }) => (
  <div className="space-y-2">
    <p className="text-xs text-muted-foreground font-medium">Social Media Handles</p>
    <div className="grid grid-cols-1 gap-2">
      <div className="flex items-center gap-2">
        <InstagramIcon className="h-4 w-4 text-pink-500 shrink-0" />
        <Input placeholder="Instagram URL" value={social.instagram || ''} onChange={e => onChange({ ...social, instagram: e.target.value })} className="h-8 text-xs" />
      </div>
      <div className="flex items-center gap-2">
        <FacebookIcon className="h-4 w-4 text-blue-600 shrink-0" />
        <Input placeholder="Facebook URL" value={social.facebook || ''} onChange={e => onChange({ ...social, facebook: e.target.value })} className="h-8 text-xs" />
      </div>
      <div className="flex items-center gap-2">
        <LinkedinIcon className="h-4 w-4 text-blue-700 shrink-0" />
        <Input placeholder="LinkedIn URL" value={social.linkedin || ''} onChange={e => onChange({ ...social, linkedin: e.target.value })} className="h-8 text-xs" />
      </div>
      <div className="flex items-center gap-2">
        <TwitterIcon className="h-4 w-4 shrink-0" />
        <Input placeholder="Twitter / X URL" value={social.twitter || ''} onChange={e => onChange({ ...social, twitter: e.target.value })} className="h-8 text-xs" />
      </div>
      <div className="flex items-center gap-2">
        <YoutubeIcon className="h-4 w-4 text-red-600 shrink-0" />
        <Input placeholder="YouTube URL" value={social.youtube || ''} onChange={e => onChange({ ...social, youtube: e.target.value })} className="h-8 text-xs" />
      </div>
    </div>
  </div>
);

const SocialMediaIcons = ({ social }: { social?: LeadSocialMedia }) => {
  if (!social) return null;
  const links = [
    { url: social.instagram, Icon: InstagramIcon, color: 'text-pink-500 hover:text-pink-400', label: 'Instagram' },
    { url: social.facebook, Icon: FacebookIcon, color: 'text-blue-600 hover:text-blue-500', label: 'Facebook' },
    { url: social.linkedin, Icon: LinkedinIcon, color: 'text-blue-700 hover:text-blue-600', label: 'LinkedIn' },
    { url: social.twitter, Icon: TwitterIcon, color: 'hover:text-muted-foreground', label: 'Twitter' },
    { url: social.youtube, Icon: YoutubeIcon, color: 'text-red-600 hover:text-red-500', label: 'YouTube' },
  ].filter(l => l.url?.trim());
  if (links.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      {links.map(({ url, Icon, color, label }) => (
        <a key={label} href={url!.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" title={label} className={`${color} transition-colors`} onClick={e => e.stopPropagation()}>
          <Icon className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
  );
};

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Follow-up', 'Interested', 'Not Interested', 'Converted'];

const Leads = () => {
  const { user } = useAuth();
  const { leads, folders, addFolder, deleteFolder, renameFolder, addLead, updateLead, deleteLead, updateLeadStatus, assignLead, addLeadNote, addProjectRequest } = useCRM();
  const { users } = useCRM();

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderLocation, setFolderLocation] = useState('');
  const [renameFolderOpen, setRenameFolderOpen] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [editLeadId, setEditLeadId] = useState<string | null>(null);
  const [editLeadData, setEditLeadData] = useState({ name: '', email: '', phone: '', company: '', socialMedia: {} as LeadSocialMedia });
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', company: '', socialMedia: {} as LeadSocialMedia });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [telecallerFolder, setTelecallerFolder] = useState<string | null>(null);

  // Project request dialog state
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [projectDetails, setProjectDetails] = useState({ projectName: '', description: '' });

  if (!user) return null;

  const isManager = user.role === 'sales_manager' || user.role === 'admin';
  const isTelecaller = user.role === 'telecaller';

  // Telecaller: show assigned leads grouped by folder
  if (isTelecaller) {
    const myLeads = leads.filter(l => l.assignedTo === user.id);

    // Group leads by folder
    const folderIds = [...new Set(myLeads.map(l => l.folderId).filter(Boolean))] as string[];
    const unfoldered = myLeads.filter(l => !l.folderId);
    const currentTcFolder = folders.find(f => f.id === telecallerFolder);
    const tcFolderLeads = telecallerFolder ? myLeads.filter(l => l.folderId === telecallerFolder) : [];

    const projectRequestDialog = (
      <Dialog open={!!convertLead} onOpenChange={(o) => { if (!o) { setConvertLead(null); setProjectDetails({ projectName: '', description: '' }); } }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Submit Project Request</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Lead "<span className="font-medium text-foreground">{convertLead?.name}</span>" is finalized. Fill in project details to send an approval request to Admin.
          </p>
          <div className="space-y-3">
            <Input placeholder="Project Name *" value={projectDetails.projectName} onChange={e => setProjectDetails(p => ({ ...p, projectName: e.target.value }))} />
            <Textarea placeholder="Project description / requirements..." value={projectDetails.description} onChange={e => setProjectDetails(p => ({ ...p, description: e.target.value }))} />
            <div className="bg-secondary/50 rounded p-3 text-sm space-y-1">
              <p><span className="text-muted-foreground">Client:</span> {convertLead?.name}</p>
              <p><span className="text-muted-foreground">Email:</span> {convertLead?.email}</p>
              <p><span className="text-muted-foreground">Phone:</span> {convertLead?.phone}</p>
              {convertLead?.company && <p><span className="text-muted-foreground">Company:</span> {convertLead.company}</p>}
            </div>
            <Button className="w-full" onClick={() => {
              if (!projectDetails.projectName.trim()) { toast.error('Project name is required'); return; }
              if (!convertLead) return;
              addProjectRequest({ leadId: convertLead.id, leadName: convertLead.name, projectName: projectDetails.projectName.trim(), clientName: convertLead.name, clientEmail: convertLead.email, clientPhone: convertLead.phone, description: projectDetails.description.trim(), requestedBy: user.id });
              updateLeadStatus(convertLead.id, 'Converted', user.id);
              setConvertLead(null);
              setProjectDetails({ projectName: '', description: '' });
              toast.success('Project request sent to Admin for approval');
            }}>Send Request to Admin</Button>
          </div>
        </DialogContent>
      </Dialog>
    );

    if (telecallerFolder) {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setTelecallerFolder(null)}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-3xl font-bold">{currentTcFolder?.name}</h1>
              {currentTcFolder?.location && <p className="text-muted-foreground text-sm flex items-center gap-1"><MapPin className="h-3 w-3" />{currentTcFolder.location}</p>}
              <p className="text-muted-foreground text-sm">{tcFolderLeads.length} leads assigned</p>
            </div>
          </div>
          <LeadTable leads={tcFolderLeads} user={user} isManager={false} isTelecaller={true} onConvert={(lead) => { setConvertLead(lead); setProjectDetails({ projectName: `${lead.name} Project`, description: '' }); }} />
          {projectRequestDialog}
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">My Leads</h1>
          <p className="text-muted-foreground mt-1">{myLeads.length} leads assigned across {folderIds.length} folder{folderIds.length !== 1 ? 's' : ''}</p>
        </div>

        {folderIds.length === 0 && unfoldered.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No leads assigned to you yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {folderIds.map(fid => {
              const folder = folders.find(f => f.id === fid);
              if (!folder) return null;
              const count = myLeads.filter(l => l.folderId === fid).length;
              return (
                <Card key={fid} className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors group" onClick={() => setTelecallerFolder(fid)}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{folder.name}</p>
                        {folder.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{folder.location}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">{count} lead{count !== 1 ? 's' : ''} assigned</p>
                  </CardContent>
                </Card>
              );
            })}
            {unfoldered.length > 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">Uncategorized</p>
                      <p className="text-xs text-muted-foreground">{unfoldered.length} lead{unfoldered.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  const currentFolder = folders.find(f => f.id === selectedFolder);
  const folderLeads = selectedFolder ? leads.filter(l => l.folderId === selectedFolder) : [];

  const handleCreateFolder = () => {
    if (!folderName.trim()) { toast.error('Folder name is required'); return; }
    addFolder(folderName.trim(), folderLocation.trim());
    setFolderName('');
    setFolderLocation('');
    setCreateFolderOpen(false);
    toast.success('Folder created');
  };

  const handleRenameFolder = (folderId: string) => {
    if (!renameFolderName.trim()) return;
    renameFolder(folderId, renameFolderName.trim());
    setRenameFolderOpen(null);
    toast.success('Folder renamed');
  };

  const handleAddLead = () => {
    if (!newLead.name || !newLead.phone) { toast.error('Name and phone are required'); return; }
    if (newLead.email && !isValidEmail(newLead.email)) { toast.error('Please enter a valid email'); return; }
    if (!isValidPhone(newLead.phone)) { toast.error('Please enter a valid phone number'); return; }
    addLead({ ...newLead, status: 'New', folderId: selectedFolder || undefined });
    setNewLead({ name: '', email: '', phone: '', company: '', socialMedia: {} });
    setAddOpen(false);
    toast.success('Lead added');
  };

  const handleUpdateLead = () => {
    if (!editLeadId) return;
    if (editLeadData.email && !isValidEmail(editLeadData.email)) { toast.error('Please enter a valid email'); return; }
    if (editLeadData.phone && !isValidPhone(editLeadData.phone)) { toast.error('Please enter a valid phone number'); return; }
    updateLead(editLeadId, editLeadData);
    setEditLeadId(null);
    toast.success('Lead updated');
  };

  const handleAddNote = (leadId: string) => {
    if (!noteText.trim()) return;
    addLeadNote(leadId, { content: noteText, createdBy: user.id });
    setNoteText('');
    setNoteOpen(null);
    toast.success('Note added');
  };

  // removed openWhatsApp

  // Import from CSV/sheet
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { toast.error('File must have header + data rows'); return; }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const nameIdx = headers.findIndex(h => h.includes('name'));
      const emailIdx = headers.findIndex(h => h.includes('email'));
      const phoneIdx = headers.findIndex(h => h.includes('phone'));
      const companyIdx = headers.findIndex(h => h.includes('company'));
      

      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const name = nameIdx >= 0 ? cols[nameIdx] : '';
        const phone = phoneIdx >= 0 ? cols[phoneIdx] : '';
        if (!name || !phone) continue;
        addLead({
          name,
          email: emailIdx >= 0 ? cols[emailIdx] : '',
          phone,
          company: companyIdx >= 0 ? cols[companyIdx] : '',
          status: 'New',
          folderId: selectedFolder || undefined,
        });
        imported++;
      }
      toast.success(`Imported ${imported} leads`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export to CSV
  const handleExport = () => {
    const data = folderLeads;
    if (data.length === 0) { toast.error('No leads to export'); return; }
    const csv = ['Name,Email,Phone,Company,Status', ...data.map(l => `${l.name},${l.email},${l.phone},${l.company || ''},${l.status}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFolder?.name || 'leads'}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported leads');
  };

  // Folder list view
  if (!selectedFolder) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leads Management</h1>
            <p className="text-muted-foreground mt-1">{folders.length} folders · {leads.length} total leads</p>
          </div>
          {isManager && (
            <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1"><FolderPlus className="h-4 w-4" /> Create Folder</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Create Lead Folder</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleCreateFolder(); }} className="space-y-3">
                  <Input placeholder="Folder / Business Name *" value={folderName} onChange={e => setFolderName(e.target.value)} />
                  <Input placeholder="Location" value={folderLocation} onChange={e => setFolderLocation(e.target.value)} />
                  <Button type="submit" className="w-full">Create Folder</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {folders.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No folders yet. Create a folder to organize leads by business/niche and location.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {folders.map(folder => {
              const count = leads.filter(l => l.folderId === folder.id).length;
              return (
                <Card key={folder.id} className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors group" onClick={() => setSelectedFolder(folder.id)}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FolderOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{folder.name}</p>
                          {folder.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{folder.location}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <Dialog open={renameFolderOpen === folder.id} onOpenChange={(o) => { setRenameFolderOpen(o ? folder.id : null); if (o) setRenameFolderName(folder.name); }}>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card border-border">
                            <DialogHeader><DialogTitle>Rename Folder</DialogTitle></DialogHeader>
                            <form onSubmit={(e) => { e.preventDefault(); handleRenameFolder(folder.id); }} className="space-y-2">
                              <Input value={renameFolderName} onChange={e => setRenameFolderName(e.target.value)} />
                              <Button type="submit">Save</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                              <AlertDialogDescription>Delete "{folder.name}" and all {count} leads inside it?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => { deleteFolder(folder.id); toast.success('Folder deleted'); }}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">{count} lead{count !== 1 ? 's' : ''}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Inside a folder
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedFolder(null)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-3xl font-bold">{currentFolder?.name}</h1>
            {currentFolder?.location && <p className="text-muted-foreground text-sm flex items-center gap-1"><MapPin className="h-3 w-3" />{currentFolder.location}</p>}
            <p className="text-muted-foreground text-sm">{folderLeads.length} leads</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImport} />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1"><Upload className="h-3.5 w-3.5" /> Import</Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1"><Download className="h-3.5 w-3.5" /> Export</Button>
          {isManager && (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Lead</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Add Lead to {currentFolder?.name}</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleAddLead(); }} className="space-y-3">
                  <Input placeholder="Name *" value={newLead.name} onChange={e => setNewLead(p => ({ ...p, name: e.target.value }))} />
                  <Input placeholder="Email" type="email" value={newLead.email} onChange={e => setNewLead(p => ({ ...p, email: e.target.value }))} />
                  <Input placeholder="Phone *" value={newLead.phone} onChange={e => setNewLead(p => ({ ...p, phone: sanitizePhone(e.target.value) }))} />
                  <Input placeholder="Company" value={newLead.company} onChange={e => setNewLead(p => ({ ...p, company: e.target.value }))} />
                  
                  <SocialMediaInputs social={newLead.socialMedia} onChange={s => setNewLead(p => ({ ...p, socialMedia: s }))} />
                  <Button type="submit" className="w-full">Add Lead</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <LeadTable
        leads={folderLeads}
        user={user}
        isManager={isManager}
        isTelecaller={false}
        onEdit={(lead) => { setEditLeadId(lead.id); setEditLeadData({ name: lead.name, email: lead.email, phone: lead.phone, company: lead.company || '', socialMedia: lead.socialMedia || {} }); }}
        onDelete={(id) => { deleteLead(id); toast.success('Lead deleted'); }}
        onConvert={(lead) => { setConvertLead(lead); setProjectDetails({ projectName: `${lead.name} Project`, description: '' }); }}
      />

      {/* Edit Lead Dialog */}
      <Dialog open={!!editLeadId} onOpenChange={(o) => { if (!o) setEditLeadId(null); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Edit Lead</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateLead(); }} className="space-y-3">
            <Input placeholder="Name" value={editLeadData.name} onChange={e => setEditLeadData(p => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Email" type="email" value={editLeadData.email} onChange={e => setEditLeadData(p => ({ ...p, email: e.target.value }))} />
            <Input placeholder="Phone" value={editLeadData.phone} onChange={e => setEditLeadData(p => ({ ...p, phone: sanitizePhone(e.target.value) }))} />
            <Input placeholder="Company" value={editLeadData.company} onChange={e => setEditLeadData(p => ({ ...p, company: e.target.value }))} />
            
            <SocialMediaInputs social={editLeadData.socialMedia} onChange={s => setEditLeadData(p => ({ ...p, socialMedia: s }))} />
            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Project Request Dialog */}
      <Dialog open={!!convertLead} onOpenChange={(o) => { if (!o) { setConvertLead(null); setProjectDetails({ projectName: '', description: '' }); } }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Submit Project Request</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Lead "<span className="font-medium text-foreground">{convertLead?.name}</span>" is finalized. Fill in project details to send an approval request to Admin. Once approved, it will be assigned to Tech Lead.
          </p>
          <div className="space-y-3">
            <Input placeholder="Project Name *" value={projectDetails.projectName} onChange={e => setProjectDetails(p => ({ ...p, projectName: e.target.value }))} />
            <Textarea placeholder="Project description / requirements..." value={projectDetails.description} onChange={e => setProjectDetails(p => ({ ...p, description: e.target.value }))} />
            <div className="bg-secondary/50 rounded p-3 text-sm space-y-1">
              <p><span className="text-muted-foreground">Client:</span> {convertLead?.name}</p>
              <p><span className="text-muted-foreground">Email:</span> {convertLead?.email}</p>
              <p><span className="text-muted-foreground">Phone:</span> {convertLead?.phone}</p>
              {convertLead?.company && <p><span className="text-muted-foreground">Company:</span> {convertLead.company}</p>}
            </div>
            <Button className="w-full" onClick={() => {
              if (!projectDetails.projectName.trim()) { toast.error('Project name is required'); return; }
              if (!convertLead) return;
              addProjectRequest({ leadId: convertLead.id, leadName: convertLead.name, projectName: projectDetails.projectName.trim(), clientName: convertLead.name, clientEmail: convertLead.email, clientPhone: convertLead.phone, description: projectDetails.description.trim(), requestedBy: user.id });
              updateLeadStatus(convertLead.id, 'Converted', user.id);
              setConvertLead(null);
              setProjectDetails({ projectName: '', description: '' });
              toast.success('Project request sent to Admin for approval');
            }}>Send Request to Admin</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Shared Lead Table
const LeadTable = ({ leads, user, isManager, isTelecaller, onEdit, onDelete, onConvert }: {
  leads: any[];
  user: any;
  isManager: boolean;
  isTelecaller: boolean;
  onEdit?: (lead: any) => void;
  onDelete?: (id: string) => void;
  onConvert?: (lead: any) => void;
}) => {
  const { updateLeadStatus, assignLead, addLeadNote, users } = useCRM();
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const telecallers = users.filter(u => u.role === 'telecaller');

  const handleAddNote = (leadId: string) => {
    if (!noteText.trim()) return;
    addLeadNote(leadId, { content: noteText, createdBy: user.id });
    setNoteText('');
    setNoteOpen(null);
    toast.success('Note added');
  };

  // removed openWhatsApp from LeadTable

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Phone</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Company</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Social</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                {isManager && <th className="text-left py-3 px-4 text-muted-foreground font-medium">Assigned To</th>}
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={isManager ? 7 : 6} className="text-center py-8 text-muted-foreground">No leads in this folder</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{lead.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{lead.phone}</td>
                  <td className="py-3 px-4 text-muted-foreground">{lead.company || '—'}</td>
                  <td className="py-3 px-4"><SocialMediaIcons social={lead.socialMedia} /></td>
                  <td className="py-3 px-4">
                    {(isTelecaller || isManager) && lead.status !== 'Converted' ? (
                      <div className="flex items-center gap-1">
                        <Select value={lead.status} onValueChange={(v) => {
                          if (v === 'Converted') {
                            if (onConvert) onConvert(lead);
                            return;
                          }
                          updateLeadStatus(lead.id, v as LeadStatus, user.id);
                        }}>
                          <SelectTrigger className="w-32 h-8 text-xs bg-secondary border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.filter(s => s !== 'Converted').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {lead.status === 'Interested' && onConvert && (
                          <Button size="sm" variant="default" className="h-8 text-xs" onClick={() => onConvert(lead)}>
                            Convert
                          </Button>
                        )}
                      </div>
                    ) : (
                      <StatusBadge status={lead.status} />
                    )}
                  </td>
                  {isManager && (
                    <td className="py-3 px-4">
                      <Select value={lead.assignedTo || ''} onValueChange={(v) => assignLead(lead.id, v)}>
                        <SelectTrigger className="w-32 h-8 text-xs bg-secondary border-border">
                          <SelectValue placeholder="Assign" />
                        </SelectTrigger>
                        <SelectContent>
                          {telecallers.map(u => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <Dialog open={noteOpen === lead.id} onOpenChange={(o) => { setNoteOpen(o ? lead.id : null); setNoteText(''); }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost">Notes ({lead.notes.length})</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border">
                          <DialogHeader><DialogTitle>Notes - {lead.name}</DialogTitle></DialogHeader>
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {lead.notes.map((n: any) => (
                              <div key={n.id} className="bg-secondary/50 rounded p-3 text-sm">
                                <p>{n.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">{n.createdAt}</p>
                              </div>
                            ))}
                          </div>
                          <form onSubmit={(e) => { e.preventDefault(); handleAddNote(lead.id); }} className="space-y-2">
                            <Textarea placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} />
                            <Button type="submit">Add Note</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                      {onEdit && <Button size="sm" variant="ghost" onClick={() => onEdit(lead)}><Pencil className="h-3.5 w-3.5" /></Button>}
                      {onDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                              <AlertDialogDescription>Remove {lead.name} from this folder?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(lead.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'New': 'bg-info/20 text-info',
    'Contacted': 'bg-warning/20 text-warning',
    'Follow-up': 'bg-warning/20 text-warning',
    'Interested': 'bg-primary/20 text-primary',
    'Not Interested': 'bg-destructive/20 text-destructive',
    'Converted': 'bg-success/20 text-success',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || ''}`}>{status}</span>;
};

export default Leads;
