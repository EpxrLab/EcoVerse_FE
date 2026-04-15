import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, Button, Progress } from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  StarOutlined,
  RightOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { getCampaignDetails } from "../../services";

// ─── Constants ────────────────────────────────────────────────────────────────

const CAMPAIGN_TYPE_LABEL = {
  SCHOOL_INTERNAL: "Nội bộ trường",
  INTER_SCHOOL: "Liên trường",
  PARTNERSHIP_EVENT: "Sự kiện đối tác",
};

const ROUND_STATUS_CFG = {
  UPCOMING: {
    label: "Sắp diễn ra",
    tw: "bg-blue-50 text-blue-600 border-blue-200",
    dot: "bg-blue-500",
  },
  ACTIVE: {
    label: "Đang diễn ra",
    tw: "bg-primary/10 text-primary border-primary/20",
    dot: "bg-primary",
  },
  COMPLETED: {
    label: "Đã kết thúc",
    tw: "bg-gray-50 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
  },
  CANCELLED: {
    label: "Đã hủy",
    tw: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-500",
  },
};
const CAMPAIGN_STATUS_CFG = {
  ON_GOING: {
    label: "Đang diễn ra",
    tw: "bg-primary/10 text-primary border-primary/20",
  },
  INVITED: {
    label: "Được mời",
    tw: "bg-blue-50 text-blue-600 border-blue-200",
  },
  COMPLETED: {
    label: "Đã kết thúc",
    tw: "bg-gray-50 text-gray-500 border-gray-200",
  },
};

const DIFFICULTY_COLOR = {
  EASY: "text-primary bg-primary/10",
  MEDIUM: "text-amber-600 bg-amber-50",
  HARD: "text-red-600 bg-red-50",
};
const DIFFICULTY_LABEL = { EASY: "Dễ", MEDIUM: "Trung bình", HARD: "Khó" };

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const daysLeft = (iso) => {
  if (!iso) return null;
  const diff = Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
};

// ─── Animation ────────────────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};

// ─── RoundCard ────────────────────────────────────────────────────────────────

