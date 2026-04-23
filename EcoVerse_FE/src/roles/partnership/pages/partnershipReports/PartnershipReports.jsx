import { toLocalISO } from "@/utils/dateUtils";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { 
  Users, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  Download,
  School,
  FileText,
  BarChart3,
  Search,
  TrendingUp
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { partnershipReportService } from "../../services/partnership.report.service";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function PartnershipReports() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [campaignsData, setCampaignsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const campaignRes = await partnershipReportService.getPartnershipCampaigns();
        setCampaignsData(campaignRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch partnership reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedCampaigns = campaignsData.filter(c => c.status === 'COMPLETED');

  const filteredCampaigns = completedCampaigns.filter(c => 
    c.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.campaignCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const exportToExcel = () => {
    if (filteredCampaigns.length === 0) return;

    const headers = ["Mã chiến dịch", "Tên chiến dịch", "Trạng thái", "Số vòng", "Số trường tham gia", "Tổng HS tham gia", "Độ chính xác TB (%)", "Ngày bắt đầu", "Ngày kết thúc"];
    const rows = filteredCampaigns.map(c => [
      c.campaignCode,
      c.campaignName,
      "Hoàn thành",
      c.totalRounds,
      c.schoolsParticipated,
      c.totalStudentsEnrolled,
      (c.avgParticipantAccuracy).toFixed(2),
      new Date(c.startDate).toLocaleDateString('vi-VN'),
      new Date(c.endDate).toLocaleDateString('vi-VN')
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo chiến dịch");
    XLSX.writeFile(workbook, `bao_cao_chien_dich_doi_tac_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Đang tải dữ liệu báo cáo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-eco-blue/10 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-eco-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Báo cáo hoạt động</h1>
            <p className="text-muted-foreground text-base">Phân tích hiệu suất và tầm ảnh hưởng của các chiến dịch</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl border-2 font-semibold" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-eco-blue/10 bg-eco-blue/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 rounded-lg bg-eco-blue/10">
                <FileText className="w-5 h-5 text-eco-blue" />
              </div>
              <p className="text-base font-bold text-muted-foreground uppercase">Tổng chiến dịch</p>
            </div>
            <p className="text-4xl font-bold text-foreground">{completedCampaigns.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-eco-blue/5 bg-eco-blue/5/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 rounded-lg bg-eco-blue/10">
                <School className="w-5 h-5 text-eco-blue" />
              </div>
              <p className="text-base font-bold text-muted-foreground uppercase">Trường tham gia TB</p>
            </div>
            <p className="text-4xl font-bold text-foreground">
              {completedCampaigns.length > 0 ? (completedCampaigns.reduce((acc, c) => acc + c.schoolsParticipated, 0) / completedCampaigns.length).toFixed(1) : 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 bg-blue-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-base font-bold text-muted-foreground uppercase">Tầm ảnh hưởng TB</p>
            </div>
            <p className="text-4xl font-bold text-foreground">
              {completedCampaigns.length > 0 ? Math.round(completedCampaigns.reduce((acc, c) => acc + c.totalStudentsEnrolled, 0) / completedCampaigns.length) : 0} <span className="text-sm text-muted-foreground font-normal">HS/CD</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-border overflow-hidden">
        <CardHeader className="p-4 border-b bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
               <Search className="w-4 h-4 text-muted-foreground" />
               <Input 
                 placeholder="Tìm kiếm chiến dịch..." 
                 className="max-w-xs border-none bg-transparent shadow-none focus-visible:ring-0"
                 value={searchTerm}
                 onChange={(e) => {
                   setSearchTerm(e.target.value);
                   setCurrentPage(1);
                 }}
               />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="campaigns" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Thống kê chiến dịch</TabsTrigger>
                <TabsTrigger value="charts" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Biểu đồ (Beta)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activeTab === "campaigns" ? (
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-muted/30 border-b border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                         <th className="p-4">Chiến dịch</th>
                         <th className="p-4 text-center">Trạng thái</th>
                         <th className="p-4 text-center">Số vòng</th>
                         <th className="p-4 text-center">Trường tham gia</th>
                         <th className="p-4 text-center">Tổng học sinh</th>
                         <th className="p-4 text-center">Độ chính xác TB (%)</th>
                         <th className="p-4">Thời gian</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border/20">
                      {paginatedCampaigns.map((campaign) => (
                        <tr key={campaign.campaignId} className="hover:bg-primary/5 transition-colors group">
                           <td className="p-4">
                              <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{campaign.campaignName}</p>
                              <p className="text-xs font-mono text-muted-foreground">{campaign.campaignCode}</p>
                           </td>
                           <td className="p-4 text-center">
                              <Badge variant="outline" className="rounded-lg text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground border-none px-3 py-1">
                                Hoàn thành
                              </Badge>
                           </td>
                           <td className="p-4 text-center">
                              <span className="font-bold text-sm bg-muted/50 px-2 py-1 rounded-lg">{campaign.totalRounds}</span>
                           </td>
                           <td className="p-4 text-center font-bold text-eco-blue">{campaign.schoolsParticipated}</td>
                           <td className="p-4 text-center font-bold text-eco-blue-light">{campaign.totalStudentsEnrolled}</td>
                           <td className="p-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                 <span className="text-xs font-bold">{(campaign.avgParticipantAccuracy).toFixed(1)}%</span>
                                 <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-eco-blue" style={{ width: `${campaign.avgParticipantAccuracy}%` }} />
                                 </div>
                              </div>
                           </td>
                           <td className="p-4">
                              <div className="flex flex-col text-xs items-start gap-1">
                                 <div className="flex items-center gap-1.5 text-eco-blue font-bold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-eco-blue" />
                                    {new Date(campaign.startDate).toLocaleDateString()}
                                 </div>
                                 <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                                    {new Date(campaign.endDate).toLocaleDateString()}
                                 </div>
                              </div>
                           </td>
                        </tr>
                      ))}
                      {paginatedCampaigns.length === 0 && (
                         <tr>
                            <td colSpan={7} className="p-10 text-center text-muted-foreground text-sm">Không tìm thấy dữ liệu báo cáo</td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>
          ) : (
             <div className="p-6 space-y-8 min-h-[500px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Impact Chart (Students Enrolled) */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground italic">Tầm ảnh hưởng (Số học sinh)</h3>
                         <Badge variant="outline" className="text-[10px] font-bold bg-primary/5 border-primary/20">Top 5 chiến dịch</Badge>
                      </div>
                      <div className="h-[300px] w-full bg-white rounded-3xl border-2 border-border/50 p-4 pt-8">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[...completedCampaigns].sort((a,b) => b.totalStudentsEnrolled - a.totalStudentsEnrolled).slice(0, 5)}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                               <XAxis 
                                 dataKey="campaignName" 
                                 axisLine={false} 
                                 tickLine={false} 
                                 tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748B'}} 
                                 interval={0}
                                 tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val}
                               />
                               <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748B'}} />
                               <Tooltip 
                                 cursor={{fill: '#F1F5F9'}} 
                                 contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                 formatter={(value) => [value.toLocaleString(), "Học sinh tham gia"]}
                                 labelStyle={{fontWeight: 'bold', color: '#1E293B', marginBottom: '4px'}}
                               />
                               <Bar dataKey="totalStudentsEnrolled" radius={[6, 6, 0, 0]} barSize={40}>
                                  {completedCampaigns.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#3B82F6'} />
                                  ))}
                               </Bar>
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   {/* Participation Chart */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground italic">Số trường tham gia</h3>
                         <Badge variant="outline" className="text-[10px] font-bold bg-amber-50 border-amber-200 text-amber-600">Phổ biến nhất</Badge>
                      </div>
                      <div className="h-[300px] w-full bg-white rounded-3xl border-2 border-border/50 p-4 pt-8">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[...completedCampaigns].sort((a,b) => b.schoolsParticipated - a.schoolsParticipated).slice(0, 5)} layout="vertical">
                               <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                               <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748B'}} />
                               <YAxis 
                                 dataKey="campaignName" 
                                 type="category" 
                                 axisLine={false} 
                                 tickLine={false} 
                                 tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748B'}} 
                                 width={80}
                                 tickFormatter={(val) => val.length > 8 ? val.substring(0, 8) + '..' : val}
                               />
                               <Tooltip 
                                 cursor={{fill: '#F1F5F9'}} 
                                 contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                 formatter={(value) => [value, "Số trường tham gia"]}
                                 labelStyle={{fontWeight: 'bold', color: '#1E293B', marginBottom: '4px'}}
                               />
                               <Bar dataKey="schoolsParticipated" fill="#F59E0B" radius={[0, 6, 6, 0]} barSize={20} />
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/30 border border-dashed border-border/60">
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary" />
                   </div>
                   <p className="text-xs text-muted-foreground font-medium">
                      <span className="font-bold text-foreground">Mẹo:</span> Biểu đồ này giúp bạn nhận diện các chiến dịch đang thu hút nhiều trường học nhất và có chất lượng hoàn thành tốt nhất.
                   </p>
                </div>
             </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Hiển thị trang {currentPage} / {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-2 hover:bg-primary/5 transition-colors"
              onClick={() => {
                setCurrentPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-2 hover:bg-primary/5 transition-colors"
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
