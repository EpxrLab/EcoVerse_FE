import { useState } from 'react';
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { 
  Plus, 
  GraduationCap,
  Calendar,
  History,
  Star,
  Trash2,
  Edit,
  Loader2,
  Layers,
} from "lucide-react";
import { useClasses } from '../../features/classes/hooks/useClasses';
import { useClassForm } from '../../features/classes/hooks';
import { StudentListView, GradeGroup } from '../../components/classes';
import { ClassStats, ClassForm, AcademicYearForm } from '../../features/classes/components';
import { cn } from "@/shared/lib/utils";

export default function SchoolClasses() {
  const {
    academicYears,
    selectedYear,
    gradeGroups,
    classStudents,
    stats,
    selectedClass,
    isLoading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isAddYearDialogOpen,
    setIsAddYearDialogOpen,
    setSelectedYear,
    setSelectedClass,
    createAcademicYear,
    copyClassesFromYear,
    createClass,
    updateClass,
    deleteClass,
    deleteAcademicYear,
    setCurrentAcademicYear,
    createStudent,
    updateStudent,
    deleteStudent,
    importStudents,
  } = useClasses();

  // Use class form hook for all form logic
  const {
    classForm,
    updateClassForm,
    resetClassForm,
    loadClassForm,
    yearForm,
    updateYearForm,
    resetYearForm,
    generateYearName,
    expandedGrades,
    toggleGrade,
    openAddClassForGrade,
  } = useClassForm();

  const [copyFromYearId, setCopyFromYearId] = useState('');
  const [editingClass, setEditingClass] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Handlers
  const handleCreateClass = async () => {
    await createClass(classForm);
    resetClassForm();
    setIsAddDialogOpen(false);
  };

  const handleUpdateClass = async () => {
    if (editingClass) {
      await updateClass(editingClass, classForm);
      setEditingClass(null);
      setIsEditDialogOpen(false);
      resetClassForm();
    }
  };

  const handleCreateYear = async () => {
    await createAcademicYear(yearForm);
    
    if (copyFromYearId && copyFromYearId !== 'none' && selectedYear) {
      const newYear = academicYears.find(y => y.name === yearForm.name);
      if (newYear) {
        await copyClassesFromYear(copyFromYearId, newYear.id);
      }
    }
    
    resetYearForm();
    setCopyFromYearId('');
    setIsAddYearDialogOpen(false);
  };

  const handleAddStudent = async (data) => {
    if (selectedClass) {
      return await createStudent(selectedClass.id, data);
    }
    return false;
  };

  const handleUpdateStudent = async (id, data) => {
    return await updateStudent(id, data);
  };

  const openEditDialog = (classItem) => {
    setEditingClass(classItem.id);
    loadClassForm({
      name: classItem.name,
      grade: classItem.grade,
      teacher_name: classItem.teacher_name || '',
      description: classItem.description || '',
    });
    setIsEditDialogOpen(true);
  };

  // View: Student List for Selected Class
  if (selectedClass) {
    return (
      <StudentListView
        selectedClass={selectedClass}
        students={classStudents}
        onBack={() => setSelectedClass(null)}
        onAddStudent={handleAddStudent}
        onUpdateStudent={handleUpdateStudent}
        onDeleteStudent={deleteStudent}
        onImportStudents={importStudents}
      />
    );
  }

  // Main View
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-eco-blue to-eco-green flex items-center justify-center shadow-lg shadow-eco-blue/20">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Quản lý Lớp & Học sinh
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Academic Year Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select
              value={selectedYear?.id || ''}
              onValueChange={(value) => {
                const year = academicYears.find(y => y.id === value);
                if (year) setSelectedYear(year);
              }}
            >
              <SelectTrigger className="w-[160px] border-0 bg-transparent h-8">
                <SelectValue placeholder="Chọn niên khóa" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    <div className="flex items-center gap-2">
                      {year.name}
                      {year.is_current && (
                        <Badge variant="secondary" className="text-xs bg-eco-green/10 text-eco-green">
                          Hiện tại
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Year Button */}
          <Dialog open={isAddYearDialogOpen} onOpenChange={setIsAddYearDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-eco-blue/30 hover:bg-eco-blue/10 hover:border-eco-blue/50">
                <History className="w-4 h-4 mr-2" />
                Tạo niên khóa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-eco-blue/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-eco-blue" />
                  </div>
                  Tạo niên khóa mới
                </DialogTitle>
              </DialogHeader>
              <AcademicYearForm
                formData={yearForm}
                existingYears={academicYears}
                copyFromYearId={copyFromYearId}
                onFormChange={updateYearForm}
                onCopyFromChange={setCopyFromYearId}
                onGenerateYearName={() => updateYearForm({ name: generateYearName() })}
                onSubmit={handleCreateYear}
              />
            </DialogContent>
          </Dialog>

          {/* Add Class Button */}
          {selectedYear && (
            <Button 
              className="bg-eco-green hover:bg-eco-green/90 shadow-lg shadow-eco-green/20"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo lớp mới
            </Button>
          )}
        </div>
      </div>

      {/* Year Settings Card */}
      {selectedYear && (
        <Card className="border-2 border-eco-leaf/20 bg-gradient-to-r from-eco-leaf/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-eco-leaf/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-eco-leaf" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{selectedYear.name}</h3>
                    {selectedYear.is_current && (
                      <Badge className="bg-eco-green text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Hiện tại
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedYear.start_date).toLocaleDateString('vi-VN')} - {new Date(selectedYear.end_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!selectedYear.is_current && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentAcademicYear(selectedYear.id)}
                    className="hover:bg-eco-green/10 hover:text-eco-green hover:border-eco-green/30"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Đặt hiện tại
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa niên khóa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tất cả lớp học và dữ liệu học sinh trong niên khóa "{selectedYear.name}" sẽ bị xóa vĩnh viễn.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => deleteAcademicYear(selectedYear.id)}
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Year Selected */}
      {!selectedYear && academicYears.length === 0 && (
        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chưa có niên khóa nào</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Tạo niên khóa đầu tiên để bắt đầu quản lý lớp học và học sinh
            </p>
            <Button onClick={() => setIsAddYearDialogOpen(true)} className="bg-eco-blue hover:bg-eco-blue/90">
              <Plus className="w-4 h-4 mr-2" />
              Tạo niên khóa
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {selectedYear && <ClassStats stats={stats} />}

      {/* Loading State */}
      {isLoading && selectedYear && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-eco-green mx-auto mb-3" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}

      {/* Empty State - No Classes */}
      {!isLoading && selectedYear && gradeGroups.length === 0 && (
        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Layers className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chưa có lớp học nào</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Tạo lớp học đầu tiên cho niên khóa {selectedYear.name}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-eco-green hover:bg-eco-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Tạo lớp học
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Grade Groups */}
      {!isLoading && gradeGroups.length > 0 && (
        <div className="space-y-4">
          {/* Quick navigation tabs when more than 5 grades */}
          {gradeGroups.length > 5 && (
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-muted/30 border border-border">
              <span className="text-xs text-muted-foreground self-center mr-2">Chuyển nhanh:</span>
              {gradeGroups.map((group) => (
                <Button
                  key={group.grade}
                  variant={expandedGrades.has(group.grade) ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-7 px-3 text-xs",
                    expandedGrades.has(group.grade) 
                      ? "bg-eco-green hover:bg-eco-green/90" 
                      : "hover:bg-eco-green/10 hover:border-eco-green/50"
                  )}
                  onClick={() => {
                    toggleGrade(group.grade);
                    if (!expandedGrades.has(group.grade)) {
                      setTimeout(() => {
                        document.getElementById(`grade-${group.grade}`)?.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start' 
                        });
                      }, 100);
                    }
                  }}
                >
                  Khối {group.grade}
                </Button>
              ))}
            </div>
          )}

          {/* Grade Groups List */}
          <div className="space-y-3">
            {gradeGroups.map((group) => (
              <div key={group.grade} id={`grade-${group.grade}`}>
                <GradeGroup
                  group={group}
                  isExpanded={expandedGrades.has(group.grade)}
                  onToggle={() => toggleGrade(group.grade)}
                  onAddClass={openAddClassForGrade}
                  onSelectClass={setSelectedClass}
                  onEditClass={openEditDialog}
                  onDeleteClass={deleteClass}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Class Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-eco-green/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-eco-green" />
              </div>
              Tạo lớp học mới
            </DialogTitle>
          </DialogHeader>
          <ClassForm
            mode="create"
            formData={classForm}
            academicYearName={selectedYear?.name}
            onFormChange={updateClassForm}
            onSubmit={handleCreateClass}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-eco-blue/10 flex items-center justify-center">
                <Edit className="w-5 h-5 text-eco-blue" />
              </div>
              Chỉnh sửa lớp học
            </DialogTitle>
          </DialogHeader>
          <ClassForm
            mode="edit"
            formData={classForm}
            onFormChange={updateClassForm}
            onSubmit={handleUpdateClass}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}