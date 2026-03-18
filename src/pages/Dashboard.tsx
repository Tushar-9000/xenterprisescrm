import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { ROLE_LABELS, Activity } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, FolderKanban, Users, TrendingUp, Clock, CheckCircle, ArrowUpRight, ArrowDownRight, Activity as ActivityIcon, BarChart3, Target, UserCheck, PhoneCall, CalendarCheck, UserPlus, Trash2, FileText, GitBranch } from 'lucide-react';

const ACTIVITY_ICONS: Record<string, any> = {
  lead_added: UserPlus,
  lead_deleted: Trash2,
  lead_status_changed: GitBranch,
  lead_assigned: UserCheck,
  lead_note_added: FileText,
  project_added: FolderKanban,
  project_deleted: Trash2,
  project_status_changed: GitBranch,
  project_renamed: FileText,
  developer_assigned: UserCheck,
  folder_added: FolderKanban,
  folder_deleted: Trash2,
  user_added: UserPlus,
  user_removed: Trash2,
};

const ACTIVITY_COLORS: Record<string, string> = {
  lead_added: 'bg-success/20 text-success',
  lead_deleted: 'bg-destructive/20 text-destructive',
  lead_status_changed: 'bg-info/20 text-info',
  lead_assigned: 'bg-primary/20 text-primary',
  project_added: 'bg-success/20 text-success',
  project_deleted: 'bg-destructive/20 text-destructive',
  project_status_changed: 'bg-warning/20 text-warning',
  folder_added: 'bg-primary/20 text-primary',
  folder_deleted: 'bg-destructive/20 text-destructive',
};

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const AdminDashboard = ({ leads, projects, notifications, activities, users }: { leads: any[]; projects: any[]; notifications: any[]; activities: Activity[]; users: any[] }) => {
  const converted = leads.filter(l => l.status === 'Converted').length;
  const conversionRate = leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0;
  const assignedLeads = leads.filter(l => l.assignedTo).length;
  const unassigned = leads.length - assignedLeads;

  const statCards = [
    { label: 'Total Leads', value: leads.length, icon: Phone, change: '+12%', up: true },
    { label: 'Active Projects', value: projects.filter(p => p.status !== 'Completed').length, icon: FolderKanban, change: '+3', up: true },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, change: '+5%', up: true },
    { label: 'Pending Follow-ups', value: leads.filter(l => l.status === 'Follow-up').length, icon: Clock, change: '-2', up: false },
  ];

  const statusBreakdown = [
    { status: 'New', count: leads.filter(l => l.status === 'New').length, color: 'bg-info' },
    { status: 'Contacted', count: leads.filter(l => l.status === 'Contacted').length, color: 'bg-warning' },
    { status: 'Interested', count: leads.filter(l => l.status === 'Interested').length, color: 'bg-primary' },
    { status: 'Follow-up', count: leads.filter(l => l.status === 'Follow-up').length, color: 'bg-warning' },
    { status: 'Converted', count: converted, color: 'bg-success' },
    { status: 'Not Interested', count: leads.filter(l => l.status === 'Not Interested').length, color: 'bg-destructive' },
  ];


  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="bg-card border-border overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className={`text-xs font-medium flex items-center ${stat.up ? 'text-success' : 'text-destructive'}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lead Pipeline */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Lead Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusBreakdown.map(s => (
                <div key={s.status} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-28">{s.status}</span>
                  <div className="flex-1 h-7 bg-secondary/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded-full flex items-center justify-end pr-2 transition-all`}
                      style={{ width: leads.length > 0 ? `${Math.max((s.count / leads.length) * 100, 8)}%` : '8%' }}
                    >
                      <span className="text-xs font-bold text-background">{s.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Overview */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Team Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {users.filter(u => u.role !== 'admin').map(member => {
              const memberLeads = leads.filter(l => l.assignedTo === member.id);
              const memberConverted = memberLeads.filter(l => l.status === 'Converted').length;
              return (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{ROLE_LABELS[member.role]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{memberLeads.length}</p>
                    <p className="text-xs text-muted-foreground">{memberConverted} conv.</p>
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">Unassigned</span>
              <span className="font-bold text-warning">{unassigned}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><ActivityIcon className="h-4 w-4 text-primary" /> Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leads.slice(0, 5).map(lead => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.company || 'No company'}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><FolderKanban className="h-4 w-4 text-primary" /> Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No projects yet. Convert leads to create projects.</p>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 5).map(project => (
                  <div key={project.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.clientName}</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><ActivityIcon className="h-4 w-4 text-primary" /> Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activities yet. Actions across the CRM will appear here.</p>
          ) : (
            <div className="space-y-1">
              {activities.slice(0, 15).map(activity => {
                const Icon = ACTIVITY_ICONS[activity.type] || ActivityIcon;
                const colorClass = ACTIVITY_COLORS[activity.type] || 'bg-secondary text-muted-foreground';
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{formatTimeAgo(activity.createdAt)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const SalesManagerDashboard = ({ leads, users }: { leads: any[]; users: any[] }) => {
  const assigned = leads.filter(l => l.assignedTo).length;
  const converted = leads.filter(l => l.status === 'Converted').length;
  const followUps = leads.filter(l => l.status === 'Follow-up').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: leads.length, icon: Phone },
          { label: 'Assigned', value: assigned, icon: UserCheck },
          { label: 'Converted', value: converted, icon: TrendingUp },
          { label: 'Pending Follow-ups', value: followUps, icon: Clock },
        ].map((s, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-bold mt-2">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Telecaller Performance</CardTitle></CardHeader>
        <CardContent>
          {users.filter(u => u.role === 'telecaller').map(tc => {
            const tcLeads = leads.filter(l => l.assignedTo === tc.id);
            const tcConverted = tcLeads.filter(l => l.status === 'Converted').length;
            const tcFollowUp = tcLeads.filter(l => l.status === 'Follow-up').length;
            return (
              <div key={tc.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/20 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">{tc.name.charAt(0)}</div>
                <div className="flex-1">
                  <p className="font-medium">{tc.name}</p>
                  <p className="text-xs text-muted-foreground">{tcLeads.length} leads assigned</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div><p className="text-lg font-bold text-success">{tcConverted}</p><p className="text-xs text-muted-foreground">Converted</p></div>
                  <div><p className="text-lg font-bold text-warning">{tcFollowUp}</p><p className="text-xs text-muted-foreground">Follow-ups</p></div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Unassigned Leads</CardTitle></CardHeader>
        <CardContent>
          {leads.filter(l => !l.assignedTo).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">All leads are assigned</p>
          ) : (
            <div className="space-y-2">
              {leads.filter(l => !l.assignedTo).slice(0, 5).map(lead => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.company || '—'} · {lead.source || '—'}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TelecallerDashboard = ({ leads, userId }: { leads: any[]; userId: string }) => {
  const myLeads = leads.filter(l => l.assignedTo === userId);
  const contacted = myLeads.filter(l => l.status === 'Contacted').length;
  const followUps = myLeads.filter(l => l.status === 'Follow-up').length;
  const converted = myLeads.filter(l => l.status === 'Converted').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'My Leads', value: myLeads.length, icon: Phone },
          { label: 'Contacted', value: contacted, icon: PhoneCall },
          { label: 'Follow-ups Due', value: followUps, icon: CalendarCheck },
          { label: 'Converted', value: converted, icon: CheckCircle },
        ].map((s, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-bold mt-2">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Upcoming Follow-ups</CardTitle></CardHeader>
        <CardContent>
          {myLeads.filter(l => l.followUpDate).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No follow-ups scheduled</p>
          ) : (
            <div className="space-y-2">
              {myLeads.filter(l => l.followUpDate).map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.company || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-warning">{lead.followUpDate}</p>
                    <StatusBadge status={lead.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle>My Leads</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {myLeads.slice(0, 6).map(lead => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-medium">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.phone}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            ))}
            {myLeads.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No leads assigned yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TechLeadDashboard = ({ projects }: { projects: any[] }) => {
  const active = projects.filter(p => p.status === 'In Progress').length;
  const planning = projects.filter(p => p.status === 'Planning').length;
  const completed = projects.filter(p => p.status === 'Completed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: projects.length, icon: FolderKanban },
          { label: 'In Progress', value: active, icon: ActivityIcon },
          { label: 'Planning', value: planning, icon: Clock },
          { label: 'Completed', value: completed, icon: CheckCircle },
        ].map((s, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-bold mt-2">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><FolderKanban className="h-4 w-4 text-primary" /> All Projects</CardTitle></CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No projects yet. Projects are created when leads are converted.</p>
          ) : (
            <div className="space-y-2">
              {projects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.clientName} · {project.clientEmail}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
              ))}
            </div>
          )}
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
    'Planning': 'bg-info/20 text-info',
    'In Progress': 'bg-primary/20 text-primary',
    'Review': 'bg-warning/20 text-warning',
    'Completed': 'bg-success/20 text-success',
    'On Hold': 'bg-muted text-muted-foreground',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || ''}`}>
      {status}
    </span>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { leads, projects, notifications, activities, users } = useCRM();

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <p className="text-muted-foreground mt-1">{ROLE_LABELS[user.role]} Dashboard</p>
      </div>

      {user.role === 'admin' && <AdminDashboard leads={leads} projects={projects} notifications={notifications} activities={activities} users={users} />}
      {user.role === 'sales_manager' && <SalesManagerDashboard leads={leads} users={users} />}
      {user.role === 'telecaller' && <TelecallerDashboard leads={leads} userId={user.id} />}
      {user.role === 'tech_lead' && <TechLeadDashboard projects={projects} />}
    </div>
  );
};

export default Dashboard;
