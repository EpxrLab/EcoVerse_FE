import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Clock, User, ArrowRight, StickyNote, AlertCircle, Loader2 } from "lucide-react";
import { usePartnershipCampaigns } from '../../campaigns/hooks/usePartnershipCampaigns';
import { cn } from "@/shared/lib/utils";

export function RewardStatusLogsDialog({ isOpen, onOpenChange, deliveryId, studentName }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchRewardStatusLogs } = usePartnershipCampaigns();

  useEffect(() => {
    if (isOpen && deliveryId) {
      fetchLogs();
    }
  }, [isOpen, deliveryId]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Filtering by referenceId which should be the deliveryId
      const data = await fetchRewardStatusLogs({ referenceId: deliveryId, size: 50 });
      setLogs(data?.content || []);
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
      case 'PREPARING':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/25">Chờ gửi</Badge>;
      case 'SHIPPING':
        return <Badge variant="outline" className="bg-eco-blue/10 text-eco-blue border-eco-blue/25">Đang gửi</Badge>;
      case 'ARRIVED':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/25">Đã đến trường</Badge>;
      case 'DELIVERED':
        return <Badge variant="outline" className="bg-eco-green/10 text-eco-green border-eco-green/25">Trường đã giao</Badge>;
      case 'CONFIRMED':
        return <Badge variant="outline" className="bg-eco-green/20 text-eco-green border-eco-green/40">Đã nhận</Badge>;
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
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-eco-blue to-eco-blue/80 p-6 text-white">
          <DialogTitle className="flex items-center gap-3 text-2xl font-extrabold">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            Lịch sử vận chuyển
            {studentName && <span className="text-white/80 text-sm font-normal ml-auto">HS: {studentName}</span>}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-eco-blue" />
              <p className="text-muted-foreground font-medium animate-pulse">Đang tải lịch sử...</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-6 relative py-2">
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
                    "p-5 rounded-2xl border-2 transition-all duration-200",
                    index === 0 ? "bg-eco-blue/5 border-eco-blue/20 shadow-sm" : "bg-card border-muted/50"
                  )}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.fromStatus)}
                        {log.fromStatus && log.toStatus && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                        {getStatusBadge(log.toStatus)}
                      </div>
                      <span className="text-xs text-muted-foreground font-bold ml-auto flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(log.transitionAt || log.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground leading-none">{log.actorName}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                          {log.actorRole === 'SCHOOL_ADMIN' || log.actorRole === 'PARTNERSHIP_SCHOOL' ? 'Nhà trường' : 
                           log.actorRole === 'STUDENT' ? 'Học sinh' : 
                           log.actorRole === 'PARTNERSHIP' ? 'Đối tác' : log.actorRole}
                        </span>
                      </div>
                    </div>

                    {(log.reason || log.notes) && (
                      <div className="mt-4 p-3 bg-eco-orange/5 rounded-xl border border-eco-orange/10 flex gap-3">
                        <StickyNote className="w-4 h-4 text-eco-orange shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-bold text-eco-orange mb-0.5">Ghi chú:</p>
                          <p className="text-muted-foreground font-medium">{log.reason || log.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Chưa có lịch sử thay đổi</h3>
              <p className="text-sm text-muted-foreground max-w-[250px]">Các thay đổi về trạng thái vận chuyển sẽ được lưu lại tại đây</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
