import { useState } from 'react';
import { isValidEmail, isValidPhone, sanitizePhone } from '@/lib/validation';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS, UserRole } from '@/types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserCircle, Plus, Trash2, Pencil, Mail, Phone, Calendar, ExternalLink, ArrowLeft, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

const UserManagement = () => {
  const navigate = useNavigate();
  const { users, addUser, removeUser, updateUser } = useCRM();
  const { updatePassword, passwords } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'telecaller' as UserRole, joiningDate: '', username: '' });
  const [editData, setEditData] = useState({ name: '', email: '', phone: '', password: '', role: 'telecaller' as UserRole, joiningDate: '', username: '' });

  const handleAdd = () => {
    if (!newUser.name.trim()) { toast.error('Full name is required'); return; }
    if (!newUser.email.trim()) { toast.error('Email is required'); return; }
    if (!isValidEmail(newUser.email)) { toast.error('Please enter a valid email'); return; }
    if (!newUser.password.trim() || newUser.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newUser.phone && !isValidPhone(newUser.phone)) { toast.error('Please enter a valid phone number'); return; }

    const userData = {
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      phone: newUser.phone.trim(),
      username: newUser.username.trim() || undefined,
      password: newUser.password,
      role: newUser.role,
      joiningDate: newUser.joiningDate || new Date().toISOString().split('T')[0],
    };
    addUser(userData);
    // Also register the password in auth context
    const addedUser = users[users.length]; // will be set after re-render
    setNewUser({ name: '', email: '', phone: '', password: '', role: 'telecaller', joiningDate: '', username: '' });
    setShowAddPassword(false);
    setAddOpen(false);
    toast.success('User added successfully');
  };

  const handleEdit = () => {
    if (!editUserId) return;
    if (!editData.name.trim()) { toast.error('Full name is required'); return; }
    if (!isValidEmail(editData.email)) { toast.error('Please enter a valid email'); return; }
    if (editData.phone && !isValidPhone(editData.phone)) { toast.error('Please enter a valid phone number'); return; }
    if (editData.password && editData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    updateUser(editUserId, {
      name: editData.name.trim(),
      email: editData.email.trim(),
      phone: editData.phone.trim(),
      username: editData.username.trim() || undefined,
      role: editData.role,
      joiningDate: editData.joiningDate,
    });
    if (editData.password) {
      updatePassword(editUserId, editData.password);
    }
    setEditUserId(null);
    setShowEditPassword(false);
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
        <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setShowAddPassword(false); }}>
          <DialogTrigger asChild>
            <Button className="gap-1"><Plus className="h-4 w-4" /> Add User</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. John Doe" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Username</Label>
                <Input placeholder="e.g. johndoe" value={newUser.username} onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Email Address <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. john@company.com" type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Password <span className="text-destructive">*</span></Label>
                <div className="relative mt-1">
                  <Input
                    type={showAddPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={newUser.password}
                    onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowAddPassword(!showAddPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showAddPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone Number</Label>
                <Input placeholder="e.g. +91 9000000000" value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: sanitizePhone(e.target.value) }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Role <span className="text-destructive">*</span></Label>
                <Select value={newUser.role} onValueChange={(v) => setNewUser(p => ({ ...p, role: v as UserRole }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                      <SelectItem key={r} value={r}>
                        <span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5" /> {ROLE_LABELS[r]}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Joining Date</Label>
                <Input type="date" value={newUser.joiningDate} onChange={e => setNewUser(p => ({ ...p, joiningDate: e.target.value }))} className="mt-1" />
              </div>
              <Button type="submit" className="w-full">Add User</Button>
            </form>
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
                        if (o) {
                          setEditData({ name: user.name, email: user.email, phone: user.phone || '', role: user.role, joiningDate: user.joiningDate || '', password: '', username: user.username || '' });
                          setShowEditPassword(false);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border max-w-md">
                          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
                          <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></Label>
                              <Input placeholder="Full Name" value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} className="mt-1" />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Username</Label>
                              <Input placeholder="Username" value={editData.username} onChange={e => setEditData(p => ({ ...p, username: e.target.value }))} className="mt-1" />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Email Address</Label>
                              <Input placeholder="Email" type="email" value={editData.email} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))} className="mt-1" />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">New Password <span className="text-muted-foreground text-xs">(leave blank to keep current)</span></Label>
                              <div className="relative mt-1">
                                <Input
                                  type={showEditPassword ? 'text' : 'password'}
                                  placeholder="Enter new password"
                                  value={editData.password}
                                  onChange={e => setEditData(p => ({ ...p, password: e.target.value }))}
                                  className="pr-10"
                                />
                                <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                  {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Phone Number</Label>
                              <Input placeholder="Phone" value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: sanitizePhone(e.target.value) }))} className="mt-1" />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Role</Label>
                              <Select value={editData.role} onValueChange={(v) => setEditData(p => ({ ...p, role: v as UserRole }))}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                                    <SelectItem key={r} value={r}>
                                      <span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5" /> {ROLE_LABELS[r]}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Joining Date</Label>
                              <Input type="date" value={editData.joiningDate} onChange={e => setEditData(p => ({ ...p, joiningDate: e.target.value }))} className="mt-1" />
                            </div>
                            <Button type="submit" className="w-full">Save Changes</Button>
                          </form>
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
                    {user.username && <p className="flex items-center gap-2"><UserCircle className="h-3.5 w-3.5" />@{user.username}</p>}
                    <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{user.email}</p>
                    {user.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{user.phone}</p>}
                    <p className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" />Password: ••••••••</p>
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
