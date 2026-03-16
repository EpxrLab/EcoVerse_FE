import { useState } from 'react';
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { 
  Plus, 
  GraduationCap,
  Edit,
  Loader2,
  Layers,
  Mail,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { useClasses } from '../../features/classes/hooks/useClasses';
import { useClassForm } from '../../features/classes/hooks';
import { StudentListView, GradeGroup, SchoolAccountsView } from '../../components/classes';
import { ClassStats, ClassForm, BulkImportDialog } from '../../features/classes/components';
import { cn } from "@/shared/lib/utils";

export default function SchoolClasses() {
  const {
    gradeGroups,
    classStudents,
    allStudents,
    stats,
    selectedClass,
    isLoading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isBulkImportOpen,
    setIsBulkImportOpen,
    setSelectedClass,
    createClass,
    updateClass,
    deleteClass,
    fetchClasses,
    createStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,
    bulkImport,
  } = useClasses();

  const {
    classForm,
    updateClassForm,
    resetClassForm,
    loadClassForm,
    expandedGrades,
    toggleGrade,
    openAddClassForGrade,
  } = useClassForm();

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

  const handleBulkImport = async (file, parsedRows) => {
    return await bulkImport(file, parsedRows);
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
        onToggleStudentStatus={toggleStudentStatus}
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
            <p className="text-sm text-muted-foreground">Khối · Lớp · Tài khoản</p>
          </div>
        </div>

        {/* Actions — compact */}
        <div className="flex items-center gap-2.5">
          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Tạo mới
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setIsAddDialogOpen(true)} className="gap-2 cursor-pointer">
                <Layers className="w-4 h-4 text-eco-green" />
                Tạo lớp học
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary CTA */}
          <Button
            className="h-9 bg-gradient-to-r from-eco-blue to-eco-green hover:opacity-90 shadow-md shadow-eco-blue/15 text-white font-semibold gap-1.5"
            onClick={() => setIsBulkImportOpen(true)}
          >
            Import 
          </Button>
        </div>
      </div>

      {/* ─── Main Tabs — full view switch ─── */}
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
                    Tạo lớp đầu tiên hoặc import từ file CSV
                  </p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    <Button
                      className="bg-gradient-to-r from-eco-blue to-eco-green hover:opacity-90 shadow-md"
                      onClick={() => setIsBulkImportOpen(true)}
                    >
                      Import File
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
              onRefresh={fetchClasses}
            />
          </TabsContent>
        </Tabs>

      {/* ─── Dialogs ─── */}
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