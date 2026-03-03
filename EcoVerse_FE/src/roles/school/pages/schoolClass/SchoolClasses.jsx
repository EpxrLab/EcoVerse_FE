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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
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
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  Users,
  Mail,
  MoreVertical,
  Settings,
  Target,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { useClasses } from '../../features/classes/hooks/useClasses';
import { useClassForm } from '../../features/classes/hooks';
import { StudentListView, GradeGroup, SchoolAccountsView } from '../../components/classes';
import { ClassStats, ClassForm, AcademicYearForm, BulkImportDialog } from '../../features/classes/components';
import { cn } from "@/shared/lib/utils";

export default function SchoolClasses() {
  const {
    academicYears,
    selectedYear,
    gradeGroups,
    classStudents,
    allStudents,
    stats,
    selectedClass,
    isLoading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isAddYearDialogOpen,
    setIsAddYearDialogOpen,
    isBulkImportOpen,
    setIsBulkImportOpen,
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
    bulkImport,
  } = useClasses();

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
  const [mainTab, setMainTab] = useState('classes');

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

  const handleBulkImport = async (parsedRows) => {
    return await bulkImport(parsedRows);
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
      />
    );
  }

  // Main View
  return (
    <div className="space-y-5 animate-fade-in">
      {/* ─── Header Row ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-eco-blue to-eco-green flex items-center justify-center shadow-lg shadow-eco-blue/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quản lý Lớp & Học sinh</h1>
            <p className="text-sm text-muted-foreground">Niên khóa · Khối · Lớp · Tài khoản</p>
          </div>
        </div>

        {/* Actions — compact */}
        <div className="flex items-center gap-2.5">
          {/* Year selector */}
          {academicYears.length > 0 && (
            <Select
              value={selectedYear?.id || ''}
              onValueChange={(value) => {
                const year = academicYears.find(y => y.id === value);
                if (year) setSelectedYear(year);
              }}
            >
              <SelectTrigger className="w-[180px] h-9 bg-background border-border">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Chọn niên khóa" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    <div className="flex items-center gap-2">
                      {year.name}
                      {year.is_current && (
                        <Badge variant="secondary" className="text-[10px] bg-eco-green/10 text-eco-green px-1.5 py-0">
                          Hiện tại
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* More actions dropdown — gộp Tạo niên khóa + Tạo lớp */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Tạo mới
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setIsAddYearDialogOpen(true)} className="gap-2 cursor-pointer">
                <History className="w-4 h-4 text-eco-blue" />
                Tạo niên khóa
              </DropdownMenuItem>
              {selectedYear && (
                <DropdownMenuItem onClick={() => setIsAddDialogOpen(true)} className="gap-2 cursor-pointer">
                  <Layers className="w-4 h-4 text-eco-green" />
                  Tạo lớp học
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary CTA */}
          <Button
            className="h-9 bg-gradient-to-r from-eco-blue to-eco-green hover:opacity-90 shadow-md shadow-eco-blue/15 text-white font-semibold gap-1.5"
            onClick={() => setIsBulkImportOpen(true)}
          >
            <Sparkles className="w-4 h-4" />
            Import 
          </Button>
        </div>
      </div>

      {/* ─── Hero Empty State — no academic years ─── */}
      {!selectedYear && academicYears.length === 0 && (
        <Card className="border-2 border-dashed border-muted-foreground/20 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-eco-blue/10 via-eco-green/10 to-eco-leaf/10 px-8 pt-10 pb-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-eco-blue to-eco-green flex items-center justify-center mb-4 shadow-lg shadow-eco-blue/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Bắt đầu với Import hàng loạt</h2>
              <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                Tải lên 1 file CSV để tự động tạo niên khóa, khối, lớp, học sinh và phụ huynh — kèm tài khoản đăng nhập
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {[
                { icon: FileSpreadsheet, label: '1. Upload CSV', desc: 'Theo mẫu có sẵn', color: 'text-eco-blue' },
                { icon: Calendar, label: '2. Tạo niên khóa', desc: 'Tự động từ file', color: 'text-eco-green' },
                { icon: Layers, label: '3. Lớp & Học sinh', desc: 'Theo khối', color: 'text-eco-leaf' },
                { icon: Mail, label: '4. Gửi tài khoản', desc: 'Email phụ huynh', color: 'text-eco-orange' },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div key={label} className="flex flex-col items-center text-center p-5 gap-2">
                  <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center">
                    <Icon className={cn("w-5 h-5", color)} />
                  </div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>

            <div className="px-8 py-5 flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-border bg-muted/20">
              <Button
                className="bg-gradient-to-r from-eco-blue to-eco-green hover:opacity-90 shadow-lg shadow-eco-blue/20 text-white font-semibold"
                onClick={() => setIsBulkImportOpen(true)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Import hàng loạt ngay
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => setIsAddYearDialogOpen(true)}>
                <History className="w-4 h-4 mr-2" />
                Tạo thủ công
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Main Tabs — full view switch ─── */}
      {selectedYear && (
        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList className="h-10 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger
              value="classes"
              className="gap-2 rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Layers className="w-4 h-4" />
              Lớp học
            </TabsTrigger>
            <TabsTrigger
              value="accounts"
              className="gap-2 rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Mail className="w-4 h-4" />
              Tài khoản & Email
              {allStudents.length > 0 && (
                <Badge variant="secondary" className="ml-0.5 h-5 min-w-5 px-1.5 text-[10px] bg-eco-blue/10 text-eco-blue font-semibold">
                  {allStudents.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Classes Tab ── */}
          <TabsContent value="classes" className="mt-4 space-y-4">
            {/* Year Info Bar — only shown in classes tab */}
            <div className="flex items-center justify-between rounded-xl border border-eco-leaf/20 bg-gradient-to-r from-eco-leaf/5 via-transparent to-transparent px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-eco-leaf/10 flex items-center justify-center">
                  <Calendar className="w-4.5 h-4.5 text-eco-leaf" />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-sm">{selectedYear.name}</span>
                  {selectedYear.is_current && (
                    <Badge className="bg-eco-green/15 text-eco-green border-eco-green/30 text-[10px] px-1.5 py-0 font-medium">
                      <Star className="w-2.5 h-2.5 mr-0.5" />
                      Hiện tại
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedYear.start_date).toLocaleDateString('vi-VN')} – {new Date(selectedYear.end_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!selectedYear.is_current && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 text-xs hover:bg-eco-green/10 hover:text-eco-green gap-1"
                    onClick={() => setCurrentAcademicYear(selectedYear.id)}
                  >
                    <Star className="w-3 h-3" />
                    Đặt hiện tại
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5" />
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

            {/* Stats — only in classes tab */}
            <ClassStats stats={stats} />

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-eco-green mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Đang tải dữ liệu…</p>
                </div>
              </div>
            )}

            {/* Empty */}
            {!isLoading && gradeGroups.length === 0 && (
              <Card className="border-2 border-dashed border-muted-foreground/20">
                <CardContent className="p-10 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Layers className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1.5">Chưa có lớp học nào</h3>
                  <p className="text-muted-foreground text-sm mb-5 max-w-xs mx-auto">
                    Tạo lớp đầu tiên cho niên khóa {selectedYear.name} hoặc import từ file CSV
                  </p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    <Button
                      className="bg-gradient-to-r from-eco-blue to-eco-green hover:opacity-90 shadow-md"
                      onClick={() => setIsBulkImportOpen(true)}
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Import hàng loạt
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-1.5" />
                      Tạo lớp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grade Groups */}
            {!isLoading && gradeGroups.length > 0 && (
              <div className="space-y-3">
                {gradeGroups.length > 5 && (
                  <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-muted/30 border border-border">
                    <span className="text-xs text-muted-foreground self-center mr-1.5">Khối:</span>
                    {gradeGroups.map((group) => (
                      <Button
                        key={group.grade}
                        variant={expandedGrades.has(group.grade) ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "h-7 px-2.5 text-xs rounded-lg",
                          expandedGrades.has(group.grade) 
                            ? "bg-eco-green hover:bg-eco-green/90 text-white" 
                            : "hover:bg-eco-green/10 text-muted-foreground"
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
                <div className="space-y-2.5">
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
          </TabsContent>

          {/* ── Accounts & Email Tab — full replacement view ── */}
          <TabsContent value="accounts" className="mt-4">
            <SchoolAccountsView
              allStudents={allStudents}
              gradeGroups={gradeGroups}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* ─── Dialogs ─── */}
      <Dialog open={isAddYearDialogOpen} onOpenChange={setIsAddYearDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-eco-blue/10 flex items-center justify-center">
                <Calendar className="w-4.5 h-4.5 text-eco-blue" />
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-eco-green/10 flex items-center justify-center">
                <Plus className="w-4.5 h-4.5 text-eco-green" />
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-eco-blue/10 flex items-center justify-center">
                <Edit className="w-4.5 h-4.5 text-eco-blue" />
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

      <BulkImportDialog
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
      />
    </div>
  );
}