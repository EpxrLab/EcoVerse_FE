import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Users, 
  Target, 
  Coins,
  Flame,
  GraduationCap,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  Recycle
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useCampaigns } from "../../features/campaigns/hooks/useCampaigns";

const ITEMS_PER_PAGE = 10;

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
      return "bg-card border-border/50 hover:bg-muted/40";
  }
};

const extendedStudentsData = [
  { rank: 1, name: "Nguyễn Văn An", class: "3A", accuracy: 96, items: 520, coins: 2450, streak: 15, avatar: "🌟" },
  { rank: 2, name: "Trần Thị Bình", class: "1A", accuracy: 94, items: 480, coins: 2280, streak: 12, avatar: "🏆" },
  { rank: 3, name: "Lê Hoàng Cường", class: "2A", accuracy: 93, items: 450, coins: 2150, streak: 10, avatar: "🥉" },
  { rank: 4, name: "Phạm Minh Dũng", class: "1B", accuracy: 92, items: 430, coins: 2050, streak: 8, avatar: "🌿" },
  { rank: 5, name: "Hoàng Thị Em", class: "3A", accuracy: 91, items: 420, coins: 1980, streak: 11, avatar: "🍀" },
  { rank: 6, name: "Võ Văn Phúc", class: "2B", accuracy: 90, items: 410, coins: 1920, streak: 7, avatar: "🌱" },
  { rank: 7, name: "Ngô Thị Hương", class: "1A", accuracy: 89, items: 395, coins: 1850, streak: 9, avatar: "🌻" },
  { rank: 8, name: "Đặng Quốc Bảo", class: "3B", accuracy: 88, items: 380, coins: 1780, streak: 6, avatar: "🍃" },
  { rank: 9, name: "Bùi Thị Mai", class: "2A", accuracy: 87, items: 365, coins: 1720, streak: 5, avatar: "🌸" },
  { rank: 10, name: "Lý Văn Hùng", class: "1B", accuracy: 86, items: 350, coins: 1650, streak: 4, avatar: "🌾" },
  { rank: 11, name: "Trương Thị Lan", class: "3A", accuracy: 85, items: 340, coins: 1600, streak: 6, avatar: "🌺" },
  { rank: 12, name: "Đinh Văn Khoa", class: "2B", accuracy: 84, items: 330, coins: 1550, streak: 5, avatar: "🌼" },
  { rank: 13, name: "Phan Thị Ngọc", class: "1A", accuracy: 83, items: 320, coins: 1500, streak: 4, avatar: "🌷" },
  { rank: 14, name: "Huỳnh Văn Long", class: "3B", accuracy: 82, items: 310, coins: 1450, streak: 3, avatar: "🌴" },
  { rank: 15, name: "Vũ Thị Oanh", class: "2A", accuracy: 81, items: 300, coins: 1400, streak: 5, avatar: "🌵" },
  { rank: 16, name: "Dương Văn Phong", class: "1B", accuracy: 80, items: 290, coins: 1350, streak: 4, avatar: "🎋" },
  { rank: 17, name: "Lương Thị Quỳnh", class: "3A", accuracy: 79, items: 280, coins: 1300, streak: 3, avatar: "🎍" },
  { rank: 18, name: "Tô Văn Rạng", class: "2B", accuracy: 78, items: 270, coins: 1250, streak: 2, avatar: "🌲" },
  { rank: 19, name: "Châu Thị Sen", class: "1A", accuracy: 77, items: 260, coins: 1200, streak: 4, avatar: "🌳" },
  { rank: 20, name: "Kiều Văn Tài", class: "3B", accuracy: 76, items: 250, coins: 1150, streak: 3, avatar: "🌿" },
];

const extendedClassesData = [
  { rank: 1, name: "3A", teacher: "Thầy Nam", students: 29, accuracy: 91, items: 1420, avgCoins: 185 },
  { rank: 2, name: "1A", teacher: "Cô Mai", students: 32, accuracy: 88, items: 1250, avgCoins: 172 },
  { rank: 3, name: "1B", teacher: "Cô Lan", students: 30, accuracy: 85, items: 1180, avgCoins: 165 },
  { rank: 4, name: "3B", teacher: "Cô Thảo", students: 25, accuracy: 86, items: 1100, avgCoins: 158 },
  { rank: 5, name: "2A", teacher: "Thầy Hùng", students: 28, accuracy: 82, items: 1050, avgCoins: 145 },
  { rank: 6, name: "2B", teacher: "Cô Hoa", students: 31, accuracy: 79, items: 980, avgCoins: 132 },
];

