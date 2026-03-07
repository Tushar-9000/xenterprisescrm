import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { MOCK_USERS, LeadStatus, Lead } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Follow-up', 'Interested', 'Not Interested', 'Converted'];

const Leads = () => {
  const { user } = useAuth();
  const { leads, addLead, updateLeadStatus, assignLead, addLeadNote } = useCRM();
  const [addOpen, setAddOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', company: '', source: '' });

  if (!user) return null;

  const isManager = user.role === 'sales_manager' || user.role === 'admin';
  const isTelecaller = user.role === 'telecaller';
  const displayLeads = isTelecaller ? leads.filter(l => l.assignedTo === user.id) : leads;

  const handleAddLead = () => {
    if (!newLead.name || !newLead.phone) {
      toast.error('Name and phone are required');
      return;
    }
    addLead({ ...newLead, status: 'New' });
    setNewLead({ name: '', email: '', phone: '', company: '', source: '' });
    setAddOpen(false);
    toast.success('Lead added successfully');
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isTelecaller ? 'My Leads' : 'Leads Management'}</h1>
          <p className="text-muted-foreground mt-1">{displayLeads.length} leads</p>
        </div>
        {isManager && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Lead</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
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
                {displayLeads.map((lead) => (
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
                            {MOCK_USERS.filter(u => u.role === 'telecaller').map(u => (
                              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    )}
                    <td className="py-3 px-4 flex gap-2">
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
                            {lead.notes.map(n => (
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
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
