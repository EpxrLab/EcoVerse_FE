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
import { AlertTriangle } from "lucide-react";

export function ConfirmDeleteDialog({ isOpen, onClose, onConfirm, title, type = 'chiến dịch' }) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[400px] border-destructive/20">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 text-destructive mb-2">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">Xác nhận xóa</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-foreground/80">
            Bạn có chắc chắn muốn xóa {type} <strong>{title}</strong>? 
            Hành động này <span className="text-destructive font-medium">không thể hoàn tác</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel 
            onClick={onClose}
            className="border-2 border-border hover:bg-muted font-semibold"
          >
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive-dark text-white font-bold px-6 shadow-md hover:shadow-lg transition-all"
          >
            Xóa {type}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
