import { useState, useRef, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ChevronRight,
  GraduationCap,
  Users,
  Layers,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { read, utils } from 'xlsx';

// ── CSV Parser ────────────────────────────────────────────────────────────────

const HEADERS = [
  'student_name', 'class_name', 'grade', 'date_of_birth',
  'gender', 'address', 'parent_name', 'parent_phone', 'parent_email'
];

const HEADER_ALIASES = {
  'student full name': 'student_name',
  'class name': 'class_name',
  'grade level': 'grade',
  'date of birth': 'date_of_birth',
  'gender': 'gender',
  'address': 'address',
  'parent full name': 'parent_name',
  'parent phone number': 'parent_phone',
  'parent email': 'parent_email',
  'khối': 'grade', 'khoi': 'grade',
  'lớp': 'class_name', 'lop': 'class_name', 'class': 'class_name',
  'tên học sinh': 'student_name', 'ten_hoc_sinh': 'student_name', 'họ tên': 'student_name', 'hoten': 'student_name',
  'ngày sinh': 'date_of_birth', 'ngay_sinh': 'date_of_birth', 'dob': 'date_of_birth',
  'giới tính': 'gender', 'gioi_tinh': 'gender',
  'tên phụ huynh': 'parent_name', 'ten_phu_huynh': 'parent_name', 'phụ huynh': 'parent_name',
  'sdt phụ huynh': 'parent_phone', 'sdt_phu_huynh': 'parent_phone', 'sđt': 'parent_phone', 'điện thoại': 'parent_phone',
  'email phụ huynh': 'parent_email', 'email_phu_huynh': 'parent_email', 'email': 'parent_email',
  'địa chỉ': 'address', 'dia_chi': 'address',
};

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];

  // Detect if first line is header
  const firstLine = lines[0].split(',').map(s => s.trim().toLowerCase());
  const hasHeader = firstLine.some(h => HEADER_ALIASES[h]);

  let headers = [];
  let startIdx = 0;

  if (hasHeader) {
    headers = firstLine.map(h => HEADER_ALIASES[h] || h);
    startIdx = 1;
  } else {
    // Assume positional order
    headers = HEADERS;
  }

  return lines.slice(startIdx).map(line => {
    const parts = line.split(',').map(s => s.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = parts[i] || ''; });
    return {
      grade: row.grade || row.khoi || '',
      class_name: row.class_name || row.lop || '',
      student_name: row.student_name || row.ten_hoc_sinh || '',
      date_of_birth: row.date_of_birth || row.ngay_sinh || '',
      gender: row.gender || row.gioi_tinh || '',
      parent_name: row.parent_name || row.ten_phu_huynh || '',
      parent_phone: row.parent_phone || row.sdt_phu_huynh || '',
      parent_email: row.parent_email || row.email_phu_huynh || '',
      address: row.address || row.dia_chi || '',
    };
  }).filter(r => r.student_name);
}

// Ensure row data matches our needed keys from JSON array representation
function parseExcelData(jsonRows) {
  if (!jsonRows || jsonRows.length === 0) return [];
  
  // Find headers format
  const rawHeaders = Object.keys(jsonRows[0] || {});
  
  // Create a mapping from raw header to our canonical header
  const headerMap = {};
  for (const h of rawHeaders) {
    const canonical = HEADER_ALIASES[h.trim().toLowerCase()] || h;
    headerMap[h] = canonical;
  }

  return jsonRows.map(row => {
    const normalized = {};
    for (const [rawH, val] of Object.entries(row)) {
      if (val !== undefined && val !== null) {
         normalized[headerMap[rawH]] = String(val).trim();
      }
    }
    return {
      grade: normalized.grade || normalized.khoi || '',
      class_name: normalized.class_name || normalized.lop || '',
      student_name: normalized.student_name || normalized.ten_hoc_sinh || '',
      date_of_birth: normalized.date_of_birth || normalized.ngay_sinh || '',
      gender: normalized.gender || normalized.gioi_tinh || '',
      parent_name: normalized.parent_name || normalized.ten_phu_huynh || '',
      parent_phone: normalized.parent_phone || normalized.sdt_phu_huynh || '',
      parent_email: normalized.parent_email || normalized.email_phu_huynh || '',
      address: normalized.address || normalized.dia_chi || '',
    };
  }).filter(r => r.student_name);
}

// ── Sample Excel/CSV ────────────────────────────────────────────────────────────────

const SAMPLE_CSV = `Student Full Name,Class Name,Grade Level,Date of Birth,Gender,Address,Parent Full Name,Parent Phone Number,Parent Email
Nguyễn Hoàng Nhật Ân,A1,1,2014-08-10,Male,8 Dương Văn Cam,Nguyễn Văn Quốc,0905324995,nguyenhoangnhatan31@gmail.com
Trần Minh Khang,A1,1,2014-05-22,Male,Lương Định Của,Nguyễn Văn Hùng,0987654321,hung@gmail.com
Lê Thảo Nguyên,B2,2,2013-11-03,Female,Nguyễn Trãi,Lê Thanh Bình,0901122334,binh@gmail.com`;

