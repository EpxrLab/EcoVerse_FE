import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
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
  Loader2,
  School,
  Handshake,
  Flame,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useCampaigns } from "../../features/campaigns/hooks/useCampaigns";
import { campaignService } from "../../services/campaign.service";

const ITEMS_PER_PAGE = 10;

// ── Podium card for rank 1, 2, 3 ─────────────────────────────────────────────
const PODIUM_CONFIG = {
  1: {
    bg: "bg-gradient-to-b from-amber-400 to-amber-500",
    ring: "ring-4 ring-amber-400/60",
    badge: "bg-amber-500",
    iconColor: "text-amber-500",
    glow: "shadow-amber-400/40",
    height: "h-28",
    icon: <Crown className="w-7 h-7 text-amber-400" />,
    label: "Hạng 1",
  },
  2: {
    bg: "bg-gradient-to-b from-slate-400 to-slate-500",
    ring: "ring-4 ring-slate-300/60",
    badge: "bg-slate-400",
    iconColor: "text-slate-400",
    glow: "shadow-slate-400/30",
    height: "h-20",
    icon: <Medal className="w-6 h-6 text-slate-400" />,
    label: "Hạng 2",
  },
  3: {
    bg: "bg-gradient-to-b from-orange-400 to-orange-500",
    ring: "ring-4 ring-orange-400/50",
    badge: "bg-orange-400",
    iconColor: "text-orange-400",
    glow: "shadow-orange-400/30",
    height: "h-14",
    icon: <Medal className="w-6 h-6 text-orange-400" />,
    label: "Hạng 3",
  },
};

function PodiumCard({ item, rank, isPartnership }) {
  const cfg = PODIUM_CONFIG[rank];
  if (!item) return <div className="flex-1" />;

  return (
    <div className="flex-1 flex flex-col items-center gap-2">
      {/* Icon trophy */}
      <div className="mb-1">{cfg.icon}</div>

      {/* Avatar */}
      <div className={cn(
        "w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl shadow-xl",
        cfg.bg, cfg.ring, `shadow-lg ${cfg.glow}`
      )}>
        {item.studentName?.charAt(0)?.toUpperCase() || "?"}
      </div>

      {/* Name + school */}
      <div className="text-center max-w-[120px]">
        <p className="font-bold text-sm text-foreground leading-tight truncate">{item.studentName}</p>
        {isPartnership && item.schoolName && (
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.schoolName}</p>
        )}
      </div>

      {/* Stats chip */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className={cn(
          "text-xs font-black text-white px-2.5 py-1 rounded-full",
          cfg.badge
        )}>
          {item.combinedAccuracyPercentage || 0}%
        </span>
        {item.avgTimeSeconds != null && (
          <span className="text-xs font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
            {item.avgTimeSeconds}s
          </span>
        )}
      </div>

      {/* Podium block */}
      <div className={cn(
        "w-full rounded-t-2xl flex items-end justify-center pb-2 font-black text-white/90 text-sm",
        cfg.bg, cfg.height
      )}>
        #{rank}
      </div>
    </div>
  );
}

