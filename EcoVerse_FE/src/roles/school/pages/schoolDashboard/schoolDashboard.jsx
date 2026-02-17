import { motion } from "framer-motion";
import { Card, Badge, Progress, Button, Statistic } from "antd";
import {
  UserOutlined,
  AimOutlined,
  RiseOutlined,
  TrophyOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  GiftOutlined,
  RightOutlined,
  ReconciliationOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Mock data - replace with your actual useDashboard hook
const weeklyActivity = [
  { day: "T2", items: 145 },
  { day: "T3", items: 189 },
  { day: "T4", items: 156 },
  { day: "T5", items: 203 },
  { day: "T6", items: 178 },
  { day: "T7", items: 142 },
  { day: "CN", items: 98 },
];

const classPerformance = [
  { class: "6A", accuracy: 94 },
  { class: "6B", accuracy: 88 },
  { class: "7A", accuracy: 91 },
  { class: "7B", accuracy: 86 },
  { class: "8A", accuracy: 92 },
];

const topStudents = [
  { name: "Nguyễn Văn A", class: "6A", accuracy: 98, items: 245, avatar: "👦" },
  { name: "Trần Thị B", class: "7B", accuracy: 96, items: 231, avatar: "👧" },
  { name: "Lê Văn C", class: "6B", accuracy: 95, items: 218, avatar: "👦" },
  { name: "Phạm Thị D", class: "8A", accuracy: 94, items: 205, avatar: "👧" },
  { name: "Hoàng Văn E", class: "7A", accuracy: 93, items: 198, avatar: "👦" },
];

const recentRewards = [
  {
    student: "Nguyễn Văn A",
    reward: "Bút chì xanh",
    coins: 50,
    status: "COMPLETED",
  },
  {
    student: "Trần Thị B",
    reward: "Sổ tay môi trường",
    coins: 80,
    status: "PENDING",
  },
  {
    student: "Lê Văn C",
    reward: "Túi vải tái chế",
    coins: 120,
    status: "COMPLETED",
  },
  {
    student: "Phạm Thị D",
    reward: "Bình nước inox",
    coins: 200,
    status: "PENDING",
  },
];

const stats = {
  activeStudents: 342,
  activeStudentsChange: "12%",
  avgAccuracy: 91,
  avgAccuracyChange: 3.2,
  totalItemsSorted: 12453,
  itemsThisWeek: 1289,
};

const subscription = {
  plan: "Gói Premium",
  currentStudents: 342,
  maxStudents: 500,
  expiresAt: "31/12/2026",
  usagePercent: 68,
};

export default function SchoolDashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center">
          <span className="text-3xl">🌳</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
          <p className="text-gray-600">Hiệu suất EcoVerse của trường hôm nay</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            title: "Học sinh hoạt động",
            value: stats.activeStudents,
            change: `+${stats.activeStudentsChange}`,
            changeLabel: "tuần này",
            icon: UserOutlined,
            color: "green",
          },
          {
            title: "Độ chính xác TB",
            value: `${stats.avgAccuracy}%`,
            change: `+${stats.avgAccuracyChange}%`,
            changeLabel: "so với tuần trước",
            icon: AimOutlined,
            color: "blue",
          },
          {
            title: "Rác đã phân loại",
            value: stats.totalItemsSorted.toLocaleString(),
            change: `+${stats.itemsThisWeek.toLocaleString()}`,
            changeLabel: "tuần này",
            icon: ReconciliationOutlined,
            color: "cyan",
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <Card
                hoverable
                className="border-2 transition-all duration-300 hover:shadow-lg"
                style={{
                  borderColor:
                    stat.color === "green"
                      ? "#10b981"
                      : stat.color === "blue"
                        ? "#3b82f6"
                        : "#06b6d4",
                  borderOpacity: 0.2,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      {stat.title}
                    </p>
                    <Statistic
                      value={stat.value}
                      valueStyle={{
                        fontSize: "28px",
                        fontWeight: "bold",
                        color: "#1f2937",
                      }}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                          stat.color === "green"
                            ? "bg-green-100"
                            : stat.color === "blue"
                              ? "bg-blue-100"
                              : "bg-cyan-100"
                        }`}
                      >
                        <ArrowUpOutlined
                          className={`text-xs ${
                            stat.color === "green"
                              ? "text-green-600"
                              : stat.color === "blue"
                                ? "text-blue-600"
                                : "text-cyan-600"
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            stat.color === "green"
                              ? "text-green-600"
                              : stat.color === "blue"
                                ? "text-blue-600"
                                : "text-cyan-600"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {stat.changeLabel}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      stat.color === "green"
                        ? "bg-green-100"
                        : stat.color === "blue"
                          ? "bg-blue-100"
                          : "bg-cyan-100"
                    }`}
                  >
                    <Icon
                      className={`text-2xl ${
                        stat.color === "green"
                          ? "text-green-600"
                          : stat.color === "blue"
                            ? "text-blue-600"
                            : "text-cyan-600"
                      }`}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={itemVariants}>
          <Card
            className="border-2 border-green-100"
            title={
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <CalendarOutlined className="text-green-600" />
                </div>
                <span className="font-bold">Hoạt động tuần này</span>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid rgba(16, 185, 129, 0.2)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="items"
                  stroke="#10b981"
                  fill="url(#colorItems)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card
            className="border-2 border-blue-100"
            title={
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <AimOutlined className="text-blue-600" />
                </div>
                <span className="font-bold">Hiệu suất lớp học</span>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="class" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="accuracy" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={itemVariants}>
          <Card
            className="border-2 border-orange-100"
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <TrophyOutlined className="text-orange-600" />
                  </div>
                  <span className="font-bold">Học sinh xuất sắc tuần này</span>
                </div>
                <Button
                  type="text"
                  size="small"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  Xem tất cả
                  <RightOutlined className="ml-1" />
                </Button>
              </div>
            }
          >
            <div className="space-y-2.5">
              {topStudents.map((student, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    index === 0
                      ? "bg-orange-50 border-2 border-orange-200"
                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                      index === 0
                        ? "bg-orange-600 text-white"
                        : index === 1
                          ? "bg-green-600 text-white"
                          : index === 2
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-base border border-cyan-200">
                    {student.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-500">Lớp {student.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-base">
                      {student.accuracy}%
                    </p>
                    <p className="text-xs text-gray-500">{student.items} rác</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card
            className="border-2 border-yellow-100"
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <GiftOutlined className="text-yellow-600" />
                  </div>
                  <span className="font-bold">Yêu cầu đổi quà gần đây</span>
                </div>
                <Button
                  type="text"
                  size="small"
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                >
                  Xem tất cả
                  <RightOutlined className="ml-1" />
                </Button>
              </div>
            }
          >
            <div className="space-y-2.5">
              {recentRewards.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-base border border-yellow-200">
                      🎁
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {reward.student}
                      </p>
                      <p className="text-xs text-gray-500">{reward.reward}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      color={reward.status === "COMPLETED" ? "green" : "orange"}
                      text={
                        reward.status === "COMPLETED"
                          ? "Hoàn thành"
                          : "Đang chờ"
                      }
                      className="text-xs font-medium"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {reward.coins} xu
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Subscription Info */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-green-200 bg-green-50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center">
                <span className="text-2xl">🌿</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {subscription.plan}
                </h3>
                <p className="text-sm text-gray-600">
                  {subscription.currentStudents}/{subscription.maxStudents} học
                  sinh • Hết hạn: {subscription.expiresAt}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="flex-1 md:flex-none md:w-44">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-gray-600 font-medium">
                    Đã sử dụng
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {subscription.usagePercent}%
                  </p>
                </div>
                <Progress
                  percent={subscription.usagePercent}
                  strokeColor="#16a34a"
                />
              </div>
              <Button
                type="primary"
                size="large"
                className="bg-green-600 hover:bg-green-700"
              >
                Nâng cấp gói
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
