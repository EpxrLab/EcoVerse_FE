import { useState, useMemo, lazy, Suspense } from "react";
import { Card, Button, Tabs, Tag, Spin, Progress } from "antd";
import {
  CalendarOutlined,
  TrophyOutlined,
  AimOutlined,
  ArrowRightOutlined,
  StarOutlined,
  GiftOutlined,
  UserOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentCampaigns } from "../../hooks/useStudentCampaign";
import { useCampaignContext } from "../../context";
import { useNavigate } from "react-router";

// ─── Status & Type Config ─────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active: {
    label: "Đang diễn ra",
    color: "success",
    tw: "bg-green-50 text-green-600 border-green-200",
  },
  upcoming: {
    label: "Sắp diễn ra",
    color: "processing",
    tw: "bg-blue-50 text-blue-600 border-blue-200",
  },
  completed: {
    label: "Đã kết thúc",
    color: "default",
    tw: "bg-gray-50 text-gray-500 border-gray-200",
  },
};

const TYPE_CONFIG = {
  school: { label: "Trường học", tw: "bg-blue-100 text-blue-700" },
  partnership: { label: "Đối tác", tw: "bg-purple-100 text-purple-700" },
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

// ─── Lazy-loaded Campaign Card ────────────────────────────────────────────────

const CampaignCard = lazy(() =>
  Promise.resolve({
    default: ({ campaign, onSelect }) => {
      const statusCfg = STATUS_CONFIG[campaign.status];
      const typeCfg = TYPE_CONFIG[campaign.type];
      const isActive = campaign.status === "active";

      return (
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="h-full"
        >
          <Card
            className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-xl h-full
              ${isActive ? "border-green-300" : "border-gray-200 opacity-75"}`}
            bodyStyle={{
              padding: "24px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top accent bar */}
            <div
              className={`absolute top-0 inset-x-0 h-1 ${
                isActive
                  ? "bg-gradient-to-r from-green-400 to-blue-400"
                  : "bg-gray-200"
              }`}
            />

            {/* Content wrapper with flex-grow */}
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="space-y-2 mb-4">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={`text-xl font-bold text-gray-800 transition-colors ${
                      isActive ? "group-hover:text-green-600" : ""
                    }`}
                  >
                    {campaign.name}
                  </h3>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${statusCfg.tw}`}
                  >
                    {statusCfg.label}
                  </span>
                </div>
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeCfg.tw}`}
                >
                  {typeCfg.label}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {campaign.description}
              </p>

              {/* Dates */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <CalendarOutlined />
                <span>
                  {new Date(campaign.startDate).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(campaign.endDate).toLocaleDateString("vi-VN")}
                </span>
              </div>

              {/* Progress */}
              {campaign.studentProgress && (
                <div className="grid grid-cols-3 gap-3 pt-3 mb-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-lg">
                      <TrophyOutlined />
                      {campaign.studentProgress.rank}
                    </div>
                    <p className="text-xs text-gray-400">Hạng</p>
                  </div>
                  <div className="text-center">
                    <div className="text-green-600 font-bold text-lg">
                      {campaign.studentProgress.totalPoints}
                    </div>
                    <p className="text-xs text-gray-400">Điểm</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-500 font-bold text-lg">
                      <AimOutlined />
                      {campaign.studentProgress.accuracy}%
                    </div>
                    <p className="text-xs text-gray-400">Độ chính xác</p>
                  </div>
                </div>
              )}

              {/* Spacer to push button to bottom */}
              <div className="flex-grow" />

              {/* Action Button - always at bottom */}
              <div className="pt-4">
                <Button
                  block
                  type={isActive ? "primary" : "default"}
                  size="large"
                  onClick={() => onSelect(campaign)}
                  disabled={campaign.status === "upcoming"}
                  className={`rounded-xl font-semibold ${
                    isActive
                      ? "bg-green-500 border-green-500 hover:bg-green-600"
                      : ""
                  }`}
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                >
                  {campaign.status === "upcoming" ? "Sắp mở" : "Vào chiến dịch"}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      );
    },
  }),
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ message }) => (
  <div className="text-center py-16">
    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
      <TrophyOutlined className="text-5xl text-gray-300" />
    </div>
    <p className="text-lg text-gray-400">{message}</p>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CampaignSelection() {
  const navigate = useNavigate();
  const { campaigns, loading } = useStudentCampaigns();
  const { setSelectedCampaign } = useCampaignContext();

  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign.id);
    navigate(`/student/campaign/${campaign.id}`);
  };

  const handleProfile = () => {
    navigate("/student/profile");
  };

  const handleRewards = () => {
    navigate("/student/rewards");
  };

  // ── Filtered campaigns ──
  const { active, upcoming, completed } = useMemo(
    () => ({
      active: campaigns.filter((c) => c.status === "active"),
      upcoming: campaigns.filter((c) => c.status === "upcoming"),
      completed: campaigns.filter((c) => c.status === "completed"),
    }),
    [campaigns],
  );

  // ── Tab items ──
  const tabItems = [
    {
      key: "active",
      label: `Đang diễn ra (${active.length})`,
      children:
        active.length === 0 ? (
          <EmptyState message="Chưa có chiến dịch nào đang diễn ra" />
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {active.map((c) => (
              <Suspense
                key={c.id}
                fallback={
                  <Card
                    className="rounded-2xl border-2 border-gray-200"
                    bodyStyle={{ padding: 80 }}
                  >
                    <div className="text-center text-gray-300">
                      <LoadingOutlined className="text-3xl" />
                    </div>
                  </Card>
                }
              >
                <CampaignCard campaign={c} onSelect={handleSelectCampaign} />
              </Suspense>
            ))}
          </motion.div>
        ),
    },
    {
      key: "upcoming",
      label: `Sắp diễn ra (${upcoming.length})`,
      children:
        upcoming.length === 0 ? (
          <EmptyState message="Chưa có chiến dịch nào sắp diễn ra" />
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {upcoming.map((c) => (
              <Suspense
                key={c.id}
                fallback={
                  <Card
                    className="rounded-2xl border-2 border-gray-200"
                    bodyStyle={{ padding: 80 }}
                  >
                    <div className="text-center text-gray-300">
                      <LoadingOutlined className="text-3xl" />
                    </div>
                  </Card>
                }
              >
                <CampaignCard campaign={c} onSelect={handleSelectCampaign} />
              </Suspense>
            ))}
          </motion.div>
        ),
    },
    {
      key: "completed",
      label: `Đã kết thúc (${completed.length})`,
      children:
        completed.length === 0 ? (
          <EmptyState message="Chưa có chiến dịch nào đã kết thúc" />
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {completed.map((c) => (
              <Suspense
                key={c.id}
                fallback={
                  <Card
                    className="rounded-2xl border-2 border-gray-200"
                    bodyStyle={{ padding: 80 }}
                  >
                    <div className="text-center text-gray-300">
                      <LoadingOutlined className="text-3xl" />
                    </div>
                  </Card>
                }
              >
                <CampaignCard campaign={c} onSelect={handleSelectCampaign} />
              </Suspense>
            ))}
          </motion.div>
        ),
    },
  ];

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-gray-400 mt-4">Đang tải chiến dịch...</p>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          {/* Top buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleProfile}
                  icon={<UserOutlined />}
                  className="rounded-xl border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400"
                >
                  Hồ sơ
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="primary"
                  onClick={handleRewards}
                  icon={<GiftOutlined />}
                  className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 border-0 hover:from-amber-500 hover:to-orange-600"
                >
                  Đổi quà
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-600 mb-2"
          >
            <StarOutlined />
            <span className="text-sm font-semibold">
              Chọn chiến dịch để bắt đầu
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-800"
          >
            Chiến dịch của bạn
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto"
          >
            Tham gia các chiến dịch để học hỏi, chơi game và nhận phần thưởng
            hấp dẫn
          </motion.p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Tabs
            defaultActiveKey="active"
            centered
            size="large"
            items={tabItems}
            className="[&_.ant-tabs-nav]:mb-8 [&_.ant-tabs-tab]:px-6 [&_.ant-tabs-tab]:py-3 [&_.ant-tabs-tab]:text-base [&_.ant-tabs-tab]:font-semibold"
          />
        </motion.div>
      </div>
    </div>
  );
}
