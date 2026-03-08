import { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, Code2 } from 'lucide-react';
import { toast } from 'sonner';

const DeveloperManagement = () => {
  const { developers, addDeveloper, removeDeveloper, updateDeveloper, projects, assignDeveloper } = useCRM();
  const [newDevName, setNewDevName] = useState('');
  const [addDevOpen, setAddDevOpen] = useState(false);
  const [editDevId, setEditDevId] = useState<string | null>(null);
  const [editDevName, setEditDevName] = useState('');
  const [reassignOpen, setReassignOpen] = useState<string | null>(null);

  const handleAddDev = () => {
    if (!newDevName.trim()) return;
    addDeveloper(newDevName.trim());
    setNewDevName('');
    setAddDevOpen(false);
    toast.success('Developer added');
  };

  const handleEditDev = () => {
    if (!editDevId || !editDevName.trim()) return;
    updateDeveloper(editDevId, editDevName.trim());
    setEditDevId(null);
    setEditDevName('');
    toast.success('Developer updated');
  };

  const handleRemoveDev = (id: string) => {
    removeDeveloper(id);
    toast.success('Developer removed');
  };

  const handleReassign = (projectId: string, devId: string) => {
    assignDeveloper(projectId, devId);
    setReassignOpen(null);
    toast.success('Project reassigned');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Developer Management</h1>
          <p className="text-muted-foreground mt-1">{developers.length} developers</p>
        </div>
        <Dialog open={addDevOpen} onOpenChange={setAddDevOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1"><Plus className="h-4 w-4" /> Add Developer</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Add Developer</DialogTitle></DialogHeader>
            <Input placeholder="Developer Name" value={newDevName} onChange={e => setNewDevName(e.target.value)} />
            <Button onClick={handleAddDev}>Add</Button>
          </DialogContent>
        </Dialog>
      </div>

      {developers.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center text-muted-foreground">No developers added yet</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {developers.map(dev => {
            const devProjects = projects.filter(p => p.assignedDeveloper === dev.id);
            return (
              <Card key={dev.id} className="bg-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {dev.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{dev.name}</p>
                      <p className="text-xs text-muted-foreground">{devProjects.length} project{devProjects.length !== 1 ? 's' : ''} assigned</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Dialog open={editDevId === dev.id} onOpenChange={(o) => { setEditDevId(o ? dev.id : null); if (o) setEditDevName(dev.name); }}>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border">
                          <DialogHeader><DialogTitle>Edit Developer</DialogTitle></DialogHeader>
                          <Input value={editDevName} onChange={e => setEditDevName(e.target.value)} />
                          <Button onClick={handleEditDev}>Save</Button>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Developer</AlertDialogTitle>
                            <AlertDialogDescription>Remove {dev.name}? They will be unassigned from all projects.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveDev(dev.id)}>Remove</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {devProjects.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {devProjects.map(p => (
                        <div key={p.id} className="flex items-center justify-between text-sm bg-secondary/20 rounded-md px-3 py-2">
                          <span>{p.name}</span>
                          <Dialog open={reassignOpen === p.id} onOpenChange={(o) => setReassignOpen(o ? p.id : null)}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-6 text-xs"><Pencil className="h-3 w-3 mr-1" />Reassign</Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-border">
                              <DialogHeader><DialogTitle>Reassign "{p.name}"</DialogTitle></DialogHeader>
                              <Select onValueChange={(v) => handleReassign(p.id, v)}>
                                <SelectTrigger className="bg-secondary border-border">
                                  <SelectValue placeholder="Select developer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {developers.filter(d => d.id !== dev.id).map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeveloperManagement;