export default function SchoolLeaderboardPage() {
  const { allCampaigns } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("students");

  const filteredStudents = useMemo(() => {
    let currentData = [...extendedStudentsData];
    
    if (campaignFilter !== 'all') {
      const seed = campaignFilter.length; 
      currentData = currentData
        .map(s => ({ ...s, items: s.items + (seed * 10) % 50, coins: s.coins + (seed * 100) % 500 }))
        .sort((a, b) => b.accuracy - a.accuracy)
        .map((s, idx) => ({ ...s, rank: idx + 1 }));
    }

    return currentData.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter === "all" || student.class === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [searchQuery, classFilter, campaignFilter]);

  const filteredClasses = useMemo(() => {
    return extendedClassesData.filter(classItem => {
      return classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             classItem.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  const totalStudentPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const totalClassPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);
  const totalPages = activeTab === "students" ? totalStudentPages : totalClassPages;

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClasses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredClasses, currentPage]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleClassFilterChange = (value) => {
    setClassFilter(value);
    setCurrentPage(1);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const uniqueClasses = [...new Set(extendedStudentsData.map(s => s.class))].sort();

  const totalStudents = extendedStudentsData.length;
  const avgAccuracy = Math.round(extendedStudentsData.reduce((acc, s) => acc + s.accuracy, 0) / totalStudents);
  const totalItems = extendedStudentsData.reduce((acc, s) => acc + s.items, 0);
  const totalCoins = extendedStudentsData.reduce((acc, s) => acc + s.coins, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bảng xếp hạng</h1>
            <p className="text-muted-foreground">Xếp hạng học sinh theo độ chính xác</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                <p className="text-xs text-muted-foreground">Học sinh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-eco-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-eco-blue/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-eco-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgAccuracy}%</p>
                <p className="text-xs text-muted-foreground">Độ chính xác TB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-eco-leaf/20 hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-eco-leaf/10 flex items-center justify-center">
                <Recycle className="w-5 h-5 text-eco-leaf" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalItems.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Rác phân loại</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-eco-orange/20 hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-eco-orange/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-eco-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCoins.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Tổng xu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Campaign Filter */}
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-full md:w-[250px]">
                <Target className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Chọn chiến dịch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chiến dịch</SelectItem>
                {allCampaigns.map(campaign => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Class Filter */}
            {activeTab === "students" && (
              <Select value={classFilter} onValueChange={handleClassFilterChange}>
                <SelectTrigger className="w-full md:w-40">
                  <GraduationCap className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả lớp</SelectItem>
                  {uniqueClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>Lớp {cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3 border-b border-border/50">
           <h3 className="text-lg font-bold flex items-center gap-2">
             <Trophy className="w-5 h-5 text-amber-500" />
             Bảng xếp hạng học sinh
           </h3>
        </CardHeader>
        <CardContent className="pt-4">
            <div className="space-y-2">
              {paginatedStudents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Không tìm thấy học sinh nào</p>
                </div>
              ) : (
                paginatedStudents.map((student) => (
                  <div
                    key={student.rank}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.005]",
                      getRankBg(student.rank)
                    )}
                  >
                    {/* Rank */}
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                      student.rank === 1 ? "bg-amber-500 text-white" :
                      student.rank === 2 ? "bg-slate-400 text-white" :
                      student.rank === 3 ? "bg-amber-600 text-white" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {getRankIcon(student.rank) || student.rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl border border-primary/20 shrink-0">
                      {student.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate">{student.name}</p>
                        {student.rank <= 3 && getRankIcon(student.rank)}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className="text-xs bg-eco-blue/10 text-eco-blue border-eco-blue/25">
                          Lớp {student.class}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-eco-orange" />
                          <span className="text-xs font-medium text-eco-orange">{student.streak} ngày</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 shrink-0 pr-4">
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Target className="w-4 h-4 text-primary" />
                          <p className="text-base font-bold text-primary">{student.accuracy}%</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Chính xác</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trước
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-8 h-8 p-0",
                        currentPage === page && "bg-primary text-primary-foreground"
                      )}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Sau
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}