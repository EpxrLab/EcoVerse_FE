import { usePartnership, usePartnershipDashboard } from "../../hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { 
  Users, 
  FileText, 
  Calendar, 
  Target, 
  Trophy, 
  Clock,
  ChevronRight,
  School
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

export default function PartnershipDashboard() {
  const { partnershipInfo } = usePartnership();
  const { stats, isLoading, refreshStats } = usePartnershipDashboard();

  const kpis = [
    {
      title: "Tổng chiến dịch",
      value: stats.totalCampaignsCreated,
      icon: FileText,
      color: "text-eco-blue",
      bg: "bg-eco-blue/10",
    },
    {
      title: "Trường tham gia",
      value: stats.totalSchoolsParticipated,
      icon: School,
      color: "text-eco-blue-light",
      bg: "bg-eco-blue-light/10",
      desc: "Trong thời gian qua"
    },
    {
      title: "HS tiếp cận",
      value: stats.totalStudentsReached.toLocaleString(),
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50",
      desc: "Tham gia các chiến dịch"
    },
    {
      title: "Độ chính xác TB",
      value: `${(stats.avgParticipantAccuracy).toFixed(1)}%`,
      icon: Target,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
      desc: "Hiệu suất trung bình"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Chào mừng, {partnershipInfo?.organizationName || "Đối tác"}!
          </h2>
          <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
            <Clock className="w-4 h-4" />
            Báo cáo tổng quan hoạt động chiến dịch của bạn
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select 
            defaultValue="THIS_MONTH" 
            onValueChange={(val) => refreshStats(val)}
          >
            <SelectTrigger className="w-[180px] rounded-xl border-2 font-semibold">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="THIS_WEEK">Tuần này</SelectItem>
              <SelectItem value="THIS_MONTH">Tháng này</SelectItem>
              <SelectItem value="LAST_3_MONTHS">3 tháng qua</SelectItem>
              <SelectItem value="THIS_YEAR">Năm nay</SelectItem>
              <SelectItem value="CUSTOM">Tất cả thời gian</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subscription Alert if nearly expired or status check */}
      {stats.subscriptionStatus === "ACTIVE" && (
        <Card className="border-l-4 border-l-eco-blue bg-eco-blue/5 overflow-hidden">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-eco-blue/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-eco-blue" />
              </div>
              <div>
                <p className="text-sm font-bold text-eco-blue">Gói {stats.subscriptionPlanName}</p>
                <p className="text-xs text-muted-foreground">Thời hạn đến: {new Date(stats.subscriptionEndDate).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-eco-blue border-eco-blue/20 bg-white">Đang sử dụng</Badge>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="border-2 border-border/50 hover:border-eco-blue/20 transition-all hover:shadow-lg hover:shadow-eco-blue/5 group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform", kpi.bg)}>
                  <kpi.icon className={cn("w-6 h-6", kpi.color)} />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1 tracking-tight">{isLoading ? "---" : kpi.value}</p>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">{kpi.title}</p>
              <p className="text-[10px] font-medium text-muted-foreground/70 italic">{kpi.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Schools List */}
        <Card className="lg:col-span-1 border-2 border-border/50 flex flex-col h-full overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <School className="w-5 h-5 text-eco-blue" />
                Trường học tham gia
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-4 flex-1">
            <div className="space-y-5">
              {stats.topSchoolsByParticipation?.length > 0 ? (
                stats.topSchoolsByParticipation.map((school, index) => (
                  <div key={school.schoolId} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all",
                        index === 0 ? "bg-amber-100 text-amber-600" : 
                        index === 1 ? "bg-slate-100 text-slate-600" : 
                        index === 2 ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground group-hover:text-eco-blue transition-colors">{school.schoolName}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">{school.campaignsParticipated} chiến dịch</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-eco-blue">{school.totalStudentsEnrolled}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">HS tham gia</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground text-sm">Chưa có dữ liệu trường tham gia</div>
              )}
            </div>
            
            <button className="w-full mt-8 py-3 rounded-xl bg-muted/30 text-xs font-bold text-muted-foreground hover:bg-eco-blue/5 hover:text-eco-blue transition-all flex items-center justify-center gap-2 group">
              Xem tất cả trường học
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </CardContent>
        </Card>

        {/* Placeholder for Chart or Additional info */}
        <Card className="lg:col-span-2 border-2 border-border/50 bg-muted/10">
          <CardContent className="h-full flex flex-col items-center justify-center p-10 text-center">
            <div className="p-4 rounded-3xl bg-white shadow-sm mb-4">
               <Trophy className="w-12 h-12 text-amber-500 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold mb-2">Phân tích chuyên sâu</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              EcoVerse đang thu thập dữ liệu chi tiết hơn để hiển thị biểu đồ phân loại rác và xu hướng tham gia của học sinh theo thời gian.
            </p>
            <Badge variant="secondary" className="mt-4 px-4 py-1">Sắp ra mắt</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
