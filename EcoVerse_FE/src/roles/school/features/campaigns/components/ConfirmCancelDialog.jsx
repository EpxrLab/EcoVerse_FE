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
import { AlertCircle } from "lucide-react";

export function ConfirmCancelDialog({ isOpen, onClose, onConfirm, title }) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 text-orange-500 mb-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">Hủy chiến dịch</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-foreground/80">
            Bạn có chắc chắn muốn hủy chiến dịch <strong>{title}</strong>? 
            Trạng thái sẽ được chuyển sang <span className="text-orange-600 font-medium whitespace-nowrap">Đã hủy</span>.
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
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 shadow-md hover:shadow-lg transition-all"
          >
            Xác nhận hủy
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
