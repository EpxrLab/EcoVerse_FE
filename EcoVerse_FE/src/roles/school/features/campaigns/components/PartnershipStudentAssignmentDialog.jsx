import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Users, UserPlus, AlertCircle } from 'lucide-react';
import { StudentSelectionDialog } from './StudentSelectionDialog';

export function PartnershipStudentAssignmentDialog({
  isOpen,
  onClose,
  onConfirm,
  campaign,
  availableClasses,
  allStudents,
  initialSelectedIds = [],
  isLoading = false
}) {
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [studentSelectionClass, setStudentSelectionClass] = useState(null);

  // Initialize selected students and classes when dialog opens
  useEffect(() => {
    if (isOpen && initialSelectedIds.length > 0) {
      setSelectedStudentIds(initialSelectedIds);
      
      // Calculate which classes are fully selected
      const classIds = [];
      availableClasses.forEach(cls => {
        const classStudentIds = allStudents
          .filter(s => s.class === cls.name)
          .map(s => s.id);
        
        if (classStudentIds.length > 0 && classStudentIds.every(id => initialSelectedIds.includes(id))) {
          classIds.push(cls.id);
        }
      });
      setSelectedClassIds(classIds);
    } else if (isOpen) {
      setSelectedStudentIds([]);
      setSelectedClassIds([]);
    }
  }, [isOpen, initialSelectedIds, availableClasses, allStudents]);

  const studentLimit = campaign?.max_students_per_school || campaign?.student_limit || 0;

  const handleClassToggle = (classId, classStudentIds) => {
    const isSelected = selectedClassIds.includes(classId);
    
    if (isSelected) {
      // Remove class and its students
      setSelectedClassIds(prev => prev.filter(id => id !== classId));
      setSelectedStudentIds(prev => prev.filter(id => !classStudentIds.includes(id)));
    } else {
      // Check if adding this class exceeds limit
      const currentTotal = selectedStudentIds.length;
      const classSize = classStudentIds.length;
      
      if (currentTotal + classSize > studentLimit) {
        // Just add specific students if possible or show alert
        return;
      }
      
      setSelectedClassIds(prev => [...prev, classId]);
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...classStudentIds])));
    }
  };

  const handleOpenStudentSelection = (cls, e) => {
    e.preventDefault();
    e.stopPropagation();
    setStudentSelectionClass(cls);
  };

  const handleConfirmSpecificStudents = (ids) => {
    if (!studentSelectionClass) return;
    
    const classStudentIds = allStudents
      .filter(s => s.class === studentSelectionClass.name)
      .map(s => s.id);
    
    // Remove old class students first
    const otherStudents = selectedStudentIds.filter(id => !classStudentIds.includes(id));
    const newTotal = otherStudents.length + ids.length;
    
    if (newTotal > studentLimit) return;

    setSelectedStudentIds([...otherStudents, ...ids]);
    
    // Update class checkbox status
    if (ids.length === classStudentIds.length && ids.length > 0) {
      if (!selectedClassIds.includes(studentSelectionClass.id)) {
        setSelectedClassIds(prev => [...prev, studentSelectionClass.id]);
      }
    } else {
      setSelectedClassIds(prev => prev.filter(id => id !== studentSelectionClass.id));
    }
    
    setStudentSelectionClass(null);
  };

  const studentsForSelection = useMemo(() => {
    if (!studentSelectionClass) return [];
    return allStudents.filter(s => s.class === studentSelectionClass.name);
  }, [allStudents, studentSelectionClass]);

  const totalSelected = selectedStudentIds.length;
  const isOverLimit = totalSelected > studentLimit;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-6 h-6 text-eco-green" />
              Chọn học sinh tham gia
            </DialogTitle>
            <DialogDescription>
              Chiến dịch: <span className="font-semibold text-foreground">{campaign?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0 py-4 gap-4">
            <div className="flex items-center justify-between p-4 bg-eco-green/5 border border-eco-green/20 rounded-xl">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tổng số học sinh đã chọn</p>
                <p className={`text-2xl font-bold ${isOverLimit ? 'text-destructive' : 'text-eco-green'}`}>
                  {totalSelected} / {studentLimit}
                </p>
              </div>
              {isOverLimit && (
                <div className="flex items-center gap-2 text-destructive text-sm font-medium animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  Vượt hạn mức cho phép
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 border rounded-xl bg-muted/20">
              <div className="p-4 space-y-3">
                {availableClasses.map((cls) => {
                  const classStudentIds = allStudents
                    .filter(s => s.class === cls.name)
                    .map(s => s.id);
                  const selectedInClass = selectedStudentIds.filter(id => classStudentIds.includes(id)).length;
                  const isFullySelected = selectedInClass === classStudentIds.length && classStudentIds.length > 0;
                  
                  return (
                    <div
                      key={cls.id}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-background border hover:border-eco-green/50 transition-all group"
                    >
                      <Checkbox
                        id={`assign-class-${cls.id}`}
                        checked={isFullySelected}
                        onCheckedChange={() => handleClassToggle(cls.id, classStudentIds)}
                      />
                      <label
                        htmlFor={`assign-class-${cls.id}`}
                        className="flex-1 flex items-center justify-between cursor-pointer"
                      >
                        <div className="space-y-1">
                          <p className="font-bold flex items-center gap-2">
                            {cls.name}
                            <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 rounded uppercase">
                              Khối {cls.grade}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedInClass} / {cls.students_count} học sinh
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {selectedInClass > 0 && selectedInClass < cls.students_count && (
                            <Badge variant="outline" className="text-eco-blue border-eco-blue/30 bg-eco-blue/5">
                              Đã chọn {selectedInClass}
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 group-hover:bg-eco-blue/10 group-hover:text-eco-blue transition-colors"
                            onClick={(e) => handleOpenStudentSelection(cls, e)}
                            title="Chọn học sinh cụ thể"
                          >
                            <UserPlus className="h-5 w-5" />
                          </Button>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button 
              onClick={() => {
                onConfirm(selectedStudentIds);
                onClose();
              }}
              disabled={totalSelected === 0 || isOverLimit || isLoading}
              className="bg-eco-green hover:bg-eco-green/90 min-w-[150px]"
            >
              {isLoading ? 'Đang gửi...' : 'Xác nhận tham gia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {studentSelectionClass && (
        <StudentSelectionDialog
          isOpen={!!studentSelectionClass}
          onClose={() => setStudentSelectionClass(null)}
          onConfirm={handleConfirmSpecificStudents}
          studentLimit={studentLimit}
          students={studentsForSelection}
          initialSelectedIds={selectedStudentIds.filter(id => 
            studentsForSelection.some(s => s.id === id)
          )}
          campaignName={`Lớp ${studentSelectionClass.name}`}
          isLoading={false}
        />
      )}
    </>
  );
}
