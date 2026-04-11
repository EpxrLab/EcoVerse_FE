import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, Button } from "antd";
import {
  TrophyOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { Crown, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { useCampaignContext } from "../../context";
import {
  getAuthenticatedStudentProfile,
  getCampaignLeaderboard,
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

// Schema BE: { studentId, studentName, schoolName, combinedAccuracyPercentage,
//              avgTimeSeconds, rank, totalCoinsEarned }

const PODIUM_HEIGHT = { 1: "h-32", 2: "h-24", 3: "h-20" };
const PODIUM_GRADIENT = {
  1: "from-amber-400 to-yellow-500",
  2: "from-slate-300 to-slate-400",
  3: "from-orange-400 to-orange-500",
};
const AVATAR_GRADIENT = {
  1: "from-amber-400 to-yellow-500",
  2: "from-slate-300 to-slate-400",
  3: "from-orange-400 to-orange-500",
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

function PodiumSlot({ entry, isFirst }) {
  if (!entry) return <div className="w-36" />;
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
        className={`rounded-full flex items-center justify-center font-black text-white shadow-xl border-4 border-white mb-3
        bg-gradient-to-br ${AVATAR_GRADIENT[entry.rank] ?? "from-blue-400 to-green-400"}
        ${isFirst ? "w-24 h-24 text-4xl" : "w-20 h-20 text-3xl"}`}
      >
        {initial}
      </div>

      {/* Name / School */}
      <div className="text-center mb-3 max-w-[130px]">
        <p
          className={`font-bold text-gray-800 leading-tight ${isFirst ? "text-base" : "text-sm"}`}
        >
          {entry.studentName}
        </p>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">
          {entry.schoolName}
        </p>
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <CoinIcon className="w-4 h-4 text-amber-500" />
          <span
            className={`font-bold text-amber-600 ${isFirst ? "text-base" : "text-sm"}`}
          >
            {entry.totalCoinsEarned?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Podium block */}
      <div
        className={`w-32 rounded-t-2xl bg-gradient-to-br flex items-center justify-center shadow-md
        ${PODIUM_HEIGHT[entry.rank] ?? "h-16"} ${PODIUM_GRADIENT[entry.rank] ?? "from-gray-200 to-gray-300"}`}
      >
        <span
          className={`font-black text-white ${isFirst ? "text-5xl" : "text-4xl"}`}
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
  const { selectedCampaign } = useCampaignContext();
  const campaign = selectedCampaign;

  const [entries, setEntries] = useState([]); // leaderboardData
  const [currentUser, setCurrentUser] = useState(null); // authenticated student profile

  useEffect(() => {
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          getAuthenticatedStudentProfile(),
          getCampaignLeaderboard(campaignId),
        ]);
        setCurrentUser(r1?.data ?? null);
        setEntries(r2?.data ?? []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [campaignId]);

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
  const rest = entries.slice(3);

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
          className="border-2 shadow-lg overflow-hidden rounded-3xl"
          bodyStyle={{ padding: 0 }}
        >
          <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-green-50 p-7">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/25 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <TrophyOutlined className="text-xl text-white" />
                  </div>
                  Bảng xếp hạng
                </h1>
                <p className="text-gray-500">
                  {campaign.campaignName ?? campaign.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {entries.length} người tham gia
                </p>
              </div>

              {/* Xếp hạng của tôi */}
              {myEntry && (
                <Card
                  className="border-2 border-green-200 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 flex-shrink-0 shadow-sm"
                  bodyStyle={{ padding: "16px 20px" }}
                >
                  <p className="text-xs text-gray-400 mb-1.5 text-center font-medium">
                    Xếp hạng của bạn
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <TrophyOutlined className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-800 leading-none">
                        #{myEntry.rank}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <CoinIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-sm font-bold text-amber-600">
                          {myEntry.totalCoinsEarned?.toLocaleString()} xu
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <AimOutlined className="text-blue-400" />
                      {myEntry.combinedAccuracyPercentage?.toFixed(1)}%
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockCircleOutlined className="text-purple-400" />
                      {fmtTime(myEntry.avgTimeSeconds)}
                    </span>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

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
            <div className="flex items-end justify-center gap-3 overflow-x-auto pb-0">
              {/* 2nd */}
              <PodiumSlot entry={topThree[1]} isFirst={false} />
              {/* 1st */}
              <PodiumSlot entry={topThree[0]} isFirst={true} />
              {/* 3rd */}
              <PodiumSlot entry={topThree[2]} isFirst={false} />
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
              const isMe = currentUser && entry.studentId === currentUser.id;
              const initial = (entry.studentName ?? "?")
                .charAt(0)
                .toUpperCase();
              const avatarGrad =
                AVATAR_GRADIENT[entry.rank] ?? "from-blue-400 to-green-400";

              return (
                <motion.div key={entry.studentId} variants={row}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all
                    ${
                      isMe
                        ? "border-green-300 bg-green-50/60 shadow-md"
                        : entry.rank <= 3
                          ? "border-amber-100 bg-amber-50/30 hover:shadow-sm"
                          : "border-gray-100 bg-white hover:shadow-sm"
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-10 flex-shrink-0 flex flex-col items-center">
                      {entry.rank <= 3 ? (
                        <>
                          <RankIcon rank={entry.rank} />
                          <span className="text-[11px] font-bold text-gray-500 mt-0.5">
                            #{entry.rank}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-black text-gray-400">
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-lg flex-shrink-0
                      shadow-sm bg-gradient-to-br ${avatarGrad}`}
                    >
                      {initial}
                    </div>

                    {/* Name + School */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-bold text-gray-800 truncate ${isMe ? "text-green-700" : ""}`}
                        >
                          {entry.studentName}
                          {isMe && (
                            <span className="ml-1.5 text-[11px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                              Bạn
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {entry.schoolName}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Xu */}
                      <div className="text-center min-w-[52px]">
                        <div className="flex items-center justify-center gap-1">
                          <CoinIcon className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-bold text-amber-600 text-sm">
                            {entry.totalCoinsEarned?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400">Xu</p>
                      </div>

                      {/* Độ chính xác */}
                      <div className="text-center min-w-[52px] hidden sm:block">
                        <p className="font-bold text-blue-500 text-sm flex items-center justify-center gap-0.5">
                          <AimOutlined className="text-xs" />
                          {entry.combinedAccuracyPercentage?.toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-gray-400">Chính xác</p>
                      </div>

                      {/* Thời gian TB */}
                      <div className="text-center min-w-[52px] hidden md:block">
                        <p className="font-bold text-purple-500 text-sm flex items-center justify-center gap-0.5">
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
                <p className="text-sm font-medium">Chưa có dữ liệu xếp hạng</p>
              </div>
            )}
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
