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
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import { notificationService } from './services';

// Helpers remain for icon mapping based on notification type
const getNotificationIcon = (type) => {
  switch (type) {
    case 'reward':
      return <Gift className="w-4 h-4 text-eco-orange" />;
    case 'student':
      return <Users className="w-4 h-4 text-eco-blue" />;
    case 'quiz':
      return <FileQuestion className="w-4 h-4 text-eco-green" />;
    case 'system':
      return <Info className="w-4 h-4 text-muted-foreground" />;
  }
};

const getNotificationBg = (type) => {
  switch (type) {
    case 'reward':
      return 'bg-eco-orange/10';
    case 'student':
      return 'bg-eco-blue/10';
    case 'quiz':
      return 'bg-eco-green/10';
    case 'system':
      return 'bg-muted';
  }
};

export function SchoolNotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notiRes, countRes] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount()
      ]);
      
      const notiData = Array.isArray(notiRes.data?.data) 
        ? notiRes.data.data 
        : (Array.isArray(notiRes.data) ? notiRes.data : []);
      
      setNotifications(notiData);
      
      const unreadData = countRes.data?.data !== undefined 
        ? countRes.data.data 
        : (typeof countRes.data === 'number' ? countRes.data : 0);
        
      setUnreadCount(unreadData);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Optional: Set up interval for real-time updates
    const interval = setInterval(fetchNotifications, 60000); // every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Rollback or refetch
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);

      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      fetchNotifications();
    }
  };

  const deleteNotification = (id) => {
    // Note: The user didn't provide a delete API, so I'll keep it local or remove if it's not supported by backend.
    // For now, I'll just filter it out locally.
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

        <ScrollArea className="max-h-[350px]">
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
              {Array.isArray(notifications) && notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      getNotificationBg(notification.type)
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm font-semibold line-clamp-1",
                          !notification.read ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.read && (
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
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-border bg-muted/20">
            <Button variant="ghost" className="w-full text-sm text-muted-foreground hover:text-foreground h-9 rounded-lg">
              Xem tất cả thông báo
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}