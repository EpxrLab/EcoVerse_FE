import { useState, useMemo } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Users,
  Search,
  Mail,
  Phone,
  SendHorizonal,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  MailCheck,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { EmailPreviewDialog } from './EmailPreviewDialog';
import { classesService } from '@/roles/school/features/classes/services/classes.service';

const PAGE_SIZE = 15;

export function SchoolAccountsView({ allStudents, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Email state
  const [emailPreviewData, setEmailPreviewData] = useState(null);
  const [isSendingAll, setIsSendingAll] = useState(false);

  // Unique classes for filter
  const allClasses = useMemo(() => {
    const seen = new Set();
    return allStudents
      .map(s => ({ grade: String(s.grade), className: s.className }))
      .filter(c => {
        const key = `${c.grade}_${c.className}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(c => ({
        grade: c.grade,
        className: c.className,
        value: `${c.grade}_${c.className}`,
        label: `${c.grade}${c.className}`
      }))
      .sort((a, b) => parseInt(a.grade) - parseInt(b.grade) || a.className.localeCompare(b.className));
  }, [allStudents]);

  // Filtered
  const filteredStudents = useMemo(() => {
    return allStudents.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        s.student_name.toLowerCase().includes(q) ||
        s.student_code?.toLowerCase().includes(q) ||
        s.student_username?.toLowerCase().includes(q) ||
        s.parent_name?.toLowerCase().includes(q) ||
        s.parent_email?.toLowerCase().includes(q);
      const matchGrade = filterGrade === 'all' || String(s.grade) === filterGrade;
      const matchClass = filterClass === 'all' || `${s.grade}_${s.className}` === filterClass;
      return matchSearch && matchGrade && matchClass;
    });
  }, [allStudents, searchQuery, filterGrade, filterClass]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset page on filter change
  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setCurrentPage(1);
  };

  // Parents with email count
  const parentsWithEmail = useMemo(() => {
    const seen = new Set();
    return allStudents.filter(s => {
      if (!s.parent_email) return false;
      const key = s.parent_email;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allStudents]);

  // Count emails sent using credentialEmailSent from API
  const sentEmailsCount = useMemo(() => {
    return allStudents.filter(s => s.credentialEmailSent === true).length;
  }, [allStudents]);

  const gradeOptions = [...new Set(allStudents.map(s => s.grade))].sort((a, b) => a - b);



  // Batch send
  const handleSendAll = async () => {
    // Filter only parents that haven't been sent yet
    const parentsToSend = parentsWithEmail.filter(s => !s.credentialEmailSent);
    
    if (parentsToSend.length === 0) {
      toast.info('Tất cả phụ huynh đã được gửi email');
      return;
    }
    
    setIsSendingAll(true);
    try {
      // Bulk send uses /school/send-credentials (backend handles all students)
      await classesService.sendCredentials();
      
      toast.success("Hệ thống đang tiến hành gửi email cho tất cả phụ huynh");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Bulk email error:", error);
      toast.error("Không thể kích hoạt gửi email hàng loạt");
    } finally {
      setIsSendingAll(false);
    }
  };

  if (allStudents.length === 0) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/20">
        <CardContent className="p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Users className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-base mb-1">Chưa có tài khoản nào</h3>
          <p className="text-sm text-muted-foreground">Import học sinh để xem danh sách tài khoản</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Card className="border border-eco-green/20 bg-eco-green/[0.02] shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-eco-green/10 flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5 text-eco-green" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{allStudents.length}</p>
              <p className="text-[11px] text-muted-foreground font-semibold mt-1">Học sinh</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-eco-green/20 bg-eco-green/[0.02] shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-eco-green/10 flex items-center justify-center shrink-0">
              <UserCheck className="w-4.5 h-4.5 text-eco-green" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{parentsWithEmail.length}</p>
              <p className="text-[11px] text-muted-foreground font-semibold mt-1">Phụ huynh có email</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-eco-green/20 bg-eco-green/[0.02] shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-eco-green/10 flex items-center justify-center shrink-0">
              <Mail className="w-4.5 h-4.5 text-eco-green" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{filteredStudents.length}</p>
              <p className="text-[11px] text-muted-foreground font-semibold mt-1">Đang hiển thị</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-eco-green/20 bg-eco-green/[0.02] shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-eco-green/10 flex items-center justify-center shrink-0">
              <MailCheck className="w-4.5 h-4.5 text-eco-green" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{sentEmailsCount}</p>
              <p className="text-[11px] text-muted-foreground font-semibold mt-1">Đã gửi email</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters + Send All */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm tên, mã HS, email..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={filterGrade} onValueChange={handleFilterChange(setFilterGrade)}>
          <SelectTrigger className="w-[110px] h-9 text-sm">
            <SelectValue placeholder="Khối" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khối</SelectItem>
            {gradeOptions.map(g => (
              <SelectItem key={g} value={String(g)}>Khối {g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterClass} onValueChange={handleFilterChange(setFilterClass)}>
          <SelectTrigger className="w-[110px] h-9 text-sm">
            <SelectValue placeholder="Lớp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lớp</SelectItem>
            {allClasses
              .filter(c => filterGrade === 'all' || c.grade === filterGrade)
              .map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="h-9 ml-auto bg-eco-green hover:bg-eco-green/90 shadow-sm font-medium text-sm gap-1.5"
          onClick={handleSendAll}
          disabled={isSendingAll || parentsWithEmail.filter(s => !s.credentialEmailSent).length === 0}
        >
          {isSendingAll ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang gửi...</>
          ) : (
            <><SendHorizonal className="w-3.5 h-3.5" /> Gửi tất cả ({parentsWithEmail.filter(s => !s.credentialEmailSent).length})</>
          )}
        </Button>
      </div>

      {/* ── Unified Table ── */}
      <Card className="overflow-hidden border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-12 text-center text-[11px] font-bold text-muted-foreground/80 uppercase tracking-tight">#</TableHead>
                <TableHead className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-tight">Học sinh</TableHead>
                <TableHead className="text-center text-[11px] font-bold text-muted-foreground/80 uppercase tracking-tight">Lớp</TableHead>
                <TableHead className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-tight">Phụ huynh</TableHead>
                <TableHead className="text-center text-[11px] font-bold text-muted-foreground/80 uppercase tracking-tight">Email PH</TableHead>
                <TableHead className="w-24 text-center text-[11px] font-bold text-muted-foreground/80 uppercase tracking-tight">Gửi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((s, i) => {
                const globalIndex = (currentPage - 1) * PAGE_SIZE + i + 1;
                return (
                  <TableRow key={s.id} className="hover:bg-muted/20 group">
                    {/* # */}
                    <TableCell className="text-center text-[11px] font-medium text-muted-foreground/50">{globalIndex}</TableCell>

                    {/* Student name */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-eco-green/10 flex items-center justify-center text-eco-green text-xs font-bold shrink-0">
                          {s.student_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-base leading-tight">{s.student_name}</p>
                          <p className="text-xs text-muted-foreground font-medium">{s.student_code}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Class */}
                    <TableCell className="text-center">
                      <Badge variant="outline" className="border-eco-green/30 text-eco-green bg-eco-green/5 text-sm font-medium">
                        {s.grade}{s.className}
                      </Badge>
                    </TableCell>


                    {/* Parent name + phone */}
                    <TableCell>
                      {s.parent_name ? (
                        <div>
                          <p className="text-base font-semibold leading-tight">{s.parent_name}</p>
                          {s.parent_phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium mt-0.5">
                              <Phone className="w-3 h-3" /> {s.parent_phone}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>


                    {/* Parent email */}
                    <TableCell className="text-center">
                      {s.parent_email ? (
                        <span className="text-sm text-eco-green font-medium">{s.parent_email}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Send button */}
                    <TableCell className="text-center">
                      {s.credentialEmailSent ? (
                        <span className="inline-flex items-center gap-1 text-eco-green text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã gửi
                        </span>
                      ) : s.parent_email ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-3 text-xs gap-1.5 text-eco-green hover:bg-eco-green/10 rounded font-bold"
                          onClick={() => setEmailPreviewData({
                            parent: {
                              id: s.id,
                              name: s.parent_name,
                              email: s.parent_email,
                              phone: s.parent_phone,
                              username: s.parent_username,
                              password: s.parent_password,
                            },
                            student: s,
                          })}
                        >
                          <Mail className="w-3 h-3" /> Gửi
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Trang {currentPage}/{totalPages} · {filteredStudents.length} kết quả
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'h-7 w-7 p-0 text-xs',
                      page === currentPage && 'bg-eco-green hover:bg-eco-green/90 text-white'
                    )}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Email Preview Dialog */}
      {emailPreviewData && (
        <EmailPreviewDialog
          isOpen={!!emailPreviewData}
          onClose={() => {
            setEmailPreviewData(null);
          }}
          onSent={() => {
            // Refresh data after sending to get updated credentialEmailSent status
            if (onRefresh) {
              onRefresh();
            }
          }}
          parent={emailPreviewData.parent}
          student={emailPreviewData.student}
        />
      )}
    </div>
  );
}
