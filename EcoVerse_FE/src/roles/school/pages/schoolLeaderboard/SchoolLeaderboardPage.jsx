import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
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
  ChevronLeft, 
  ChevronRight,
  Search,
  Target as TargetIcon,
  Loader2
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useCampaigns } from "../../features/campaigns/hooks/useCampaigns";
import { campaignService } from "../../services/campaign.service";

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

export default function SchoolLeaderboardPage() {
  const { allCampaigns } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter only Ongoing or Completed campaigns for leaderboard
  const relevantCampaigns = useMemo(() => {
    const list = allCampaigns.filter(c => {
      const status = c.status?.toLowerCase();
      return status === 'on_going' || status === 'completed';
    });
    
    return {
      all: list,
      school: list.filter(c => c.origin === 'school'),
      partnership: list.filter(c => c.origin === 'partnership')
    };
  }, [allCampaigns]);

  // Handle Fetch Leaderboard
  const fetchLeaderboard = async () => {
    if (!selectedCampaignId) {
      setLeaderboardData([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await campaignService.getCampaignLeaderboard(selectedCampaignId);
      setLeaderboardData(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setLeaderboardData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCampaignId]);

  // Auto-select first campaign
  useEffect(() => {
    if (!selectedCampaignId && relevantCampaigns.all.length > 0) {
      const first = relevantCampaigns.all[0];
      setSelectedCampaignId(first.campaign_id || first.id);
    }
  }, [relevantCampaigns.all, selectedCampaignId]);

  const filteredLeaderboard = useMemo(() => {
    return leaderboardData.filter(item => 
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.schoolName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaderboardData, searchQuery]);

  const totalPages = Math.ceil(filteredLeaderboard.length / ITEMS_PER_PAGE);
  const paginatedData = filteredLeaderboard.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = useMemo(() => {
    if (leaderboardData.length === 0) return { total: 0, avgAccuracy: 0 };
    const total = leaderboardData.length;
    const avgAccuracy = Math.round(leaderboardData.reduce((acc, s) => acc + (s.combinedAccuracyPercentage || 0), 0) / total);
    return { total, avgAccuracy };
  }, [leaderboardData]);

  const isSchoolCampaign = useMemo(() => {
    const campaign = relevantCampaigns.all.find(c => (c.campaign_id || c.id) === selectedCampaignId);
    return campaign?.origin === 'school';
  }, [relevantCampaigns.all, selectedCampaignId]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-eco-green to-eco-green-light flex items-center justify-center shadow-lg shadow-eco-green/20">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bảng xếp hạng</h1>
            <p className="text-muted-foreground">Theo dõi thứ hạng của học sinh trong các chiến dịch</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-eco-green/10 bg-eco-green/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                <Users className="w-6 h-6 text-eco-green" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Học sinh tham gia</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-eco-green/10 bg-eco-green/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                <Target className="w-6 h-6 text-eco-green" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.avgAccuracy}%</p>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Độ chính xác trung bình</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 rounded-xl border-2 focus-visible:ring-eco-green/20"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-1 sm:flex-none">
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger className="w-full sm:w-[250px] h-11 rounded-xl border-2 font-bold">
                  <div className="flex items-center gap-2">
                    <TargetIcon className="w-4 h-4 text-eco-green" />
                    <SelectValue placeholder="Chọn chiến dịch" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 shadow-xl">
                  {relevantCampaigns.school.length > 0 && (
                    <>
                      <div className="px-2 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/30 border-y my-1">
                        Chiến dịch trường học
                      </div>
                      {relevantCampaigns.school.map(campaign => (
                        <SelectItem key={campaign.id} value={campaign.campaign_id || campaign.id} className="font-medium py-2">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-eco-green shrink-0" />
                             <span className="truncate">{campaign.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}

                  {relevantCampaigns.partnership.length > 0 && (
                    <>
                      <div className="px-2 py-2 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 border-y my-1">
                        Chiến dịch đối tác
                      </div>
                      {relevantCampaigns.partnership.map(campaign => (
                        <SelectItem key={campaign.id} value={campaign.campaign_id || campaign.id} className="font-medium py-2">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                             <span className="truncate">{campaign.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="border-2 border-border/50 overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 border-b p-4">
           <h3 className="font-bold flex items-center gap-2">
             <Trophy className="w-5 h-5 text-amber-500" />
             Xếp hạng chi tiết
           </h3>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-eco-green animate-spin" />
              <p className="text-muted-foreground font-bold italic">Đang tải bảng xếp hạng...</p>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 opacity-20" />
              </div>
              <p className="font-bold text-lg">Không có dữ liệu xếp hạng</p>
              <p className="text-sm">Vui lòng chọn chiến dịch hoặc thử tìm kiếm khác</p>
            </div>
          ) : (
            <div className="divide-y">
              {paginatedData.map((item) => (
                <div
                  key={`${item.studentId}-${item.rank}`}
                  className={cn(
                    "flex items-center gap-4 p-4 transition-all duration-200 hover:bg-eco-green/5",
                    item.rank === 1 && "bg-amber-50/30",
                    item.rank === 2 && "bg-slate-50/30",
                    item.rank === 3 && "bg-orange-50/30"
                  )}
                >
                  {/* Rank */}
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0",
                    item.rank === 1 ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" :
                    item.rank === 2 ? "bg-slate-400 text-white shadow-lg shadow-slate-400/20" :
                    item.rank === 3 ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" :
                    "bg-muted/50 text-muted-foreground"
                  )}>
                    {getRankIcon(item.rank) || item.rank}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-base truncate">{item.studentName}</p>
                    {!isSchoolCampaign && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5 truncate">
                          <Users className="w-3 h-3 text-eco-green" />
                          {item.schoolName}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8 pr-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-eco-green leading-none">{item.combinedAccuracyPercentage || 0}%</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-1">Chính xác</p>
                    </div>
                    <div className="text-center hidden sm:block w-24">
                      <p className="text-lg font-bold text-foreground leading-none">{item.avgTimeSeconds || 0}s</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-1">Thời gian TB</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t bg-muted/10">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Trang {currentPage} / {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border-2 font-bold h-9"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border-2 font-bold h-9"
                >
                  Sau
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
