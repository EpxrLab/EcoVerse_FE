import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, Button, Tag, Tabs, Empty, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  BookOutlined,
  ClockCircleOutlined,
  StarOutlined,
  RightOutlined,
  LockOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  HeartOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentRoundContent } from "../../services";

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_CFG = {
  EASY: {
    label: "Dễ",
    color: "bg-green-500",
    badge: "bg-green-50 text-green-700 border-green-200",
    tab: "text-green-600",
  },
  MEDIUM: {
    label: "Trung bình",
    color: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    tab: "text-amber-600",
  },
  HARD: {
    label: "Khó",
    color: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
    tab: "text-red-600",
  },
};

const WASTE_LABEL = {
  RECYCLABLE: "Tái chế",
  ORGANIC: "Hữu cơ",
  HAZARDOUS: "Nguy hại",
  GENERAL: "Rác thông thường",
  NON_RECYCLABLE: "Không tái chế",
};

const WASTE_COLOR = {
  RECYCLABLE: "blue",
  ORGANIC: "green",
  HAZARDOUS: "red",
  GENERAL: "default",
};

const fmtTime = (s) =>
  s >= 60 ? `${Math.floor(s / 60)}p ${s % 60}s` : `${s}s`;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: "easeOut" },
  },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

// ─── LevelCard ────────────────────────────────────────────────────────────────

