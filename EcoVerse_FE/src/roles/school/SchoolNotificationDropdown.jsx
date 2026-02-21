import { useState } from 'react';
import { Bell, Gift, Users, Info, Megaphone, Check, Trash2, FileQuestion } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';

const mockNotifications = [
  {
    id: '1',
    type: 'reward',
    title: 'Yêu cầu đổi thưởng mới',
    message: 'Nguyễn Văn A yêu cầu đổi "Voucher Sách 50K". Vui lòng duyệt.',
    time: '5 phút trước',
    read: false,
  },
  {
    id: '2',
    type: 'student',
    title: 'Học sinh mới',
    message: '3 học sinh mới đã được thêm vào lớp 5A.',
    time: '1 giờ trước',
    read: false,
  },
  {
    id: '3',
    type: 'quiz',
    title: 'Quiz hoàn thành',
    message: 'Quiz "Phân loại rác" đã được 25 học sinh hoàn thành.',
    time: '2 giờ trước',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Cập nhật hệ thống',
    message: 'Phiên bản mới đã được cập nhật với nhiều tính năng mới.',
    time: '1 ngày trước',
    read: true,
  },
];

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
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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

        <ScrollArea className="max-h-[350px]">
          {notifications.length === 0 ? (
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
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => markAsRead(notification.id)}
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
                        {notification.time}
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