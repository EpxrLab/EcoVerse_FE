import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Calendar, Send, Users, UserPlus, Clock } from 'lucide-react';
import { StudentSelectionDialog } from './StudentSelectionDialog';
import { useStudents } from '@/roles/school/hooks';

export function CampaignForm({
  mode,
  formData,
  availableClasses,
  onFormChange,
  onClassToggle,
  onStudentSelection,
  onSubmit,
  onCancel,
  dateValidation = { errors: {}, isValid: true },
}) {
  const { students: allStudents, isLoading: isStudentsLoading } = useStudents();
  const [studentSelectionClass, setStudentSelectionClass] = useState(null);
  
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const handleOpenStudentSelection = (cls, e) => {
    e.preventDefault();
    e.stopPropagation();
    setStudentSelectionClass(cls);
  };

  const handleConfirmStudents = (selectedIds) => {
    if (studentSelectionClass && onStudentSelection) {
      const allClassStudents = allStudents.filter(s => s.class === studentSelectionClass.name);
      onStudentSelection(selectedIds, studentSelectionClass.id, allClassStudents.map(s => s.id));
    }
    setStudentSelectionClass(null);
  };

  const studentsForSelection = useMemo(() => {
    if (!studentSelectionClass) return [];
    return allStudents.filter(s => s.class === studentSelectionClass.name);
  }, [allStudents, studentSelectionClass]);

  const isFormValid =
    formData.name &&
    formData.class_ids.length > 0 &&
    dateValidation.isValid;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pr-4 -mr-4 px-4 scrollbar-thin">
        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${mode}-name`}>Tên chiến dịch *</Label>
              <Input
                id={`${mode}-name`}
                value={formData.name}
                onChange={(e) => onFormChange({ name: e.target.value })}
                placeholder="Nhập tên chiến dịch"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${mode}-description`}>Mô tả</Label>
              <Textarea
                id={`${mode}-description`}
                value={formData.description}
                onChange={(e) => onFormChange({ description: e.target.value })}
                placeholder="Mô tả chi tiết về chiến dịch"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${mode}-start-date`}>
                  <Calendar className="w-4 h-4 inline mr-1 text-eco-green" />
                  Ngày bắt đầu *
                </Label>
                <Input
                  id={`${mode}-start-date`}
                  type="datetime-local"
                  value={formData.start_date}
                  min={today}
                  onChange={(e) => onFormChange({ start_date: e.target.value })}
                  className={dateValidation.errors.start_date ? 'border-destructive' : ''}
                />
                {dateValidation.errors.start_date && (
                  <p className="text-[10px] text-destructive mt-1">{dateValidation.errors.start_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${mode}-end-date`}>
                  <Calendar className="w-4 h-4 inline mr-1 text-red-500" />
                  Ngày kết thúc *
                </Label>
                <Input
                  id={`${mode}-end-date`}
                  type="datetime-local"
                  value={formData.end_date}
                  min={formData.start_date || today}
                  onChange={(e) => onFormChange({ end_date: e.target.value })}
                  className={dateValidation.errors.end_date ? 'border-destructive' : ''}
                />
                {dateValidation.errors.end_date && (
                  <p className="text-[10px] text-destructive mt-1">{dateValidation.errors.end_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${mode}-invite-date`}>
                  <Send className="w-4 h-4 inline mr-1 text-eco-blue" />
                  Ngày gửi mời
                </Label>
                <Input
                  id={`${mode}-invite-date`}
                  type="datetime-local"
                  value={formData.invitation_send_date}
                  min={today}
                  max={formData.invitation_deadline || formData.start_date}
                  onChange={(e) => onFormChange({ invitation_send_date: e.target.value })}
                  className={dateValidation.errors.invitation_send_date ? 'border-destructive' : ''}
                />
                {dateValidation.errors.invitation_send_date && (
                  <p className="text-[10px] text-destructive mt-1">{dateValidation.errors.invitation_send_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${mode}-invite-deadline`}>
                  <Clock className="w-4 h-4 inline mr-1 text-eco-orange" />
                  Hạn chấp nhận
                </Label>
                <Input
                  id={`${mode}-invite-deadline`}
                  type="datetime-local"
                  value={formData.invitation_deadline}
                  min={formData.invitation_send_date || today}
                  max={formData.start_date}
                  onChange={(e) => onFormChange({ invitation_deadline: e.target.value })}
                  className={dateValidation.errors.invitation_deadline ? 'border-destructive' : ''}
                />
                {dateValidation.errors.invitation_deadline && (
                  <p className="text-[10px] text-destructive mt-1">{dateValidation.errors.invitation_deadline}</p>
                )}
              </div>
            </div>
          </div>

          {/* Class Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4 text-eco-green" />
              Chọn lớp tham gia *
            </Label>
            <Card>
              <ScrollArea className="h-52">
                <div className="p-4 space-y-2">
                  {availableClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`${mode}-class-${cls.id}`}
                        checked={formData.class_ids.includes(cls.id)}
                        onCheckedChange={() => onClassToggle(cls.id, allStudents.filter(s => s.class === cls.name).map(s => s.id))}
                      />
                      <label
                        htmlFor={`${mode}-class-${cls.id}`}
                        className="flex-1 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <span className="font-medium">{cls.name}</span>
                          <span className="text-muted-foreground ml-2">Khối {cls.grade}</span>
                        </div>
                        <Badge variant="outline">{cls.students_count} học sinh</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-2 h-8 w-8 p-0"
                          onClick={(e) => handleOpenStudentSelection(cls, e)}
                          title="Chọn học sinh cụ thể"
                        >
                          <UserPlus className="h-4 w-4 text-eco-blue" />
                        </Button>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {studentSelectionClass && onStudentSelection && (
              <StudentSelectionDialog
                isOpen={!!studentSelectionClass}
                onClose={() => setStudentSelectionClass(null)}
                onConfirm={handleConfirmStudents}
                studentLimit={studentSelectionClass.students_count}
                students={studentsForSelection}
                initialSelectedIds={(formData.student_ids || []).filter(id => 
                  studentsForSelection.some(s => s.id === id)
                )}
                campaignName={`Lớp ${studentSelectionClass.name}`}
                isLoading={isStudentsLoading}
              />
            )}

            {formData.class_ids.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Đã chọn {formData.class_ids.length} lớp với tổng{' '}
                {availableClasses
                  .filter((c) => formData.class_ids.includes(c.id))
                  .reduce((sum, c) => sum + c.students_count, 0)}{' '}
                học sinh
              </p>
            )}
          </div>

          {/* Info banner */}
          <div className="rounded-xl bg-eco-green/5 border border-eco-green/20 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">📋 Sau khi tạo chiến dịch</p>
            <p>Chiến dịch sẽ ở trạng thái <strong>Nháp</strong>. Bạn có thể thêm <strong>Game</strong> và <strong>Quiz</strong> từ menu hành động trong danh sách chiến dịch.</p>
          </div>
        </div>
      </div>

      {/* Form Actions - Fixed at bottom */}
      <div className="flex justify-end gap-3 pt-6 border-t mt-auto bg-background">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!isFormValid}
          className="bg-eco-green hover:bg-eco-green/90"
        >
          {mode === 'create' ? 'Tạo bản nháp' : 'Cập nhật chiến dịch'}
        </Button>
      </div>
    </div>
  );
}