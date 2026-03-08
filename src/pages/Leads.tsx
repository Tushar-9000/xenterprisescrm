import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { LeadStatus } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, MessageCircle, FolderPlus, Trash2, Pencil, ArrowLeft, Upload, Download, FolderOpen, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Follow-up', 'Interested', 'Not Interested', 'Converted'];

const Leads = () => {
  const { user } = useAuth();
  const { leads, folders, addFolder, deleteFolder, renameFolder, addLead, updateLead, deleteLead, updateLeadStatus, assignLead, addLeadNote } = useCRM();
  const { users } = useCRM();

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderLocation, setFolderLocation] = useState('');
  const [renameFolderOpen, setRenameFolderOpen] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [editLeadId, setEditLeadId] = useState<string | null>(null);
  const [editLeadData, setEditLeadData] = useState({ name: '', email: '', phone: '', company: '', source: '' });
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', company: '', source: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [telecallerFolder, setTelecallerFolder] = useState<string | null>(null);

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
          <LeadTable leads={tcFolderLeads} user={user} isManager={false} isTelecaller={true} />
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
    addLead({ ...newLead, status: 'New', folderId: selectedFolder || undefined });
    setNewLead({ name: '', email: '', phone: '', company: '', source: '' });
    setAddOpen(false);
    toast.success('Lead added');
  };

  const handleUpdateLead = () => {
    if (!editLeadId) return;
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

  const openWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleaned}`, '_blank');
  };

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
      const sourceIdx = headers.findIndex(h => h.includes('source'));

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
          source: sourceIdx >= 0 ? cols[sourceIdx] : '',
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
    const csv = ['Name,Email,Phone,Company,Source,Status', ...data.map(l => `${l.name},${l.email},${l.phone},${l.company || ''},${l.source || ''},${l.status}`)].join('\n');
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
                <div className="space-y-3">
                  <Input placeholder="Folder / Business Name *" value={folderName} onChange={e => setFolderName(e.target.value)} />
                  <Input placeholder="Location" value={folderLocation} onChange={e => setFolderLocation(e.target.value)} />
                  <Button onClick={handleCreateFolder} className="w-full">Create Folder</Button>
                </div>
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
                            <Input value={renameFolderName} onChange={e => setRenameFolderName(e.target.value)} />
                            <Button onClick={() => handleRenameFolder(folder.id)}>Save</Button>
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
                <div className="space-y-3">
                  <Input placeholder="Name *" value={newLead.name} onChange={e => setNewLead(p => ({ ...p, name: e.target.value }))} />
                  <Input placeholder="Email" value={newLead.email} onChange={e => setNewLead(p => ({ ...p, email: e.target.value }))} />
                  <Input placeholder="Phone *" value={newLead.phone} onChange={e => setNewLead(p => ({ ...p, phone: e.target.value }))} />
                  <Input placeholder="Company" value={newLead.company} onChange={e => setNewLead(p => ({ ...p, company: e.target.value }))} />
                  <Input placeholder="Source" value={newLead.source} onChange={e => setNewLead(p => ({ ...p, source: e.target.value }))} />
                  <Button onClick={handleAddLead} className="w-full">Add Lead</Button>
                </div>
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
        onEdit={(lead) => { setEditLeadId(lead.id); setEditLeadData({ name: lead.name, email: lead.email, phone: lead.phone, company: lead.company || '', source: lead.source || '' }); }}
        onDelete={(id) => { deleteLead(id); toast.success('Lead deleted'); }}
      />

      {/* Edit Lead Dialog */}
      <Dialog open={!!editLeadId} onOpenChange={(o) => { if (!o) setEditLeadId(null); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Edit Lead</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" value={editLeadData.name} onChange={e => setEditLeadData(p => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Email" value={editLeadData.email} onChange={e => setEditLeadData(p => ({ ...p, email: e.target.value }))} />
            <Input placeholder="Phone" value={editLeadData.phone} onChange={e => setEditLeadData(p => ({ ...p, phone: e.target.value }))} />
            <Input placeholder="Company" value={editLeadData.company} onChange={e => setEditLeadData(p => ({ ...p, company: e.target.value }))} />
            <Input placeholder="Source" value={editLeadData.source} onChange={e => setEditLeadData(p => ({ ...p, source: e.target.value }))} />
            <Button onClick={handleUpdateLead} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Shared Lead Table
const LeadTable = ({ leads, user, isManager, isTelecaller, onEdit, onDelete }: {
  leads: any[];
  user: any;
  isManager: boolean;
  isTelecaller: boolean;
  onEdit?: (lead: any) => void;
  onDelete?: (id: string) => void;
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

  const openWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

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
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                {isManager && <th className="text-left py-3 px-4 text-muted-foreground font-medium">Assigned To</th>}
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={isManager ? 6 : 5} className="text-center py-8 text-muted-foreground">No leads in this folder</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{lead.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{lead.phone}</td>
                  <td className="py-3 px-4 text-muted-foreground">{lead.company || '—'}</td>
                  <td className="py-3 px-4">
                    {(isTelecaller || isManager) && lead.status !== 'Converted' ? (
                      <Select value={lead.status} onValueChange={(v) => updateLeadStatus(lead.id, v as LeadStatus, user.id)}>
                        <SelectTrigger className="w-32 h-8 text-xs bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
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
                      <Button size="sm" variant="ghost" onClick={() => openWhatsApp(lead.phone)} title="WhatsApp">
                        <MessageCircle className="h-4 w-4 text-success" />
                      </Button>
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
                          <Textarea placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} />
                          <Button onClick={() => handleAddNote(lead.id)}>Add Note</Button>
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
