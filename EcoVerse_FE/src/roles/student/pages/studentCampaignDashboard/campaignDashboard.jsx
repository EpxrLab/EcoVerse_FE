import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, Button, Progress, Statistic } from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  AimOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useCampaignContext } from "../../context";

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const featureVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CampaignDashboard() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { selectedCampaign } = useCampaignContext();

  if (!selectedCampaign) {
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

  const progress = selectedCampaign.studentProgress;
  const completionPercentage = progress
    ? Math.round(
        ((progress.quizzesCompleted + progress.gamesPlayed) / 20) * 100,
      )
    : 0;

  const features = [
    {
      id: "quiz",
      title: "Làm Quiz",
      description: "Trả lời câu hỏi để kiểm tra kiến thức",
      icon: <BookOutlined />,
      color: "text-blue-500",
      bg: "bg-blue-50",
      borderColor: "border-blue-200",
      buttonBg: "bg-blue-500",
      path: `/student/campaign/${selectedCampaign.id}/quiz`,
      stat: progress ? `${progress.quizzesCompleted} quiz` : "0 quiz",
      statLabel: "đã hoàn thành",
    },
    {
      id: "game",
      title: "Chơi Game",
      description: "Phân loại rác qua các level thú vị",
      icon: <PlayCircleOutlined />,
      color: "text-green-500",
      bg: "bg-green-50",
      borderColor: "border-green-200",
      buttonBg: "bg-green-500",
      path: `/student/campaign/${selectedCampaign.id}/game`,
      stat: progress ? `${progress.gamesPlayed} game` : "0 game",
      statLabel: "đã chơi",
    },
    {
      id: "leaderboard",
      title: "Bảng xếp hạng",
      description: "Xem thứ hạng và so sánh với bạn bè",
      icon: <TrophyOutlined />,
      color: "text-amber-500",
      bg: "bg-amber-50",
      borderColor: "border-amber-200",
      buttonBg: "bg-amber-500",
      path: `/student/campaign/${selectedCampaign.id}/leaderboard`,
      stat: progress ? `#${progress.rank}` : "#--",
      statLabel: "xếp hạng",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className="border-2 shadow-xl overflow-hidden rounded-3xl"
          bodyStyle={{ padding: 0 }}
        >
          <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl" />

            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/50 border border-green-200 text-gray-700">
                  {selectedCampaign.type === "school"
                    ? "🏫 Chiến dịch trường học"
                    : "🤝 Chiến dịch đối tác"}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/50 border border-blue-200 text-gray-700">
                  <CalendarOutlined />
                  {new Date(selectedCampaign.startDate).toLocaleDateString(
                    "vi-VN",
                  )}{" "}
                  -{" "}
                  {new Date(selectedCampaign.endDate).toLocaleDateString(
                    "vi-VN",
                  )}
                </span>
              </div>

              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-3">
                  {selectedCampaign.name}
                </h1>
                <p className="text-gray-500 text-lg max-w-3xl">
                  {selectedCampaign.description}
                </p>
              </div>

              {/* Progress Bar */}
              {progress && (
                <div className="max-w-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Tiến độ hoàn thành
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {completionPercentage}%
                    </span>
                  </div>
                  <Progress
                    percent={completionPercentage}
                    strokeColor="#22c55e"
                    trailColor="#e5e7eb"
                    strokeWidth={12}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {progress.quizzesCompleted + progress.gamesPlayed} / 20 hoạt
                    động đã hoàn thành
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Statistics Grid */}
      {progress && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              icon: <TrophyOutlined />,
              label: "Xếp hạng",
              value: `#${progress.rank}`,
              bg: "bg-amber-50",
              color: "text-amber-500",
            },
            {
              icon: <ThunderboltOutlined />,
              label: "Tổng điểm",
              value: progress.totalPoints,
              bg: "bg-green-50",
              color: "text-green-500",
            },
            {
              icon: <AimOutlined />,
              label: "Độ chính xác",
              value: `${progress.accuracy}%`,
              bg: "bg-blue-50",
              color: "text-blue-500",
            },
            {
              icon: <FireOutlined />,
              label: "Hoạt động",
              value: progress.quizzesCompleted + progress.gamesPlayed,
              bg: "bg-orange-50",
              color: "text-orange-500",
            },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card
                className="rounded-2xl border-2 border-gray-100 hover:shadow-lg transition-all"
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
      )}

      {/* Feature Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Hoạt động</h2>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={featureVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="cursor-pointer"
              onClick={() => navigate(feature.path)}
            >
              <Card
                className={`rounded-2xl border-2 ${feature.borderColor} hover:shadow-xl transition-all h-full`}
                bodyStyle={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div className="space-y-4">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center shadow-sm`}
                    >
                      <span className={`text-2xl ${feature.color}`}>
                        {feature.icon}
                      </span>
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div
                    className={`p-4 rounded-xl border-2 border-dashed ${feature.bg} ${feature.borderColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-2xl font-bold ${feature.color}`}>
                          {feature.stat}
                        </p>
                        <p className="text-sm text-gray-500">
                          {feature.statLabel}
                        </p>
                      </div>
                      <CheckCircleOutlined
                        className={`text-2xl ${feature.color}`}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    block
                    type="primary"
                    size="large"
                    className={`rounded-xl font-semibold ${feature.buttonBg} border-0 hover:opacity-90`}
                  >
                    Bắt đầu ngay
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
