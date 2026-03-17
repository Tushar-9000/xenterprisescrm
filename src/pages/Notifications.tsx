import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, CheckCheck, ArrowLeft } from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useCRM();
  const navigate = useNavigate();

  if (!user) return null;

  const myNotifications = notifications.filter(n => n.userId === user.id).reverse();
  const unreadCount = myNotifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              {myNotifications.length} notification{myNotifications.length !== 1 ? 's' : ''}
              {unreadCount > 0 && <span className="text-primary font-semibold"> · {unreadCount} unread</span>}
            </p>
          </div>
        </div>
        {hasUnread && (
          <Button variant="outline" size="sm" onClick={() => markAllNotificationsRead(user.id)}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>
      {myNotifications.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-3 opacity-50" />
            No notifications yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {myNotifications.map(n => (
            <Card key={n.id} className={`bg-card border-border transition-colors ${!n.read ? 'border-l-4 border-l-primary bg-primary/5' : 'opacity-60'}`}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!n.read && (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 animate-pulse" />
                  )}
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!n.read && (
                  <Button size="sm" variant="ghost" onClick={() => markNotificationRead(n.id)}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
