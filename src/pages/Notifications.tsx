import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, CheckCheck } from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useCRM();

  if (!user) return null;

  const myNotifications = notifications.filter(n => n.userId === user.id).reverse();
  const hasUnread = myNotifications.some(n => !n.read);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
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
            <Card key={n.id} className={`bg-card border-border ${!n.read ? 'border-l-2 border-l-primary' : 'opacity-60'}`}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
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
