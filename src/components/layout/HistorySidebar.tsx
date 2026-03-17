import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { Activity, ActivityType } from '@/types/crm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  History, X, UserPlus, Edit, Trash2, ArrowRightLeft, FolderPlus,
  FolderMinus, FileCheck, FileX, Phone, FolderKanban, UserCircle, Search
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
  admin: [], // admin sees all
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

const HistorySidebar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { activities } = useCRM();

  if (!user) return null;

  const filtered = filterActivities(activities, user.role, user.id);

  return (
    <>
      {/* Toggle button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-4 z-40 h-9 w-9 rounded-full border-border bg-card shadow-md hover:bg-accent"
        title="Activity History"
      >
        <History className="h-4 w-4" />
      </Button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-80 bg-card border-l border-border shadow-xl transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Activity History</h2>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100%-57px)]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <History className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <div className="p-3 space-y-1">
              {filtered.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type] || History;
                return (
                  <div
                    key={activity.id}
                    className="flex gap-3 p-2.5 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-tight">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-tight truncate">{activity.description}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">{formatTimeAgo(activity.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
};

export default HistorySidebar;
