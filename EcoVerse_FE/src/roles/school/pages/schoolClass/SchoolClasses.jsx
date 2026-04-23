import { useState } from 'react';
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { 
  Plus, 
  GraduationCap,
  Loader2,
  Layers,
  Mail,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { useClasses } from '../../features/classes/hooks/useClasses';
import { 
  StudentListView, 
  GradeGroup, 
  SchoolAccountsView, 
  StudentFormDialog,
  ClassStats, 
  BulkImportDialog 
} from '../../features/classes/components';
import { cn } from "@/shared/lib/utils";

export default function SchoolClasses() {
  const {
    gradeGroups,
    classStudents,
    allStudents,
    stats,
    selectedClass,
    isLoading,
    setSelectedClass,
    fetchClasses,
    createStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,
    bulkImport,
  } = useClasses();

  const [expandedGrades, setExpandedGrades] = useState(new Set([1, 2, 3, 4, 5]));
  const toggleGrade = (grade) => {
    setExpandedGrades(prev => {
      const newSet = new Set(prev);
      if (newSet.has(grade)) {
        newSet.delete(grade);
      } else {
        newSet.add(grade);
      }
      return newSet;
    });
  };

  const [mainTab, setMainTab] = useState('classes');
  
  const initialStudentForm = {
    student_name: '',
    date_of_birth: '',
    gender: '',
    gradeLevel: '1',
    className: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    address: '',
    notes: '',
    status: 'active',
  };
  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Handlers

  const handleAddStudent = async (data) => {
    return await createStudent(data);
  };

  const handleGlobalAddStudent = async () => {
    const success = await handleAddStudent(studentForm);
    if (success) {
      setStudentForm(initialStudentForm);
      setIsAddStudentDialogOpen(false);
    }
  };

  const handleUpdateStudent = async (id, data) => {
    return await updateStudent(id, data);
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
          <div className="w-12 h-12 rounded-2xl bg-eco-green flex items-center justify-center shadow-lg shadow-eco-green/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Quản lý Lớp & Học sinh</h1>
            <p className="text-base text-muted-foreground font-medium">Khối · Lớp · Tài khoản</p>
          </div>
        </div>

        {/* Actions — compact */}
        <div className="flex items-center gap-2.5">
          {/* Primary CTA: Add Student */}
          <Button
            className="h-9 bg-eco-green hover:bg-eco-green/90 shadow-md shadow-eco-green/15 text-white font-semibold gap-1.5"
            onClick={() => {
              setStudentForm(initialStudentForm);
              setIsAddStudentDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Thêm học sinh
          </Button>

          <Button
            variant="outline"
            className="h-9 gap-1.5"
            onClick={() => setIsBulkImportOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
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
                <Badge variant="secondary" className="ml-0.5 h-5 min-w-5 px-1.5 text-xs bg-eco-green/10 text-eco-green font-bold">
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
                      className="bg-eco-green hover:bg-eco-green/90 shadow-md text-white font-semibold"
                      onClick={() => setIsBulkImportOpen(true)}
                    >
                      Import File
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setStudentForm(initialStudentForm);
                      setIsAddStudentDialogOpen(true);
                    }}>
                      <Plus className="w-4 h-4 mr-1.5" />
                      Thêm học sinh
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
                        onSelectClass={setSelectedClass}
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
      <StudentFormDialog
        isOpen={isAddStudentDialogOpen}
        onClose={() => setIsAddStudentDialogOpen(false)}
        isEditing={false}
        form={studentForm}
        onFormChange={setStudentForm}
        onSubmit={handleGlobalAddStudent}
      />

      <BulkImportDialog
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
      />
    </div>
  );
}