import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { ProjectStatus } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const PROJECT_STATUSES: ProjectStatus[] = ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold'];

const Projects = () => {
  const { user } = useAuth();
  const { projects, updateProjectStatus, addProjectNote } = useCRM();
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  if (!user) return null;

  const isTechLead = user.role === 'tech_lead';

  const handleAddNote = (projectId: string) => {
    if (!noteText.trim()) return;
    addProjectNote(projectId, { content: noteText, createdBy: user.id });
    setNoteText('');
    setNoteOpen(null);
    toast.success('Note added');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground mt-1">{projects.length} projects from converted leads</p>
      </div>

      {projects.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            No projects yet. Projects are automatically created when leads are converted.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{project.clientName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{project.clientEmail} · {project.clientPhone}</p>
                </div>
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
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 items-center">
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
                </div>
              </CardContent>
            </Card>
          ))}
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
