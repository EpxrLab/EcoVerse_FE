import { useState, useEffect, useCallback } from 'react';
import { Bell, Gift, Users, Info, Check, Trash2, FileQuestion, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import { notificationService } from '@/shared/services';
import { NotificationDetailDialog } from './NotificationDetailDialog';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'reward':
    case 'REWARD':
      return <Gift className="w-4 h-4 text-eco-orange" />;
    case 'student':
    case 'STUDENT':
      return <Users className="w-4 h-4 text-eco-blue" />;
    case 'quiz':
    case 'QUIZ':
      return <FileQuestion className="w-4 h-4 text-eco-green" />;
    case 'CAMPAIGN_INVITE':
      return <Users className="w-4 h-4 text-eco-blue" />;
    case 'system':
    case 'SYSTEM':
      return <Info className="w-4 h-4 text-muted-foreground" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
};

const getNotificationBg = (type) => {
  switch (type) {
    case 'reward':
    case 'REWARD':
      return 'bg-eco-orange/10';
    case 'student':
    case 'STUDENT':
    case 'CAMPAIGN_INVITE':
      return 'bg-eco-blue/10';
    case 'quiz':
    case 'QUIZ':
      return 'bg-eco-green/10';
    case 'system':
    case 'SYSTEM':
      return 'bg-muted';
    default:
      return 'bg-muted';
  }
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notiRes, countRes] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount()
      ]);
      
      const data = notiRes.data?.data;
      const notiData = data?.content && Array.isArray(data.content)
        ? data.content
        : (Array.isArray(data) ? data : (Array.isArray(notiRes.data) ? notiRes.data : []));
      
      setNotifications(notiData);
      
      const unreadData = countRes.data?.data?.unreadCount !== undefined
        ? countRes.data.data.unreadCount
        : (countRes.data?.data !== undefined ? countRes.data.data : (typeof countRes.data === 'number' ? countRes.data : 0));
        
      setUnreadCount(unreadData);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const ws = notificationService.connectWebSocket((notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      if (ws) ws.deactivate();
    };
  }, [fetchNotifications]);

  const handleNotificationClick = (notification) => {
    setSelectedNotificationId(notification.id);
    setIsDetailOpen(true);
    if (notification.status === 'UNREAD') {
      markAsRead(notification.id);
    }
  };

  const markAsRead = async (id) => {
    try {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, status: 'READ' } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
      setUnreadCount(0);
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      fetchNotifications();
    }
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-10 w-10 rounded-xl hover:bg-muted/60"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl border-2 border-border">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <h3 className="font-bold text-foreground">Thông báo</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary hover:text-primary/80 h-7"
              onClick={markAllAsRead}
            >
              <Check className="w-3 h-3 mr-1" />
              Đọc tất cả
            </Button>
          )}
        </div>

        <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Đang tải...</p>
            </div>
          ) : (!Array.isArray(notifications) || notifications.length === 0) ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Không có thông báo mới</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                    notification.status === 'UNREAD' && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      getNotificationBg(notification.notificationType || notification.type)
                    )}>
                      {getNotificationIcon(notification.notificationType || notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm font-semibold line-clamp-1",
                          notification.status === 'UNREAD' ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {notification.title}
                        </p>
                        {notification.status === 'UNREAD' && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1 font-medium">
                        {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi }) : notification.time}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

      </DropdownMenuContent>

      <NotificationDetailDialog 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        notificationId={selectedNotificationId} 
      />
    </DropdownMenu>
  );
}
