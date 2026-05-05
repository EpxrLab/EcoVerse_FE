import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { DatePicker } from "antd";
import dayjs from "dayjs";
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
  MapPin,
  Calendar,

  AlertCircle,
} from "lucide-react";

export function StudentFormDialog({ 
  isOpen, 
  onClose, 
  isEditing, 
  form, 
  onFormChange, 
  onSubmit 
}) {
  const [errors, setErrors] = useState({});

  // Reset errors when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    
    // Required fields
    if (!form.student_name?.trim()) newErrors.student_name = "Họ tên không được để trống";
    if (!form.student_code?.trim()) newErrors.student_code = "Mã học sinh không được để trống";
    if (!form.gradeLevel) newErrors.gradeLevel = "Vui lòng chọn lớp";
    if (!form.className?.trim()) newErrors.className = "Vui lòng nhập tên lớp";
    if (!form.date_of_birth) newErrors.date_of_birth = "Vui lòng chọn ngày sinh";
    if (!form.gender) newErrors.gender = "Vui lòng chọn giới tính";
    if (!form.parent_name?.trim()) newErrors.parent_name = "Vui lòng nhập tên phụ huynh";
    if (!form.parent_phone?.trim()) {
      newErrors.parent_phone = "Vui lòng nhập số điện thoại";
    } else {
      // Phone validation: 10 digits, starts with 03/05/07/08/09
      const phoneRegex = /^0(3|5|7|8|9)\d{8}$/;
      if (!phoneRegex.test(form.parent_phone.trim())) {
        newErrors.parent_phone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03/05/07/08/09)";
      }
    }

    if (!form.parent_email?.trim()) {
      newErrors.parent_email = "Vui lòng nhập email phụ huynh";
    } else {
      // Email validation (optional but format check)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.parent_email.trim())) {
        newErrors.parent_email = "Email không đúng định dạng";
      }
    }

    if (!form.address?.trim()) newErrors.address = "Vui lòng nhập địa chỉ";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isEditing ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-eco-green/10 flex items-center justify-center">
                  <Edit className="w-5 h-5 text-eco-green" />
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
        
        {/* Scrollable Form Body */}
        <div className="flex-1 min-h-0 overflow-y-auto py-4 px-1 space-y-6 scrollbar-thin">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="w-4 h-4 text-eco-green" />
              Thông tin cơ bản
            </div>
            <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              {/* Họ và tên – span 2 */}
              <div className="col-span-4 md:col-span-2 flex flex-col justify-end gap-2">
                <Label className="font-medium">
                  Họ và tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Nhập họ và tên học sinh"
                  value={form.student_name}
                  onChange={(e) => onFormChange({ ...form, student_name: e.target.value })}
                  className={errors.student_name ? "border-destructive bg-destructive/5" : "bg-background"}
                />
                {errors.student_name && (
                  <p className="text-[11px] text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    {errors.student_name}
                  </p>
                )}
              </div>

              {/* Mã học sinh – span 2 */}
              <div className="col-span-4 md:col-span-2 flex flex-col justify-end gap-2">
                <Label className="font-medium">
                  Mã học sinh <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Nhập mã học sinh"
                  value={form.student_code}
                  onChange={(e) => onFormChange({ ...form, student_code: e.target.value })}
                  className={errors.student_code ? "border-destructive bg-destructive/5" : "bg-background"}
                />
                {errors.student_code && (
                  <p className="text-[11px] text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    {errors.student_code}
                  </p>
                )}
              </div>

              {/* Lớp – span 1 */}
              <div className="col-span-2 md:col-span-1 flex flex-col justify-end gap-2">
                <Label className="font-medium">Lớp <span className="text-destructive">*</span></Label>
                <Select
                  value={form.gradeLevel}
                  onValueChange={(v) => onFormChange({ ...form, gradeLevel: v })}
                >
                  <SelectTrigger className={errors.gradeLevel ? "border-destructive bg-destructive/5" : "bg-background"}>
                    <SelectValue placeholder="Lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(g => (
                      <SelectItem key={g} value={String(g)}>Lớp {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tên lớp – span 1 */}
              <div className="col-span-2 md:col-span-1 flex flex-col justify-end gap-2">
                <Label className="font-medium">Tên lớp <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="VD: A, B"
                  value={form.className}
                  onChange={(e) => onFormChange({ ...form, className: e.target.value })}
                  className={errors.className ? "border-destructive bg-destructive/5" : "bg-background"}
                />
              </div>

              {/* Ngày sinh – span 2 */}
              <div className="col-span-4 md:col-span-2 flex flex-col justify-end gap-2">
                <Label className="font-medium">
                  Ngày sinh <span className="text-destructive">*</span>
                </Label>
                <DatePicker
                  className={`w-full h-10 rounded-md border px-3 text-sm ${
                    errors.date_of_birth ? "border-destructive bg-destructive/5" : "border-input bg-background"
                  }`}
                  format="DD/MM/YYYY"
                  placeholder="Ngày/Tháng/Năm"
                  disabledDate={(d) => d && d.isAfter(dayjs(), 'day')}
                  value={form.date_of_birth ? dayjs(form.date_of_birth, 'YYYY-MM-DD') : null}
                  onChange={(date) => onFormChange({ ...form, date_of_birth: date ? date.format('YYYY-MM-DD') : '' })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Giới tính – span 2 */}
              <div className="col-span-4 md:col-span-2 flex flex-col justify-end gap-2">
                <Label className="font-medium">Giới tính <span className="text-destructive">*</span></Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => onFormChange({ ...form, gender: v })}
                >
                  <SelectTrigger className={errors.gender ? "border-destructive bg-destructive/5" : "bg-background"}>
                    <SelectValue placeholder="Giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(errors.gradeLevel || errors.className || errors.date_of_birth || errors.gender) && (
              <p className="text-[11px] text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                Vui lòng nhập đầy đủ các trường bắt buộc
              </p>
            )}
          </div>

          {/* Parent Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Phone className="w-4 h-4 text-eco-green" />
              Thông tin phụ huynh
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="space-y-2">
                <Label className="font-medium">Tên phụ huynh <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Họ và tên phụ huynh"
                  value={form.parent_name}
                  onChange={(e) => onFormChange({ ...form, parent_name: e.target.value })}
                  className={errors.parent_name ? "border-destructive bg-destructive/5" : "bg-background"}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Số điện thoại <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="0912345678"
                  value={form.parent_phone}
                  onChange={(e) => onFormChange({ ...form, parent_phone: e.target.value })}
                  className={errors.parent_phone ? "border-destructive bg-destructive/5" : "bg-background"}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="font-medium">Email phụ huynh <span className="text-destructive">*</span></Label>
                <Input
                  type="email"
                  placeholder="hoaparent@example.com"
                  value={form.parent_email}
                  onChange={(e) => onFormChange({ ...form, parent_email: e.target.value })}
                  className={errors.parent_email ? "border-destructive bg-destructive/5" : "bg-background"}
                />
              </div>
            </div>
            {(errors.parent_name || errors.parent_phone || errors.parent_email) && (
              <p className="text-[11px] text-destructive flex items-center gap-1 font-medium italic">
                <AlertCircle className="w-3 h-3" />
                {errors.parent_phone || errors.parent_email || "Kiểm tra lại thông tin phụ huynh"}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              Địa chỉ <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Địa chỉ nhà"
              value={form.address}
              onChange={(e) => onFormChange({ ...form, address: e.target.value })}
              className={errors.address ? "border-destructive bg-destructive/5" : "bg-background"}
            />
            {errors.address && (
              <p className="text-[11px] text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />{errors.address}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            className="bg-eco-green hover:bg-eco-green/90 text-white min-w-[120px]"
            onClick={handleSubmit}
          >
            {isEditing ? "Lưu thay đổi" : "Thêm học sinh"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
