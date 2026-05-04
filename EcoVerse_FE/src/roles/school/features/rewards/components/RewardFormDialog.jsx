import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/button";
import { rewardService } from "../../../services/reward.service";

export function RewardFormDialog({ 
  isOpen, 
  onOpenChange, 
  mode = 'add', 
  form, 
  onUpdateForm, 
  onResetForm, 
  onSubmit 
}) {
  const isEdit = mode === 'edit';

  const handleFileChange = async (e) => {
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if (!open) onResetForm(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật quà tặng" : "Thêm quà tặng mới"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên sản phẩm *</Label>
              <Input 
                placeholder={isEdit ? "VD: Voucher Rạp phim" : "VD: Gấu bông Eco"} 
                value={form.rewardName}
                onChange={(e) => onUpdateForm({ rewardName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Loại quà *</Label>
              <Select 
                value={form.rewardType} 
                onValueChange={(value) => onUpdateForm({ rewardType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHYSICAL">Vật lý</SelectItem>
                  <SelectItem value="VOUCHER">Voucher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Hình ảnh</Label>
            <div className="flex items-center gap-3">
              <Input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer file:cursor-pointer file:bg-eco-green/10 file:text-eco-green file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-3 file:font-semibold hover:file:bg-eco-green/20 transition-all text-xs"
              />
              {form.imageUrl && (
                <div className="shrink-0 w-10 h-10 border rounded-lg overflow-hidden relative flex items-center justify-center bg-muted/20">
                  {typeof form.imageUrl === 'string' && (form.imageUrl.startsWith('http') || form.imageUrl.startsWith('/') || form.imageUrl.startsWith('blob:') || form.imageUrl.length > 5) ? (
                      <img src={form.imagePresignedUrl || form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                      <span className="text-xl">{form.imageUrl}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea 
              placeholder="Mô tả ngắn gọn về phần thưởng..." 
              value={form.description}
              onChange={(e) => onUpdateForm({ description: e.target.value })}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Giá (Xu) *</Label>
              <Input 
                type="number" 
                min="0"
                placeholder="200" 
                value={form.coinCost !== null && form.coinCost !== undefined ? form.coinCost : ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value);
                  onUpdateForm({ coinCost: val === '' ? '' : Math.max(0, val || 0) });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Số lượng</Label>
              <Input 
                type="number" 
                min="0"
                placeholder="10" 
                value={form.stockQuantity !== null && form.stockQuantity !== undefined ? form.stockQuantity : ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value);
                  onUpdateForm({ stockQuantity: val === '' ? '' : Math.max(0, val || 0) });
                }}
                disabled={form.isUnlimited}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={isEdit ? "unlimited-edit" : "unlimited"} 
              checked={form.isUnlimited}
              onCheckedChange={(checked) => onUpdateForm({ isUnlimited: !!checked })}
            />
            <label 
              htmlFor={isEdit ? "unlimited-edit" : "unlimited"} 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Không giới hạn số lượng
            </label>
          </div>
          <div className="space-y-2">
            <Label>Điều khoản sử dụng</Label>
            <Textarea 
              placeholder="Nhập điều khoản khi sử dụng hoặc đổi quà..." 
              value={form.termsConditions}
              onChange={(e) => onUpdateForm({ termsConditions: e.target.value })}
              className="resize-none"
            />
          </div>
          <Button 
            className="w-full bg-eco-green hover:bg-eco-green-dark text-primary-foreground font-semibold"
            onClick={onSubmit}
            disabled={
              !form.rewardName || 
              !form.rewardType || 
              form.coinCost === undefined || 
              form.coinCost === null || 
              form.coinCost === '' || 
              form.coinCost < 0 ||
              (!form.isUnlimited && (form.stockQuantity === undefined || form.stockQuantity === null || form.stockQuantity === ''))
            }
          >
            {isEdit ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
