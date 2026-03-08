import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { ProjectStatus, MOCK_DEVELOPERS } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, UserPlus } from 'lucide-react';

const PROJECT_STATUSES: ProjectStatus[] = ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold'];

const Projects = () => {
  const { user } = useAuth();
  const { projects, addProject, deleteProject, updateProjectStatus, addProjectNote, assignDeveloper } = useCRM();
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newProject, setNewProject] = useState({ clientName: '', clientEmail: '', clientPhone: '' });

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
    if (!newProject.clientName.trim() || !newProject.clientEmail.trim()) {
      toast.error('Please fill in client name and email');
      return;
    }
    addProject({
      clientName: newProject.clientName,
      clientEmail: newProject.clientEmail,
      clientPhone: newProject.clientPhone,
      status: 'Planning',
      assignedTo: user.id,
    });
    setNewProject({ clientName: '', clientEmail: '', clientPhone: '' });
    setAddOpen(false);
    toast.success('Project created');
  };

  const handleDelete = (projectId: string) => {
    deleteProject(projectId);
    toast.success('Project deleted');
  };

  const handleAssignDeveloper = (projectId: string, developerId: string) => {
    assignDeveloper(projectId, developerId);
    const dev = MOCK_DEVELOPERS.find(d => d.id === developerId);
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
              <div className="space-y-3">
                <Input placeholder="Client Name *" value={newProject.clientName} onChange={e => setNewProject(p => ({ ...p, clientName: e.target.value }))} />
                <Input placeholder="Client Email *" type="email" value={newProject.clientEmail} onChange={e => setNewProject(p => ({ ...p, clientEmail: e.target.value }))} />
                <Input placeholder="Client Phone" value={newProject.clientPhone} onChange={e => setNewProject(p => ({ ...p, clientPhone: e.target.value }))} />
                <Button onClick={handleAddProject} className="w-full">Create Project</Button>
              </div>
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
            const assignedDev = MOCK_DEVELOPERS.find(d => d.id === project.assignedDeveloper);
            return (
              <Card key={project.id} className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="truncate">{project.clientName}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{project.clientEmail} · {project.clientPhone}</p>
                    {assignedDev && (
                      <p className="text-xs text-primary mt-1 flex items-center gap-1">
                        <UserPlus className="h-3 w-3" /> Developer: {assignedDev.name}
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
                    {/* Assign Developer */}
                    {isTechLead && (
                      <Select value={project.assignedDeveloper || ''} onValueChange={(v) => handleAssignDeveloper(project.id, v)}>
                        <SelectTrigger className="w-44 bg-secondary border-border">
                          <SelectValue placeholder="Assign Developer" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_DEVELOPERS.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Notes */}
                    <Dialog open={noteOpen === project.id} onOpenChange={(o) => { setNoteOpen(o ? project.id : null); setNoteText(''); }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary">Notes ({project.notes.length})</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader><DialogTitle>Project Notes - {project.clientName}</DialogTitle></DialogHeader>
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
                            <AlertDialogDescription>Are you sure you want to delete "{project.clientName}"? This cannot be undone.</AlertDialogDescription>
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
