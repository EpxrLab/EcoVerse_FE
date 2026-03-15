import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import {
  Mail,
  SendHorizonal,
  User,
  Users,
  Lock,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { classesService } from '@/roles/school/features/classes/services/classes.service';

function InfoRow({ label, value, mono = false, copyable = false, masked = false }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={cn('text-sm font-medium', mono && 'font-mono')}>
          {masked && !show ? '••••••' : value || '—'}
        </span>
        {masked && value && (
          <button
            onClick={() => setShow(s => !s)}
            className="p-0.5 hover:bg-muted rounded"
          >
            {show ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
        )}
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-eco-green" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

export function EmailPreviewDialog({ isOpen, onClose, onSent, parent, student }) {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!parent || !student) return null;

  const handleSend = async () => {
    if (!parent.email) {
      toast.error('Phụ huynh chưa có địa chỉ email');
      return;
    }
    setIsSending(true);
    try {
      await classesService.sendCredentials({
        student_id: student.id,
        parent_email: parent.email,
        student_name: student.student_name,
        student_username: student.student_username || student.student_code,
        student_password: student.student_password,
        parent_name: parent.name,
        parent_username: parent.username,
        parent_password: parent.password,
      });
      setIsSending(false);
      setSent(true);
      toast.success(`Đã gửi email đến ${parent.email}`);
      
      // Call onSent callback to refresh data
      if (onSent) {
        onSent();
      }
      
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 1500);
    } catch (error) {
      setIsSending(false);
      console.error('Error sending credentials:', error);
      toast.error(error?.response?.data?.message || 'Gửi email thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { setSent(false); onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eco-blue/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-eco-blue" />
            </div>
            <div>
              <p className="text-base font-bold">Gửi thông tin tài khoản</p>
              <p className="text-sm text-muted-foreground font-normal">
                Đến: {parent.email || <span className="text-destructive">Chưa có email</span>}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Email Preview */}
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Email Header */}
          <div className="px-4 py-3 bg-muted/50 border-b border-border">
            <p className="text-xs text-muted-foreground">Xem trước nội dung email</p>
          </div>

          <div className="p-4 space-y-4 bg-background text-sm">
            <p className="text-foreground">
              Kính gửi phụ huynh <strong>{parent.name}</strong>,
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Nhà trường xin gửi thông tin tài khoản đăng nhập hệ thống EcoVerse cho phụ huynh và học sinh.
              Vui lòng <strong>giữ bí mật</strong> thông tin này và đổi mật khẩu sau lần đăng nhập đầu tiên.
            </p>

            {/* Student Account */}
            <div className="rounded-xl border-2 border-eco-green/20 bg-eco-green/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-eco-green/10 border-b border-eco-green/20">
                <User className="w-4 h-4 text-eco-green" />
                <span className="font-semibold text-eco-green text-sm">Tài khoản Học sinh</span>
                <Badge variant="outline" className="ml-auto text-xs border-eco-green/40 text-eco-green">
                  {student.student_name}
                </Badge>
              </div>
              <div className="px-4 py-1">
                <InfoRow label="Tên đăng nhập" value={student.student_username || student.student_code} mono copyable />
                <InfoRow label="Mật khẩu" value={student.student_password} mono copyable masked />
              </div>
            </div>

            {/* Parent Account */}
            <div className="rounded-xl border-2 border-eco-orange/20 bg-eco-orange/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-eco-orange/10 border-b border-eco-orange/20">
                <Users className="w-4 h-4 text-eco-orange" />
                <span className="font-semibold text-eco-orange text-sm">Tài khoản Phụ huynh</span>
              </div>
              <div className="px-4 py-1">
                <InfoRow label="Tên đăng nhập" value={parent.username} mono copyable />
                <InfoRow label="Mật khẩu" value={parent.password} mono copyable masked />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ nhà trường.
              <br />Trân trọng, Ban quản lý EcoVerse.
            </p>
          </div>
        </div>

        {!parent.email && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
            <Lock className="w-4 h-4 shrink-0" />
            Phụ huynh này chưa có địa chỉ email. Hãy cập nhật để gửi được.
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Đóng
          </Button>
          <Button
            className={cn(
              'flex-1 shadow-lg',
              sent
                ? 'bg-eco-green hover:bg-eco-green/90'
                : 'bg-eco-blue hover:bg-eco-blue/90'
            )}
            onClick={handleSend}
            disabled={isSending || sent || !parent.email}
          >
            {sent ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Đã gửi!</>
            ) : isSending ? (
              <><span className="w-4 h-4 mr-2 animate-spin border-2 border-white/40 border-t-white rounded-full inline-block" /> Đang gửi...</>
            ) : (
              <><SendHorizonal className="w-4 h-4 mr-2" /> Gửi email</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
