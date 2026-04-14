import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { 
  Users, 
  Flag, 
  TrendingUp, 
  BarChart3, 
  Search,
  Download,
  Target,
  Loader2,
  Calendar,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { reportService } from "../../services/report.service";
import { cn } from "@/shared/lib/utils";
import * as XLSX from "xlsx";

export default function SchoolReports() {
  const [activeTab, setActiveTab] = useState("students");
  const [studentsData, setStudentsData] = useState([]);
  const [campaignsData, setCampaignsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studentsRes, campaignsRes] = await Promise.all([
          reportService.getSchoolStudents(),
          reportService.getSchoolCampaigns()
        ]);
        setStudentsData(studentsRes.data.data || []);
        setCampaignsData(campaignsRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStudents = studentsData.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedCampaigns = campaignsData.filter(c => c.status === 'COMPLETED');
  const filteredCampaigns = completedCampaigns.filter(c => 
    c.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    const isStudents = activeTab === "students";
    const dataToExport = isStudents ? filteredStudents : filteredCampaigns;
    
    if (dataToExport.length === 0) return;

    let headers = [];
    let rows = [];

    if (isStudents) {
      headers = ["Họ tên", "Lớp", "Khối", "Độ chính xác Game (%)", "Điểm Quiz (%)", "Chiến dịch tham gia", "Tổng Coins"];
      rows = dataToExport.map(s => [
        s.fullName,
        s.className,
        s.gradeLevel,
        s.avgGameAccuracy.toFixed(2),
        s.avgQuizScore.toFixed(2),
        s.totalCampaignsJoined,
        s.totalCoins
      ]);
    } else {
      headers = ["Tên chiến dịch", "Loại", "Trạng thái", "HS tham gia", "HS hoàn thành", "Độ chính xác trung bình (%)", "Ngày bắt đầu", "Ngày kết thúc"];
      rows = dataToExport.map(c => [
        c.campaignName,
        c.campaignType === 'SCHOOL_INTERNAL' ? 'Nội bộ' : 'Đối tác',
        "Hoàn thành",
        c.studentsEnrolled,
        c.studentsCompleted,
        c.avgCombinedAccuracy.toFixed(2),
        new Date(c.startDate).toLocaleDateString('vi-VN'),
        new Date(c.endDate).toLocaleDateString('vi-VN')
      ]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, isStudents ? "Học sinh" : "Chiến dịch");
    
    XLSX.writeFile(workbook, `bao_cao_${isStudents ? 'hoc_sinh' : 'chien_dich'}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
  };

  const totalPages = Math.ceil((activeTab === "students" ? filteredStudents.length : filteredCampaigns.length) / ITEMS_PER_PAGE);
  
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-eco-green flex items-center justify-center shadow-lg shadow-eco-green/20">
            <BarChart3 className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Báo cáo chi tiết</h1>
            <p className="text-muted-foreground font-semibold">Phân tích hiệu suất học tập và chiến dịch của trường</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl border-2 border-eco-green/20 font-semibold hover:bg-eco-green/5 text-eco-green" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/50 p-2 rounded-2xl border border-border/50 backdrop-blur-sm">
          <TabsList className="bg-transparent h-12 gap-1 p-0">
            <TabsTrigger 
              value="students" 
              className="rounded-xl h-10 px-6 data-[state=active]:bg-eco-green data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-eco-green/20 font-bold transition-all"
            >
              Phân tích Học sinh
            </TabsTrigger>
            <TabsTrigger 
              value="campaigns"
              className="rounded-xl h-10 px-6 data-[state=active]:bg-eco-green data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-eco-green/20 font-bold transition-all"
            >
              Kết quả Chiến dịch
            </TabsTrigger>
          </TabsList>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={activeTab === "students" ? "Tìm theo tên, lớp..." : "Tìm tên chiến dịch..."}
              className="pl-10 h-10 rounded-xl bg-card border-none focus-visible:ring-2 focus-visible:ring-eco-green/20 shadow-inner"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <TabsContent value="students" className="mt-0 outline-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <Loader2 className="w-10 h-10 text-primary animate-spin" />
               <p className="text-muted-foreground font-medium">Đang tổng hợp dữ liệu học sinh...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div className="overflow-hidden rounded-2xl border-2 border-border/50 bg-card shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/50">
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Học sinh</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Lớp</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground text-center">Độ chính xác Game</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground text-center">Điểm Quiz</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground text-center">Chiến dịch</th>
                      <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">Tổng Coins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {paginatedStudents.map((student) => (
                      <tr key={student.studentId} className="hover:bg-muted/10 transition-colors group">
                        <td colSpan={1} className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-eco-green/10 flex items-center justify-center font-bold text-eco-green group-hover:scale-110 transition-transform">
                              {student.fullName.charAt(0)}
                            </div>
                            <span className="font-semibold text-base">{student.fullName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-semibold text-foreground">Lớp {student.gradeLevel}{student.className}</p>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-sm font-bold text-eco-green">{Math.round(student.avgGameAccuracy)}%</span>
                            <div className="w-24 h-1.5 bg-eco-green/10 rounded-full overflow-hidden">
                              <div className="h-full bg-eco-green rounded-full" style={{ width: `${student.avgGameAccuracy}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-sm font-bold text-eco-green">{Math.round(student.avgQuizScore)}%</span>
                            <div className="w-24 h-1.5 bg-eco-green/10 rounded-full overflow-hidden">
                              <div className="h-full bg-eco-green rounded-full" style={{ width: `${student.avgQuizScore}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant="secondary" className="bg-eco-green/5 text-eco-green border-eco-green/10 font-bold">
                            {student.totalCampaignsJoined} đã tham gia
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-1.5 font-bold text-foreground">
                            {student.totalCoins.toLocaleString()}
                            <div className="p-1 rounded-md bg-eco-green/10 text-eco-green">
                               <TrendingUp className="w-3 h-3" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-20 text-center text-muted-foreground">
                          Không tìm thấy dữ liệu học sinh
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0 outline-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <Loader2 className="w-10 h-10 text-primary animate-spin" />
               <p className="text-muted-foreground font-medium">Đang tổng hợp dữ liệu chiến dịch...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                 <Card className="bg-eco-green/5 border-eco-green/20 shadow-none">
                   <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-eco-green/10 flex items-center justify-center text-eco-green">
                        <Flag className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Tổng chiến dịch</p>
                        <p className="text-2xl font-bold">{completedCampaigns.length}</p>
                      </div>
                   </CardContent>
                 </Card>
                 <Card className="bg-eco-green/5 border-eco-green/20 shadow-none">
                   <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-eco-green/10 flex items-center justify-center text-eco-green">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">HS tham gia ĐTB</p>
                        <p className="text-2xl font-bold">
                          {completedCampaigns.length > 0 ? Math.round(completedCampaigns.reduce((acc, c) => acc + c.studentsEnrolled, 0) / completedCampaigns.length) : 0}
                        </p>
                      </div>
                   </CardContent>
                 </Card>
                 <Card className="bg-eco-green/5 border-eco-green/20 shadow-none">
                   <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-eco-green/10 flex items-center justify-center text-eco-green">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Độ chính xác tổng</p>
                        <p className="text-2xl font-bold">
                           {completedCampaigns.length > 0 ? (completedCampaigns.reduce((acc, c) => acc + c.avgCombinedAccuracy, 0) / completedCampaigns.length).toFixed(1) : 0}%
                        </p>
                      </div>
                   </CardContent>
                 </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {paginatedCampaigns.map((campaign) => (
                   <Card key={campaign.campaignId} className="overflow-hidden border-2 border-border/50 hover:border-primary/30 transition-all group hover:shadow-lg hover:shadow-primary/5">
                     <CardHeader className="p-5 bg-muted/20 border-b border-border/50">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                             <Badge className={cn(
                               "mb-1 font-bold",
                               campaign.campaignType === 'SCHOOL_INTERNAL' ? "bg-primary/20 text-primary border-0" : "bg-purple-100 text-purple-700 border-0"
                             )}>
                               {campaign.campaignType === 'SCHOOL_INTERNAL' ? 'Nội bộ' : 'Đối tác'}
                             </Badge>
                             <CardTitle className="text-lg font-black group-hover:text-primary transition-colors">{campaign.campaignName}</CardTitle>
                          </div>
                          <Badge variant={campaign.status === 'COMPLETED' ? 'outline' : 'default'} className={cn(
                            "rounded-lg px-2.5 py-1 font-bold uppercase text-[10px] tracking-widest",
                            campaign.status === 'COMPLETED' ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          )}>
                            {campaign.status === 'COMPLETED' ? 'Hoàn thành' : (campaign.status === 'ON_GOING' ? 'Đang diễn ra' : 'Sắp tới')}
                          </Badge>
                        </div>
                     </CardHeader>
                     <CardContent className="p-5 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/50">
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Tiến độ tham gia</p>
                              <div className="flex items-center justify-between font-bold">
                                 <span className="text-sm">{campaign.studentsEnrolled}</span>
                                 <span className="text-[10px] text-muted-foreground">/{campaign.studentsEnrolled || '?'} HS</span>
                              </div>
                              <Progress value={(campaign.studentsCompleted / (campaign.studentsEnrolled || 1)) * 100} className="h-1.5" />
                              <p className="text-[9px] text-eco-green font-bold">{campaign.studentsCompleted} hoàn thành</p>
                           </div>
                           <div className="space-y-1.5 p-3 rounded-xl bg-eco-green/5 border border-eco-green/10">
                              <p className="text-[10px] text-eco-green/70 font-bold uppercase tracking-widest">Độ chính xác TB</p>
                              <div className="flex items-center gap-2">
                                 <div className="text-2xl font-bold text-eco-green">{(campaign.avgCombinedAccuracy).toFixed(0)}<span className="text-xs ml-0.5">%</span></div>
                                 <div className="flex-1 h-3 rounded-full bg-eco-green/10 overflow-hidden">
                                     <div className="h-full bg-eco-green" style={{ width: `${campaign.avgCombinedAccuracy}%` }} />
                                 </div>
                              </div>
                              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight italic">Combined Accuracy</p>
                           </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground border-t border-border/30 pt-4">
                           <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(campaign.startDate).toLocaleDateString('vi-VN')}
                           </div>
                           <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                           <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-rose-500" />
                              {new Date(campaign.endDate).toLocaleDateString('vi-VN')}
                           </div>
                        </div>
                     </CardContent>
                   </Card>
                 ))}
                 {filteredCampaigns.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl border-border/50 bg-muted/5">
                       <Flag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                       <p className="font-bold text-muted-foreground">Không tìm thấy chiến dịch nào</p>
                    </div>
                 )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
          <p className="text-sm font-bold text-muted-foreground">
            Hiển thị trang <span className="text-foreground">{currentPage}</span> / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 px-4 font-bold border-2 hover:bg-primary/5 transition-colors"
              onClick={() => {
                setCurrentPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Trước
            </Button>
            
            <div className="flex items-center gap-1.5 mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "w-9 h-9 p-0 rounded-xl font-bold border-2 transition-all",
                    currentPage === page 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-primary" 
                      : "hover:bg-primary/5 border-transparent"
                  )}
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-9 px-4 font-bold border-2 hover:bg-primary/5 transition-colors"
              onClick={() => {
                setCurrentPage(p => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
            >
              Sau
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
