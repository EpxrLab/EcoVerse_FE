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
  ArrowUp,
  Leaf,
  ChevronRight,
  Recycle,
  TreePine
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useDashboard } from '../../hooks/useDashboard';
import { cn } from "@/shared/lib/utils";

export default function SchoolDashboard() {
  const { 
    weeklyActivity, 
    classPerformance, 
    topStudents, 
    recentRewards, 
    stats, 
    subscription
  } = useDashboard();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-eco-green flex items-center justify-center">
          <TreePine className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tổng quan</h1>
          <p className="text-muted-foreground">Hiệu suất EcoVerse của trường hôm nay</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="group border-2 border-eco-green/20 hover:border-eco-green/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Học sinh hoạt động</p>
                <p className="text-3xl font-bold text-foreground">{stats.activeStudents}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-eco-green/10">
                    <ArrowUp className="w-3 h-3 text-eco-green" />
                    <span className="text-xs font-semibold text-eco-green">+{stats.activeStudentsChange}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">tuần này</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-eco-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-eco-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-2 border-eco-blue/20 hover:border-eco-blue/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Độ chính xác TB</p>
                <p className="text-3xl font-bold text-foreground">{stats.avgAccuracy}%</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-eco-blue/10">
                    <ArrowUp className="w-3 h-3 text-eco-blue" />
                    <span className="text-xs font-semibold text-eco-blue">+{stats.avgAccuracyChange}%</span>
                  </div>
                  <span className="text-xs text-muted-foreground">so với tuần trước</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-eco-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-eco-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-2 border-eco-leaf/20 hover:border-eco-leaf/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Rác đã phân loại</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalItemsSorted.toLocaleString()}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-eco-leaf/10">
                    <TrendingUp className="w-3 h-3 text-eco-leaf" />
                    <span className="text-xs font-semibold text-eco-leaf">+{stats.itemsThisWeek.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">tuần này</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-eco-leaf/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Recycle className="w-6 h-6 text-eco-leaf" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-2 border-eco-green/15">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <div className="w-8 h-8 rounded-lg bg-eco-green/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-eco-green" />
              </div>
              Hoạt động tuần này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--eco-green))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--eco-green))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "2px solid hsl(var(--eco-green) / 0.2)",
                    borderRadius: "12px",
                    fontSize: "12px"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="items" 
                  stroke="hsl(var(--eco-green))" 
                  fill="url(#colorItems)" 
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-2 border-eco-blue/15">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <div className="w-8 h-8 rounded-lg bg-eco-blue/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-eco-blue" />
              </div>
              Hiệu suất lớp học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="class" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "2px solid hsl(var(--eco-blue) / 0.2)",
                    borderRadius: "12px",
                    fontSize: "12px"
                  }} 
                />
                <Bar dataKey="accuracy" fill="hsl(var(--eco-blue))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-2 border-eco-brown/15">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <div className="w-8 h-8 rounded-lg bg-eco-brown/10 flex items-center justify-center">
                  <Award className="w-4 h-4 text-eco-brown" />
                </div>
                Học sinh xuất sắc tuần này
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-eco-brown hover:text-eco-brown hover:bg-eco-brown/10 text-xs">
                Xem tất cả
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2.5">
              {topStudents.map((student, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                    index === 0 
                      ? "bg-eco-brown/8 border-2 border-eco-brown/20" 
                      : "bg-muted/40 border border-border/50 hover:bg-muted/60"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm",
                    index === 0 ? "bg-eco-brown text-primary-foreground" :
                    index === 1 ? "bg-eco-green text-primary-foreground" :
                    index === 2 ? "bg-eco-blue text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-eco-leaf/10 flex items-center justify-center text-base border border-eco-leaf/20">
                    {student.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground">Lớp {student.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-eco-green text-base">{student.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">{student.items} rác</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-eco-orange/15">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <div className="w-8 h-8 rounded-lg bg-eco-orange/10 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-eco-orange" />
                </div>
                Yêu cầu đổi quà gần đây
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-eco-orange hover:text-eco-orange hover:bg-eco-orange/10 text-xs">
                Xem tất cả
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2.5">
              {recentRewards.map((reward, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-eco-orange/10 flex items-center justify-center text-base border border-eco-orange/20">
                      🎁
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{reward.student}</p>
                      <p className="text-xs text-muted-foreground">{reward.reward}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        reward.status === "COMPLETED" 
                          ? "bg-eco-green/10 text-eco-green border-eco-green/25" 
                          : "bg-eco-orange/10 text-eco-orange border-eco-orange/25"
                      )}
                    >
                      {reward.status === "COMPLETED" ? "Hoàn thành" : "Đang chờ"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{reward.coins} xu</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Subscription Info */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{subscription.plan}</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.currentStudents}/{subscription.maxStudents} học sinh • Hết hạn: {subscription.expiresAt}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="flex-1 md:flex-none md:w-44">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-muted-foreground font-medium">Đã sử dụng</p>
                  <p className="text-sm font-bold text-foreground">{subscription.usagePercent}%</p>
                </div>
                <Progress value={subscription.usagePercent} className="h-2" />
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Nâng cấp gói
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}