function RoundCard({ round, campaignId, navigate }) {
  const sc = ROUND_STATUS_CFG[round.status] ?? ROUND_STATUS_CFG.UPCOMING;
  const isActive = round.status === "ON_GOING";
  const isAccessible =
    round.status === "ACTIVE" || round.status === "COMPLETED";
  const diff = round.resolvedDifficulty ?? round.difficultyOverride;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={isActive ? { y: -3 } : {}}
      transition={{ duration: 0.2 }}
      onClick={() => {
        if (isAccessible) {
          navigate(`/student/campaign/${campaignId}/round/${round.id}`);
        }
      }}
    >
      <Card
        className={`rounded-2xl border-2 transition-all duration-200 ${
          isActive
            ? "border-primary/30 shadow-md hover:shadow-xl"
            : "border-gray-100 opacity-80"
        }`}
        bodyStyle={{ padding: "18px 20px" }}
      >
        {/* Top accent */}
        <div
          className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl ${isActive ? "bg-primary" : "bg-gray-200"}`}
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3 pt-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-gray-400">
                Vòng {round.roundNumber}
              </span>
              {diff && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[diff] ?? "bg-gray-100 text-gray-500"}`}
                >
                  {DIFFICULTY_LABEL[diff] ?? diff}
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-800 leading-tight truncate">
              {round.roundName}
            </h3>
            {round.gameTypeName && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <PlayCircleOutlined className="text-gray-300" />
                {round.gameTypeName}
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${sc.tw}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${isActive ? "animate-pulse" : ""}`}
            />
            {sc.label}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 bg-gray-50 rounded-lg px-3 py-2">
          <CalendarOutlined className="flex-shrink-0" />
          <span>{fmtDate(round.startTime)}</span>
          <span className="text-gray-300">→</span>
          <span>{fmtDate(round.endTime)}</span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {round.coinPerSession > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-semibold">
              <StarOutlined />+{round.coinPerSession} xu/phiên
            </div>
          )}
          {round.quizzes?.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              <BookOutlined />
              {round.quizzes.length} quiz
            </div>
          )}
        </div>

        {/* Quizzes list — chỉ hiện nếu có */}
        {round.quizzes?.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {round.quizzes.slice(0, 3).map((q, i) => (
              <div
                key={q.quizId}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-50/60 text-xs"
              >
                <span className="text-blue-700 font-medium truncate flex-1 mr-2">
                  {q.title}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {q.isRequired && (
                    <span className="text-[10px] text-red-500 font-bold">
                      Bắt buộc
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${DIFFICULTY_COLOR[q.difficulty] ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {DIFFICULTY_LABEL[q.difficulty] ?? q.difficulty}
                  </span>
                </div>
              </div>
            ))}
            {round.quizzes.length > 3 && (
              <p className="text-xs text-gray-400 pl-1">
                +{round.quizzes.length - 3} quiz khác
              </p>
            )}
          </div>
        )}

        {/* CTA */}
        <Button
          block
          type={isActive ? "primary" : "default"}
          size="middle"
          disabled={round.status === "UPCOMING"}
          className={`rounded-xl font-semibold ${isActive ? "bg-primary border-primary hover:opacity-90 shadow-sm shadow-primary/20" : ""}`}
          icon={
            isActive ? (
              <RightOutlined />
            ) : round.status === "COMPLETED" ? (
              <CheckCircleOutlined />
            ) : (
              <ClockCircleOutlined />
            )
          }
          iconPosition="end"
        >
          {round.status === "UPCOMING"
            ? "Chưa mở"
            : round.status === "COMPLETED"
              ? "Xem kết quả"
              : "Vào vòng này"}
        </Button>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CampaignDashboard() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const fetchCampaignDetails = async (id) => {
    try {
      const res = await getCampaignDetails(id);
      setSelectedCampaign(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails(campaignId);
    }
  }, [campaignId]);

  if (!selectedCampaign) {
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

  const c = selectedCampaign;

  // Deadline countdown
  const deadlineDays = daysLeft(c.invitationDeadline);
  const showDeadline = deadlineDays !== null && deadlineDays >= 0;
  const deadlineWarn = deadlineDays !== null && deadlineDays <= 3;

  // Round stats
  const completedRounds = (c.rounds ?? []).filter(
    (r) => r.status === "COMPLETED",
  ).length;
  const activeRound = (c.rounds ?? []).find((r) => r.status === "ON_GOING");
  const roundProgress =
    c.totalRounds > 0 ? Math.round((completedRounds / c.totalRounds) * 100) : 0;

  const statusCfg =
    CAMPAIGN_STATUS_CFG[c.status?.toUpperCase()] ?? CAMPAIGN_STATUS_CFG.INVITED;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Card
          className="border-2 shadow-xl overflow-hidden rounded-3xl"
          bodyStyle={{ padding: 0 }}
        >
          <div className="relative bg-gradient-mint-eco p-8 text-white">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative space-y-5">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border border-white/30 bg-white/20`}
                >
                  {statusCfg.label}
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 border border-white/20">
                  {CAMPAIGN_TYPE_LABEL[c.campaignType] ?? c.campaignType}
                </span>
                {c.campaignCode && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono bg-white/60 border border-gray-200 text-gray-500">
                    <CodeOutlined className="text-gray-400" />
                    {c.campaignCode}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-black leading-tight drop-shadow-sm">
                {c.campaignName}
              </h1>

              {/* Description */}
              {c.description && (
                <p className="text-white/80 text-base max-w-3xl line-clamp-3 font-medium">
                  {c.description}
                </p>
              )}

              {/* Date + deadline row */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                  <CalendarOutlined className="text-white/60" />
                  <span>{fmtDate(c.startDate)}</span>
                  <span className="text-white/40">→</span>
                  <span>{fmtDate(c.endDate)}</span>
                </div>
              </div>

              {/* Round progress */}
              {c.totalRounds > 0 && (
                <div className="max-w-xl">
                  <div className="flex items-center justify-between mb-2 text-sm font-bold">
                    <span className="text-white/70">Tiến độ chiến dịch</span>
                    <span className="text-white">
                      {completedRounds}/{c.totalRounds} vòng
                    </span>
                  </div>
                  <Progress
                    percent={roundProgress}
                    strokeColor="#ffffff"
                    trailColor="rgba(255,255,255,0.2)"
                    strokeWidth={10}
                    showInfo={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 bg-white border-t border-gray-100">
            {[
              {
                icon: <UnorderedListOutlined />,
                val: c.totalRounds ?? 0,
                label: "Tổng số vòng",
              },
              {
                icon: <CheckCircleOutlined />,
                val: completedRounds,
                label: "Vòng hoàn thành",
              },
              {
                icon: <StarOutlined />,
                val: c.topRankingCount ?? 0,
                label: "Top xếp hạng",
              },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center py-4 gap-0.5">
                <span className="text-gray-400 text-sm mb-0.5">{s.icon}</span>
                <p className="text-2xl font-black text-gray-800">{s.val}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── Active round highlight ── */}
      {activeRound && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-primary/40 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <p className="text-xs font-black text-primary uppercase tracking-widest">
              Vòng đang diễn ra
            </p>
          </div>
          <Card>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  Vòng {activeRound.roundNumber} · {activeRound.gameTypeName}
                </p>
                <h3 className="text-xl font-bold text-gray-800">
                  {activeRound.roundName}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {activeRound.resolvedDifficulty && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[activeRound.resolvedDifficulty] ?? "bg-gray-100"}`}
                    >
                      {DIFFICULTY_LABEL[activeRound.resolvedDifficulty] ??
                        activeRound.resolvedDifficulty}
                    </span>
                  )}
                  {activeRound.coinPerSession > 0 && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full font-semibold">
                      <StarOutlined /> +{activeRound.coinPerSession} xu/phiên
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {fmtDate(activeRound.startTime)} →{" "}
                    {fmtDate(activeRound.endTime)}
                  </span>
                </div>
              </div>
              <Button
                type="primary"
                size="large"
                onClick={() => navigate(`/student/campaign/${campaignId}/game`)}
                className="rounded-xl bg-primary border-primary hover:opacity-90 shadow-md shadow-primary/20 font-bold"
                icon={<RightOutlined />}
                iconPosition="end"
              >
                Vào chơi ngay
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Activities ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Hoạt động nhanh</h2>
        </div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              title: "Làm Quiz",
              desc: "Trả lời câu hỏi kiến thức môi trường",
              icon: <BookOutlined />,
              color: "text-blue-500",
              bg: "bg-blue-50",
              border: "border-blue-200",
              btn: "bg-blue-500 border-blue-500 hover:bg-blue-600",
              path: `/student/campaign/${campaignId}/quiz`,
            },
            {
              title: "Bảng xếp hạng",
              desc: "Xem thứ hạng trong chiến dịch",
              icon: <TrophyOutlined />,
              color: "text-amber-500",
              bg: "bg-amber-50",
              border: "border-amber-200",
              btn: "bg-amber-500 border-amber-500 hover:bg-amber-600",
              path: `/student/campaign/${campaignId}/leaderboard`,
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="cursor-pointer"
              onClick={() => navigate(f.path)}
            >
              <Card
                className={`rounded-2xl border-2 ${f.border} hover:shadow-lg transition-all`}
                bodyStyle={{ padding: "20px" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className={`text-xl ${f.color}`}>{f.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800">{f.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    className={`rounded-xl font-semibold flex-shrink-0 ${f.btn}`}
                    icon={<RightOutlined />}
                    iconPosition="end"
                  >
                    Xem
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Rounds list ── */}
      {(c.rounds ?? []).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Danh sách vòng thi
            </h2>
            <span className="text-xs text-gray-400">
              {c.rounds.length} vòng
            </span>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {c.rounds.map((round) => (
              <RoundCard
                key={round.id}
                round={round}
                campaignId={campaignId}
                navigate={navigate}
              />
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
