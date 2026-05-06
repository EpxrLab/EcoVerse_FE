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
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Gamepad2,
  ClipboardList,
  TrendingUp,
  Percent,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
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

function PodiumCard({ item, rank, isPartnership, onClick }) {
  const cfg = PODIUM_CONFIG[rank];
  if (!item) return <div className="flex-1" />;

  return (
    <div 
      className="flex-1 flex flex-col items-center gap-2 cursor-pointer group transition-transform hover:scale-105"
      onClick={() => onClick && onClick(item)}
    >
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
function RankRow({ item, isPartnership, onClick }) {
  return (
    <div 
      onClick={() => onClick && onClick(item)}
      className={cn(
        "flex items-center gap-4 px-5 py-3.5 transition-all duration-150 hover:bg-muted/40 group cursor-pointer",
      )}
    >
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

function StudentHistoryModal({ isOpen, onClose, student, history, isLoading }) {
  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-gradient-to-r from-eco-green to-eco-green-light p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Users className="w-32 h-32" />
          </div>
          <div className="relative flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black border-4 border-white/30 shadow-xl">
              {student.studentName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-3xl font-black drop-shadow-md">{student.studentName}</h2>
              <div className="flex items-center gap-3 mt-1.5 text-white/90 font-medium">
                <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs">
                  <Trophy className="w-3.5 h-3.5" /> Xếp hạng #{student.rank}
                </span>
                {student.schoolName && (
                  <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs">
                    <School className="w-3.5 h-3.5" /> {student.schoolName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-background">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-eco-green animate-spin" />
              <p className="text-muted-foreground font-bold animate-pulse">Đang truy xuất lịch sử học tập...</p>
            </div>
          ) : !history || ((history.gameHistories?.length || 0) === 0 && (history.quizHistories?.length || 0) === 0) ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-10 h-10 text-muted-foreground opacity-30" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Chưa có dữ liệu lịch sử</h3>
              <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Học sinh này chưa tham gia bất kỳ trò chơi hay bài kiểm tra nào trong vòng này.</p>
            </div>
          ) : (
            <Tabs defaultValue="games" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-2xl h-14">
                <TabsTrigger value="games" className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-eco-green data-[state=active]:shadow-md transition-all h-12">
                  <Gamepad2 className="w-4 h-4 mr-2" /> Trò chơi ({history.gameHistories?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="quizzes" className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-eco-green data-[state=active]:shadow-md transition-all h-12">
                  <ClipboardList className="w-4 h-4 mr-2" /> Quiz ({history.quizHistories?.length || 0})
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[450px] pr-4 -mr-4">
                <TabsContent value="games" className="space-y-6 mt-0">
                  {history.gameHistories?.map((game, gIdx) => (
                    <div key={gIdx} className="space-y-3">
                      <div className="flex items-center gap-2 px-2">
                        <div className="w-2 h-6 bg-eco-green rounded-full" />
                        <h4 className="font-black text-lg text-foreground">{game.gameTypeName}</h4>
                      </div>
                      <div className="grid gap-4">
                        {game.sessions?.map((session, sIdx) => (
                          <div key={sIdx} className="group relative bg-card hover:bg-muted/30 border-2 border-border/50 hover:border-eco-green/30 rounded-2xl p-5 transition-all duration-300">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                  session.isPassed ? "bg-eco-green/10 text-eco-green" : "bg-red-50 text-red-500"
                                )}>
                                  {session.isPassed ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-foreground">Màn {session.currentLevel}</span>
                                    <Badge variant="outline" className={cn(
                                      "text-[10px] px-2 py-0 h-5 font-bold uppercase",
                                      session.isPassed ? "border-eco-green text-eco-green bg-eco-green/5" : "border-red-300 text-red-500 bg-red-50"
                                    )}>
                                      {session.isPassed ? "Hoàn thành" : "Thất bại"}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                                    <Calendar className="w-3 h-3" /> {new Date(session.sessionStart).toLocaleDateString('vi-VN')}
                                    <Clock className="w-3 h-3 ml-2" /> {new Date(session.sessionStart).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-8">
                                <div className="text-center">
                                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Độ chính xác</p>
                                  <div className="flex items-center justify-center gap-1.5">
                                    <Percent className="w-3.5 h-3.5 text-eco-green" />
                                    <span className="text-lg font-black text-foreground">{session.accuracyPercentage}%</span>
                                  </div>
                                </div>
                                <div className="text-center hidden sm:block">
                                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Thời gian</p>
                                  <div className="flex items-center justify-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-lg font-black text-foreground">{session.timeTakenSeconds}s</span>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Xu nhận</p>
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="text-lg font-black text-amber-500">+{session.coinAwarded}</span>
                                    <span className="text-xs font-bold text-amber-500 ml-0.5">XU</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="quizzes" className="space-y-6 mt-0">
                  {history.quizHistories?.map((quiz, qIdx) => (
                    <div key={qIdx} className="space-y-3">
                      <div className="flex items-center gap-2 px-2">
                        <div className="w-2 h-6 bg-eco-green rounded-full" />
                        <h4 className="font-black text-lg text-foreground">{quiz.quizTitle}</h4>
                      </div>
                      <div className="grid gap-4">
                        {quiz.attempts?.map((attempt, aIdx) => (
                          <div key={aIdx} className="group relative bg-card hover:bg-muted/30 border-2 border-border/50 hover:border-eco-green/30 rounded-2xl p-5 transition-all duration-300">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm font-black text-lg",
                                  attempt.isPassed ? "bg-eco-green/10 text-eco-green" : "bg-red-50 text-red-500"
                                )}>
                                  #{attempt.attemptNumber}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-foreground">Lần {attempt.attemptNumber}</span>
                                    <Badge variant="outline" className={cn(
                                      "text-[10px] px-2 py-0 h-5 font-bold uppercase",
                                      attempt.isPassed ? "border-eco-green text-eco-green bg-eco-green/5" : "border-red-300 text-red-500 bg-red-50"
                                    )}>
                                      {attempt.isPassed ? "Đạt" : "Không đạt"}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                                    <Clock className="w-3 h-3" /> Thời gian: {attempt.timeTakenSeconds}s
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-12">
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Điểm số</p>
                                  <div className="flex items-center justify-end gap-2">
                                    <TrendingUp className={cn("w-4 h-4", attempt.isPassed ? "text-eco-green" : "text-red-500")} />
                                    <span className={cn("text-2xl font-black", attempt.isPassed ? "text-eco-green" : "text-red-500")}>
                                      {attempt.scorePercentage}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SchoolLeaderboardPage() {
  const { allCampaigns } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignType, setCampaignType] = useState("school");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedRoundId, setSelectedRoundId] = useState("");
  const [rounds, setRounds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // History State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

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
    const c = relevantCampaigns.all.find(c => c.id === selectedCampaignId);
    return c?.name || c?.campaignName || "";
  }, [relevantCampaigns.all, selectedCampaignId]);

  const fetchLeaderboard = async () => {
    if (!selectedCampaignId) { setLeaderboardData([]); return; }
    try {
      setIsLoading(true);
      let res;
      if (campaignType === "partnership") {
        if (selectedRoundId) {
          res = await campaignService.getPartnershipLeaderboard(selectedCampaignId, selectedRoundId);
        } else {
          setLeaderboardData([]);
          return;
        }
      } else {
        res = await campaignService.getCampaignLeaderboard(selectedCampaignId);
      }
      setLeaderboardData(res?.data?.data || []);
    } catch { setLeaderboardData([]); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchLeaderboard(); }, [selectedCampaignId, selectedRoundId]);

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setIsHistoryModalOpen(true);
    setIsHistoryLoading(true);
    try {
      if (selectedCampaignId && selectedRoundId) {
        const res = await campaignService.getStudentHistory(selectedCampaignId, selectedRoundId, student.studentId);
        setStudentHistory(res?.data?.data || null);
      } else {
        setStudentHistory(null);
      }
    } catch {
      setStudentHistory(null);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    const list = campaignType === "school" ? relevantCampaigns.school : relevantCampaigns.partnership;
    const initialId = list[0]?.id || "";
    setSelectedCampaignId(initialId);

    if (!list.length) {
      setLeaderboardData([]);
      setRounds([]);
      setSelectedRoundId("");
    }
    setCurrentPage(1);
    setSearchQuery("");
  }, [campaignType, relevantCampaigns.school, relevantCampaigns.partnership]);

  useEffect(() => {
    if (selectedCampaignId) {
      const fetchRounds = async () => {
        try {
          let res;
          if (campaignType === "partnership") {
            res = await campaignService.getPartnershipInvitationDetail(selectedCampaignId);
            const rds = res.data?.data?.rounds || [];
            setRounds(rds);
            setSelectedRoundId(rds[0]?.roundId || "");
          } else {
            res = await campaignService.getCampaignById(selectedCampaignId);
            const rds = res.data?.data?.rounds || [];
            const formattedRounds = rds.map(r => ({
              roundId: r.id,
              roundName: r.roundName || `Vòng ${r.roundNumber || 1}`
            }));
            setRounds(formattedRounds);
            setSelectedRoundId(formattedRounds[0]?.roundId || "");
          }
        } catch {
          setRounds([]);
          setSelectedRoundId("");
        }
      };
      fetchRounds();
    } else {
      setRounds([]);
      setSelectedRoundId("");
    }
  }, [selectedCampaignId, campaignType]);

  const filteredLeaderboard = useMemo(() =>
    leaderboardData.filter(item =>
      (item.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.schoolName || "").toLowerCase().includes(searchQuery.toLowerCase())
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
                <div className="flex-1 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border/60">
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
                            key={c.id}
                            value={c.id}
                            className="font-medium py-2.5 rounded-lg"
                          >
                            {c.name || c.campaignName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Round Selector for Partnership */}
                  {isPartnership && rounds.length > 0 && (
                    <div className="sm:w-48 flex items-center px-4 py-3">
                      <Select
                        value={selectedRoundId}
                        onValueChange={v => { setSelectedRoundId(v); setCurrentPage(1); }}
                      >
                        <SelectTrigger className={cn(
                          "h-10 border-2 rounded-xl font-semibold w-full",
                          isPartnership ? "border-amber-300/60" : "border-eco-green/30"
                        )}>
                          <div className="flex items-center gap-2 min-w-0">
                            <Target className={cn("w-4 h-4 shrink-0", isPartnership ? "text-amber-500" : "text-eco-green")} />
                            <SelectValue placeholder="Chọn vòng..." />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2 shadow-xl">
                          {rounds.map(r => (
                            <SelectItem key={r.roundId} value={r.roundId} className="font-medium py-2.5 rounded-lg">
                              {r.roundName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
                <div className="flex items-end justify-center gap-2 sm:gap-4 max-w-md mx-auto px-2">
                  <PodiumCard item={top3[1]} rank={2} isPartnership={isPartnership} onClick={handleStudentClick} />
                  <PodiumCard item={top3[0]} rank={1} isPartnership={isPartnership} onClick={handleStudentClick} />
                  <PodiumCard item={top3[2]} rank={3} isPartnership={isPartnership} onClick={handleStudentClick} />
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
                    <RankRow key={`${item.studentId}-${item.rank}`} item={item} isPartnership={isPartnership} onClick={handleStudentClick} />
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

      {/* ── Student History Modal ────────────────────────────────────────── */}
      <StudentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        student={selectedStudent}
        history={studentHistory}
        isLoading={isHistoryLoading}
      />
    </div>
  );
}
