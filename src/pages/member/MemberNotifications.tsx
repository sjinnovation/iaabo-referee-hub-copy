import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { MemberSidebar } from "@/components/MemberSidebar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { mockNotifications } from "@/data/mockNotifications";
import { Bell, Check, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MemberNotifications = () => {
  const [notificationList, setNotificationList] = useState(mockNotifications.getMockNotificationsForUser('user-1', 'member'));

  const handleMarkAsRead = (id: string) => {
    setNotificationList(notificationList.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
    toast({
      title: "Marked as read",
      description: "Notification marked as read",
    });
  };

  const handleMarkAllAsRead = () => {
    setNotificationList(notificationList.map(n => ({ ...n, isRead: true })));
    toast({
      title: "All marked as read",
      description: "All notifications marked as read",
    });
  };

  const handleDelete = (id: string) => {
    setNotificationList(notificationList.filter(n => n.id !== id));
    toast({
      title: "Notification deleted",
      description: "Notification has been removed",
    });
  };

  const unreadCount = notificationList.filter(n => !n.isRead).length;

  return (
    <DashboardLayout sidebar={<MemberSidebar />}>
      <div className="space-y-6">
        <PageHeader
          title="Notifications"
          subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
          actions={
            <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              <Check className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
          }
        />

        <div className="space-y-3">
          {notificationList.map((notification) => (
            <Card key={notification.id} className={notification.isRead ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.isRead ? "bg-muted" : "bg-primary/10"
                    }`}>
                      <Bell className={`w-5 h-5 ${notification.isRead ? "text-muted-foreground" : "text-primary"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        {!notification.isRead && <Badge variant="default">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.isRead && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberNotifications;
