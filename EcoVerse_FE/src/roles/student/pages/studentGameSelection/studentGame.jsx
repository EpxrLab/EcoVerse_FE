import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Card,
  Button,
  Progress,
  Spin,
  Modal,
  Empty,
  Tag,
  Pagination,
} from "antd";
import {
  PlayCircleOutlined,
  LockOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  AimOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Star, Lock, Play, History, Clock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Select, Space } from "antd";
import { Layers, ChevronRight, RotateCcw } from "lucide-react";
import { getCampaignDetails, getGameHistory } from "../../services";
import { toLocalISO } from "@/utils/dateUtils";

// ─── CoinIcon ─────────────────────────────────────────────────────────────────

const CoinIcon = ({ className = "w-6 h-6 text-white" }) => (
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

// ─── Difficulty badge color mapping ───────────────────────────────────────────

const DIFFICULTY_LABELS = {
  EASY: {
    label: "Dễ",
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  },
  MEDIUM: {
    label: "Trung bình",
    bg: "bg-secondary/10",
    text: "text-secondary",
    border: "border-secondary/20",
  },
  HARD: {
    label: "Khó",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
  },
};

// ─── Filter Categories ────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  {
    key: "all",
    label: "Tất cả",
    activeClass: "bg-gray-800 text-white border-gray-800",
  },
  {
    key: "EASY",
    label: "Dễ",
    activeClass: "bg-primary text-white border-primary",
  },
  {
    key: "MEDIUM",
    label: "Trung bình",
    activeClass: "bg-secondary text-white border-secondary",
  },
  {
    key: "HARD",
    label: "Khó",
    activeClass: "bg-red-500 text-white border-red-500",
  },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function StudentGame() {
  const navigate = useNavigate();
  const { campaignId } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [gameLevels, setGameLevels] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isCompletedMode, setIsCompletedMode] = useState(false);
  const isPartnership = campaign?.campaignType === "PARTNERSHIP_EVENT";

  useEffect(() => {
    let cancelled = false;

    async function loadCampaign() {
      try {
        setLoading(true);
        setError(null);
        const res = await getCampaignDetails(campaignId);
        if (!cancelled) {
          const campaignData = res.data;
          setCampaign(campaignData);
          if (campaignData?.rounds?.length > 0) {
            setSelectedRoundId(campaignData.rounds[0].id);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError("Không thể tải thông tin chiến dịch. Vui lòng thử lại.");
          console.error("[StudentGame] Failed to fetch campaign:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCampaign();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  useEffect(() => {
    if (campaign && selectedRoundId) {
      const round = campaign.rounds.find((r) => r.id === selectedRoundId);
      if (round) {
        // Evaluate access based on round status
        const status = round.status;
        setIsPreviewMode(status === "UPCOMING");
        setIsCompletedMode(status === "COMPLETED");

        if (round.games) {
          const flattenedLevels = [];
          round.games.forEach((game) => {
            if (game.presets) {
              game.presets.forEach((preset) => {
                if (preset.items) {
                  preset.items.forEach((item) => {
                    flattenedLevels.push({
                      id: `${game.roundGameConfigId}-${preset.presetId}-${item.levelNumber}`,
                      roundGameConfigId: game.roundGameConfigId,
                      typeCode: game.typeCode,
                      gameTypeName: game.gameTypeName,
                      presetId: preset.presetId,
                      difficulty: preset.difficulty,
                      levelNumber: item.levelNumber,
                      name: `Level ${item.levelNumber}`, // Or format based on type
                      itemsCount: item.itemCount,
                      sorter: { timeLimit: item.timeLimitSeconds },
                      coinReward: game.coinPerSession,
                      completed: item.isPassed === true,
                      locked: false, // Determine your lock logic if any
                      stars: 0, // Not explicitly provided in new API payload without attempt result
                      todayAttempts: item.todayAttempts || 0,
                      maxDailyAttempts: item.maxDailyAttempts || 0,
                    });
                  });
                }
              });
            }
          });
          // Sort levels by levelNumber
          flattenedLevels.sort((a, b) => a.levelNumber - b.levelNumber);

          // Lock logic: level is unlocked if it's the first one, or if the previous one is completed (Per difficulty)
          const difficulties = ["EASY", "MEDIUM", "HARD"];
          difficulties.forEach((diff) => {
            const diffLevels = flattenedLevels.filter(
              (l) => l.difficulty === diff,
            );
            diffLevels.forEach((level, index) => {
              if (index === 0) level.locked = false;
              else level.locked = !diffLevels[index - 1].completed;
            });
          });

          setGameLevels(flattenedLevels);
        } else {
          setGameLevels([]);
        }
      }
    }
  }, [selectedRoundId, campaign]);

  const completedLevels = gameLevels.filter((l) => l.completed);
  const totalStars = gameLevels.reduce((sum, l) => sum + (l.stars || 0), 0);
  const maxStars = gameLevels.length * 3;
  const totalCoins = completedLevels.reduce(
    (sum, l) => sum + (l.coinReward || 0),
    0,
  );

  const filteredLevels =
    selectedDifficulty === "all"
      ? gameLevels
      : gameLevels.filter((l) => l.difficulty === selectedDifficulty);

  const handlePlayLevel = (level) => {
    navigate(
      `/student/campaign/${campaignId}/round/${selectedRoundId}/game/${level.roundGameConfigId}/play`,
      {
        state: {
          levelNumber: level.levelNumber,
          presetId: level.presetId,
          typeCode: level.typeCode,
        },
      },
    );
  };

  const fetchGameHistoryData = async (configId, levelNumber, presetId) => {
    setHistoryLoading(true);
    try {
      const res = await getGameHistory(campaignId, selectedRoundId, configId);
      // Filter sessions that match the selected level number AND presetId
      const filteredHistory = (res.data || []).filter(
        (item) =>
          item.currentLevel === levelNumber && item.presetId === presetId,
      );
      setGameHistory(filteredHistory);
    } catch (err) {
      console.error("[StudentGame] Failed to fetch game history:", err);
      setGameHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenHistory = (level) => {
    setSelectedLevel(level);
    setHistoryModalOpen(true);
    setHistoryPage(1);
    fetchGameHistoryData(
      level.roundGameConfigId,
      level.levelNumber,
      level.presetId,
    );
  };

  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ─── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <span className="ml-4 text-gray-500 text-lg">Đang tải level...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <Button type="primary" onClick={() => window.location.reload()}>
          Tải lại
        </Button>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
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
        <span className="text-gray-700 font-medium">Game</span>
      </motion.div>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className="border-2 shadow-lg overflow-hidden rounded-3xl"
          bodyStyle={{ padding: 0 }}
        >
          <div className="relative bg-primary/5 p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                    <PlayCircleOutlined className="text-2xl text-white" />
                  </div>
                  Chơi Game
                </h1>
                <p className="text-gray-500 text-lg">
                  Phân loại rác thải qua các level thú vị
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <Card
                  className="border-2 border-primary/20 rounded-2xl"
                  bodyStyle={{ padding: "16px" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CheckCircleOutlined className="text-xl text-primary" />
                    </div>
                    <div className="text-left whitespace-nowrap">
                      <p className="text-sm text-gray-500">Level hoàn thành</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {completedLevels.length}/{gameLevels.length}
                      </p>
                    </div>
                  </div>
                </Card>

                {campaign?.campaignType !== "PARTNERSHIP_EVENT" && (
                  <Card
                    className="border-2 border-amber-200 rounded-2xl bg-amber-50"
                    bodyStyle={{ padding: "16px" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
                        <CoinIcon />
                      </div>
                      <div className="text-left whitespace-nowrap">
                        <p className="text-sm text-gray-500">Xu kiếm được</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {totalCoins}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Round Selection */}
      {campaign?.campaignType !== "SCHOOL_INTERNAL" && (
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
                options={campaign?.rounds?.map((round) => {
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
                })}
              />
              {(() => {
                const selectedRound = campaign?.rounds?.find(
                  (r) => r.id === selectedRoundId,
                );
                if (!selectedRound) return null;
                return (
                  <div className="mt-1 text-sm flex flex-col gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">
                        Bắt đầu:
                      </span>
                      <span className="text-primary font-bold">
                        {new Date(selectedRound.startTime).toLocaleString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">
                        Kết thúc:
                      </span>
                      <span className="text-gray-800 font-bold">
                        {new Date(selectedRound.endTime).toLocaleString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </Space>
          </Card>
        </motion.div>
      )}

      {/* Preview Mode Notification */}
      {isPreviewMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-amber-100 flex items-center justify-center">
              <LockOutlined className="text-amber-500 text-2xl" />
            </div>
            <div>
              <h3 className="text-amber-800 text-lg font-bold m-0">
                Vòng đấu chưa mở
              </h3>
              <p className="text-amber-700 m-0 mt-1">
                Vòng đấu này hiện chưa tới thời gian bắt đầu nên bạn chưa thể
                tham gia. Hãy quay lại sau nhé!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Completed Mode Notification */}
      {isCompletedMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-100 flex items-center justify-center">
              <Star className="text-blue-500 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-blue-800 text-lg font-bold m-0">
                Vòng đấu đã kết thúc
              </h3>
              <p className="text-blue-700 m-0 mt-1">
                Vòng đấu này đã hoàn thành. Bạn có thể xem lại các level nhưng
                không thể tham gia chơi mới hoặc chơi lại.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card
          className="border-2 rounded-2xl shadow-sm"
          bodyStyle={{ padding: "24px" }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Tiến độ hoàn thành
              </span>
              <span className="text-sm font-bold text-primary">
                {gameLevels.length > 0
                  ? Math.round(
                      (completedLevels.length / gameLevels.length) * 100,
                    )
                  : 0}
                %
              </span>
            </div>
            <Progress
              percent={
                gameLevels.length > 0
                  ? Math.round(
                      (completedLevels.length / gameLevels.length) * 100,
                    )
                  : 0
              }
              strokeColor={gameLevels.length > 0 ? "#4cc41cff" : "#e5e7eb"}
              trailColor="#f3f4f6"
              strokeWidth={12}
              showInfo={false}
              className="m-0"
            />
          </div>
        </Card>
      </motion.div>

      {/* Difficulty Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card
          className="border-2 border-gray-100 rounded-2xl shadow-sm bg-white"
          bodyStyle={{ padding: "16px 24px" }}
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest whitespace-nowrap">
                Lọc độ khó
              </span>
            </div>
            <div className="flex gap-1.5 flex-nowrap">
              {FILTER_OPTIONS.map(({ key, label, activeClass }) => (
                <button
                  key={key}
                  onClick={() => setSelectedDifficulty(key)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border-2 transition-all duration-300 uppercase tracking-wider whitespace-nowrap ${
                    selectedDifficulty === key
                      ? key === "all"
                        ? "bg-gray-800 text-white border-gray-800 shadow-md"
                        : `${activeClass} shadow-md`
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Game Levels */}
      <div className="space-y-12">
        {["EASY", "MEDIUM", "HARD"]
          .filter(
            (diff) =>
              selectedDifficulty === "all" || selectedDifficulty === diff,
          )
          .map((diff) => {
            const diffLevels = filteredLevels.filter(
              (l) => l.difficulty === diff,
            );
            if (diffLevels.length === 0) return null;
            const diffStyle = DIFFICULTY_LABELS[diff];

            return (
              <div key={diff} className="space-y-6">
                {selectedDifficulty === "all" && (
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-8 rounded-full ${diffStyle.bg} border-2 ${diffStyle.border}`}
                    />
                    <h2
                      className={`text-2xl font-black uppercase tracking-wider ${diffStyle.text}`}
                    >
                      Độ Khó: {diffStyle.label}
                    </h2>
                  </div>
                )}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {diffLevels.map((level, index) => {
                    return (
                      <motion.div
                        key={level.id}
                        variants={cardVariants}
                        whileHover={
                          !level.locked
                            ? { y: -6, transition: { duration: 0.2 } }
                            : {}
                        }
                      >
                        <Card
                          className={`rounded-2xl border-2 transition-all ${
                            level.locked ? "opacity-50" : "hover:shadow-xl"
                          } ${level.completed ? "border-primary/20" : "border-gray-100"} relative overflow-hidden`}
                          bodyStyle={{ padding: "24px" }}
                        >
                          {/* History Toggle Button - Top Left */}
                          <div className="absolute top-4 right-4 z-10">
                            <Button
                              size="small"
                              shape="circle"
                              icon={<History className="w-3.5 h-3.5" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenHistory(level);
                              }}
                              className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200 shadow-sm transition-all"
                            />
                          </div>
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border-2 ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}
                                  >
                                    {diffStyle.label}
                                  </span>
                                  {level.locked && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                      <Lock className="w-3 h-3" />
                                      Khoá
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-1">
                                  {level.gameTypeName} - Màn {level.levelNumber}
                                </h3>
                                <p className="text-lg font-semibold text-gray-500">
                                  {level.typeCode === "RUN_SORTING"
                                    ? "Eco Runner"
                                    : "Sea Rescue"}
                                </p>
                              </div>
                              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                                🎮
                              </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                  <AimOutlined />
                                  Số vật phẩm
                                </span>
                                <span className="font-semibold text-gray-800">
                                  {level.itemsCount || "—"}
                                </span>
                              </div>
                              {campaign?.campaignType !==
                                "PARTNERSHIP_EVENT" && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500 flex items-center gap-2">
                                    <CoinIcon className="w-4 h-4 text-amber-500" />
                                    Phần thưởng
                                  </span>
                                  <span className="font-semibold text-amber-600">
                                    +{level.coinReward || 0} xu
                                  </span>
                                </div>
                              )}
                              {level.sorter?.timeLimit > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">
                                    ⏱️ Thời gian phân loại
                                  </span>
                                  <span className="font-semibold text-gray-800">
                                    {level.sorter.timeLimit}s
                                  </span>
                                </div>
                              )}
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500 flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4" />
                                    Lượt chơi hôm nay
                                  </span>
                                  <span
                                    className={`font-bold ${
                                      level.todayAttempts >=
                                      level.maxDailyAttempts
                                        ? "text-red-500"
                                        : "text-primary"
                                    }`}
                                  >
                                    {level.todayAttempts}/
                                    {level.maxDailyAttempts}
                                  </span>
                                </div>
                              </div>

                            {/* Action Button */}
                            <Button
                              block
                              type={
                                level.locked
                                  ? "default"
                                  : isPreviewMode || isCompletedMode
                                    ? "default"
                                    : "primary"
                              }
                              size="large"
                              onClick={() =>
                                !level.locked &&
                                !isPreviewMode &&
                                !isCompletedMode &&
                                handlePlayLevel(level)
                              }
                              disabled={
                                level.locked || isPreviewMode || isCompletedMode
                              }
                              icon={
                                level.locked ||
                                isPreviewMode ||
                                isCompletedMode ? (
                                  <LockOutlined />
                                ) : level.completed ? (
                                  <RotateCcw className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )
                              }
                              className={`rounded-xl font-semibold !transition-all ${
                                level.locked || isPreviewMode || isCompletedMode
                                  ? "!bg-gray-100 !text-gray-400 cursor-not-allowed !border-transparent"
                                  : level.completed
                                    ? "!bg-green-500 !border-green-500 hover:!bg-green-600 !text-white"
                                    : "!bg-blue-600 !border-blue-600 hover:!bg-blue-700 !text-white"
                              }`}
                            >
                              {level.locked
                                ? "Đã khoá"
                                : isPreviewMode
                                  ? "Chưa mở"
                                  : isCompletedMode
                                    ? "Đã kết thúc"
                                    : level.completed
                                      ? "Chơi lại"
                                      : "Chơi ngay"}
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            );
          })}
        {filteredLevels.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Play className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Không tìm thấy game nào trong độ khó này.
            </p>
          </div>
        )}
      </div>

      {/* Game History Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg font-bold">
            <History className="w-5 h-5 text-primary" />
            <span>
              Lịch sử: {selectedLevel?.gameTypeName} - Level{" "}
              {selectedLevel?.levelNumber}
            </span>
          </div>
        }
        open={historyModalOpen}
        onCancel={() => setHistoryModalOpen(false)}
        footer={null}
        width={1100}
        className="rounded-2xl overflow-hidden"
        bodyStyle={{ padding: "12px 24px 24px" }}
      >
        {historyLoading ? (
          <div className="py-20 text-center">
            <Spin tip="Đang tải lịch sử..." />
          </div>
        ) : gameHistory.length > 0 ? (
          <div className="space-y-4 mt-4">
            <div className="space-y-3">
              {gameHistory
                .slice((historyPage - 1) * 5, historyPage * 5)
                .map((item, idx) => {
                  const globalIdx = (historyPage - 1) * 5 + idx;
                  return (
                    <div
                      key={item.sessionId || globalIdx}
                      className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-6">
                        {/* Status & Attempt */}
                        <div className="flex items-center gap-4 min-w-[120px]">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-500 shrink-0">
                            #{gameHistory.length - globalIdx}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">
                              Kết quả
                            </span>
                            {item.isPassed ? (
                              <Tag
                                color="success"
                                className="rounded-lg font-bold border-0 bg-primary/10 text-primary w-fit m-0"
                              >
                                ĐẠT
                              </Tag>
                            ) : (
                              <Tag
                                color="error"
                                className="rounded-lg font-bold border-0 bg-red-100 text-red-600 w-fit m-0"
                              >
                                K.ĐẠT
                              </Tag>
                            )}
                          </div>
                        </div>

                        <div className="hidden xl:block w-px h-10 bg-gray-200" />

                        {/* Performance Stats */}
                        <div
                          className={`grid gap-4 flex-1 ${
                            isPartnership
                              ? "grid-cols-2 md:grid-cols-3"
                              : "grid-cols-2 md:grid-cols-4"
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">
                              Chính xác
                            </span>
                            <span
                              className={`text-base font-black ${item.accuracyPercentage >= 80 ? "text-primary" : "text-amber-600"}`}
                            >
                              {item.accuracyPercentage}%
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">
                              Thời gian
                            </span>
                            <div className="flex items-center gap-1.5 text-gray-700 font-bold text-base">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {formatTime(item.timeTakenSeconds)}
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">
                              Đúng / Tổng
                            </span>
                            <span className="text-base font-black text-gray-700">
                              {item.correctItems} / {item.totalItems}
                            </span>
                          </div>

                          {!isPartnership && (
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">
                                Xu nhận
                              </span>
                              <span className="text-base font-black text-amber-600 flex items-center gap-1">
                                +{item.coinAwarded || 0}
                                <CoinIcon className="w-4 h-4" />
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="hidden xl:block w-px h-10 bg-gray-200" />

                        {/* Timing */}
                        <div className="flex flex-col sm:min-w-[220px] justify-center bg-gray-100/50 p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap mb-2 block">
                            Thời gian thực hiện
                          </span>
                          <div className="text-[11px] font-medium text-gray-500 space-y-1.5">
                            <div className="flex items-center justify-between gap-4">
                              <span className="opacity-70">Bắt đầu:</span>
                              <span className="text-gray-700 font-black">
                                {new Date(item.sessionStart).toLocaleTimeString(
                                  "vi-VN",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}{" "}
                                {new Date(item.sessionStart).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="opacity-70">Kết thúc:</span>
                              <span className="text-gray-700 font-black">
                                {new Date(item.sessionEnd).toLocaleTimeString(
                                  "vi-VN",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}{" "}
                                {new Date(item.sessionEnd).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {gameHistory.length > 5 && (
              <div className="flex justify-center pt-4">
                <Pagination
                  current={historyPage}
                  onChange={setHistoryPage}
                  pageSize={5}
                  total={gameHistory.length}
                  showSizeChanger={false}
                  className="custom-pagination"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="py-12">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="space-y-1">
                  <p className="text-gray-500 font-medium">Chưa có lịch sử</p>
                  <p className="text-xs text-gray-400">
                    Bạn chưa tham gia chơi level này lần nào.
                  </p>
                </div>
              }
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
