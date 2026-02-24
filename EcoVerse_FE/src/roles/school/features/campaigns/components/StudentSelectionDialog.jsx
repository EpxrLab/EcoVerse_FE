import { useState, useMemo } from 'react';
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
  campaignName
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase())
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
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn học sinh tham gia</DialogTitle>
          <DialogDescription>
            Chiến dịch: <span className="font-semibold">{campaignName}</span>
            <br />
            Số lượng cho phép: <span className="font-semibold text-primary">{currentCount}/{studentLimit}</span> học sinh
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={false} 
                    disabled={true}
                  />
                </TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Lớp</TableHead>
                <TableHead>Điểm hiện tại</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy học sinh
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = selectedIds.includes(student.id);
                  const  isDisabled = !isSelected && isLimitReached;
                  
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
                      <TableCell>{student.coins}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button 
            onClick={() => {
              onConfirm(selectedIds);
              onClose();
            }}
            disabled={currentCount === 0}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Xác nhận tham gia ({currentCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}