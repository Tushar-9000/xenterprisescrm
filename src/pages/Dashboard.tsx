import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { ROLE_LABELS } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, FolderKanban, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { leads, projects } = useCRM();

  if (!user) return null;

  const stats = getStats(user.role, user.id, leads, projects);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <p className="text-muted-foreground mt-1">{ROLE_LABELS[user.role]} Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent leads table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Company</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id} className="border-b border-border/50">
                    <td className="py-3 px-2 font-medium">{lead.name}</td>
                    <td className="py-3 px-2 text-muted-foreground">{lead.company || '—'}</td>
                    <td className="py-3 px-2">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{lead.createdAt}</td>
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
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || ''}`}>
      {status}
    </span>
  );
};

function getStats(role: string, userId: string, leads: any[], projects: any[]) {
  const myLeads = leads.filter(l => l.assignedTo === userId);
  switch (role) {
    case 'admin':
      return [
        { label: 'Total Leads', value: leads.length, icon: Phone },
        { label: 'Projects', value: projects.length, icon: FolderKanban },
        { label: 'Converted', value: leads.filter(l => l.status === 'Converted').length, icon: CheckCircle },
        { label: 'Follow-ups', value: leads.filter(l => l.status === 'Follow-up').length, icon: Clock },
      ];
    case 'sales_manager':
      return [
        { label: 'Total Leads', value: leads.length, icon: Phone },
        { label: 'Assigned', value: leads.filter(l => l.assignedTo).length, icon: Users },
        { label: 'Converted', value: leads.filter(l => l.status === 'Converted').length, icon: TrendingUp },
        { label: 'Pending Follow-ups', value: leads.filter(l => l.status === 'Follow-up').length, icon: Clock },
      ];
    case 'telecaller':
      return [
        { label: 'My Leads', value: myLeads.length, icon: Phone },
        { label: 'Contacted', value: myLeads.filter(l => l.status === 'Contacted').length, icon: CheckCircle },
        { label: 'Follow-ups', value: myLeads.filter(l => l.status === 'Follow-up').length, icon: Clock },
        { label: 'Converted', value: myLeads.filter(l => l.status === 'Converted').length, icon: TrendingUp },
      ];
    case 'tech_lead':
      return [
        { label: 'Active Projects', value: projects.filter(p => p.status === 'In Progress').length, icon: FolderKanban },
        { label: 'Planning', value: projects.filter(p => p.status === 'Planning').length, icon: Clock },
        { label: 'Completed', value: projects.filter(p => p.status === 'Completed').length, icon: CheckCircle },
        { label: 'Total Projects', value: projects.length, icon: TrendingUp },
      ];
    default:
      return [];
  }
}

export default Dashboard;
