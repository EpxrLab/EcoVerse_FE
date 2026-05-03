import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, Button, Select, Space, Dropdown } from "antd";
import {
  TrophyOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  AimOutlined,
  EyeOutlined,
  HistoryOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { Crown, Medal, Layers, ChevronRight, Lock } from "lucide-react";
import { motion } from "framer-motion";
import {
  getAuthenticatedStudentProfile,
  getCampaignDetails,
  getRoundLeaderboard,
} from "../../services";

// ─── CoinIcon ─────────────────────────────────────────────────────────────────
const CoinIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="10" opacity="0.2" />
    <circle cx="12" cy="12" r="8" />
    <text
      x="12"
      y="16"
      fontSize="10"
      fontWeight="bold"
      fill="white"
      textAnchor="middle"
    >
      ₫
    </text>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PODIUM_HEIGHT = { 1: "h-32", 2: "h-24", 3: "h-20" };
const PODIUM_GRADIENT = {
  1: "bg-amber-500",
  2: "bg-slate-400",
  3: "bg-orange-500",
};
const AVATAR_GRADIENT = {
  1: "bg-amber-500 text-white",
  2: "bg-slate-400 text-white",
  3: "bg-orange-500 text-white",
};

const fmtTime = (sec) => {
  if (!sec && sec !== 0) return "—";
  if (sec < 60) return `${sec.toFixed(0)}s`;
  return `${Math.floor(sec / 60)}m${String(Math.round(sec % 60)).padStart(2, "0")}s`;
};

const RankIcon = ({ rank }) => {
  if (rank === 1) return <Crown size={28} className="text-amber-500" />;
  if (rank === 2) return <Medal size={24} className="text-slate-400" />;
  if (rank === 3) return <Medal size={22} className="text-orange-500" />;
  return null;
};

// ─── PodiumSlot ───────────────────────────────────────────────────────────────

function PodiumSlot({ entry, isFirst, isPartnership }) {
  if (!entry) return <div className="w-28" />;
  const initial = (entry.studentName ?? "?").charAt(0).toUpperCase();

  return (
    <div className={`flex flex-col items-center ${isFirst ? "-mt-8" : ""}`}>
      {isFirst && (
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
        >
          <Crown size={40} className="text-amber-500 mb-1" />
        </motion.div>
      )}

      {/* Avatar */}
      <div
        className={`rounded-full flex items-center justify-center font-black shadow-xl border-4 border-white mb-3
        ${AVATAR_GRADIENT[entry.rank] ?? "bg-primary text-white"}
        ${isFirst ? "w-20 h-20 text-3xl" : "w-16 h-16 text-2xl"}`}
      >
        {initial}
      </div>

      {/* Name / School */}
      <div className="text-center mb-3 max-w-[110px]">
        <p
          className={`font-bold text-gray-800 leading-tight ${isFirst ? "text-base" : "text-sm"}`}
        >
          {entry.studentName}
        </p>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">
          {entry.schoolName}
        </p>
        {!isPartnership && (
          <div className="flex items-center justify-center gap-1 mt-1.5">
            <CoinIcon className="w-4 h-4 text-amber-500" />
            <span
              className={`font-bold text-amber-600 ${isFirst ? "text-base" : "text-sm"}`}
            >
              {entry.totalCoinsEarned?.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Podium block */}
      <div
        className={`w-24 rounded-t-2xl flex items-center justify-center shadow-md
        ${PODIUM_HEIGHT[entry.rank] ?? "h-16"} ${PODIUM_GRADIENT[entry.rank] ?? "bg-gray-200"}`}
      >
        <span
          className={`font-black text-white ${isFirst ? "text-4xl" : "text-3xl"}`}
        >
          {entry.rank}
        </span>
      </div>
    </div>
  );
}

// ─── Animation ────────────────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const row = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.28 } },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudentLeaderboard() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);

  const [entries, setEntries] = useState([]); // leaderboardData
  const [currentUser, setCurrentUser] = useState(null); // authenticated student profile
  const [selectedRoundId, setSelectedRoundId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const resCamapign = await getCampaignDetails(campaignId);
        const campaignData = resCamapign?.data;
        setCampaign(campaignData ?? null);

        // Auto-select first round
        if (campaignData?.rounds?.length > 0) {
          setSelectedRoundId(campaignData.rounds[0].id);
        }

        const profileRes = await getAuthenticatedStudentProfile();
        setCurrentUser(profileRes?.data ?? null);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [campaignId]);

  useEffect(() => {
    (async () => {
      if (!selectedRoundId) return;
      try {
        const lbRes = await getRoundLeaderboard(selectedRoundId);
        setEntries(lbRes?.data ?? []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [campaignId, selectedRoundId]);

  const selectedRound = useMemo(
    () => campaign?.rounds?.find((r) => r.id === selectedRoundId),
    [campaign?.rounds, selectedRoundId],
  );

  const isCampaignCompleted = useMemo(() => {
    if (!campaign) return false;
    // Check if ALL game levels and ALL mandatory quizzes are passed across all rounds
    return (campaign.rounds ?? []).every((round) => {
      const gamesPassed = (round.games ?? []).every((game) =>
        (game.presets ?? []).every((preset) =>
          (preset.items ?? []).every((item) => item.isPassed),
        ),
      );
      const quizzesPassed = (round.quizzes ?? []).every((quiz) =>
        quiz.isRequired ? quiz.isPassed : true,
      );
      return gamesPassed && quizzesPassed;
    });
  }, [campaign]);

  const isPartnership = campaign?.campaignType === "PARTNERSHIP_EVENT";
  const isCampaignFinished = campaign?.status === "COMPLETED";

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-400">Không tìm thấy chiến dịch</p>
          <Button
            type="primary"
            onClick={() => navigate("/student")}
            className="rounded-xl"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const topThree = entries.slice(0, 3);

  // Tìm entry của current user trong leaderboard
  const myEntry = currentUser
    ? entries.find((e) => e.studentId === currentUser.id)
    : null;

  return (
    <div className="space-y-5 pb-8">
      {/* ── Breadcrumb ── */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm text-gray-400"
      >
        <Button
          type="text"
          size="small"
          icon={<HomeOutlined />}
          onClick={() => navigate(`/student/campaign/${campaignId}`)}
          className="text-gray-400 hover:text-gray-700"
        >
          Dashboard
        </Button>
        <span>/</span>
        <span className="text-gray-700 font-medium">Bảng xếp hạng</span>
      </motion.div>

      {/* ── Hero header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42 }}
      >
        <Card
          className="border-0 shadow-lg overflow-hidden rounded-3xl"
          bodyStyle={{ padding: 0 }}
        >
          <div className="relative bg-gradient-mint-eco p-8 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-black text-white flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl">
                      <TrophyOutlined className="text-2xl text-white" />
                    </div>
                    Bảng xếp hạng
                  </h1>
                  {selectedRound?.isFinalRound && (
                    <span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white/20 text-white border border-white/30 rounded-full backdrop-blur-md animate-pulse">
                      Chung kết
                    </span>
                  )}
                </div>
                <p className="text-white/80 font-medium">
                  {campaign.campaignName ?? campaign.name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <p className="text-xs text-white/60 font-bold uppercase tracking-widest">
                    {entries.length} người tham gia
                  </p>
                </div>
              </div>

              {/* Xếp hạng của tôi */}
              {myEntry && (
                <Card
                  className="border-0 rounded-2xl bg-white/10 backdrop-blur-md flex-shrink-0 shadow-2xl border-white/20"
                  bodyStyle={{ padding: "20px" }}
                >
                  <p className="text-[10px] text-white/60 mb-2 text-center font-black uppercase tracking-widest">
                    Xếp hạng của bạn
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg border-2 border-white/30">
                      <TrophyOutlined className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white leading-none">
                        #{myEntry.rank}
                      </p>
                      {!isPartnership && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <CoinIcon className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-sm font-bold text-white">
                            {myEntry.totalCoinsEarned?.toLocaleString()} xu
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Main Content Area ── */}
      {!isCampaignCompleted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-10"
        >
          <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-md border border-gray-100">
            <div className="py-20 flex flex-col items-center text-center px-6">
              <div className="w-24 h-24 rounded-[2rem] bg-amber-50 flex items-center justify-center mb-8 shadow-inner">
                <Lock className="w-12 h-12 text-amber-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">
                Bảng xếp hạng đang tạm khóa
              </h2>
              <p className="text-gray-500 max-w-lg text-lg leading-relaxed mb-10">
                Để đảm bảo tính công bằng và chính xác, bảng xếp hạng chỉ hiển
                thị khi bạn đã hoàn thành{" "}
                <span className="font-bold text-primary">tất cả</span> các vòng
                chơi và quiz trong chiến dịch này.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate(`/student/campaign/${campaignId}`)}
                  className="h-14 rounded-2xl bg-primary border-primary hover:bg-primary/90 font-black text-base shadow-xl shadow-primary/20 flex-1"
                >
                  Quay lại Dashboard
                </Button>
                <Button
                  size="large"
                  onClick={() =>
                    navigate(`/student/campaign/${campaignId}/game`)
                  }
                  className="h-14 rounded-2xl border-2 border-gray-100 font-bold text-base text-gray-600 hover:border-primary/30 hover:text-primary flex-1"
                >
                  Hoàn thành nhiệm vụ
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* ── Round Selection ── */}
          {campaign?.rounds?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card
                className="border-2 border-primary/20 rounded-2xl shadow-sm hover:border-primary/40 transition-colors bg-white max-w-sm"
                bodyStyle={{ padding: "20px" }}
              >
                <Space direction="vertical" className="w-full" size="middle">
                  <div className="flex items-center gap-2 text-primary font-black px-1 uppercase tracking-wider text-xs">
                    <Layers className="w-4 h-4" />
                    <span>Vòng thi đấu</span>
                  </div>
                  <Select
                    className="w-full h-12"
                    placeholder="Chọn vòng"
                    value={selectedRoundId}
                    onChange={setSelectedRoundId}
                    size="large"
                    suffixIcon={<ChevronRight className="w-4 h-4" />}
                    dropdownClassName="rounded-xl overflow-hidden shadow-xl"
                    options={
                      campaign?.rounds?.map((round) => {
                        const status = round.status;
                        const statusLabel =
                          status === "UPCOMING"
                            ? " (Chưa mở)"
                            : status === "COMPLETED"
                              ? " (Đã kết thúc)"
                              : "";
                        return {
                          label: `${round.roundName || `Vòng ${round.roundNumber}`}${statusLabel}`,
                          value: round.id,
                        };
                      }) || []
                    }
                  />
                </Space>
              </Card>
            </motion.div>
          )}

          {/* ── Podium Top 3 ── */}
          {topThree.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <Card
                className="border-2 shadow-md rounded-3xl"
                bodyStyle={{ padding: "28px 24px 0" }}
              >
                <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
                  🏆 Top 3
                </h2>
                <div className="flex items-end justify-center gap-2 sm:gap-3 overflow-hidden pb-0">
                  {/* 2nd */}
                  <PodiumSlot
                    entry={topThree[1]}
                    isFirst={false}
                    isPartnership={isPartnership}
                  />
                  {/* 1st */}
                  <PodiumSlot
                    entry={topThree[0]}
                    isFirst={true}
                    isPartnership={isPartnership}
                  />
                  {/* 3rd */}
                  <PodiumSlot
                    entry={topThree[2]}
                    isFirst={false}
                    isPartnership={isPartnership}
                  />
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── Full leaderboard table ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          >
            <Card
              className="border-2 rounded-3xl shadow-sm"
              bodyStyle={{ padding: "20px" }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Bảng xếp hạng đầy đủ
              </h3>

              <motion.div
                className="space-y-2.5"
                variants={stagger}
                initial="hidden"
                animate="visible"
              >
                {entries.map((entry) => {
                  const isMe =
                    currentUser && entry.studentId === currentUser.id;
                  const initial = (entry.studentName ?? "?")
                    .charAt(0)
                    .toUpperCase();
                  const avatarColor =
                    AVATAR_GRADIENT[entry.rank] ?? "bg-primary text-white";

                  return (
                    <motion.div key={entry.studentId} variants={row}>
                      <div
                        className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-200
                    ${
                      isMe
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : entry.rank <= 3
                          ? "border-amber-100 bg-amber-50/30 hover:shadow-sm"
                          : "border-border bg-white hover:border-primary/20 hover:shadow-sm"
                    }`}
                      >
                        {/* Rank */}
                        <div className="w-12 flex-shrink-0 flex flex-col items-center">
                          {entry.rank <= 3 ? (
                            <>
                              <RankIcon rank={entry.rank} />
                              <span className="text-[10px] font-black text-muted-foreground mt-1 uppercase">
                                #{entry.rank}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-black text-muted-foreground/30">
                              #{entry.rank}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0
                      shadow-inner ${avatarColor}`}
                        >
                          {initial}
                        </div>

                        {/* Name + School */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-black text-foreground truncate ${isMe ? "text-primary" : "text-sm"}`}
                            >
                              {entry.studentName}
                              {isMe && (
                                <span className="ml-2 text-[9px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                  Bạn
                                </span>
                              )}
                            </p>

                            {isCampaignFinished && (
                              <Dropdown
                                menu={{
                                  items: [
                                    {
                                      key: "game",
                                      label: "Xem lịch sử chơi Game",
                                      icon: <HistoryOutlined />,
                                      onClick: () =>
                                        navigate(
                                          `/student/campaign/${campaignId}/game`,
                                        ),
                                    },
                                    {
                                      key: "quiz",
                                      label: "Xem lịch sử Quiz",
                                      icon: <FileSearchOutlined />,
                                      onClick: () =>
                                        navigate(
                                          `/student/campaign/${campaignId}/quiz`,
                                        ),
                                    },
                                  ],
                                }}
                                trigger={["click"]}
                                placement="bottomRight"
                              >
                                <Button
                                  size="small"
                                  type="text"
                                  icon={
                                    <EyeOutlined className="text-gray-400" />
                                  }
                                  className="hover:bg-primary/5 rounded-full flex items-center justify-center"
                                />
                              </Dropdown>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate">
                            {entry.schoolName}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          {/* Xu */}
                          {!isPartnership && (
                            <div className="text-center min-w-[52px]">
                              <div className="flex items-center justify-center gap-1">
                                <CoinIcon className="w-3.5 h-3.5 text-amber-500" />
                                <span className="font-bold text-amber-600 text-sm">
                                  {entry.totalCoinsEarned?.toLocaleString()}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400">Xu</p>
                            </div>
                          )}

                          {/* Độ chính xác */}
                          <div className="text-center min-w-[52px] hidden sm:block">
                            <p className="font-bold text-primary text-sm flex items-center justify-center gap-0.5">
                              <AimOutlined className="text-xs" />
                              {entry.combinedAccuracyPercentage?.toFixed(1)}%
                            </p>
                            <p className="text-[10px] text-gray-400">
                              Chính xác
                            </p>
                          </div>

                          {/* Thời gian TB */}
                          <div className="text-center min-w-[52px] hidden md:block">
                            <p className="font-bold text-primary text-sm flex items-center justify-center gap-0.5">
                              <ClockCircleOutlined className="text-xs" />
                              {fmtTime(entry.avgTimeSeconds)}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              TG trung bình
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {entries.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-14 text-gray-400">
                    <TrophyOutlined className="text-5xl opacity-20" />
                    <p className="text-sm font-medium">
                      Chưa có dữ liệu xếp hạng
                    </p>
                  </div>
                )}
              </motion.div>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