// ── Rank row for positions 4+ ─────────────────────────────────────────────────
function RankRow({ item, isPartnership }) {
  return (
    <div className={cn(
      "flex items-center gap-4 px-5 py-3.5 transition-all duration-150 hover:bg-muted/40 group",
    )}>
      {/* Rank number */}
      <div className="w-8 text-center">
        <span className="text-sm font-black text-muted-foreground">#{item.rank}</span>
      </div>

      {/* Avatar circle */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-eco-green/30 to-eco-green/10 border border-eco-green/20 flex items-center justify-center text-eco-green font-black text-sm shrink-0 group-hover:from-eco-green/40 transition-all">
        {item.studentName?.charAt(0)?.toUpperCase() || "?"}
      </div>

      {/* Name + school */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm truncate">{item.studentName}</p>
        {isPartnership && item.schoolName && (
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3" />{item.schoolName}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="text-center min-w-[52px]">
          <p className="text-sm font-bold text-eco-green leading-none">{item.combinedAccuracyPercentage || 0}%</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-tight">Chính xác</p>
        </div>
        <div className="text-center min-w-[48px] hidden sm:block">
          <p className="text-sm font-bold text-foreground leading-none">{item.avgTimeSeconds ?? "—"}s</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-tight">TB</p>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SchoolLeaderboardPage() {
  const { allCampaigns } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignType, setCampaignType] = useState("school");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const relevantCampaigns = useMemo(() => {
    const list = allCampaigns.filter(c => {
      const s = c.status?.toLowerCase();
      return s === "on_going" || s === "completed";
    });
    return {
      all: list,
      school: list.filter(c => c.origin === "school"),
      partnership: list.filter(c => c.origin === "partnership"),
    };
  }, [allCampaigns]);

  const activeCampaignList = campaignType === "school"
    ? relevantCampaigns.school
    : relevantCampaigns.partnership;

  const activeCampaignName = useMemo(() => {
    const c = relevantCampaigns.all.find(c => (c.campaign_id || c.id) === selectedCampaignId);
    return c?.name || c?.campaignName || "";
  }, [relevantCampaigns.all, selectedCampaignId]);

  const fetchLeaderboard = async () => {
    if (!selectedCampaignId) { setLeaderboardData([]); return; }
    try {
      setIsLoading(true);
      const res = await campaignService.getCampaignLeaderboard(selectedCampaignId);
      setLeaderboardData(res.data?.data || []);
    } catch { setLeaderboardData([]); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchLeaderboard(); }, [selectedCampaignId]);

  useEffect(() => {
    const list = campaignType === "school" ? relevantCampaigns.school : relevantCampaigns.partnership;
    setSelectedCampaignId(list[0]?.campaign_id || list[0]?.id || "");
    if (!list.length) setLeaderboardData([]);
    setCurrentPage(1);
    setSearchQuery("");
  }, [campaignType, relevantCampaigns.school, relevantCampaigns.partnership]);

  const filteredLeaderboard = useMemo(() =>
    leaderboardData.filter(item =>
      item.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.schoolName?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [leaderboardData, searchQuery]);

  const top3 = filteredLeaderboard.slice(0, 3);
  const rest = filteredLeaderboard.slice(3);
  const totalPages = Math.ceil(rest.length / ITEMS_PER_PAGE);
  const paginatedRest = rest.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    if (!leaderboardData.length) return { total: 0, avgAccuracy: 0, topAccuracy: 0 };
    const total = leaderboardData.length;
    const avgAccuracy = Math.round(leaderboardData.reduce((a, s) => a + (s.combinedAccuracyPercentage || 0), 0) / total);
    const topAccuracy = Math.max(...leaderboardData.map(s => s.combinedAccuracyPercentage || 0));
    return { total, avgAccuracy, topAccuracy };
  }, [leaderboardData]);

  const isPartnership = campaignType === "partnership";
  const accentColor = isPartnership ? "amber" : "eco-green";

  return (
    <div className="space-y-5 animate-fade-in pb-10">

      {/* ── Hero Banner ───────────────────────────────────────────────────── */}
      <div className={cn(
        "rounded-2xl p-6 relative overflow-hidden",
        isPartnership
          ? "bg-gradient-to-r from-amber-500 to-orange-400"
          : "bg-gradient-to-r from-eco-green to-eco-green-light"
      )}>
        {/* Decorative circles */}
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute right-10 bottom-0 w-24 h-24 rounded-full bg-white/10 translate-y-1/2" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white drop-shadow">Bảng xếp hạng</h1>
              <p className="text-white/80 text-sm mt-0.5">
                {activeCampaignName ? `Chiến dịch: ${activeCampaignName}` : "Theo dõi thứ hạng học sinh"}
              </p>
            </div>
          </div>

          {/* Inline stats */}
          {leaderboardData.length > 0 && (
            <div className="flex gap-4 sm:gap-6 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-black text-white leading-none">{stats.total}</p>
                <p className="text-white/70 text-xs font-bold mt-1 uppercase tracking-wide flex items-center gap-1 justify-center">
                  <Users className="w-3 h-3" /> HS tham gia
                </p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-black text-white leading-none">{stats.avgAccuracy}%</p>
                <p className="text-white/70 text-xs font-bold mt-1 uppercase tracking-wide flex items-center gap-1 justify-center">
                  <Target className="w-3 h-3" /> Độ c.xác TB
                </p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-black text-white leading-none">{stats.topAccuracy}%</p>
                <p className="text-white/70 text-xs font-bold mt-1 uppercase tracking-wide flex items-center gap-1 justify-center">
                  <Flame className="w-3 h-3" /> Cao nhất
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────────────── */}
      <Card className="border-2 border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Type switch (left column) */}
            <div className="flex sm:flex-col border-b sm:border-b-0 sm:border-r border-border/60">
              {[
                { key: "school", label: "Trường học", icon: <School className="w-4 h-4" />, count: relevantCampaigns.school.length },
                { key: "partnership", label: "Đối tác", icon: <Handshake className="w-4 h-4" />, count: relevantCampaigns.partnership.length },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setCampaignType(tab.key)}
                  className={cn(
                    "flex-1 sm:flex-none flex items-center gap-2 px-5 py-3.5 text-sm font-bold transition-all duration-200 whitespace-nowrap",
                    campaignType === tab.key
                      ? tab.key === "school"
                        ? "bg-eco-green/10 text-eco-green border-b-2 sm:border-b-0 sm:border-r-2 border-eco-green"
                        : "bg-amber-500/10 text-amber-600 border-b-2 sm:border-b-0 sm:border-r-2 border-amber-500"
                      : "text-muted-foreground hover:bg-muted/40 border-b-2 sm:border-b-0 sm:border-r-2 border-transparent"
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span className={cn(
                    "text-[11px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                    campaignType === tab.key
                      ? tab.key === "school" ? "bg-eco-green text-white" : "bg-amber-500 text-white"
                      : "bg-muted text-muted-foreground"
                  )}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Campaign + search (right) */}
            <div className="flex-1 flex flex-col sm:flex-row gap-0 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
              {activeCampaignList.length === 0 ? (
                <div className="flex-1 flex items-center justify-center px-5 py-4 text-sm text-muted-foreground italic">
                  Không có chiến dịch nào đang diễn ra hoặc đã hoàn thành.
                </div>
              ) : (
                <div className="flex-1 flex items-center px-4 py-3">
                  <Select
                    value={selectedCampaignId}
                    onValueChange={v => { setSelectedCampaignId(v); setCurrentPage(1); }}
                  >
                    <SelectTrigger className={cn(
                      "h-10 border-2 rounded-xl font-semibold w-full",
                      isPartnership ? "border-amber-300/60" : "border-eco-green/30"
                    )}>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          isPartnership ? "bg-amber-500" : "bg-eco-green"
                        )} />
                        <SelectValue placeholder="Chọn chiến dịch..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent
                      className="rounded-xl border-2 shadow-xl"
                      style={{
                        "--accent": isPartnership ? "38 92% 92%" : "142 72% 92%",
                        "--accent-foreground": isPartnership ? "32 80% 30%" : "142 60% 25%",
                      }}
                    >
                      {activeCampaignList.map(c => (
                        <SelectItem
                          key={c.campaign_id || c.id}
                          value={c.campaign_id || c.id}
                          className="font-medium py-2.5 rounded-lg"
                        >
                          {c.name || c.campaignName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Search */}
              <div className="flex items-center px-4 py-3 sm:w-64">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm học sinh..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-9 h-10 rounded-xl border-2 focus-visible:ring-eco-green/20 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Leaderboard Content ───────────────────────────────────────────── */}
      <Card className="border-2 border-border/50 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center",
              isPartnership ? "bg-amber-50" : "bg-eco-green/10"
            )}>
              <Loader2 className={cn("w-8 h-8 animate-spin", isPartnership ? "text-amber-500" : "text-eco-green")} />
            </div>
            <p className="text-muted-foreground font-semibold">Đang tải bảng xếp hạng...</p>
          </div>

        ) : filteredLeaderboard.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 opacity-20" />
            </div>
            <p className="font-bold text-lg">Chưa có dữ liệu xếp hạng</p>
            <p className="text-sm mt-1">
              {selectedCampaignId ? "Học sinh chưa có kết quả trong chiến dịch này" : "Vui lòng chọn chiến dịch"}
            </p>
          </div>

        ) : (
          <>
            {/* ── Podium (top 3) ───────────────────────────────────── */}
            {top3.length > 0 && (
              <div className={cn(
                "px-6 pt-8 pb-0",
                isPartnership ? "bg-gradient-to-b from-amber-50/60 to-transparent" : "bg-gradient-to-b from-eco-green/5 to-transparent"
              )}>
                <p className="text-center text-xs font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  Top 3
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                </p>
                {/* Reorder: 2nd | 1st | 3rd */}
                <div className="flex items-end justify-center gap-4 max-w-md mx-auto">
                  <PodiumCard item={top3[1]} rank={2} isPartnership={isPartnership} />
                  <PodiumCard item={top3[0]} rank={1} isPartnership={isPartnership} />
                  <PodiumCard item={top3[2]} rank={3} isPartnership={isPartnership} />
                </div>
              </div>
            )}

            {/* ── Rest of rankings ──────────────────────────────────── */}
            {paginatedRest.length > 0 && (
              <>
                <div className="px-5 py-2.5 border-y bg-muted/20">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Xếp hạng #{3 + (currentPage - 1) * ITEMS_PER_PAGE + 1} – #{3 + (currentPage - 1) * ITEMS_PER_PAGE + paginatedRest.length}
                  </p>
                </div>
                <div className="divide-y divide-border/50">
                  {paginatedRest.map(item => (
                    <RankRow key={`${item.studentId}-${item.rank}`} item={item} isPartnership={isPartnership} />
                  ))}
                </div>
              </>
            )}

            {/* ── Pagination ────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t bg-muted/10">
                <p className="text-xs font-bold text-muted-foreground">
                  Trang {currentPage} / {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl border-2 font-bold h-9 gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Trước
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-xl border-2 font-bold h-9 gap-1"
                  >
                    Sau <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
