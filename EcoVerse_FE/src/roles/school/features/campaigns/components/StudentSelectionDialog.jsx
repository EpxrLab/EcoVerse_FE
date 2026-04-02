import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Search, UserPlus } from 'lucide-react';

export function StudentSelectionDialog({
  isOpen,
  onClose,
  onConfirm,
  studentLimit,
  students,
  campaignName,
  initialSelectedIds = [],
  isLoading = false
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Initialize selection when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelectedIds);
    }
  }, [isOpen, initialSelectedIds]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) 
    );
  }, [students, searchTerm]);

  const handleToggleStudent = (studentId) => {
    setSelectedIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        if (prev.length >= studentLimit) {
          return prev; // Limit reached
        }
        return [...prev, studentId];
      }
    });
  };

  const currentCount = selectedIds.length;
  const isLimitReached = currentCount >= studentLimit;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 pb-2">
          <DialogTitle>Chọn học sinh tham gia</DialogTitle>
          <DialogDescription>
            Chiến dịch: <span className="font-semibold">{campaignName}</span>
            <br />
            Số lượng cho phép: <span className="font-semibold text-primary">{currentCount}/{studentLimit}</span> học sinh
          </DialogDescription>
        </DialogHeader>

        {/* Search Input - Fixed */}
        <div className="shrink-0 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Table Area - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto border rounded-md mt-2">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={false} 
                    disabled={true}
                  />
                </TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Lớp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    Đang tải danh sách học sinh...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy học sinh
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = selectedIds.includes(student.id);
                  const isDisabled = !isSelected && isLimitReached;
                  
                  return (
                    <TableRow key={student.id} className={isSelected ? 'bg-muted/50' : ''}>
                      <TableCell>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => handleToggleStudent(student.id)}
                          disabled={isDisabled}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="shrink-0 pt-4 gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button 
            onClick={() => {
              onConfirm(selectedIds);
              onClose();
            }}
            disabled={currentCount === 0}
            className="bg-eco-green hover:bg-eco-green/90"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Xác nhận tham gia ({currentCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}