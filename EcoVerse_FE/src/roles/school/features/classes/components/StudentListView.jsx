import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { 
  ArrowLeft,
  Upload, 
  Users,
  GraduationCap,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Phone,
  Mail,
  User,
  Ban,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { StudentFormDialog } from "./StudentFormDialog";
import { EmailPreviewDialog } from "./EmailPreviewDialog";

const initialStudentForm = {
  student_name: '',
  student_password: '',
  date_of_birth: '',
  gender: '',
  parent_name: '',
  parent_phone: '',
  parent_email: '',
  parent_password: '',
  address: '',
  notes: '',
  status: 'active',
};

export function StudentListView({
  selectedClass,
  students,
  onBack,
  onUpdateStudent,
  onDeleteStudent,
  onToggleStudentStatus,
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [highlightedParentId, setHighlightedParentId] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Email sending state
  const [emailPreviewData, setEmailPreviewData] = useState(null); // { parent, student }

  const filteredStudents = students.filter(s => 
    s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unique parents from students
  const parentsData = filteredStudents
    .filter(s => s.parent_name)
    .reduce((acc, student) => {
      const parentKey = student.parent_phone || student.parent_email || student.parent_name;
      if (parentKey && !acc.find(p => (p.phone || p.email || p.name) === parentKey)) {
        acc.push({
          id: student.id,
          name: student.parent_name || '',
          phone: student.parent_phone || '',
          email: student.parent_email || '',
          username: student.parent_username || '',
          password: student.parent_password || '',
          studentName: student.student_name,
          studentId: student.id,
          student: student,
        });
      }
      return acc;
    }, []);



  const handleParentClick = (studentId) => {
    setActiveTab('parents');
    setHighlightedParentId(studentId);
    setTimeout(() => setHighlightedParentId(null), 2000);
  };

  const openEmailPreview = (parent, student) => {
    setEmailPreviewData({ parent, student });
  };



  const handleUpdateStudent = async () => {
    if (editingStudentId) {
      const success = await onUpdateStudent(editingStudentId, studentForm);
      if (success) {
        setStudentForm(initialStudentForm);
        setEditingStudentId(null);
        setIsEditDialogOpen(false);
      }
    }
  };

  const openEditDialog = (student) => {
    setEditingStudentId(student.id);
    setStudentForm({
      student_name: student.student_name,
      student_code: student.student_code || '',
      student_password: student.student_password || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || 'other',
      gradeLevel: String(student.grade || ''),
      className: student.className || '',
      parent_name: student.parent_name || '',
      parent_phone: student.parent_phone || '',
      parent_email: student.parent_email || '',
      parent_password: student.parent_password || '',
      address: student.address || '',
      notes: student.notes || '',
      status: student.status,
    });
    setIsEditDialogOpen(true);
  };


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
            className="hover:bg-muted rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-14 h-14 rounded-2xl bg-eco-green flex items-center justify-center shadow-lg shadow-eco-green/20">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Lớp {selectedClass.grade}{selectedClass.name}</h1>
            <p className="text-base text-muted-foreground font-medium flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-eco-green" />
              Khối {selectedClass.grade}
            </p>
          </div>
        </div>


      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-eco-green/20 bg-eco-green/[0.02] shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-eco-green/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-eco-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">{students.length}</p>
              <p className="text-xs text-muted-foreground font-semibold mt-1">Học sinh</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      {students.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {students.length === 0 ? (
        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Chưa có học sinh nào</h3>
            <p className="text-base text-muted-foreground mb-6 max-w-sm mx-auto">
              Thêm học sinh thủ công hoặc import nhanh từ file CSV/TXT
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import từ file
              </Button>

            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
          <div className="flex items-center justify-between mb-4 gap-3">
            <TabsList>
              <TabsTrigger value="students" className="gap-2">
                <Users className="w-4 h-4" />
                Học sinh ({filteredStudents.length})
              </TabsTrigger>
              <TabsTrigger value="parents" className="gap-2">
                <User className="w-4 h-4" />
                Phụ huynh ({parentsData.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="students">
            {filteredStudents.length === 0 ? (
              <Card className="border border-border">
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    Không tìm thấy học sinh nào với từ khóa "{searchQuery}"
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead className="text-sm font-bold uppercase tracking-wider">Học sinh</TableHead>
                      <TableHead className="text-center text-sm font-bold uppercase tracking-wider">Giới tính</TableHead>


                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => (
                      <TableRow 
                        key={student.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-center font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-eco-green flex items-center justify-center text-white font-bold text-base">
                              {student.student_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-base text-foreground">{student.student_name}</p>
                              <p className="text-xs text-muted-foreground font-medium">{student.student_code}</p>
                              {student.parent_name && (
                                <button 
                                  onClick={() => handleParentClick(student.id)}
                                  className="text-sm text-eco-green hover:underline cursor-pointer font-medium"
                                >
                                  PH: {student.parent_name}
                                </button>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge variant="outline" className={cn(
                            "text-sm font-medium",
                            student.gender === 'male' && "border-blue-500/50 text-blue-600 bg-blue-50 dark:bg-blue-950/30",
                            student.gender === 'female' && "border-pink-500/50 text-pink-600 bg-pink-50 dark:bg-pink-950/30",
                            student.gender === 'other' && "border-gray-500/50 text-gray-600"
                          )}>
                            {student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Khác'}
                          </Badge>
                        </TableCell>


                        <TableCell className="text-center">
                          <Badge 
                            variant={student.status === 'active' ? 'default' : 'secondary'}
                            className={cn(
                              student.status === 'active' 
                                ? "bg-eco-green/10 text-eco-green border-eco-green/30 hover:bg-eco-green/20" 
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {student.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(student)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              {onToggleStudentStatus && (
                                <DropdownMenuItem 
                                  onClick={() => onToggleStudentStatus(student.id, student.status)}
                                  className={cn(
                                    student.status === 'active' 
                                      ? "text-orange-600 focus:text-orange-600" 
                                      : "text-eco-green focus:text-eco-green"
                                  )}
                                >
                                  {student.status === 'active' ? (
                                    <>
                                      <Ban className="w-4 h-4 mr-2" />
                                      Vô hiệu hóa
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Kích hoạt
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => setStudentToDelete(student)}
                                className="text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa học sinh
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="parents">
            {parentsData.length === 0 ? (
              <Card className="border border-border">
                <CardContent className="p-8 text-center">
                  <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    Chưa có thông tin phụ huynh nào
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Phụ huynh</TableHead>
                      <TableHead>Học sinh</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Phone className="w-4 h-4" />
                          Số ĐT
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Mail className="w-4 h-4" />
                          Email
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parentsData.map((parent, index) => (
                      <TableRow 
                        key={parent.id}
                        className={cn(
                          "group hover:bg-muted/30 transition-all",
                          highlightedParentId === parent.studentId && "bg-eco-green/10 animate-pulse"
                        )}
                      >
                        <TableCell className="text-center font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-eco-green/20 flex items-center justify-center text-eco-green font-bold text-base">
                              {parent.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-semibold text-base">{parent.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-eco-green/50 text-eco-green bg-eco-green/10">
                            {parent.studentName}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {parent.phone ? (
                            <a href={`tel:${parent.phone}`} className="text-base text-eco-green hover:underline font-medium">
                              {parent.phone}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {parent.email ? (
                            <a href={`mailto:${parent.email}`} className="text-base text-eco-green hover:underline font-medium">
                              {parent.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Add/Edit Dialogs */}


      <StudentFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingStudentId(null);
        }}
        isEditing={true}
        form={studentForm}
        onFormChange={setStudentForm}
        onSubmit={handleUpdateStudent}
      />

      {/* Email Preview Dialog */}
      {emailPreviewData && (
        <EmailPreviewDialog
          isOpen={!!emailPreviewData}
          onClose={() => {
            setEmailPreviewData(null);
          }}
          parent={emailPreviewData.parent}
          student={emailPreviewData.student}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!studentToDelete} 
        onOpenChange={(open) => !open && setStudentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa học sinh?</AlertDialogTitle>
            <AlertDialogDescription>
              Tất cả dữ liệu của học sinh <span className="font-bold text-foreground">"{studentToDelete?.student_name}"</span> sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (studentToDelete) {
                  onDeleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