function downloadSampleXLSX() {
  const ws = utils.aoa_to_sheet([
    ['Student Full Name', 'Class Name', 'Grade Level', 'Date of Birth', 'Gender', 'Address', 'Parent Full Name', 'Parent Phone Number', 'Parent Email'],
    ['Nguyễn Hoàng Nhật Ân', 'A1', '1', '2014-08-10', 'Male', '8 Dương Văn Cam', 'Nguyễn Văn Quốc', '0905324995', 'nguyenhoangnhatan31@gmail.com'],
    ['Trần Minh Khang', 'A1', '1', '2014-05-22', 'Male', 'Lương Định Của', 'Nguyễn Văn Hùng', '0987654321', 'hung@gmail.com'],
    ['Lê Thảo Nguyên', 'B2', '2', '2013-11-03', 'Female', 'Nguyễn Trãi', 'Lê Thanh Bình', '0901122334', 'binh@gmail.com']
  ]);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Danh_sach_hoc_sinh");
  
  // Use XLSX's built-in file saver if available, otherwise manual download.
  import('xlsx').then(({ writeFile }) => {
     writeFile(wb, "mau_import_hoc_sinh.xlsx");
  });
}

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = ['Upload', 'Preview', 'Kết quả'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
            i < current ? 'bg-eco-green text-white' :
            i === current ? 'bg-eco-blue text-white ring-2 ring-eco-blue/30' :
            'bg-muted text-muted-foreground'
          )}>
            {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          <span className={cn(
            'text-sm font-medium hidden sm:block',
            i === current ? 'text-foreground' : 'text-muted-foreground'
          )}>{label}</span>
          {i < STEPS.length - 1 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Preview Table ─────────────────────────────────────────────────────────────

function PreviewSummary({ rows }) {
  const grades = [...new Set(rows.map(r => r.grade).filter(Boolean))];
  const classes = [...new Set(rows.map(r => `${r.grade}_${r.class_name}`).filter(r => r !== '_'))];
  const withParent = rows.filter(r => r.parent_name).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {[
        { icon: Layers, label: 'Khối', value: grades.length, color: 'eco-leaf' },
        { icon: GraduationCap, label: 'Lớp', value: classes.length, color: 'eco-green' },
        { icon: Users, label: 'Học sinh', value: rows.length, color: 'eco-orange' },
      ].map(({ icon: Icon, label, value, color }) => (
        <div key={label} className={cn(
          'flex items-center gap-2 p-3 rounded-xl border-2 bg-gradient-to-br',
          `border-${color}/20 from-${color}/5 to-transparent`
        )}>
          <div className={`w-8 h-8 rounded-lg bg-${color}/10 flex items-center justify-center`}>
            <Icon className={`w-4 h-4 text-${color}`} />
          </div>
          <div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function BulkImportDialog({ isOpen, onClose, onImport }) {
  const [step, setStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const reset = () => {
    setStep(0);
    setParsedRows([]);
    setFileName('');
    setSelectedFile(null);
    setIsImporting(false);
    setImportResult(null);
    setImportError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processFile = useCallback((file) => {
    if (!file) return;
    setImportError('');

    const allowed = ['.csv', '.txt', '.xlsx', '.xls'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setImportError('Chỉ hỗ trợ file Excel (.xlsx, .xls) hoặc CSV/TXT');
      return;
    }

    setFileName(file.name);
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      let rows = [];
      try {
        if (ext === '.csv' || ext === '.txt') {
          // If the data is read as ArrayBuffer (for unified excel/csv reading below), we decode to string first.
          // In JS, readAsText is simpler for CSV, but readAsArrayBuffer is best for Excel.
          // We will use readAsArrayBuffer for both and let SheetJS handle them or decode CSV to string ourselves.
          const text = new TextDecoder("utf-8").decode(data);
          rows = parseCSV(text);
        } else {
          // Read Excel file
          const wb = read(data, { type: 'array' });
          const firstSheetName = wb.SheetNames[0];
          const ws = wb.Sheets[firstSheetName];
          const jsonRows = utils.sheet_to_json(ws, { defval: "" }); // Convert sheet to JSON array
          rows = parseExcelData(jsonRows);
        }
        
        if (rows.length === 0) {
          setImportError('Không tìm thấy dữ liệu hợp lệ trong file. Hãy kiểm tra lại định dạng.');
          return;
        }
        setParsedRows(rows);
        setStep(1);
      } catch (err) {
        setImportError('Đã xảy ra lỗi khi đọc file. Vui lòng kiểm tra lại định dạng file.');
        console.error("File parse error:", err);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileChange = (e) => processFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const result = await onImport(selectedFile, parsedRows);
      setImportResult(result);
      setStep(2);
    } catch (err) {
      toast.error('Đã xảy ra lỗi trong quá trình import');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden" style={{ maxHeight: '85vh' }}>
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-eco-blue to-eco-green flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold">Import hàng loạt</p>
              <p className="text-xs text-muted-foreground font-normal">Tạo khối · lớp · học sinh · phụ huynh từ 1 file</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 pb-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
        <StepIndicator current={step} />

        {/* ── Step 0: Upload ── */}
        {step === 0 && (
          <div className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              className={cn(
                'relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                isDragging
                  ? 'border-eco-blue bg-eco-blue/5 scale-[1.01]'
                  : 'border-muted-foreground/25 hover:border-eco-blue/50 hover:bg-muted/20'
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-14 h-14 mx-auto rounded-xl bg-muted/80 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold mb-0.5">
                {isDragging ? 'Thả file vào đây' : 'Kéo & thả file hoặc click để chọn'}
              </p>
              <p className="text-xs text-muted-foreground">Hỗ trợ: Excel (.xlsx), CSV, TXT</p>
            </div>

            {importError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {importError}
              </div>
            )}

            {/* Format Guide */}
            <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1.5">
              <p className="text-xs font-semibold flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-eco-blue" />
                Định dạng file Excel / CSV
              </p>
              <div className="overflow-x-auto">
                <code className="text-xs text-muted-foreground whitespace-pre block leading-relaxed">
{`Student Full Name,Class Name,Grade Level,Date of Birth,Gender,Address,Parent Full Name,Parent Phone Number,Parent Email
Nguyễn Hoàng Nhật Ân,A1,1,2014-08-10,Male,8 Dương Văn Cam,Nguyễn Văn Quốc,0905324995,nguyenhoangnhatan31@gmail.com`}
                </code>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-eco-blue/30 hover:bg-eco-blue/10 text-eco-blue"
                onClick={(e) => { e.stopPropagation(); downloadSampleXLSX(); }}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Tải file Excel mẫu
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
              * Tài khoản HS và PH sẽ được tự động tạo sau khi import
            </p>
          </div>
        )}

        {/* ── Step 1: Preview ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-eco-green" />
                <span className="text-sm font-medium">{fileName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-xs"
                onClick={() => { setParsedRows([]); setFileName(''); setStep(0); }}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Đổi file
              </Button>
            </div>

            <PreviewSummary rows={parsedRows} />

            {/* Preview Table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-xs w-8">#</TableHead>
                      <TableHead className="text-xs">Lớp</TableHead>
                      <TableHead className="text-xs">Học sinh</TableHead>
                      <TableHead className="text-xs">Phụ huynh</TableHead>
                      <TableHead className="text-xs">Email PH</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.slice(0, 50).map((row, i) => (
                      <TableRow key={i} className="text-xs hover:bg-muted/20">
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          <span className="font-medium">
                            Khối {row.grade} — {row.class_name}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{row.student_name}</TableCell>
                        <TableCell className="text-muted-foreground">{row.parent_name || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{row.parent_email || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {parsedRows.length > 50 && (
                <div className="py-2 text-center text-xs text-muted-foreground bg-muted/30 border-t">
                  ... và {parsedRows.length - 50} học sinh khác
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-eco-blue to-eco-green hover:opacity-90 shadow-lg"
                onClick={handleImport}
                disabled={isImporting}
              >
                {isImporting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tạo...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Tạo tất cả ({parsedRows.length} học sinh)</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Result ── */}
        {step === 2 && importResult && (
          <div className="space-y-5 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-eco-green/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-eco-green" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Import thành công! 🎉</h3>
              <p className="text-muted-foreground text-sm">Toàn bộ dữ liệu đã được tạo và tài khoản đã được cấp phát</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Lớp mới', value: importResult.createdClasses.length, icon: GraduationCap, color: 'eco-green' },
                { label: 'Học sinh', value: importResult.createdStudents, icon: Users, color: 'eco-leaf' },
                { label: 'Phụ huynh', value: importResult.createdStudents, icon: Users, color: 'eco-orange' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="p-3 rounded-xl bg-muted/40 border border-border text-center">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-eco-green/5 border border-eco-green/20 text-sm text-eco-green text-left flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Tài khoản học sinh và phụ huynh đã được tự động tạo. Bạn có thể xem và gửi thông tin về email phụ huynh trong trang chi tiết lớp.</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Đóng
              </Button>
              <Button
                className="flex-1 bg-eco-green hover:bg-eco-green/90"
                onClick={handleClose}
              >
                <Users className="w-4 h-4 mr-2" />
                Xem danh sách lớp
              </Button>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