function LevelCard({ item, isUnlocked, isCompleted, onPlay, campaignId }) {
  return (
    <motion.div variants={fadeUp}>
      <div
        className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-200
        ${
          isCompleted
            ? "border-green-300 bg-green-50/40"
            : isUnlocked
              ? "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
              : "border-gray-100 bg-gray-50/60 opacity-60"
        }`}
      >
        {/* Left accent bar */}
        <div
          className={`absolute inset-y-0 left-0 w-1.5
          ${isCompleted ? "bg-green-500" : isUnlocked ? "bg-blue-400" : "bg-gray-300"}`}
        />

        <div className="pl-5 pr-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Level badge + info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Level number circle */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm
                ${
                  isCompleted
                    ? "bg-green-500 text-white shadow-sm shadow-green-200"
                    : isUnlocked
                      ? "bg-blue-500 text-white shadow-sm shadow-blue-200"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircleOutlined />
                ) : isUnlocked ? (
                  item.levelNumber
                ) : (
                  <LockOutlined />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-gray-800 text-sm">
                    Màn {item.levelNumber}
                  </span>
                  {isCompleted && (
                    <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      ✓ Hoàn thành
                    </span>
                  )}
                  {!isUnlocked && !isCompleted && (
                    <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
                      Chưa mở khóa
                    </span>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-2.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <HeartOutlined className="text-red-400" />
                    {item.lives} mạng
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockCircleOutlined className="text-blue-400" />
                    {fmtTime(item.timeLimitSeconds)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThunderboltOutlined className="text-amber-400" />
                    {item.itemCount} vật phẩm
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-blue-600">
                    +{item.scorePerCorrect} điểm/đúng
                  </span>
                </div>

                {/* Waste categories */}
                {item.wasteCategories?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {item.wasteCategories.map((cat) => (
                      <Tag
                        key={cat}
                        color={WASTE_COLOR[cat] ?? "default"}
                        className="rounded-full text-[10px] py-0 border-none m-0"
                      >
                        {WASTE_LABEL[cat] ?? cat}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0">
              {isCompleted ? (
                <Tooltip title="Bạn đã hoàn thành màn này và nhận thưởng">
                  <Button
                    size="small"
                    disabled
                    className="rounded-xl border-green-200 text-green-600 bg-green-50 cursor-default"
                    icon={<CheckCircleOutlined />}
                  >
                    Đã xong
                  </Button>
                </Tooltip>
              ) : isUnlocked ? (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => onPlay(item.levelNumber)}
                  className="rounded-xl bg-blue-500 border-blue-500 hover:bg-blue-600 font-semibold px-4"
                  icon={<PlayCircleOutlined />}
                >
                  Chơi
                </Button>
              ) : (
                <Tooltip title={`Hoàn thành màn ${item.levelNumber - 1} trước`}>
                  <Button
                    size="small"
                    disabled
                    className="rounded-xl border-gray-200 text-gray-400"
                    icon={<LockOutlined />}
                  >
                    Khóa
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── PresetTabContent ─────────────────────────────────────────────────────────

function PresetTabContent({ preset, onPlay, campaignId }) {
  const cfg = DIFFICULTY_CFG[preset.difficulty] ?? DIFFICULTY_CFG.EASY;

  // Logic mở khóa: level đầu luôn mở, các level sau chỉ mở khi level trước coinReceived=true
  const items = [...(preset.items ?? [])].sort(
    (a, b) => a.levelNumber - b.levelNumber,
  );

  const completedCount = items.filter((i) => i.coinReceived).length;
  const progressPct =
    items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const isUnlocked = (idx) => {
    if (idx === 0) return true; // màn đầu luôn mở
    return items[idx - 1]?.coinReceived === true; // mở nếu màn trước đã xong
  };

  return (
    <div className="space-y-4">
      {/* Preset header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}
          >
            {cfg.label}
          </span>
          <span className="text-xs text-gray-400">
            {completedCount}/{items.length} màn hoàn thành
          </span>
        </div>
        {/* Mini progress */}
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${cfg.color} transition-all`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-500">
            {progressPct}%
          </span>
        </div>
      </div>

      {/* Level cards */}
      <motion.div
        className="space-y-3"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {items.map((item, idx) => (
          <LevelCard
            key={item.levelNumber}
            item={item}
            isCompleted={item.coinReceived === true}
            isUnlocked={isUnlocked(idx)}
            onPlay={onPlay}
            campaignId={campaignId}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudentRoundDetails() {
  const { campaignId, roundId } = useParams();
  const navigate = useNavigate();
  const [roundData, setRoundData] = useState(null);

  useEffect(() => {
    if (!campaignId) return;
    getCurrentRoundContent(campaignId)
      .then((res) => setRoundData(res?.data ?? null))
      .catch(console.error);
  }, [campaignId, roundId]);

  if (!roundData)
    return (
      <Empty
        description="Không tìm thấy thông tin vòng đấu"
        className="mt-16"
      />
    );

  const game = roundData.games?.[0]; // hiện tại chỉ xử lý game đầu

  const handlePlay = (levelNumber) => {
    navigate(`/student/campaign/${campaignId}/game`, {
      state: { levelNumber },
    });
  };

  // Build Tabs từ presets — sort theo thứ tự EASY→MEDIUM→HARD
  const DIFF_ORDER = { EASY: 0, MEDIUM: 1, HARD: 2 };
  const sortedPresets = [...(game?.presets ?? [])].sort(
    (a, b) => (DIFF_ORDER[a.difficulty] ?? 9) - (DIFF_ORDER[b.difficulty] ?? 9),
  );

  const gameTabItems = sortedPresets.map((preset) => {
    const cfg = DIFFICULTY_CFG[preset.difficulty] ?? DIFFICULTY_CFG.EASY;
    const completed = (preset.items ?? []).filter((i) => i.coinReceived).length;
    const total = (preset.items ?? []).length;
    return {
      key: preset.presetId,
      label: (
        <span className="flex items-center gap-2">
          <span className={`font-bold ${cfg.tab}`}>{cfg.label}</span>
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
              completed === total && total > 0
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {completed}/{total}
          </span>
        </span>
      ),
      children: (
        <PresetTabContent
          preset={preset}
          onPlay={handlePlay}
          campaignId={campaignId}
        />
      ),
    };
  });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-5">
      {/* Back */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/student/campaign/${campaignId}`)}
        type="text"
        className="text-gray-500 hover:text-green-600 -ml-1"
      >
        Quay lại chiến dịch
      </Button>

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          className="rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
          <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-6 py-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-green-600 uppercase tracking-widest">
                  Vòng {roundData.roundNumber}
                </span>
                <h1 className="text-2xl font-extrabold text-gray-800 mt-0.5">
                  {roundData.roundName}
                </h1>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <ClockCircleOutlined className="text-gray-400" />
                    {new Date(roundData.roundStartTime).toLocaleDateString(
                      "vi-VN",
                    )}
                    {" → "}
                    {new Date(roundData.roundEndTime).toLocaleDateString(
                      "vi-VN",
                    )}
                  </span>
                </div>
              </div>
              {/* Mini stats */}
              <div className="flex gap-4 bg-white/70 backdrop-blur border border-white rounded-2xl px-5 py-3 shadow-sm flex-shrink-0">
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-800">
                    {roundData.games?.length ?? 0}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-center">
                    <PlayCircleOutlined />
                    Game
                  </p>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-800">
                    {roundData.quizzes?.length ?? 0}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-center">
                    <BookOutlined />
                    Quiz
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Game section ── */}
      {game && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className="rounded-2xl border-2 border-gray-100 shadow-sm"
            bodyStyle={{ padding: 0 }}
          >
            {/* Game header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <PlayCircleOutlined className="text-xl text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{game.gameTypeName}</p>
                  <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                    <StarOutlined />+{game.coinPerSession} xu / phiên
                  </p>
                </div>
              </div>
              {/* Difficulty badge */}
              {game.resolvedDifficulty && (
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${DIFFICULTY_CFG[game.resolvedDifficulty]?.badge ?? ""}`}
                >
                  Mặc định:{" "}
                  {DIFFICULTY_CFG[game.resolvedDifficulty]?.label ??
                    game.resolvedDifficulty}
                </span>
              )}
            </div>

            {/* Preset tabs */}
            <div className="px-5 py-4">
              {sortedPresets.length === 0 ? (
                <Empty description="Chưa có cấu hình màn chơi" />
              ) : (
                <Tabs
                  items={gameTabItems}
                  size="middle"
                  className="[&_.ant-tabs-nav]:mb-4 [&_.ant-tabs-tab]:font-medium [&_.ant-tabs-tab-active]:font-bold"
                />
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Quiz section ── */}
      {roundData.quizzes?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <Card
            className="rounded-2xl border-2 border-gray-100 shadow-sm"
            bodyStyle={{ padding: 0 }}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <BookOutlined className="text-xl text-blue-500" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Bài Quiz</p>
                <p className="text-xs text-gray-400">
                  {roundData.quizzes.length} quiz trong vòng này
                </p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <motion.div variants={stagger} initial="hidden" animate="visible">
                {roundData.quizzes.map((quiz, idx) => (
                  <motion.div key={quiz.quizId ?? idx} variants={fadeUp}>
                    <div
                      className={`rounded-2xl border-2 p-4 flex items-center justify-between gap-4 transition-all hover:shadow-sm
                      ${quiz.isRequired ? "border-blue-100 bg-blue-50/30 hover:border-blue-300" : "border-gray-100 bg-white hover:border-gray-300"}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold
                          ${quiz.isRequired ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"}`}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {quiz.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {quiz.isRequired && (
                              <span className="text-[11px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">
                                Bắt buộc
                              </span>
                            )}
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${DIFFICULTY_CFG[quiz.difficulty]?.badge ?? "bg-gray-100 text-gray-500"}`}
                            >
                              {DIFFICULTY_CFG[quiz.difficulty]?.label ??
                                quiz.difficulty}
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <TrophyOutlined />
                              Max {quiz.maxAttempts} lần
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        type={quiz.isRequired ? "primary" : "default"}
                        size="small"
                        className={`rounded-xl font-semibold flex-shrink-0 ${quiz.isRequired ? "bg-blue-500 border-blue-500 hover:bg-blue-600" : ""}`}
                        icon={<RightOutlined />}
                        iconPosition="end"
                        onClick={() =>
                          navigate(
                            `/student/campaign/${campaignId}/round/${roundId}/quiz/${quiz.quizId}`,
                          )
                        }
                      >
                        Làm Quiz
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
