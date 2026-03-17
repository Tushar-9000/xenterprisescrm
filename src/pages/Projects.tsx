import { useState } from 'react';
import { isValidEmail, isValidPhone, sanitizePhone } from '@/lib/validation';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { ProjectStatus } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, UserPlus, Pencil, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const PROJECT_STATUSES: ProjectStatus[] = ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold'];

const Projects = () => {
  const { user } = useAuth();
  const { projects, addProject, deleteProject, updateProjectStatus, addProjectNote, assignDeveloper, renameProject, setProjectDeadline, developers } = useCRM();
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', clientName: '', clientEmail: '', clientPhone: '' });
  const [renameOpen, setRenameOpen] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  if (!user) return null;

  const isTechLead = user.role === 'tech_lead';

  const handleAddNote = (projectId: string) => {
    if (!noteText.trim()) return;
    addProjectNote(projectId, { content: noteText, createdBy: user.id });
    setNoteText('');
    setNoteOpen(null);
    toast.success('Note added');
  };

  const handleAddProject = () => {
    if (!newProject.name.trim() || !newProject.clientName.trim() || !newProject.clientEmail.trim()) {
      toast.error('Please fill in project name, client name and email');
      return;
    }
    if (!isValidEmail(newProject.clientEmail)) { toast.error('Please enter a valid client email'); return; }
    if (newProject.clientPhone && !isValidPhone(newProject.clientPhone)) { toast.error('Please enter a valid phone number'); return; }
    addProject({
      name: newProject.name,
      clientName: newProject.clientName,
      clientEmail: newProject.clientEmail,
      clientPhone: newProject.clientPhone,
      status: 'Planning',
      assignedTo: user.id,
    });
    setNewProject({ name: '', clientName: '', clientEmail: '', clientPhone: '' });
    setAddOpen(false);
    toast.success('Project created');
  };

  const handleRename = (projectId: string) => {
    if (!renameText.trim()) return;
    renameProject(projectId, renameText);
    setRenameOpen(null);
    setRenameText('');
    toast.success('Project renamed');
  };

  const handleDeadline = (projectId: string, date: Date | undefined) => {
    if (!date) return;
    setProjectDeadline(projectId, date.toISOString());
    toast.success('Deadline set');
  };

  const handleDelete = (projectId: string) => {
    deleteProject(projectId);
    toast.success('Project deleted');
  };

  const handleAssignDeveloper = (projectId: string, developerId: string) => {
    assignDeveloper(projectId, developerId);
    const dev = developers.find(d => d.id === developerId);
    toast.success(`Assigned to ${dev?.name}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">{projects.length} projects</p>
        </div>
        {isTechLead && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Project</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleAddProject(); }} className="space-y-3">
                <Input placeholder="Project Name *" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} />
                <Input placeholder="Client Name *" value={newProject.clientName} onChange={e => setNewProject(p => ({ ...p, clientName: e.target.value }))} />
                <Input placeholder="Client Email *" type="email" value={newProject.clientEmail} onChange={e => setNewProject(p => ({ ...p, clientEmail: e.target.value }))} />
                <Input placeholder="Client Phone" value={newProject.clientPhone} onChange={e => setNewProject(p => ({ ...p, clientPhone: sanitizePhone(e.target.value) }))} />
                <Button type="submit" className="w-full">Create Project</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {projects.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            No projects yet. {isTechLead ? 'Click "Add Project" to create one, or projects are auto-created when leads are converted.' : 'Projects are automatically created when leads are converted.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => {
            const assignedDev = developers.find(d => d.id === project.assignedDeveloper);
            return (
              <Card key={project.id} className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="truncate">{project.name}</CardTitle>
                      {isTechLead && (
                        <Dialog open={renameOpen === project.id} onOpenChange={(o) => { setRenameOpen(o ? project.id : null); if (o) setRenameText(project.name); }}>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card border-border">
                            <DialogHeader><DialogTitle>Rename Project</DialogTitle></DialogHeader>
                            <form onSubmit={(e) => { e.preventDefault(); handleRename(project.id); }} className="space-y-3">
                              <Input value={renameText} onChange={e => setRenameText(e.target.value)} placeholder="New project name" />
                              <Button type="submit">Save</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{project.clientName} · {project.clientEmail}</p>
                    {assignedDev && (
                      <p className="text-xs text-primary mt-1 flex items-center gap-1">
                        <UserPlus className="h-3 w-3" /> Developer: {assignedDev.name}
                      </p>
                    )}
                    {project.deadline && (
                      <p className="text-xs text-warning mt-1 flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" /> Deadline: {format(new Date(project.deadline), 'PPP')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isTechLead ? (
                      <Select value={project.status} onValueChange={(v) => updateProjectStatus(project.id, v as ProjectStatus)}>
                        <SelectTrigger className="w-36 bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROJECT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={project.status} />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 items-center">
                    {isTechLead && (
                      <>
                        {/* Assign Developer */}
                        <Select value={project.assignedDeveloper || ''} onValueChange={(v) => handleAssignDeveloper(project.id, v)}>
                          <SelectTrigger className="w-44 bg-secondary border-border">
                            <SelectValue placeholder="Assign Developer" />
                          </SelectTrigger>
                          <SelectContent>
                            {developers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                          </SelectContent>
                        </Select>

                        {/* Deadline Picker */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className={cn('gap-1', !project.deadline && 'text-muted-foreground')}>
                              <CalendarIcon className="h-3.5 w-3.5" />
                              {project.deadline ? format(new Date(project.deadline), 'PP') : 'Set Deadline'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={project.deadline ? new Date(project.deadline) : undefined}
                              onSelect={(d) => handleDeadline(project.id, d)}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </>
                    )}

                    {/* Notes */}
                    <Dialog open={noteOpen === project.id} onOpenChange={(o) => { setNoteOpen(o ? project.id : null); setNoteText(''); }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary">Notes ({project.notes.length})</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader><DialogTitle>Project Notes - {project.name}</DialogTitle></DialogHeader>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {project.notes.map(n => (
                            <div key={n.id} className="bg-secondary/50 rounded p-3 text-sm">
                              <p>{n.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">{n.createdAt}</p>
                            </div>
                          ))}
                        </div>
                        {isTechLead && (
                          <>
                            <Textarea placeholder="Add technical note..." value={noteText} onChange={e => setNoteText(e.target.value)} />
                            <Button onClick={() => handleAddNote(project.id)}>Add Note</Button>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>

                    <span className="text-xs text-muted-foreground">Created: {project.createdAt}</span>

                    {/* Delete */}
                    {isTechLead && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="ml-auto gap-1">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete "{project.name}"? This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(project.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'Planning': 'bg-info/20 text-info',
    'In Progress': 'bg-warning/20 text-warning',
    'Review': 'bg-primary/20 text-primary',
    'Completed': 'bg-success/20 text-success',
    'On Hold': 'bg-destructive/20 text-destructive',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || ''}`}>{status}</span>;
};

export default Projects;
