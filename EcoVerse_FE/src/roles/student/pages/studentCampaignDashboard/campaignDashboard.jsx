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
  StarOutlined,
  RightOutlined,
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
    tw: "bg-gray-50 text-gray-400 border-gray-100",
    dot: "bg-gray-300",
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
  const isActive = round.status === "ACTIVE"; // Unified to ACTIVE
  const isAccessible =
    round.status === "ACTIVE" || round.status === "COMPLETED"; // Allow access to completed rounds to view history
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
        className={`rounded-3xl border-2 transition-all duration-300 relative overflow-hidden ${
          isActive
            ? "border-primary/40 shadow-lg hover:shadow-2xl hover:border-primary/60 cursor-pointer"
            : "border-gray-100 opacity-60 grayscale-[0.5] cursor-not-allowed"
        }`}
        bodyStyle={{ padding: "20px 24px" }}
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
          size="large"
          disabled={!isAccessible}
          className={`rounded-2xl font-bold transition-all ${
            isActive
              ? "bg-primary border-primary hover:scale-[1.02] shadow-lg shadow-primary/20"
              : "bg-gray-50 border-gray-100 text-gray-400"
          }`}
          icon={
            isActive ? (
              <PlayCircleOutlined />
            ) : round.status === "COMPLETED" ? (
              <CheckCircleOutlined />
            ) : (
              <ClockCircleOutlined />
            )
          }
          iconPosition="start"
        >
          {round.status === "UPCOMING"
            ? "Sắp mở"
            : round.status === "COMPLETED"
              ? "Xem chi tiết"
              : "Bắt đầu chơi"}
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
  const activeRound = (c.rounds ?? []).find((r) => r.status === "ACTIVE");
  const roundProgress =
    c.totalRounds > 0 ? Math.round((completedRounds / c.totalRounds) * 100) : 0;

  const statusCfg =
    CAMPAIGN_STATUS_CFG[c.status?.toUpperCase()] ?? CAMPAIGN_STATUS_CFG.INVITED;

  return (
    <div className="space-y-8 pb-12">
      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className="border-0 shadow-2xl overflow-hidden rounded-[2.5rem]"
          bodyStyle={{ padding: 0 }}
        >
          <div className="relative bg-gradient-mint-eco p-8 md:p-12 text-white min-h-[400px] flex flex-col justify-center">
            {/* Decorative circles */}
            <div className="absolute top-[-5%] right-[-5%] w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-emerald-400/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 space-y-6 text-center lg:text-left">
                {/* Badges row */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <span className="px-4 py-1.5 rounded-full text-xs font-black bg-white/20 backdrop-blur-md border border-white/30 uppercase tracking-widest">
                    {statusCfg.label}
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-xs font-black bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 uppercase tracking-widest text-emerald-100">
                    {CAMPAIGN_TYPE_LABEL[c.campaignType] ?? c.campaignType}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight drop-shadow-md">
                  {c.campaignName}
                </h1>

                {/* Description */}
                {c.description && (
                  <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed opacity-90">
                    {c.description}
                  </p>
                )}

                {/* Join/View Button */}
                {(activeRound || c.status === "COMPLETED") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4"
                  >
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => {
                        const targetRound =
                          activeRound || c.rounds?.[c.rounds.length - 1];
                        if (targetRound) {
                          navigate(`/student/campaign/${campaignId}/game`);
                        }
                      }}
                      className="h-12 px-8 rounded-2xl bg-white text-emerald-600 border-white hover:bg-emerald-50 hover:scale-105 transition-all font-black text-base shadow-2xl shadow-black/20 flex items-center gap-2 mx-auto lg:mx-0"
                    >
                      {c.status === "COMPLETED"
                        ? "XEM LẠI KẾT QUẢ"
                        : "THAM GIA THI ĐẤU NGAY"}
                      <RightOutlined className="animate-bounce-x" />
                    </Button>
                    <p className="text-white/70 text-xs mt-3 font-bold uppercase tracking-widest">
                      {c.status === "COMPLETED"
                        ? "Chiến dịch đã kết thúc"
                        : `Đang diễn ra: ${activeRound?.roundName}`}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Quick Stats Card */}
              <div className="w-full lg:w-80 grid grid-cols-1 gap-4">
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white text-center shadow-xl">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">
                        Hoàn thành
                      </p>
                      <p className="text-3xl font-black">
                        {completedRounds}/{c.totalRounds}
                      </p>
                    </div>
                    <div className="w-[2px] h-10 bg-white/20" />
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">
                        Xếp hạng
                      </p>
                      <p className="text-3xl font-black text-white-400">
                        Top {c.topRankingCount ?? 0}
                      </p>
                    </div>
                  </div>
                  <Progress
                    percent={roundProgress}
                    strokeColor="#10b981"
                    trailColor="rgba(255,255,255,0.1)"
                    strokeWidth={8}
                    showInfo={false}
                  />
                  <p className="text-xs mt-3 font-bold opacity-70">
                    Tiến độ: {roundProgress}%
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

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
