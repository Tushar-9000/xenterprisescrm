import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { Activity, ActivityType } from '@/types/crm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  History, UserPlus, Edit, Trash2, ArrowRightLeft, FolderPlus,
  FolderMinus, FileCheck, FileX, Phone, FolderKanban, UserCircle, Search, ArrowLeft
} from 'lucide-react';

const ACTIVITY_ICONS: Partial<Record<ActivityType, React.ElementType>> = {
  lead_added: UserPlus,
  lead_updated: Edit,
  lead_deleted: Trash2,
  lead_status_changed: ArrowRightLeft,
  lead_assigned: Phone,
  lead_note_added: Edit,
  project_added: FolderKanban,
  project_deleted: Trash2,
  project_status_changed: ArrowRightLeft,
  project_renamed: Edit,
  project_deadline_set: FileCheck,
  developer_assigned: UserCircle,
  developer_added: UserPlus,
  developer_removed: Trash2,
  user_added: UserPlus,
  user_removed: Trash2,
  folder_added: FolderPlus,
  folder_deleted: FolderMinus,
  project_request_created: FileCheck,
  project_request_approved: FileCheck,
  project_request_rejected: FileX,
};

const ROLE_ACTIVITY_TYPES: Record<string, ActivityType[]> = {
  admin: [],
  sales_manager: [
    'lead_added', 'lead_updated', 'lead_deleted', 'lead_status_changed',
    'lead_assigned', 'lead_note_added', 'folder_added', 'folder_deleted',
    'project_request_created',
  ],
  telecaller: [
    'lead_status_changed', 'lead_note_added', 'lead_assigned',
    'project_request_created',
  ],
  tech_lead: [
    'project_added', 'project_deleted', 'project_status_changed',
    'project_renamed', 'project_deadline_set', 'developer_assigned',
    'developer_added', 'developer_removed',
    'project_request_approved', 'project_request_rejected',
  ],
};

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function filterActivities(activities: Activity[], role: string, userId: string): Activity[] {
  if (role === 'admin') return activities;
  const allowedTypes = ROLE_ACTIVITY_TYPES[role] || [];
  return activities.filter(a =>
    allowedTypes.includes(a.type) || a.userId === userId
  );
}

const ActivityHistory = () => {
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const { activities } = useCRM();
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!user) return [];
    const roleFiltered = filterActivities(activities, user.role, user.id);
    if (!search.trim()) return roleFiltered;
    const q = search.toLowerCase();
    return roleFiltered.filter(a =>
      a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    );
  }, [activities, user, search]);

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Activity History</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} activities</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">No activity yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type] || History;
            return (
              <Card key={activity.id} className="bg-card border-border">
                <CardContent className="py-3 px-4 flex gap-4 items-start">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-1">{formatTimeAgo(activity.createdAt)}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;
