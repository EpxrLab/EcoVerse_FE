import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Package, Plus, XCircle, Loader2 } from "lucide-react";
import { rewardService } from '../../../services/reward.service';

export function DeliveryFormDialog({ 
  isOpen, 
  onOpenChange, 
  deliveryForm, 
  onUpdateForm, 
  onSubmit, 
  isSubmitting 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-eco-blue flex items-center gap-2">
            <Package className="w-5 h-5" />
            Xác nhận giao quà
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Hình ảnh bằng chứng *</Label>
            <div 
              className="relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center min-h-[200px] bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer group"
              onClick={() => document.getElementById('delivery-image-input').click()}
            >
              {deliveryForm.imageUrl ? (
                <div className="relative w-full h-full aspect-video rounded-xl overflow-hidden group">
                  <img 
                    src={deliveryForm.imagePresignedUrl || deliveryForm.imageUrl} 
                    alt="Delivery proof" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateForm({ imageUrl: '', imagePresignedUrl: '' });
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Gỡ ảnh
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-eco-blue/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-eco-blue" />
                  </div>
                  <p className="mb-2 text-sm text-foreground font-medium">Click để tải ảnh lên</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG hoặc JPEG (Tối đa 5MB)</p>
                </div>
              )}
              <input 
                id="delivery-image-input"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const res = await rewardService.uploadImage(formData);
                    const data = res.data?.data || res.data;
                    const url = data?.url || (typeof data === 'string' ? data : null);
                    const presignedUrl = data?.presignedUrl || data?.imagePresignedUrl;
                    
                    if (url) {
                      onUpdateForm({ 
                        imageUrl: url, 
                        imagePresignedUrl: presignedUrl || url 
                      });
                    }
                  } catch (error) {
                    console.error('Upload failed', error);
                  }
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              * Vui lòng tải lên hình ảnh chụp lúc bàn giao phần thưởng cho học sinh.
            </p>
          </div>
          <Button 
            className="w-full bg-eco-blue hover:bg-eco-blue-dark text-primary-foreground font-bold h-11"
            disabled={!deliveryForm.imageUrl || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Xác nhận hoàn thành'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
