import { useState } from 'react';
import { isValidEmail, isValidPhone, sanitizePhone } from '@/lib/validation';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { ROLE_LABELS, UserRole } from '@/types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserCircle, Plus, Trash2, Pencil, Mail, Phone, Calendar, ExternalLink, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const UserManagement = () => {
  const navigate = useNavigate();
  const { users, addUser, removeUser, updateUser } = useCRM();
  const [addOpen, setAddOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'telecaller' as UserRole, joiningDate: '' });
  const [editData, setEditData] = useState({ name: '', email: '', phone: '', role: 'telecaller' as UserRole, joiningDate: '' });

  const handleAdd = () => {
    if (!newUser.name || !newUser.email) { toast.error('Name and email are required'); return; }
    if (!isValidEmail(newUser.email)) { toast.error('Please enter a valid email'); return; }
    if (newUser.phone && !isValidPhone(newUser.phone)) { toast.error('Please enter a valid phone number'); return; }
    addUser({ ...newUser, joiningDate: newUser.joiningDate || new Date().toISOString().split('T')[0] });
    setNewUser({ name: '', email: '', phone: '', role: 'telecaller', joiningDate: '' });
    setAddOpen(false);
    toast.success('User added');
  };

  const handleEdit = () => {
    if (!editUserId) return;
    if (!isValidEmail(editData.email)) { toast.error('Please enter a valid email'); return; }
    if (editData.phone && !isValidPhone(editData.phone)) { toast.error('Please enter a valid phone number'); return; }
    updateUser(editUserId, editData);
    setEditUserId(null);
    toast.success('User updated');
  };

  const handleRemove = (id: string) => {
    removeUser(id);
    toast.success('User removed');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">{users.length} users</p>
          </div>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1"><Plus className="h-4 w-4" /> Add User</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Full Name *" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Email *" type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
              <Input placeholder="Phone" value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: sanitizePhone(e.target.value) }))} />
              <Select value={newUser.role} onValueChange={(v) => setNewUser(p => ({ ...p, role: v as UserRole }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" placeholder="Joining Date" value={newUser.joiningDate} onChange={e => setNewUser(p => ({ ...p, joiningDate: e.target.value }))} />
              <Button onClick={handleAdd} className="w-full">Add User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {users.map(user => (
          <Card key={user.id} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{user.name}</p>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{ROLE_LABELS[user.role]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => navigate(`/profile?userId=${user.id}`)} title="View Profile">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Dialog open={editUserId === user.id} onOpenChange={(o) => {
                        setEditUserId(o ? user.id : null);
                        if (o) setEditData({ name: user.name, email: user.email, phone: user.phone || '', role: user.role, joiningDate: user.joiningDate || '' });
                      }}>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border">
                          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
                          <div className="space-y-3">
                            <Input placeholder="Full Name" value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} />
                            <Input placeholder="Email" type="email" value={editData.email} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))} />
                            <Input placeholder="Phone" value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: sanitizePhone(e.target.value) }))} />
                            <Select value={editData.role} onValueChange={(v) => setEditData(p => ({ ...p, role: v as UserRole }))}>
                              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input type="date" value={editData.joiningDate} onChange={e => setEditData(p => ({ ...p, joiningDate: e.target.value }))} />
                            <Button onClick={handleEdit} className="w-full">Save Changes</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove User</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to remove {user.name}?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemove(user.id)}>Remove</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{user.email}</p>
                    {user.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{user.phone}</p>}
                    {user.joiningDate && <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />Joined: {user.joiningDate}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
