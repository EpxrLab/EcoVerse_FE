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
  ArrowLeft,
  FileQuestion,
  Trophy,
  Layout,
  FileUp
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { read, utils } from 'xlsx';

const HEADER_ALIASES = {
  'quiz_title': 'quiz_title', 'tên quiz': 'quiz_title', 'ten_quiz': 'quiz_title',
  'description': 'description', 'mô tả': 'description', 'mo_ta': 'description',
  'difficulty': 'difficulty', 'độ khó': 'difficulty', 'do_kho': 'difficulty',
  'quiz_type': 'quiz_type', 'loại quiz': 'quiz_type', 'loai_quiz': 'quiz_type',
  'question_order': 'question_order', 'thứ tự câu hỏi': 'question_order', 'thu_tu_cau_hoi': 'question_order',
  'question_text': 'question_text', 'nội dung câu hỏi': 'question_text', 'noi_dung_cau_hoi': 'question_text',
  'answer_a': 'answer_A', 'đáp án a': 'answer_A', 'dap_an_a': 'answer_A', 'answer_A': 'answer_A',
  'answer_b': 'answer_B', 'đáp án b': 'answer_B', 'dap_an_b': 'answer_B', 'answer_B': 'answer_B',
  'answer_c': 'answer_C', 'đáp án c': 'answer_C', 'dap_an_c': 'answer_C', 'answer_C': 'answer_C',
  'answer_d': 'answer_D', 'đáp án d': 'answer_D', 'dap_an_d': 'answer_D', 'answer_D': 'answer_D',
  'correct_answer': 'correct_answer', 'đáp án đúng': 'correct_answer', 'dap_an_dung': 'correct_answer',
  'target_grade': 'target_grade', 'hạng mục lớp': 'target_grade', 'hang_muc_lop': 'target_grade',
  'coins_on_pass': 'coins_on_pass', 'điểm thưởng': 'coins_on_pass', 'diem_thuong': 'coins_on_pass',
  'time_per_question': 'time_per_question', 'thời gian mỗi câu': 'time_per_question', 'thoi_gian_moi_cau': 'time_per_question',
  'pass_score_percentage': 'pass_score_percentage', 'điểm đạt (%)': 'pass_score_percentage', 'diem_dat_phan_tram': 'pass_score_percentage',
};

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];

  const firstLine = lines[0].split(',').map(s => s.trim().toLowerCase());
  const headers = firstLine.map(h => HEADER_ALIASES[h] || h);

  return lines.slice(1).map(line => {
    const parts = line.split(',').map(s => s.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = parts[i] || ''; });
    return row;
  }).filter(r => r.quiz_title || r.question_text);
}

function parseExcelData(jsonRows) {
  if (!jsonRows || jsonRows.length === 0) return [];
  
  const rawHeaders = Object.keys(jsonRows[0] || {});
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
    return normalized;
  }).filter(r => r.quiz_title || r.question_text);
}

function downloadSampleQuizXLSX() {
  const ws = utils.aoa_to_sheet([
    ['quiz_title', 'description', 'difficulty', 'target_grade', 'quiz_type', 'question_order', 'question_text', 'answer_A', 'answer_B', 'answer_C', 'answer_D', 'correct_answer', 'coins_on_pass', 'time_per_question', 'pass_score_percentage'],
    ['Phân loại rác', 'Quiz về môi trường', 'EASY', '5', 'MULTIPLE_CHOICE', '1', 'Chai nhựa thuộc loại rác nào?', 'Rác hữu cơ', 'Rác tái chế', 'Rác nguy hại', 'Rác vô cơ', 'B', '10', '30', '80'],
    ['Phân loại rác', 'Quiz về môi trường', 'EASY', '5', 'MULTIPLE_CHOICE', '2', 'Vỏ chuối thuộc loại rác nào?', 'Rác tái chế', 'Rác hữu cơ', 'Rác nguy hại', 'Rác vô cơ', 'B', '10', '30', '80'],
    ['Phân loại rác', 'Quiz về môi trường', 'EASY', '5', 'MULTIPLE_CHOICE', '3', 'Pin đã qua sử dụng thuộc loại nào?', 'Rác hữu cơ', 'Rác tái chế', 'Rác nguy hại', 'Rác vô cơ', 'C', '10', '30', '80']
  ]);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Quiz_Template");
  
  import('xlsx').then(({ writeFile }) => {
     writeFile(wb, "mau_import_quiz.xlsx");
  });
}

