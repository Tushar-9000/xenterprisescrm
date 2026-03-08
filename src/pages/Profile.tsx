import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { ROLE_LABELS, User } from '@/types/crm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserCircle, Camera, Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Profile = () => {
  const { user: currentUser } = useAuth();
  const { users, updateUser } = useCRM();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const viewUserId = searchParams.get('userId');
  const isAdmin = currentUser?.role === 'admin';
  const targetUserId = isAdmin && viewUserId ? viewUserId : currentUser?.id;
  const targetUser = users.find(u => u.id === targetUserId);

  const isViewingOther = isAdmin && viewUserId && viewUserId !== currentUser?.id;
  const canEditAll = isAdmin;

  const [form, setForm] = useState({
    name: targetUser?.name || '',
    username: targetUser?.username || '',
    email: targetUser?.email || '',
    phone: targetUser?.phone || '',
    dob: targetUser?.dob || '',
    address: targetUser?.address || '',
    role: targetUser?.role || 'telecaller',
    profilePic: targetUser?.profilePic || '',
  });

  if (!currentUser || !targetUser) return null;

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setForm(prev => ({ ...prev, profilePic: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updates: Partial<User> = {};

    if (canEditAll) {
      updates.name = form.name;
      updates.username = form.username;
      updates.email = form.email;
      updates.phone = form.phone;
      updates.dob = form.dob;
      updates.address = form.address;
      updates.role = form.role as User['role'];
      updates.profilePic = form.profilePic;
    } else {
      updates.username = form.username;
      updates.profilePic = form.profilePic;
    }

    updateUser(targetUser.id, updates);
    toast.success('Profile updated successfully');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {isViewingOther && (
        <button onClick={() => navigate('/users')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to User Management
        </button>
      )}

      <h1 className="text-2xl font-bold text-foreground mb-6">
        {isViewingOther ? `${targetUser.name}'s Profile` : 'My Profile'}
      </h1>

      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {form.profilePic ? (
              <img src={form.profilePic} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 border-border" />
            ) : (
              <UserCircle className="h-24 w-24 text-muted-foreground" />
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
          <p className="text-xs text-muted-foreground">Click to change photo</p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              disabled={!canEditAll}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Username</label>
            <Input
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              placeholder="Set a username"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              disabled={!canEditAll}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Contact No.</label>
            <Input
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              disabled={!canEditAll}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Date of Birth</label>
            <Input
              type="date"
              value={form.dob}
              onChange={e => setForm(p => ({ ...p, dob: e.target.value }))}
              disabled={!canEditAll}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Role</label>
            {canEditAll ? (
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Super Admin</SelectItem>
                  <SelectItem value="tech_lead">Tech Lead</SelectItem>
                  <SelectItem value="sales_manager">Sales Manager</SelectItem>
                  <SelectItem value="telecaller">Telecaller</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input value={ROLE_LABELS[targetUser.role]} disabled className="mt-1" />
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-foreground">Address</label>
            <Input
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              disabled={!canEditAll}
              placeholder="Full address"
              className="mt-1"
            />
          </div>
        </div>

        {!canEditAll && (
          <p className="text-xs text-muted-foreground text-center">
            Only username and profile picture can be changed. Contact your admin to update other details.
          </p>
        )}

        <Button onClick={handleSave} className="w-full">
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Profile;
