import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, Select } from "antd";
import {
  TrophyOutlined,
  CrownOutlined,
  HomeOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { Crown, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { useStudentCampaigns } from "../../hooks/useStudentCampaign";
import { useCampaignContext, useStudentContext } from "../../context";

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_LEADERBOARD = [
  {
    id: "student-002",
    rank: 1,
    name: "Trần Văn B",
    class: "3B",
    school: "Tiểu học Nguyễn Huệ",
    totalCoins: 2850,
    quizzesCompleted: 25,
    gamesPlayed: 18,
    isCurrentUser: false,
  },
  {
    id: "student-003",
    rank: 2,
    name: "Lê Thị C",
    class: "3A",
    school: "Tiểu học Nguyễn Huệ",
    totalCoins: 2650,
    quizzesCompleted: 23,
    gamesPlayed: 16,
    isCurrentUser: false,
  },
  {
    id: "student-001",
    rank: 3,
    name: "Nguyễn Minh An",
    class: "3A",
    school: "Tiểu học Nguyễn Huệ",
    totalCoins: 2450,
    quizzesCompleted: 23,
    gamesPlayed: 15,
    isCurrentUser: true,
  },
  {
    id: "student-004",
    rank: 4,
    name: "Phạm Văn D",
    class: "4A",
    school: "Tiểu học Nguyễn Huệ",
    totalCoins: 2250,
    quizzesCompleted: 20,
    gamesPlayed: 14,
    isCurrentUser: false,
  },
  {
    id: "student-005",
    rank: 5,
    name: "Hoàng Thị E",
    class: "3C",
    school: "Tiểu học Nguyễn Huệ",
    totalCoins: 2100,
    quizzesCompleted: 19,
    gamesPlayed: 13,
    isCurrentUser: false,
  },
];

// ─── CoinIcon ─────────────────────────────────────────────────────────────────

const CoinIcon = ({ className = "w-4 h-4 text-amber-500" }) => (
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

const getPodiumHeight = (rank) =>
  ({ 1: "h-32", 2: "h-24", 3: "h-20" })[rank] || "h-16";

const getPodiumColor = (rank) =>
  ({
    1: "from-amber-400 to-yellow-500",
    2: "from-gray-300 to-gray-400",
    3: "from-orange-400 to-orange-500",
  })[rank] || "from-gray-200 to-gray-300";

const getRankIcon = (rank) => {
  if (rank === 1) return <Crown size={36} className="text-amber-500" />;

  if (rank === 2) return <Medal size={30} className="text-gray-400" />;

  if (rank === 3) return <Medal size={26} className="text-orange-500" />;

  return null;
};

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function StudentLeaderboard() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const leaderboardData = DEMO_LEADERBOARD;
  const [selectedRound, setSelectedRound] = useState("main");
  const { selectedCampaign } = useCampaignContext();
  const campaign = selectedCampaign;
  const { currentUser } = useStudentContext();
  const topThree = leaderboardData.slice(0, 3);
  const hasQualifyingRounds =
    campaign?.type === "partnership" && campaign?.qualifyingRounds?.length > 0;

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg text-gray-400 mb-4">
            Không tìm thấy chiến dịch
          </p>
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
        <span className="text-gray-700 font-medium">Bảng xếp hạng</span>
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
          <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-green-50 p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-200/30 to-transparent rounded-full blur-3xl" />

            <div className="relative space-y-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <TrophyOutlined className="text-2xl text-white" />
                    </div>
                    Bảng xếp hạng
                  </h1>
                  <p className="text-gray-500 text-lg">{campaign.name}</p>
                  {selectedRound !== "main" && hasQualifyingRounds && (
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                      {campaign.qualifyingRounds?.find(
                        (r) => r.round_number.toString() === selectedRound,
                      )?.round_name || `Vòng ${selectedRound}`}
                    </span>
                  )}
                </div>

                {/* Current User Rank */}
                {currentUser && (
                  <Card
                    className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl"
                    bodyStyle={{ padding: "24px" }}
                  >
                    <div className="text-center space-y-2">
                      <p className="text-sm text-gray-500">Xếp hạng của bạn</p>
                      <div className="flex items-center justify-center gap-3">
                        <TrophyOutlined className="text-3xl text-amber-500" />
                        <p className="text-4xl font-bold text-gray-800">
                          #{currentUser.rank}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-green-600">
                        {currentUser.totalCoins} xu
                      </p>
                    </div>
                  </Card>
                )}
              </div>

              {/* Qualifying Round Selector */}
              {hasQualifyingRounds && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 border-2 border-blue-200">
                  <FilterOutlined className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Xem theo vòng:
                  </span>
                  <Select
                    value={selectedRound}
                    onChange={setSelectedRound}
                    style={{ width: 200 }}
                    options={[
                      ...campaign.qualifyingRounds.map((round) => ({
                        value: round.round_number.toString(),
                        label: round.round_name,
                      })),
                      { value: "main", label: "Vòng chính thức" },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Podium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card
          className="border-2 shadow-lg rounded-3xl"
          bodyStyle={{ padding: "32px" }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">🏆 Top 3 🏆</h2>
          <div className="flex items-end justify-center gap-4">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="flex flex-col items-center">
                <div className="mb-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-3xl mb-2 shadow-lg border-4 border-white">
                    {topThree[1].name.charAt(0)}
                  </div>
                  <p className="font-bold text-sm text-gray-800">
                    {topThree[1].name}
                  </p>
                  <p className="text-xs text-gray-400">{topThree[1].class}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <CoinIcon />
                    <span className="font-semibold text-sm text-gray-700">
                      {topThree[1].totalCoins}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-32 rounded-t-2xl bg-gradient-to-br flex items-center justify-center ${getPodiumHeight(2)} ${getPodiumColor(2)}`}
                >
                  <span className="text-4xl font-bold text-white">2</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="flex flex-col items-center -mt-8">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Crown size={48} className="text-amber-500 mb-2" />
                </motion.div>
                <div className="mb-4 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-4xl mb-2 shadow-2xl border-4 border-white">
                    {topThree[0].name.charAt(0)}
                  </div>
                  <p className="font-bold text-gray-800">{topThree[0].name}</p>
                  <p className="text-xs text-gray-400">{topThree[0].class}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <CoinIcon className="w-5 h-5" />
                    <span className="font-bold text-gray-800">
                      {topThree[0].totalCoins}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-32 rounded-t-2xl bg-gradient-to-br flex items-center justify-center shadow-xl ${getPodiumHeight(1)} ${getPodiumColor(1)}`}
                >
                  <span className="text-5xl font-bold text-white">1</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="flex flex-col items-center">
                <div className="mb-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-3xl mb-2 shadow-lg border-4 border-white">
                    {topThree[2].name.charAt(0)}
                  </div>
                  <p className="font-bold text-sm text-gray-800">
                    {topThree[2].name}
                  </p>
                  <p className="text-xs text-gray-400">{topThree[2].class}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <CoinIcon />
                    <span className="font-semibold text-sm text-gray-700">
                      {topThree[2].totalCoins}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-32 rounded-t-2xl bg-gradient-to-br flex items-center justify-center ${getPodiumHeight(3)} ${getPodiumColor(3)}`}
                >
                  <span className="text-4xl font-bold text-white">3</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card
          className="border-2 rounded-3xl shadow-sm"
          bodyStyle={{ padding: "24px" }}
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Bảng xếp hạng đầy đủ
          </h3>
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {leaderboardData.map((user) => (
              <motion.div key={user.id} variants={itemVariants}>
                <Card
                  className={`rounded-2xl border-2 transition-all ${
                    user.isCurrentUser
                      ? "border-green-300 bg-green-50/50 shadow-lg"
                      : "border-gray-100 hover:shadow-md"
                  }`}
                  bodyStyle={{ padding: "16px" }}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-16 text-center">
                      {user.rank <= 3 ? (
                        <div className="flex flex-col items-center">
                          {getRankIcon(user.rank)}
                          <span className="text-sm font-bold mt-1 text-gray-700">
                            #{user.rank}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">
                          #{user.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-md ${
                        user.rank === 1
                          ? "bg-gradient-to-br from-amber-400 to-yellow-500"
                          : user.rank === 2
                            ? "bg-gradient-to-br from-gray-300 to-gray-400"
                            : user.rank === 3
                              ? "bg-gradient-to-br from-orange-400 to-orange-500"
                              : "bg-gradient-to-br from-blue-400 to-green-400"
                      }`}
                    >
                      {user.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-800">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {user.class} • {user.school}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <CoinIcon />
                          <p className="text-lg font-bold text-amber-600">
                            {user.totalCoins}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">Tổng xu</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-500">
                          {user.quizzesCompleted}
                        </p>
                        <p className="text-xs text-gray-400">Quiz</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-500">
                          {user.gamesPlayed}
                        </p>
                        <p className="text-xs text-gray-400">Game</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
