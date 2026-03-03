import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
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
import { Progress } from "@/shared/components/ui/progress";
import { 
  ArrowLeft,
  Upload, 
  UserPlus,
  Users,
  Target,
  Trophy,
  GraduationCap,
  FileSpreadsheet,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Coins,
  Flame,
  Recycle,
  Phone,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  SendHorizonal,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { StudentFormDialog } from "./StudentFormDialog";
import { EmailPreviewDialog } from "./EmailPreviewDialog";

const initialStudentForm = {
  student_name: '',
  student_code: '',
  student_password: '',
  date_of_birth: '',
  gender: 'other',
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
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onImportStudents,
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [highlightedParentId, setHighlightedParentId] = useState(null);

  // State for showing/hiding passwords
  const [showStudentPasswords, setShowStudentPasswords] = useState({});
  const [showParentPasswords, setShowParentPasswords] = useState({});

  // Email sending state
  const [emailPreviewData, setEmailPreviewData] = useState(null); // { parent, student }
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [sentEmails, setSentEmails] = useState(new Set());

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

  const toggleStudentPassword = (studentId) => {
    setShowStudentPasswords(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const toggleParentPassword = (parentId) => {
    setShowParentPasswords(prev => ({ ...prev, [parentId]: !prev[parentId] }));
  };

  const handleParentClick = (studentId) => {
    setActiveTab('parents');
    setHighlightedParentId(studentId);
    setTimeout(() => setHighlightedParentId(null), 2000);
  };

  const openEmailPreview = (parent, student) => {
    setEmailPreviewData({ parent, student });
  };

  const handleSendAllEmails = async () => {
    const withEmail = parentsData.filter(p => p.email);
    if (withEmail.length === 0) {
      toast.error('Không có phụ huynh nào có email để gửi');
      return;
    }
    setIsSendingAll(true);
    const newSent = new Set(sentEmails);
    for (const parent of withEmail) {
      await new Promise(r => setTimeout(r, 400));
      newSent.add(parent.id);
      setSentEmails(new Set(newSent));
    }
    setIsSendingAll(false);
    toast.success(`Đã gửi email đến ${withEmail.length} phụ huynh`);
  };

  const handleAddStudent = async () => {
    const success = await onAddStudent(studentForm);
    if (success) {
      setStudentForm(initialStudentForm);
      setIsAddDialogOpen(false);
    }
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-eco-blue to-eco-green flex items-center justify-center shadow-lg shadow-eco-blue/20">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lớp {selectedClass.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Khối {selectedClass.grade} • GV: {selectedClass.teacher_name || 'Chưa phân công'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            className="bg-eco-green hover:bg-eco-green/90 text-white font-semibold shadow-lg shadow-eco-green/20"
            onClick={() => {
              setStudentForm(initialStudentForm);
              setIsAddDialogOpen(true);
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Thêm học sinh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-eco-green/20 hover:border-eco-green/40 transition-all hover:shadow-lg hover:-translate-y-0.5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-eco-green/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-eco-green" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-xs text-muted-foreground">Học sinh</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-eco-blue/20 hover:border-eco-blue/40 transition-all hover:shadow-lg hover:-translate-y-0.5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-eco-blue/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-eco-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">{selectedClass.avg_accuracy || 0}%</p>
                <p className="text-xs text-muted-foreground">Độ chính xác</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-eco-leaf/20 hover:border-eco-leaf/40 transition-all hover:shadow-lg hover:-translate-y-0.5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-eco-leaf/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-eco-leaf" />
              </div>
              <div>
                <p className="text-2xl font-bold">{selectedClass.total_items || 0}</p>
                <p className="text-xs text-muted-foreground">Rác phân loại</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-eco-orange/20 hover:border-eco-orange/40 transition-all hover:shadow-lg hover:-translate-y-0.5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-eco-orange/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-eco-orange" />
              </div>
              <div>
                <p className="text-sm font-bold truncate">{selectedClass.top_student || '-'}</p>
                <p className="text-xs text-muted-foreground">Top 1</p>
              </div>
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
            <h3 className="text-xl font-semibold mb-2">Chưa có học sinh nào</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Thêm học sinh thủ công hoặc import nhanh từ file CSV/TXT
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import từ file
              </Button>
              <Button 
                className="bg-eco-green hover:bg-eco-green/90"
                onClick={() => {
                  setStudentForm(initialStudentForm);
                  setIsAddDialogOpen(true);
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Thêm học sinh
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
            {activeTab === 'parents' && parentsData.length > 0 && (
              <Button
                size="sm"
                className="bg-eco-blue hover:bg-eco-blue/90 shadow-md"
                onClick={handleSendAllEmails}
                disabled={isSendingAll}
              >
                {isSendingAll ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Đang gửi...</>
                ) : (
                  <><SendHorizonal className="w-3.5 h-3.5 mr-1.5" /> Gửi tất cả ({parentsData.filter(p => p.email).length})</>
                )}
              </Button>
            )}
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
                      <TableHead>Học sinh</TableHead>
                      <TableHead className="text-center">Tên đăng nhập</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Lock className="w-4 h-4" />
                          Mật khẩu
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Giới tính</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Recycle className="w-4 h-4" />
                          Rác
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Target className="w-4 h-4" />
                          Độ chính xác
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Coins className="w-4 h-4" />
                          Coins
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Flame className="w-4 h-4" />
                          Streak
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Level</TableHead>
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
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-eco-green to-eco-blue flex items-center justify-center text-white font-semibold text-sm">
                              {student.student_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{student.student_name}</p>
                              {student.parent_name && (
                                <button 
                                  onClick={() => handleParentClick(student.id)}
                                  className="text-xs text-eco-blue hover:underline cursor-pointer"
                                >
                                  PH: {student.parent_name}
                                </button>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-mono text-sm text-muted-foreground">
                            {student.student_username || student.student_code || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-mono text-sm text-muted-foreground">
                              {student.student_password 
                                ? (showStudentPasswords[student.id] ? student.student_password : '••••••')
                                : '-'
                              }
                            </span>
                            {student.student_password && (
                              <button 
                                onClick={() => toggleStudentPassword(student.id)}
                                className="p-1 hover:bg-muted rounded"
                              >
                                {showStudentPasswords[student.id] 
                                  ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                                  : <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                }
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            student.gender === 'male' && "border-blue-500/50 text-blue-600 bg-blue-50 dark:bg-blue-950/30",
                            student.gender === 'female' && "border-pink-500/50 text-pink-600 bg-pink-50 dark:bg-pink-950/30",
                            student.gender === 'other' && "border-gray-500/50 text-gray-600"
                          )}>
                            {student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Khác'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-eco-leaf">{student.items_sorted}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  student.accuracy >= 80 ? "bg-eco-green" :
                                  student.accuracy >= 60 ? "bg-eco-orange" : "bg-red-500"
                                )}
                                style={{ width: `${student.accuracy}%` }}
                              />
                            </div>
                            <span className={cn(
                              "font-semibold text-sm",
                              student.accuracy >= 80 ? "text-eco-green" :
                              student.accuracy >= 60 ? "text-eco-orange" : "text-red-500"
                            )}>
                              {student.accuracy}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-eco-orange">{(student.coins ?? 0).toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Flame className={cn(
                              "w-4 h-4",
                              student.streak >= 7 ? "text-orange-500" : "text-muted-foreground"
                            )} />
                            <span className="font-semibold">{student.streak}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-eco-blue/10 text-eco-blue border-eco-blue/30 hover:bg-eco-blue/20">
                            Lv.{student.level}
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
                              <DropdownMenuItem 
                                onClick={() => onDeleteStudent(student.id)}
                                className="text-destructive focus:text-destructive"
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
                      <TableHead className="text-center">Tên đăng nhập</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Lock className="w-4 h-4" />
                          Mật khẩu
                        </div>
                      </TableHead>
                      <TableHead className="w-28 text-center">Email TK</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parentsData.map((parent, index) => (
                      <TableRow 
                        key={parent.id}
                        className={cn(
                          "group hover:bg-muted/30 transition-all",
                          highlightedParentId === parent.studentId && "bg-eco-blue/10 animate-pulse"
                        )}
                      >
                        <TableCell className="text-center font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-eco-orange to-eco-leaf flex items-center justify-center text-white font-semibold text-sm">
                              {parent.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-medium">{parent.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-eco-green/50 text-eco-green bg-eco-green/10">
                            {parent.studentName}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {parent.phone ? (
                            <a href={`tel:${parent.phone}`} className="text-eco-blue hover:underline">
                              {parent.phone}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {parent.email ? (
                            <a href={`mailto:${parent.email}`} className="text-eco-blue hover:underline">
                              {parent.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-mono text-sm text-muted-foreground">
                            {parent.username || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-mono text-sm text-muted-foreground">
                              {parent.password 
                                ? (showParentPasswords[parent.id] ? parent.password : '••••••')
                                : '-'
                              }
                            </span>
                            {parent.password && (
                              <button 
                                onClick={() => toggleParentPassword(parent.id)}
                                className="p-1 hover:bg-muted rounded"
                              >
                                {showParentPasswords[parent.id] 
                                  ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                                  : <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                }
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {sentEmails.has(parent.id) ? (
                            <div className="flex items-center justify-center gap-1 text-eco-green text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Đã gửi
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className={cn(
                                "h-7 px-2 text-xs gap-1",
                                parent.email
                                  ? "text-eco-blue hover:bg-eco-blue/10"
                                  : "text-muted-foreground cursor-not-allowed opacity-50"
                              )}
                              onClick={() => parent.email && openEmailPreview(parent, parent.student)}
                              disabled={!parent.email}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Gửi
                            </Button>
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
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        isEditing={false}
        form={studentForm}
        onFormChange={setStudentForm}
        onSubmit={handleAddStudent}
      />

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
            if (emailPreviewData?.parent) {
              setSentEmails(prev => new Set([...prev, emailPreviewData.parent.id]));
            }
          }}
          parent={emailPreviewData.parent}
          student={emailPreviewData.student}
        />
      )}
    </div>
  );
}