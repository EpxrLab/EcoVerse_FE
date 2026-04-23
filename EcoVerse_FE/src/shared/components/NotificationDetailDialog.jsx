import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Loader2, Bell, Gift, Users, Info, FileQuestion, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { notificationService } from '@/shared/services';
import { cn } from '@/shared/lib/utils';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'reward':
    case 'REWARD':
      return <Gift className="w-5 h-5 text-eco-orange" />;
    case 'student':
    case 'STUDENT':
    case 'CAMPAIGN_INVITE':
      return <Users className="w-5 h-5 text-eco-blue" />;
    case 'quiz':
    case 'QUIZ':
      return <FileQuestion className="w-5 h-5 text-eco-green" />;
    case 'system':
    case 'SYSTEM':
      return <Info className="w-5 h-5 text-muted-foreground" />;
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />;
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

export function NotificationDetailDialog({ isOpen, onClose, notificationId }) {
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && notificationId) {
      fetchDetail();
    } else {
      setNotification(null);
      setError(null);
    }
  }, [isOpen, notificationId]);

  const fetchDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await notificationService.getNotificationById(notificationId);
      setNotification(response.data?.data || response.data);
    } catch (err) {
      console.error('Failed to fetch notification detail:', err);
      setError('Không thể tải chi tiết thông báo. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-2 border-border">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              notification ? getNotificationBg(notification.notificationType || notification.type) : "bg-muted"
            )}>
              {notification ? getNotificationIcon(notification.notificationType || notification.type) : <Bell className="w-5 h-5 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-bold truncate">
                {isLoading ? "Đang tải..." : (notification?.title || "Chi tiết thông báo")}
              </DialogTitle>
              {notification?.createdAt && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(notification.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
              <p className="text-sm font-medium">Đang lấy thông tin chi tiết...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-6 h-6" />
              </div>
              <p className="text-sm text-destructive font-medium mb-4">{error}</p>
              <Button variant="outline" onClick={fetchDetail}>Thử lại</Button>
            </div>
          ) : notification ? (
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {notification.message || notification.content}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Không tìm thấy nội dung thông báo</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
