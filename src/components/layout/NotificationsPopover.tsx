import { Link } from 'react-router-dom';
import { Bell, CheckCheck, CheckCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';

interface Props {
  isActive: boolean;
}

const NotificationsPopover = ({ isActive }: Props) => {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } = useCRM();

  if (!user) return null;

  const unread = getUnreadCount(user.id);
  const recent = [...notifications]
    .filter(n => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? 'bg-sidebar-accent text-sidebar-primary'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`}
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        >
          <div className="relative">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          Notifications
          {unread > 0 && (
            <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-80 p-0 bg-popover border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <p className="font-semibold text-sm">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unread > 0 ? `${unread} unread` : 'All caught up'}
            </p>
          </div>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => markAllNotificationsRead(user.id)}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all
            </Button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            <Bell className="h-6 w-6 mx-auto mb-2 opacity-50" />
            No notifications yet
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="divide-y divide-border">
              {recent.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 flex items-start gap-2 transition-colors hover:bg-accent/50 ${
                    !n.read ? 'bg-primary/5' : ''
                  }`}
                >
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.read && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 shrink-0"
                      onClick={() => markNotificationRead(n.id)}
                      aria-label="Mark as read"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="border-t border-border p-2">
          <Link
            to="/notifications"
            className="block w-full text-center text-xs font-medium py-2 rounded-md hover:bg-accent transition-colors"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
