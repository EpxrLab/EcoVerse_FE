import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { XCircle } from "lucide-react";

export function RejectionFormDialog({ 
  isOpen, 
  onOpenChange, 
  reason, 
  onReasonChange, 
  onSubmit 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Từ chối yêu cầu
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Lý do từ chối *</Label>
            <Textarea 
              placeholder="Nhập lý do học sinh không được duyệt đổi quà này..." 
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="min-h-[100px] resize-none border-2 focus-visible:ring-destructive"
            />
            <p className="text-xs text-muted-foreground italic">
              Lý do này sẽ được hiển thị cho học sinh trong phần lịch sử đổi quà.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button 
            variant="destructive" 
            onClick={onSubmit}
            disabled={!reason.trim()}
          >
            Xác nhận từ chối
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
