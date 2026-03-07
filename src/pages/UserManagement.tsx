import { MOCK_USERS, ROLE_LABELS } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle } from 'lucide-react';

const UserManagement = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">User Management</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {MOCK_USERS.map(user => (
          <Card key={user.id} className="bg-card border-border">
            <CardContent className="py-5 flex items-center gap-4">
              <UserCircle className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <span className="text-xs text-primary">{ROLE_LABELS[user.role]}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
