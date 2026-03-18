import { useState, lazy, Suspense, useEffect } from "react";
import { Card, Button, Badge, Skeleton, Tag } from "antd";
import {
  HomeOutlined,
  TrophyOutlined,
  AimOutlined,
  BookOutlined,
  RocketOutlined,
  CrownOutlined,
  CalendarOutlined,
  RiseOutlined,
  BankOutlined,
  IdcardOutlined,
  ManOutlined,
  WomanOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { getAuthenticatedStudentProfile } from "../../services";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const calcAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const GENDER_MAP = {
  MALE: { label: "Nam", icon: <ManOutlined />, color: "blue" },
  FEMALE: { label: "Nữ", icon: <WomanOutlined />, color: "pink" },
};

// ─── Demo Data (shape matches BE response) ────────────────────────────────────

const DEMO_STUDENT = {
  id: "eae58856-85e5-40ae-af6d-83e110152420",
  studentCode: "SV000001",
  fullName: "Le Van D",
  className: "10A1",
  gradeLevel: "10",
  dateOfBirth: "2005-01-15",
  gender: "MALE",
  address: null,
  avatarUrl: null,
  totalCoins: 0,
  isFirstLogin: false,
  school: {
    id: "ad50f7fa-e974-480a-87e3-1c597e47f60a",
    schoolName: "EcoVerse Demo School",
  },
  // stats — từ API riêng, giữ demo
  stats: {
    campaignsJoined: 12,
    quizzesCompleted: 48,
    gamesPlayed: 156,
    averageQuizScore: 87,
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

// ─── CoinIcon ────────────────────────────────────────────────────────────────

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

// ─── Avatar fallback ─────────────────────────────────────────────────────────

function StudentAvatar({ avatarUrl, fullName }) {
  const initials = fullName
    ? fullName
        .split(" ")
        .map((w) => w[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "??";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        className="w-32 h-32 rounded-3xl object-cover shadow-2xl border-4 border-white"
      />
    );
  }
  return (
    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-2xl border-4 border-white">
      <span className="text-4xl font-bold text-white">{initials}</span>
    </div>
  );
}

// ─── Achievement Card (lazy) ─────────────────────────────────────────────────

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

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudentProfile() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(DEMO_STUDENT);

  const fetchStudentProfile = async () => {
    try {
      const res = await getAuthenticatedStudentProfile();
      setStudent(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  console.log(student);

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const gender = GENDER_MAP[student.gender] ?? {
    label: student.gender ?? "—",
    color: "default",
  };
  const age = calcAge(student.dateOfBirth);

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
            onClick={() => navigate("/student")}
            className="text-gray-400 hover:text-gray-700"
          >
            Home
          </Button>
          <span>/</span>
          <span className="text-gray-700 font-medium">Hồ sơ</span>
        </motion.div>

        {/* ── Profile Header ── */}
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
              {/* decorative blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl" />

              <div className="relative flex flex-col lg:flex-row items-start gap-6">
                {/* Avatar */}
                <StudentAvatar
                  avatarUrl={student.avatarUrl}
                  fullName={student.fullName}
                />

                {/* Info block */}
                <div className="flex-1 space-y-4">
                  <div>
                    {/* Name + first-login badge */}
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h1 className="text-4xl font-bold text-gray-800">
                        {student.fullName}
                      </h1>
                      {student.isFirstLogin && (
                        <Tag
                          color="volcano"
                          className="rounded-full font-semibold"
                        >
                          Lần đầu đăng nhập
                        </Tag>
                      )}
                    </div>

                    {/* School + class + grade */}
                    <div className="flex items-center gap-3 flex-wrap text-gray-500 text-sm">
                      <div className="flex items-center gap-1.5">
                        <BankOutlined />
                        <span>{student.school?.schoolName ?? "—"}</span>
                      </div>
                      <Tag color="blue" className="rounded-full">
                        Lớp {student.className}
                      </Tag>
                      <Tag color="green" className="rounded-full">
                        Khối {student.gradeLevel}
                      </Tag>
                    </div>
                  </div>

                  {/* Detail grid — chỉ hiển thị field có trong BE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    {/* Mã học sinh */}
                    <div className="flex items-center gap-2">
                      <IdcardOutlined className="text-gray-400" />
                      <span className="text-gray-400">Mã HS:</span>
                      <span className="font-mono font-semibold text-gray-700">
                        {student.studentCode}
                      </span>
                    </div>

                    {/* Ngày sinh + tuổi */}
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-gray-400" />
                      <span className="text-gray-400">Ngày sinh:</span>
                      <span>
                        {formatDate(student.dateOfBirth)}
                        {age ? ` (${age} tuổi)` : ""}
                      </span>
                    </div>

                    {/* Giới tính */}
                    <div className="flex items-center gap-2">
                      {gender.icon && (
                        <span className="text-gray-400">{gender.icon}</span>
                      )}
                      <span className="text-gray-400">Giới tính:</span>
                      <Tag color={gender.color} className="rounded-full m-0">
                        {gender.label}
                      </Tag>
                    </div>

                    {/* Địa chỉ — hiện nếu có, ẩn nếu null */}
                    {student.address && (
                      <div className="flex items-center gap-2">
                        <EnvironmentOutlined className="text-gray-400" />
                        <span className="text-gray-400">Địa chỉ:</span>
                        <span>{student.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coin card */}
                <Card
                  className="border-2 border-amber-300 shadow-xl rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex-shrink-0"
                  bodyStyle={{ padding: "24px" }}
                >
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <CoinIcon />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Tổng xu</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {(student.totalCoins ?? 0).toLocaleString()}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Stats Grid ── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              icon: <AimOutlined />,
              label: "Chiến dịch tham gia",
              value: student?.stats?.campaignsJoined,
              bg: "bg-green-50",
              color: "text-green-500",
            },
            {
              icon: <BookOutlined />,
              label: "Quiz hoàn thành",
              value: student?.stats?.quizzesCompleted,
              bg: "bg-blue-50",
              color: "text-blue-500",
            },
            {
              icon: <RocketOutlined />,
              label: "Game đã chơi",
              value: student?.stats?.gamesPlayed,
              bg: "bg-purple-50",
              color: "text-purple-500",
            },
            {
              icon: <TrophyOutlined />,
              label: "Điểm TB Quiz",
              value: `${student?.stats?.averageQuizScore}%`,
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

        {/* ── Achievements + Recent Activities ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Achievements */}
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
                {student?.achievements?.map((achievement) => (
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
                {student?.recentActivities?.map((activity) => {
                  const colors =
                    ACTIVITY_COLORS[activity.type] ?? ACTIVITY_COLORS.quiz;
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
                            className={`text-xs font-semibold ${activity.coins > 0 ? "text-green-600" : "text-red-500"}`}
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
