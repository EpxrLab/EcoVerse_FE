import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { DialogFooter } from '@/shared/components/ui/dialog';

export function ClassForm({
  mode,
  formData,
  onFormChange,
  onSubmit,
  onCancel,
}) {
  const isValid = formData.name.trim().length > 0;

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Tên lớp <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="VD: 1A"
            value={formData.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Khối lớp</Label>
          <Select
            value={formData.grade.toString()}
            onValueChange={(v) => onFormChange({ grade: parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <SelectItem key={g} value={g.toString()}>
                  Khối {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Giáo viên chủ nhiệm</Label>
        <Input
          placeholder="VD: Cô Mai"
          value={formData.teacher_name}
          onChange={(e) => onFormChange({ teacher_name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Mô tả (Tùy chọn)</Label>
        <Input
          placeholder="Mô tả lớp học"
          value={formData.description}
          onChange={(e) => onFormChange({ description: e.target.value })}
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          className={mode === 'create' ? 'bg-eco-green hover:bg-eco-green/90' : 'bg-eco-blue hover:bg-eco-blue/90'}
          onClick={onSubmit}
          disabled={!isValid}
        >
          {mode === 'create' ? 'Tạo lớp' : 'Lưu thay đổi'}
        </Button>
      </DialogFooter>
    </div>
  );
}