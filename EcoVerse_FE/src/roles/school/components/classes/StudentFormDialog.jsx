import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { 
  UserPlus, 
  Edit,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Hash,
  Lock,
} from "lucide-react";

export function StudentFormDialog({ 
  isOpen, 
  onClose, 
  isEditing, 
  form, 
  onFormChange, 
  onSubmit 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isEditing ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-eco-blue/10 flex items-center justify-center">
                  <Edit className="w-5 h-5 text-eco-blue" />
                </div>
                <span>Chỉnh sửa thông tin học sinh</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-eco-green/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-eco-green" />
                </div>
                <span>Thêm học sinh mới</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="w-4 h-4 text-eco-green" />
              Thông tin cơ bản
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Họ và tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Nhập họ và tên học sinh"
                  value={form.student_name}
                  onChange={(e) => onFormChange({ ...form, student_name: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  Mã học sinh
                </Label>
                <Input
                  placeholder="VD: HS001"
                  value={form.student_code}
                  onChange={(e) => onFormChange({ ...form, student_code: e.target.value })}
                  className="bg-background font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  Mật khẩu học sinh
                </Label>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu đăng nhập"
                  value={form.student_password}
                  onChange={(e) => onFormChange({ ...form, student_password: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  Ngày sinh
                </Label>
                <Input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => onFormChange({ ...form, date_of_birth: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Giới tính
                </Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => onFormChange({ ...form, gender: v })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isEditing && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => onFormChange({ ...form, status: v })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang học</SelectItem>
                      <SelectItem value="inactive">Tạm nghỉ</SelectItem>
                      <SelectItem value="transferred">Đã chuyển</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Parent Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Phone className="w-4 h-4 text-eco-blue" />
              Thông tin phụ huynh
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Tên phụ huynh
                </Label>
                <Input
                  placeholder="Họ và tên phụ huynh"
                  value={form.parent_name}
                  onChange={(e) => onFormChange({ ...form, parent_name: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  Số điện thoại
                </Label>
                <Input
                  placeholder="0912345678"
                  value={form.parent_phone}
                  onChange={(e) => onFormChange({ ...form, parent_phone: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  Email phụ huynh
                </Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={form.parent_email}
                  onChange={(e) => onFormChange({ ...form, parent_email: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  Mật khẩu phụ huynh
                </Label>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu đăng nhập"
                  value={form.parent_password}
                  onChange={(e) => onFormChange({ ...form, parent_password: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="w-4 h-4 text-eco-orange" />
              Thông tin bổ sung
            </div>
            <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  Địa chỉ
                </Label>
                <Input
                  placeholder="Địa chỉ nhà"
                  value={form.address}
                  onChange={(e) => onFormChange({ ...form, address: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Ghi chú
                </Label>
                <Textarea
                  placeholder="Ghi chú thêm về học sinh (sức khỏe, sở thích, điểm mạnh...)"
                  value={form.notes}
                  onChange={(e) => onFormChange({ ...form, notes: e.target.value })}
                  className="bg-background resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            className={isEditing ? "bg-eco-blue hover:bg-eco-blue/90" : "bg-eco-green hover:bg-eco-green/90"}
            onClick={onSubmit}
            disabled={!form.student_name.trim()}
          >
            {isEditing ? "Lưu thay đổi" : "Thêm học sinh"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}