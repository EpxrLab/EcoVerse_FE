import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, Users, UserPlus, AlertCircle, Clock } from 'lucide-react';
import { toLocalISO } from '@/utils/dateUtils';
import { StudentSelectionDialog } from './StudentSelectionDialog';

export function ExtendInvitingDialog({
  isOpen,
  onClose,
  onConfirm,
  campaign,
  allStudents = [],
  availableClasses = [],
  isLoading = false
}) {
  const [newInviteEndAt, setNewInviteEndAt] = useState('');
  const [dateError, setDateError] = useState('');
  const [reason, setReason] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSelectionClass, setStudentSelectionClass] = useState(null);

  const minDate = useMemo(() => {
    if (!campaign?.invitation_deadline) return toLocalISO(new Date()).slice(0, 16);
    return toLocalISO(campaign.invitation_deadline);
  }, [campaign]);

  const maxDate = useMemo(() => {
    if (!campaign?.start_date) return '';
    return toLocalISO(campaign.start_date);
  }, [campaign]);

  // Extract IDs of students already invited to this campaign
  const invitedIds = useMemo(() => {
    return campaign?.participating_students?.map(s => s.student_id || s.id) || 
           campaign?.student_ids || [];
  }, [campaign]);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen && campaign) {
      const currentDeadline = campaign.invitation_deadline || campaign.end_date || new Date().toISOString();
      const defaultDate = new Date(currentDeadline);
      defaultDate.setDate(defaultDate.getDate() + 7);
      
      // Ensure default date is between min and max
      let initialDate = defaultDate;
      if (campaign.start_date) {
        const startDate = new Date(campaign.start_date);
        if (initialDate > startDate) {
          // If 1 week later is after start date, set to 1 hour before start date
          initialDate = new Date(startDate.getTime() - 60 * 60 * 1000);
          // If even that is before min, just use min
          if (campaign.invitation_deadline && initialDate < new Date(campaign.invitation_deadline)) {
            initialDate = new Date(new Date(campaign.invitation_deadline).getTime() + 1000);
          }
        }
      }
      
      setNewInviteEndAt(toLocalISO(initialDate).slice(0, 16));
      setDateError('');
      setReason('');
      setSelectedClassIds([]);
      setSelectedStudentIds([]);
    }
  }, [isOpen, campaign]);

  const handleDateChange = (value) => {
    setNewInviteEndAt(value);
    if (!value) {
      setDateError('Vui lòng chọn thời hạn mới');
      return;
    }

    const selectedDate = new Date(value);
    if (campaign?.invitation_deadline) {
      const min = new Date(campaign.invitation_deadline);
      if (selectedDate <= min) {
        setDateError('Ngày gia hạn phải sau ngày hạn cũ');
        return;
      }
    }

    if (campaign?.start_date) {
      const max = new Date(campaign.start_date);
      if (selectedDate >= max) {
        setDateError('Ngày gia hạn phải trước ngày bắt đầu chiến dịch');
        return;
      }
    }

    setDateError('');
  };

  const handleClassToggle = (classId) => {
    const cls = availableClasses.find(c => c.id === classId);
    if (!cls) return;

    const classStudentIds = allStudents
      .filter(s => s.class === cls.name && !invitedIds.includes(s.id))
      .map(s => s.id);

    setSelectedClassIds(prev => {
      const isSelected = prev.includes(classId);
      if (isSelected) {
        // Deselect class and its students
        setSelectedStudentIds(prevStudents => 
          prevStudents.filter(id => !classStudentIds.includes(id))
        );
        return prev.filter(id => id !== classId);
      } else {
        // Select class and its students
        setSelectedStudentIds(prevStudents => {
          const newSet = new Set([...prevStudents, ...classStudentIds]);
          return Array.from(newSet);
        });
        return [...prev, classId];
      }
    });
  };

  const handleStudentSelection = (selectedIds, classId) => {
    const cls = availableClasses.find(c => c.id === classId);
    if (!cls) return;

    const classStudentIds = allStudents
      .filter(s => s.class === cls.name && !invitedIds.includes(s.id))
      .map(s => s.id);

    setSelectedStudentIds(prev => {
      // Remove current class students first, then add the new selection
      const otherStudents = prev.filter(id => !classStudentIds.includes(id));
      return [...otherStudents, ...selectedIds];
    });

    // Update class checkbox state
    if (selectedIds.length === classStudentIds.length && classStudentIds.length > 0) {
      setSelectedClassIds(prev => prev.includes(classId) ? prev : [...prev, classId]);
    } else {
      setSelectedClassIds(prev => prev.filter(id => id !== classId));
    }
  };

  const getAvailableCount = (cls) => {
    return allStudents.filter(s => s.class === cls.name && !invitedIds.includes(s.id)).length;
  };

  const getSelectedInClassCount = (cls) => {
    const classStudentIds = allStudents.filter(s => s.class === cls.name).map(s => s.id);
    return selectedStudentIds.filter(id => classStudentIds.includes(id)).length;
  };

  const studentsForSubDialog = useMemo(() => {
    if (!studentSelectionClass) return [];
    return allStudents.filter(s => s.class === studentSelectionClass.name && !invitedIds.includes(s.id));
  }, [allStudents, studentSelectionClass, invitedIds]);

  const handleConfirm = () => {
    if (!newInviteEndAt || dateError) return;
    onConfirm({
      newInviteEndAt: new Date(newInviteEndAt).toISOString(),
      additionalStudentIds: selectedStudentIds,
      reason: reason
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden leading-relaxed">
        <DialogHeader className="shrink-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-xl bg-eco-orange/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-eco-orange" />
            </div>
            <span>Gia hạn & Mời thêm học sinh</span>
          </DialogTitle>
          <DialogDescription>
            Chiến dịch: <span className="font-semibold text-foreground">{campaign?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-1 py-4 space-y-6 scrollbar-thin">
          {/* Extension Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Gia hạn
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-orange-50/50 border border-orange-100 items-stretch">
              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-2 h-6">
                  Thời hạn mới <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={newInviteEndAt}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={minDate}
                  max={maxDate}
                  className={`bg-background border-orange-200 ${dateError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {dateError ? (
                  <p className="text-[11px] text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    {dateError}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">
                    Hạn chót để học sinh chấp nhận tham gia.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-semibold flex items-center h-6">Lý do gia hạn</Label>
                <Input
                  placeholder="Nhập lý do gia hạn"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-background border-orange-200"
                />
                <p className="text-[11px] invisible select-none">&nbsp;</p>
              </div>
            </div>
          </div>

          {/* Grouped Student Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Mời thêm học sinh ({selectedStudentIds.length} đã chọn)
              </h4>
            </div>

            <div className="border rounded-xl bg-background overflow-hidden">
              <ScrollArea className="h-64">
                <div className="p-4 space-y-2">
                  {availableClasses.map((cls) => {
                    const availableCount = getAvailableCount(cls);
                    const selectedCount = getSelectedInClassCount(cls);
                    const isAllSelected = availableCount > 0 && selectedCount === availableCount;
                    
                    if (availableCount === 0) return null;

                    return (
                      <div
                        key={cls.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-all border border-transparent hover:border-border"
                      >
                        <Checkbox
                          id={`extend-class-${cls.id}`}
                          checked={isAllSelected}
                          onCheckedChange={() => handleClassToggle(cls.id)}
                        />
                        <div className="flex-1 flex items-center justify-between cursor-pointer">
                          <label
                            htmlFor={`extend-class-${cls.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <span className="font-bold text-eco-green">Lớp {cls.name}</span>
                            <span className="text-muted-foreground ml-2 text-sm italic">Khối {cls.grade}</span>
                          </label>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="font-medium">
                              {selectedCount}/{availableCount}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-eco-blue/10 hover:text-eco-blue"
                              onClick={() => setStudentSelectionClass(cls)}
                              title="Chọn học sinh cụ thể"
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {availableClasses.every(cls => getAvailableCount(cls) === 0) && (
                    <div className="text-center py-8 text-muted-foreground italic">
                      Tất cả học sinh từ các lớp đã được mời tham gia chiến dịch này.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 pt-4 border-t gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Đóng
          </Button>
          <Button 
            className="bg-eco-orange hover:bg-eco-orange/90 text-white min-w-[140px] font-bold shadow-md"
            onClick={handleConfirm}
            disabled={!newInviteEndAt || isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận gia hạn"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {studentSelectionClass && (
        <StudentSelectionDialog
          isOpen={!!studentSelectionClass}
          onClose={() => setStudentSelectionClass(null)}
          onConfirm={(selectedIds) => handleStudentSelection(selectedIds, studentSelectionClass.id)}
          studentLimit={getAvailableCount(studentSelectionClass)}
          students={studentsForSubDialog}
          initialSelectedIds={selectedStudentIds.filter(id => 
            studentsForSubDialog.some(s => s.id === id)
          )}
          campaignName={`Lớp ${studentSelectionClass.name}`}
        />
      )}
    </Dialog>
  );
}
