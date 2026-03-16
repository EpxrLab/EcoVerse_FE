import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, Button, Progress, Spin } from "antd";
import {
  PlayCircleOutlined,
  LockOutlined,
  StarOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  AimOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Star, Lock, Play } from "lucide-react";
import { motion } from "framer-motion";
import { fetchGameLevels } from "../../features/eco-game/services/ecoGame.service";

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
  easy: { label: "Dễ", bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  medium: { label: "Trung bình", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  hard: { label: "Khó", bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
};

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

  const [gameLevels, setGameLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch game levels from API
  useEffect(() => {
    let cancelled = false;

    async function loadLevels() {
      try {
        setLoading(true);
        setError(null);
        const levels = await fetchGameLevels(campaignId);
        if (!cancelled) {
          setGameLevels(levels);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Không thể tải danh sách level. Vui lòng thử lại.");
          console.error("[StudentGame] Failed to fetch game levels:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLevels();
    return () => { cancelled = true; };
  }, [campaignId]);

  const completedLevels = gameLevels.filter((l) => l.completed);
  const totalStars = gameLevels.reduce((sum, l) => sum + (l.stars || 0), 0);
  const maxStars = gameLevels.length * 3;
  const totalCoins = completedLevels.reduce((sum, l) => sum + (l.coinReward || 0), 0);

  const handlePlayLevel = (levelId) => {
    navigate(`/student/campaign/${campaignId}/game/play?levelId=${levelId}`);
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
          <div className="relative bg-gradient-to-br from-green-50 via-purple-50 to-blue-50 p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
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
                  className="border-2 border-green-200 rounded-2xl"
                  bodyStyle={{ padding: "16px" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                      <CheckCircleOutlined className="text-xl text-green-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500">Level hoàn thành</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {completedLevels.length}/{gameLevels.length}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="border-2 border-amber-200 rounded-2xl"
                  bodyStyle={{ padding: "16px" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                      <StarOutlined className="text-xl text-amber-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500">Sao đạt được</p>
                      <p className="text-2xl font-bold text-amber-500">
                        {totalStars}/{maxStars}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="border-2 border-amber-200 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50"
                  bodyStyle={{ padding: "16px" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <CoinIcon />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500">Xu kiếm được</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {totalCoins}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

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
              <span className="text-sm font-bold text-green-600">
                {gameLevels.length > 0
                  ? Math.round((completedLevels.length / gameLevels.length) * 100)
                  : 0}
                %
              </span>
            </div>
            <Progress
              percent={
                gameLevels.length > 0
                  ? Math.round((completedLevels.length / gameLevels.length) * 100)
                  : 0
              }
              strokeColor="#22c55e"
              trailColor="#e5e7eb"
              strokeWidth={12}
            />
          </div>
        </Card>
      </motion.div>

      {/* Game Levels */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {gameLevels.map((level, index) => {
          const diffStyle = DIFFICULTY_LABELS[level.difficulty] || DIFFICULTY_LABELS.medium;

          return (
            <motion.div
              key={level.id}
              variants={cardVariants}
              whileHover={
                !level.locked ? { y: -6, transition: { duration: 0.2 } } : {}
              }
            >
              <Card
                className={`rounded-2xl border-2 transition-all ${
                  level.locked ? "opacity-50" : "hover:shadow-xl"
                } ${level.completed ? "border-green-200" : "border-gray-100"}`}
                bodyStyle={{ padding: "24px" }}
              >
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
                        Level {index + 1}
                      </h3>
                      <p className="text-lg font-semibold text-gray-500">
                        {level.name}
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                      🎮
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gray-50">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-8 h-8 ${star <= (level.stars || 0) ? "fill-amber-500 text-amber-500" : "text-gray-300"}`}
                      />
                    ))}
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
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <CoinIcon className="w-4 h-4 text-amber-500" />
                        Phần thưởng
                      </span>
                      <span className="font-semibold text-amber-600">
                        +{level.coinReward || 0} xu
                      </span>
                    </div>
                    {level.sorter?.timeLimit > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">⏱️ Thời gian phân loại</span>
                        <span className="font-semibold text-gray-800">
                          {level.sorter.timeLimit}s
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    block
                    type={level.locked ? "default" : "primary"}
                    size="large"
                    onClick={() => !level.locked && handlePlayLevel(level.id)}
                    disabled={level.locked}
                    icon={
                      level.locked ? (
                        <LockOutlined />
                      ) : (
                        <Play className="w-4 h-4" />
                      )
                    }
                    className={`rounded-xl font-semibold ${
                      level.locked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : level.completed
                          ? "bg-green-500 border-green-500 hover:bg-green-600"
                          : "bg-blue-500 border-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {level.locked
                      ? "Đã khoá"
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
}
