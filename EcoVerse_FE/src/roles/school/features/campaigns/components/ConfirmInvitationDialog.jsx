import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function ConfirmInvitationDialog({ isOpen, onClose, onConfirm, type, campaignName }) {
  const config = {
    accept: {
      title: 'Chấp nhận lời mời',
      description: `Bạn có chắc chắn muốn tham gia chiến dịch "${campaignName}"?`,
      confirmText: 'Chấp nhận ngay',
      confirmClass: 'bg-eco-green hover:bg-eco-green/90 text-white',
      icon: <CheckCircle2 className="w-6 h-6 text-eco-green" />,
      iconBg: 'bg-eco-green/10',
    },
    reject: {
      title: 'Từ chối lời mời',
      description: `Bạn có chắc chắn muốn từ chối lời mời tham gia "${campaignName}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xác nhận từ chối',
      confirmClass: 'bg-destructive hover:bg-destructive/90 text-white',
      icon: <XCircle className="w-6 h-6 text-destructive" />,
      iconBg: 'bg-destructive/10',
    }
  }[type] || {
    title: 'Xác nhận',
    description: 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText: 'Xác nhận',
    confirmClass: 'bg-primary',
    icon: <AlertCircle className="w-6 h-6 text-primary" />,
    iconBg: 'bg-primary/10',
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}>
              {config.icon}
            </div>
            <AlertDialogTitle className="text-xl font-bold">{config.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-foreground/80">
            {config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel 
            onClick={onClose}
            className="border-2 border-border hover:bg-muted font-semibold"
          >
            Đóng
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={`${config.confirmClass} font-bold px-6 shadow-md hover:shadow-lg transition-all`}
          >
            {config.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
