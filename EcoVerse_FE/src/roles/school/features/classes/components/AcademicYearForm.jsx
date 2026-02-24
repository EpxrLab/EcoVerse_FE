import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Copy } from 'lucide-react';

export function AcademicYearForm({
  formData,
  existingYears,
  copyFromYearId,
  onFormChange,
  onCopyFromChange,
  onGenerateYearName,
  onSubmit,
}) {
  const isValid = formData.name && formData.start_date && formData.end_date;

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Tên niên khóa</Label>
        <div className="flex gap-2">
          <Input
            placeholder="VD: 2024-2025"
            value={formData.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={onGenerateYearName}>
            Tự động
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ngày bắt đầu</Label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => onFormChange({ start_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Ngày kết thúc</Label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => onFormChange({ end_date: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <Label htmlFor="is-current" className="cursor-pointer">
          Đặt làm niên khóa hiện tại
        </Label>
        <Switch
          id="is-current"
          checked={formData.is_current}
          onCheckedChange={(checked) => onFormChange({ is_current: checked })}
        />
      </div>

      {existingYears.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <Label className="flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Sao chép cấu trúc lớp từ
          </Label>
          <Select value={copyFromYearId} onValueChange={onCopyFromChange}>
            <SelectTrigger>
              <SelectValue placeholder="Không sao chép" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Không sao chép</SelectItem>
              {existingYears.map((year) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button
        className="w-full bg-eco-blue hover:bg-eco-blue/90"
        onClick={onSubmit}
        disabled={!isValid}
      >
        Tạo niên khóa
      </Button>
    </div>
  );
}