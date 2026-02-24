import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Users, 
  Target, 
  Coins,
  Flame,
  GraduationCap,
  ChevronRight
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const getRankIcon = (rank) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-amber-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-slate-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return null;
  }
};

const getRankBg = (rank) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-amber-500/20 to-amber-400/10 border-amber-500/30";
    case 2:
      return "bg-gradient-to-r from-slate-400/15 to-slate-300/5 border-slate-400/25";
    case 3:
      return "bg-gradient-to-r from-amber-600/15 to-amber-500/5 border-amber-600/25";
    default:
      return "bg-muted/40 border-border/50";
  }
};

export function SchoolLeaderboard({ students, classes }) {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            Bảng xếp hạng toàn trường
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 text-xs">
            Xem chi tiết
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50">
            <TabsTrigger value="students" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4" />
              Học sinh
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <GraduationCap className="w-4 h-4" />
              Lớp học
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-2 mt-0">
            {students.slice(0, 10).map((student) => (
              <div
                key={student.rank}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 hover:scale-[1.01]",
                  getRankBg(student.rank)
                )}
              >
                {/* Rank */}
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
                  student.rank === 1 ? "bg-amber-500 text-white" :
                  student.rank === 2 ? "bg-slate-400 text-white" :
                  student.rank === 3 ? "bg-amber-600 text-white" :
                  "bg-muted text-muted-foreground"
                )}>
                  {getRankIcon(student.rank) || student.rank}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg border border-primary/20 shrink-0">
                  {student.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm truncate">{student.name}</p>
                    {student.rank <= 3 && getRankIcon(student.rank)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">Lớp {student.class}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-eco-orange" />
                      <span className="text-xs font-medium text-eco-orange">{student.streak} ngày</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center hidden sm:block">
                    <p className="text-sm font-bold text-primary">{student.accuracy}%</p>
                    <p className="text-[10px] text-muted-foreground">Chính xác</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-sm font-bold text-eco-blue">{student.items}</p>
                    <p className="text-[10px] text-muted-foreground">Rác</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <Coins className="w-3.5 h-3.5 text-eco-orange" />
                      <p className="text-sm font-bold text-eco-orange">{student.coins}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Xu</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="classes" className="space-y-2 mt-0">
            {classes.map((classItem) => (
              <div
                key={classItem.rank}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 hover:scale-[1.01]",
                  getRankBg(classItem.rank)
                )}
              >
                {/* Rank */}
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
                  classItem.rank === 1 ? "bg-amber-500 text-white" :
                  classItem.rank === 2 ? "bg-slate-400 text-white" :
                  classItem.rank === 3 ? "bg-amber-600 text-white" :
                  "bg-muted text-muted-foreground"
                )}>
                  {getRankIcon(classItem.rank) || classItem.rank}
                </div>

                {/* Class Icon */}
                <div className="w-10 h-10 rounded-xl bg-eco-blue/10 flex items-center justify-center border border-eco-blue/20 shrink-0">
                  <span className="text-sm font-bold text-eco-blue">{classItem.name}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm">Lớp {classItem.name}</p>
                    {classItem.rank <= 3 && getRankIcon(classItem.rank)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">GV: {classItem.teacher}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-eco-blue" />
                      <span className="text-xs font-medium text-eco-blue">{classItem.students} HS</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center hidden sm:block">
                    <div className="flex items-center gap-1 justify-center">
                      <Target className="w-3.5 h-3.5 text-primary" />
                      <p className="text-sm font-bold text-primary">{classItem.accuracy}%</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Chính xác</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-sm font-bold text-eco-leaf">{classItem.items.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Rác</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="bg-eco-orange/10 text-eco-orange border-eco-orange/25 text-xs font-bold">
                      ~{classItem.avgCoins} xu/HS
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}