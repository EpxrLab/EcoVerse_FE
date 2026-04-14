import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Button } from "@/shared/components/ui/button";
import { 
  Users, 
  Target, 
  Coins, 
  TrendingUp, 
  Award,
  Calendar,
  Leaf,
  ChevronRight,
  TreePine,
  Flag,
  Timer,
  Loader2,
  Gift
} from "lucide-react";
import { useDashboard } from '../../hooks/useDashboard';
import { cn } from "@/shared/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useNavigate } from "react-router";

export default function SchoolDashboard() {
  const [period, setPeriod] = useState('THIS_MONTH');
  const { data: stats, isLoading, error } = useDashboard(period);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-eco-green animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
          <TreePine className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-bold">Không thể tải dữ liệu</h3>
        <p className="text-muted-foreground max-w-md">Đã có lỗi xảy ra khi kết nối với máy chủ. Vui lòng thử lại sau.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">Thử lại</Button>
      </div>
    );
  }

  const subscriptionPercent = Math.min(100, Math.round((stats.totalStudents / 1000) * 100)); // Mock max base or from API if possible

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-eco-green flex items-center justify-center">
            <TreePine className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tổng quan</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Hiệu suất EcoVerse từ {new Date(stats.fromDate).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Select value={period} onValueChange={setPeriod}>
             <SelectTrigger className="w-[160px] h-10 rounded-xl bg-card border-2 border-eco-green/10 focus:ring-eco-green/20">
               <SelectValue placeholder="Chọn thời gian" />
             </SelectTrigger>
             <SelectContent className="rounded-xl border-2">
               <SelectItem value="THIS_WEEK">Tuần này</SelectItem>
               <SelectItem value="THIS_MONTH">Tháng này</SelectItem>
               <SelectItem value="LAST_3_MONTHS">3 tháng gần đây</SelectItem>
               <SelectItem value="THIS_YEAR">Năm này</SelectItem>
             </SelectContent>
           </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="group border-2 border-eco-green/20 hover:border-eco-green/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Tổng học sinh</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalStudents}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-eco-green/10">
                    <TrendingUp className="w-3 h-3 text-eco-green" />
                    <span className="text-xs font-semibold text-eco-green">Hoạt động</span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-eco-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-eco-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-2 border-eco-blue/20 hover:border-eco-blue/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Chiến dịch</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalCampaignsCreated + stats.totalCampaignsParticipated}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-eco-blue/10">
                    <Flag className="w-3 h-3 text-eco-blue" />
                    <span className="text-xs font-semibold text-eco-blue">{stats.activeCampaignsCreated} đang diễn ra</span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-eco-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-eco-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-2 border-eco-orange/20 hover:border-eco-orange/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Đổi thưởng chờ duyệt</p>
                <p className="text-3xl font-bold text-foreground">{stats.pendingRewardRequests}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-eco-orange/10">
                    <Timer className="w-3 h-3 text-eco-orange" />
                    <span className="text-xs font-semibold text-eco-orange">Cần xử lý</span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-eco-orange/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-6 h-6 text-eco-orange" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-2 border-eco-brown/15 bg-card">
          <CardHeader className="pb-3 border-b border-eco-brown/10 mb-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-eco-brown">
                <div className="w-8 h-8 rounded-lg bg-eco-brown/10 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                Học sinh tiêu biểu - Coins
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/school/leaderboard')} className="text-eco-brown hover:text-eco-brown hover:bg-eco-brown/10 text-xs">
                Xếp hạng
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3">
              {stats.topStudentsByCoins.map((student, index) => (
                <div 
                  key={student.studentId} 
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border",
                    index === 0 
                      ? "bg-eco-brown/5 border-eco-brown/20 shadow-sm shadow-eco-brown/5" 
                      : "bg-muted/30 border-transparent hover:border-border"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm shrink-0",
                    index === 0 ? "bg-eco-brown text-primary-foreground" :
                    index === 1 ? "bg-eco-green text-primary-foreground opacity-80" :
                    index === 2 ? "bg-eco-blue text-primary-foreground opacity-80" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{student.fullName}</p>
                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-tight">
                      Lớp {student.gradeLevel}{student.className}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end text-eco-orange mb-0.5">
                       <Coins className="w-3 h-3" />
                       <span className="font-bold text-sm tracking-tight">{student.totalCoins.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">accuracy: {Math.round(student.avgGameAccuracy)}%</p>
                  </div>
                </div>
              ))}
              {stats.topStudentsByCoins.length === 0 && (
                <div className="py-10 text-center text-muted-foreground italic text-sm">Chưa có dữ liệu xếp hạng</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-eco-blue/15 bg-card">
          <CardHeader className="pb-3 border-b border-eco-blue/10 mb-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-eco-blue">
                <div className="w-8 h-8 rounded-lg bg-eco-blue/10 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                Top chính xác trung bình
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/school/reports')} className="text-eco-blue hover:text-eco-blue hover:bg-eco-blue/10 text-xs">
                Xem chi tiết
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3">
              {stats.topStudentsByAccuracy.map((student, index) => (
                <div 
                  key={student.studentId} 
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border",
                    index === 0 
                      ? "bg-eco-blue/5 border-eco-blue/20 shadow-sm shadow-eco-blue/5" 
                      : "bg-muted/30 border-transparent hover:border-border"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm shrink-0",
                    index === 0 ? "bg-eco-blue text-primary-foreground" :
                    index === 1 ? "bg-eco-green text-primary-foreground opacity-80" :
                    index === 2 ? "bg-eco-brown text-primary-foreground opacity-80" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{student.fullName}</p>
                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-tight">
                      Lớp {student.gradeLevel}{student.className} • {student.totalCampaignsJoined} chiến dịch
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-eco-blue text-base">
                      {Math.round(student.avgGameAccuracy)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">quiz: {Math.round(student.avgQuizScore)}%</p>
                  </div>
                </div>
              ))}
               {stats.topStudentsByAccuracy.length === 0 && (
                <div className="py-10 text-center text-muted-foreground italic text-sm">Chưa có dữ liệu xếp hạng</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Subscription Info */}
      <Card className="border-2 border-eco-green/20 bg-eco-green/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-eco-green/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-eco-green flex items-center justify-center shadow-lg shadow-eco-green/20">
                <Leaf className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">{stats.subscriptionPlanName}</h3>
                  <Badge className="bg-eco-green text-primary-foreground border-0 text-[10px] font-bold">
                    {stats.subscriptionStatus}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                   Đăng ký hỗ trợ đến: {new Date(stats.subscriptionEndDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
              <div className="w-full sm:w-48 text-center sm:text-left">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Học sinh đã nạp</p>
                  <p className="text-sm font-black text-eco-green">{stats.totalStudents}</p>
                </div>
                <Progress value={subscriptionPercent} className="h-2.5 bg-eco-green/10" indicatorClassName="bg-eco-green" />
              </div>
              <Button onClick={() => navigate('/school/subscription')} className="w-full sm:w-auto bg-eco-green hover:bg-eco-green/90 text-primary-foreground font-bold rounded-xl px-8 h-11 shadow-lg shadow-eco-green/20">
                Quản lý gói
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}