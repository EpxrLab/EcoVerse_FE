import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Clock, User, ArrowRight, StickyNote, AlertCircle } from "lucide-react";
import { rewardService } from '../../../services/reward.service';
import { cn } from "@/shared/lib/utils";

export function RewardStatusLogsDialog({ isOpen, onOpenChange, requestId, requestCode }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && requestId) {
      fetchLogs();
    }
  }, [isOpen, requestId]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await rewardService.getRewardRequestStatusLogs(requestId);
      setLogs(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch status logs', error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const s = status.toUpperCase();
    switch (s) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-eco-orange/10 text-eco-orange border-eco-orange/25">Chờ duyệt</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-eco-blue/10 text-eco-blue border-eco-blue/25">Đã duyệt</Badge>;
      case 'DELIVERED':
        return <Badge variant="outline" className="bg-eco-green/10 text-eco-green border-eco-green/25">Đang giao</Badge>;
      case 'CONFIRMED':
        return <Badge variant="outline" className="bg-eco-green/20 text-eco-green border-eco-green/40">Hoàn thành</Badge>;
      case 'REJECTED':
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/25">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false
    }).replace(',', '');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-eco-blue" />
            Lịch sử thay đổi trạng thái
            {requestCode && <span className="text-muted-foreground text-sm font-normal ml-2">#{requestCode}</span>}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-eco-blue border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground text-sm">Đang tải lịch sử...</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-6 py-4 relative">
              {/* Vertical Line */}
              <div className="absolute left-[17px] top-4 bottom-4 w-0.5 bg-muted-foreground/10" />

              {logs.map((log, index) => (
                <div key={log.id || index} className="relative pl-10">
                  {/* Dot */}
                  <div className={cn(
                    "absolute left-0 top-1.5 w-9 h-9 rounded-full border-4 border-background flex items-center justify-center z-10",
                    index === 0 ? "bg-eco-blue text-white shadow-lg shadow-eco-blue/20" : "bg-muted text-muted-foreground"
                  )}>
                    <Clock className="w-4 h-4" />
                  </div>

                  <div className={cn(
                    "p-4 rounded-xl border-2 transition-all duration-200",
                    index === 0 ? "bg-eco-blue/5 border-eco-blue/20 shadow-sm" : "bg-card border-muted/50"
                  )}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.fromStatus)}
                        {log.fromStatus && log.toStatus && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                        {getStatusBadge(log.toStatus)}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium ml-auto">
                        {formatDate(log.transitionAt || log.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span className="font-semibold text-foreground truncate">{log.actorName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted uppercase tracking-wider font-bold whitespace-nowrap flex-shrink-0">
                          {log.actorRole === 'SCHOOL_ADMIN' || log.actorRole === 'PARTNERSHIP_SCHOOL' ? 'Nhà trường' : 
                           log.actorRole === 'STUDENT' ? 'Học sinh' : 
                           log.actorRole === 'PARTNERSHIP' ? 'Đối tác' : log.actorRole}
                        </span>
                      </div>
                    </div>

                    {(log.reason || log.notes) && (
                      <div className="mt-3 pt-3 border-t border-dashed border-muted flex gap-2">
                        <StickyNote className="w-4 h-4 text-eco-orange shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-foreground">Ghi chú/Lý do:</p>
                          <p className="text-muted-foreground">{log.reason || log.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">Chưa có lịch sử thay đổi</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Các thay đổi trạng thái sẽ được lưu lại tại đây</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
