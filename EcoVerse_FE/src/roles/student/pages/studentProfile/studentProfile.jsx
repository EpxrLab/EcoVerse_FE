import { useState, lazy, Suspense } from "react";
import { Card, Button, Badge, Skeleton } from "antd";
import {
  UserOutlined,
  HomeOutlined,
  TrophyOutlined,
  AimOutlined,
  BookOutlined,
  RocketOutlined,
  CrownOutlined,
  CalendarOutlined,
  RiseOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_STUDENT = {
  avatar: "👨‍🎓",
  name: "Nguyễn Văn An",
  school: "THCS Trần Đại Nghĩa",
  class: "8A1",
  email: "nguyenvanan@email.com",
  phone: "0912 345 678",
  joinedDate: "01/09/2023",
  coins: 2450,
  stats: {
    campaignsJoined: 12,
    quizzesCompleted: 48,
    gamesPlayed: 156,
    averageQuizScore: 87,
    currentStreak: 15,
  },
  achievements: [
    {
      id: 1,
      icon: "🏆",
      name: "Nhà vô địch",
      description: "Top 1 chiến dịch",
      earned: "15/06/2024",
    },
    {
      id: 2,
      icon: "🎯",
      name: "Bắn súng thần",
      description: "100% độ chính xác",
      earned: "10/06/2024",
    },
    {
      id: 3,
      icon: "🔥",
      name: "Streak Master",
      description: "30 ngày liên tiếp",
      earned: "05/06/2024",
    },
    {
      id: 4,
      icon: "🌟",
      name: "Học giả",
      description: "Hoàn thành 50 quiz",
      earned: "01/06/2024",
    },
    {
      id: 5,
      icon: "♻️",
      name: "Eco Warrior",
      description: "Thu gom 1000 rác",
      earned: "28/05/2024",
    },
    {
      id: 6,
      icon: "💎",
      name: "Đại gia xu",
      description: "Tích luỹ 5000 xu",
      earned: "20/05/2024",
    },
  ],
  recentActivities: [
    {
      id: 1,
      type: "quiz",
      title: "Quiz về phân loại rác",
      coins: 150,
      date: "2 giờ trước",
    },
    {
      id: 2,
      type: "game",
      title: "Chơi game thu gom",
      coins: 200,
      date: "5 giờ trước",
    },
    {
      id: 3,
      type: "reward",
      title: "Đổi avatar mới",
      coins: -500,
      date: "1 ngày trước",
    },
    {
      id: 4,
      type: "quiz",
      title: "Quiz về tái chế",
      coins: 120,
      date: "2 ngày trước",
    },
    {
      id: 5,
      type: "game",
      title: "Chơi game phân loại",
      coins: 180,
      date: "3 ngày trước",
    },
  ],
};

const ACTIVITY_ICONS = {
  quiz: <BookOutlined />,
  game: <RocketOutlined />,
  reward: <CrownOutlined />,
};

const ACTIVITY_COLORS = {
  quiz: { bg: "bg-blue-50", text: "text-blue-500" },
  game: { bg: "bg-purple-50", text: "text-purple-500" },
  reward: { bg: "bg-amber-50", text: "text-amber-500" },
};

// ─── CoinIcon (inline SVG) ────────────────────────────────────────────────────

const CoinIcon = ({ className = "w-8 h-8 text-white" }) => (
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

// ─── Lazy-loaded Achievement Card ─────────────────────────────────────────────

const AchievementCard = lazy(() =>
  Promise.resolve({
    default: ({ achievement }) => (
      <motion.div
        whileHover={{ scale: 1.05, y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className="border-2 border-green-200 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 hover:shadow-lg transition-shadow"
          bodyStyle={{ padding: "16px", textAlign: "center" }}
        >
          <div className="space-y-2">
            <div className="text-4xl">{achievement.icon}</div>
            <h3 className="font-bold text-sm text-gray-800">
              {achievement.name}
            </h3>
            <p className="text-xs text-gray-500">{achievement.description}</p>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white">
              {achievement.earned}
            </span>
          </div>
        </Card>
      </motion.div>
    ),
  }),
);

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function StudentProfile() {
  const navigate = useNavigate();
  const [student] = useState(DEMO_STUDENT);

  const handleHome = () => {
    navigate("/student");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
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
            onClick={handleHome}
            className="text-gray-400 hover:text-gray-700"
          >
            Home
          </Button>
          <span>/</span>
          <span className="text-gray-700 font-medium">Hồ sơ</span>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="border-2 shadow-lg overflow-hidden rounded-3xl"
            bodyStyle={{ padding: 0 }}
          >
            <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-8">
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl" />

              <div className="relative flex flex-col lg:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-6xl shadow-2xl border-4 border-white">
                  {student.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                      {student.name}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <BankOutlined />
                        <span>{student.school}</span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600 border border-blue-200">
                        Lớp {student.class}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MailOutlined className="text-gray-400" />
                      <span>{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneOutlined className="text-gray-400" />
                      <span>{student.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-gray-400" />
                      <span>Tham gia: {student.joinedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RiseOutlined className="text-gray-400" />
                      <span>Streak: {student.stats.currentStreak} ngày</span>
                    </div>
                  </div>
                </div>

                {/* Coins Display */}
                <Card
                  className="border-2 border-amber-300 shadow-xl rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50"
                  bodyStyle={{ padding: "24px" }}
                >
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <CoinIcon />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Tổng xu</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {student.coins}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              icon: <AimOutlined />,
              label: "Chiến dịch",
              value: student.stats.campaignsJoined,
              bg: "bg-green-50",
              color: "text-green-500",
            },
            {
              icon: <BookOutlined />,
              label: "Quiz hoàn thành",
              value: student.stats.quizzesCompleted,
              bg: "bg-blue-50",
              color: "text-blue-500",
            },
            {
              icon: <RocketOutlined />,
              label: "Game đã chơi",
              value: student.stats.gamesPlayed,
              bg: "bg-purple-50",
              color: "text-purple-500",
            },
            {
              icon: <TrophyOutlined />,
              label: "Điểm TB Quiz",
              value: `${student.stats.averageQuizScore}%`,
              bg: "bg-amber-50",
              color: "text-amber-500",
            },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card
                className="border-2 rounded-2xl hover:shadow-lg transition-all"
                bodyStyle={{ padding: "24px" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
                    <span className={`text-xl ${stat.color}`}>{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Accomplishments */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              className="border-2 rounded-3xl"
              title={
                <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <CrownOutlined className="text-green-500" />
                  Thành tựu
                </div>
              }
              bodyStyle={{ padding: "24px" }}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {student.achievements.map((achievement) => (
                  <Suspense
                    key={achievement.id}
                    fallback={
                      <Card
                        className="rounded-2xl border-2"
                        bodyStyle={{ padding: 60 }}
                      >
                        <Skeleton.Avatar
                          active
                          size={40}
                          className="mx-auto mb-2"
                        />
                        <Skeleton active paragraph={{ rows: 2 }} />
                      </Card>
                    }
                  >
                    <AchievementCard achievement={achievement} />
                  </Suspense>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card
              className="border-2 rounded-3xl"
              title={
                <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <RiseOutlined className="text-blue-500" />
                  Hoạt động gần đây
                </div>
              }
              bodyStyle={{ padding: "20px" }}
            >
              <div className="space-y-3">
                {student.recentActivities.map((activity) => {
                  const colors =
                    ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.quiz;
                  return (
                    <motion.div
                      key={activity.id}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}
                      >
                        {ACTIVITY_ICONS[activity.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs font-semibold ${
                              activity.coins > 0
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {activity.coins > 0 ? "+" : ""}
                            {activity.coins} xu
                          </span>
                          <span className="text-xs text-gray-400">
                            {activity.date}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