function StepIndicator({ current }) {
  const steps = ['Tải lên', 'Xem trước', 'Hoàn tất'];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((label, i) => (
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
          {i < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

export function ImportQuizDialog({ isOpen, onClose, onImport, isImporting, importProgress }) {
  const [step, setStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [importError, setImportError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const reset = () => {
    setStep(0);
    setParsedRows([]);
    setFileName('');
    setSelectedFile(null);
    setImportError('');
  };

  const handleClose = () => {
    if (isImporting) return;
    reset();
    onClose();
  };

  const processFile = useCallback((file) => {
    if (!file) return;
    setImportError('');

    const allowed = ['.csv', '.xlsx', '.xls'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setImportError('Chỉ hỗ trợ file Excel (.xlsx, .xls) hoặc CSV');
      return;
    }

    setFileName(file.name);
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      let rows = [];
      try {
        if (ext === '.csv') {
          const text = new TextDecoder("utf-8").decode(data);
          rows = parseCSV(text);
        } else {
          const wb = read(data, { type: 'array' });
          const firstSheetName = wb.SheetNames[0];
          const ws = wb.Sheets[firstSheetName];
          const jsonRows = utils.sheet_to_json(ws, { defval: "" });
          rows = parseExcelData(jsonRows);
        }
        
        if (rows.length === 0) {
          setImportError('Không tìm thấy dữ liệu hợp lệ trong file.');
          return;
        }
        setParsedRows(rows);
        setStep(1);
      } catch (err) {
        setImportError('Đã xảy ra lỗi khi đọc file.');
        console.error("File parse error:", err);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileChange = (e) => processFile(e.target.files?.[0]);

  const handleImport = async () => {
    try {
      await onImport(selectedFile);
      setStep(2);
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-eco-blue to-eco-green flex items-center justify-center shrink-0">
              <FileUp className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold">Import Quiz từ file</p>
              <p className="text-xs text-muted-foreground font-normal">Tạo quiz và câu hỏi hàng loạt từ file Excel/CSV</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          <div className="sticky top-0 bg-background z-10 pb-4 mb-2">
            <StepIndicator current={step} />
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div
                className={cn(
                  'relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group',
                  isDragging
                    ? 'border-eco-blue bg-eco-blue/5 scale-[1.01]'
                    : 'border-muted-foreground/25 hover:border-eco-blue/50 hover:bg-muted/20'
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files?.[0]); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/80 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <FileSpreadsheet className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-sm font-bold mb-1">
                  {isDragging ? 'Thả file vào đây' : 'Kéo & thả file hoặc click để chọn'}
                </p>
                <p className="text-xs text-muted-foreground">Hỗ trợ: Excel (.xlsx), CSV</p>
              </div>

              {importError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {importError}
                </div>
              )}

              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  <FileQuestion className="w-4 h-4 text-eco-blue" />
                  Hướng dẫn định dạng file
                </p>
                <div className="grid grid-cols-2 gap-4 text-[11px] text-muted-foreground">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Thông tin Quiz:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>quiz_title: Tiêu đề quiz</li>
                      <li>difficulty: EASY, MEDIUM, HARD</li>
                      <li>target_grade: Lớp (1-5)</li>
                      <li>quiz_type: MULTIPLE_CHOICE, TRUE_FALSE</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Câu hỏi & Đáp án:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>question_text: Nội dung câu hỏi</li>
                      <li>answer_A/B/C/D: Các lựa chọn</li>
                      <li>correct_answer: A, B, C hoặc D. (Với TRUE_FALSE: A=Đúng, B=Sai)</li>
                    </ul>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-eco-blue/30 hover:bg-eco-blue/10 text-eco-blue font-medium"
                  onClick={(e) => { e.stopPropagation(); downloadSampleQuizXLSX(); }}
                >
                  <Download className="w-3.5 h-3.5 mr-2" />
                  Tải file Excel mẫu
                </Button>
              </div>
            </div>
          )}

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
                  onClick={() => { setStep(0); }}
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Đổi file
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-xl border-2 border-eco-blue/20 bg-eco-blue/5">
                  <Layout className="w-4 h-4 text-eco-blue mb-1" />
                  <p className="text-lg font-bold">{[...new Set(parsedRows.map(r => r.quiz_title))].length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Quizzes</p>
                </div>
                <div className="p-3 rounded-xl border-2 border-eco-green/20 bg-eco-green/5">
                  <FileQuestion className="w-4 h-4 text-eco-green mb-1" />
                  <p className="text-lg font-bold">{parsedRows.length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Câu hỏi</p>
                </div>
                <div className="p-3 rounded-xl border-2 border-eco-orange/20 bg-eco-orange/5">
                  <Trophy className="w-4 h-4 text-eco-orange mb-1" />
                  <p className="text-lg font-bold">{parsedRows.reduce((acc, curr) => acc + (parseInt(curr.coins_on_pass) || 0), 0)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Eco Points</p>
                </div>
              </div>

              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10 transition-colors">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs w-8">#</TableHead>
                        <TableHead className="text-xs">Tiêu đề Quiz</TableHead>
                        <TableHead className="text-xs">Câu hỏi</TableHead>
                        <TableHead className="text-xs">Đáp án đúng</TableHead>
                        <TableHead className="text-xs">Điểm</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedRows.slice(0, 50).map((row, i) => (
                        <TableRow key={i} className="text-xs hover:bg-muted/20">
                          <TableCell className="text-muted-foreground font-medium">{i + 1}</TableCell>
                          <TableCell className="font-semibold">{row.quiz_title}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{row.question_text}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-eco-green/10 text-eco-green font-bold border border-eco-green/20">
                              {row.correct_answer}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-eco-orange font-bold">+{row.coins_on_pass}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {parsedRows.length > 50 && (
                  <div className="py-2 text-center text-xs text-muted-foreground bg-muted/30 border-t">
                    ... và {parsedRows.length - 50} dữ liệu khác
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center py-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-eco-green/10 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-eco-green" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Import thành công!</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">Tất cả bài quiz và câu hỏi đã được tạo thành công vào hệ thống của trường.</p>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer Actions */}
        <div className="px-6 py-4 border-t bg-muted/20 flex gap-3 shrink-0">
          {step === 1 && (
             <Button variant="outline" onClick={() => setStep(0)} className="flex-1" disabled={isImporting}>
               <ArrowLeft className="w-4 h-4 mr-2" />
               Quay lại
             </Button>
          )}
          
          {step === 2 ? (
            <Button
              className="w-full text-base font-semibold bg-eco-green hover:bg-eco-green-dark"
              onClick={handleClose}
            >
              Hoàn tất
            </Button>
          ) : step === 0 ? (
            <Button variant="outline" onClick={handleClose} className="flex-1">
               Thoát
            </Button>
          ) : (
            <Button
              className="flex-1 bg-gradient-to-r from-eco-blue to-eco-green hover:opacity-90 shadow-lg"
              onClick={handleImport}
              disabled={isImporting}
            >
              {isImporting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý... ({importProgress?.done || 0}%)</>
              ) : (
                <><FileUp className="w-4 h-4 mr-2" /> Import tất cả</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
