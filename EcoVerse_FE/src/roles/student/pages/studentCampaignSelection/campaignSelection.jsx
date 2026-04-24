import { useMemo, lazy, Suspense } from "react";
import { Card, Button, Tabs, Spin, Modal } from "antd";
import {
  CalendarOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
  StarOutlined,
  GiftOutlined,
  UserOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useStudentCampaigns } from "../../hooks/useStudentCampaign";
import { useCampaignContext } from "../../context";
import { useNavigate } from "react-router";
import { logoutFunction } from "../../../../features/auth/services";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  INVITING: {
    label: "Được mời",
    tw: "bg-blue-50 text-blue-600 border-blue-200",
    dot: "bg-blue-500",
  },
  ON_GOING: {
    label: "Đang diễn ra",
    tw: "bg-primary/10 text-primary border-primary/20",
    dot: "bg-primary",
  },
  COMPLETED: {
    label: "Đã kết thúc",
    tw: "bg-gray-50 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
  },
};

const TYPE_CONFIG = {
  SCHOOL_INTERNAL: { label: "Nội bộ trường", tw: "bg-blue-100 text-blue-700" },
  INTER_SCHOOL: { label: "Liên trường", tw: "bg-indigo-100 text-indigo-700" },
  PARTNERSHIP_EVENT: {
    label: "Sự kiện đối tác",
    tw: "bg-purple-100 text-purple-700",
  },
};

const getStatusCfg = (status) =>
  STATUS_CONFIG[status?.toUpperCase()] ?? STATUS_CONFIG.INVITING;

const getTypeCfg = (type) =>
  TYPE_CONFIG[type] ?? { label: type ?? "—", tw: "bg-gray-100 text-gray-600" };

import { toLocalISO } from "@/utils/dateUtils";

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(toLocalISO(iso)).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const isActive = (status) => status?.toUpperCase() === "ON_GOING";

const daysUntil = (iso) => {
  if (!iso) return null;
  const diff = new Date(toLocalISO(iso)) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};

// ─── CampaignCard ─────────────────────────────────────────────────────────────

const CampaignCard = lazy(() =>
  Promise.resolve({
    default: ({ campaign, onSelect }) => {
      const statusCfg = getStatusCfg(campaign.status);
      const typeCfg = getTypeCfg(campaign.campaignType);
      const active = isActive(campaign.status);
      const isInvited = campaign.status?.toUpperCase() === "INVITING";

      const deadlineDays = daysUntil(campaign.invitationDeadline);
      const deadlineWarning =
        deadlineDays !== null && deadlineDays >= 0 && deadlineDays <= 3;

      return (
        <motion.div
          variants={cardVariants}
          whileHover={
            !isInvited ? { y: -6, transition: { duration: 0.2 } } : {}
          }
          className="h-full"
        >
          <Card
            className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 h-full
              ${active ? "border-primary/30 hover:shadow-xl" : "border-gray-200 hover:shadow-md"}
              ${!active && !isInvited ? "opacity-80" : ""}`}
            bodyStyle={{
              padding: "22px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top accent bar */}
            <div
              className={`absolute top-0 inset-x-0 h-1 ${active ? "bg-primary" : "bg-gray-200"}`}
            />

            {/* Active pulse dot */}
            {active && (
              <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
            )}

            <div className="flex flex-col h-full gap-3">
              {/* ── Header ── */}
              <div className="space-y-2 pr-4">
                {/* Status + Type badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.tw}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                    />
                    {statusCfg.label}
                  </span>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeCfg.tw}`}
                  >
                    {typeCfg.label}
                  </span>
                </div>

                {/* Campaign name */}
                <h3 className="text-lg font-bold text-gray-800 leading-tight line-clamp-2">
                  {campaign.campaignName}
                </h3>

                {/* Campaign code */}
                {campaign.campaignCode && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <CodeOutlined className="text-gray-300" />
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                      {campaign.campaignCode}
                    </span>
                  </div>
                )}
              </div>

              {/* ── Date range ── */}
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
                <CalendarOutlined className="text-gray-300 flex-shrink-0" />
                <span>{fmtDate(campaign.startDate)}</span>
                <span className="text-gray-300">→</span>
                <span>{fmtDate(campaign.endDate)}</span>
              </div>


              {/* Spacer */}
              <div className="flex-1" />

              <Button
                block
                type={active ? "primary" : "default"}
                size="large"
                onClick={() => onSelect(campaign)}
                disabled={isInvited}
                className={`rounded-xl font-semibold transition-all ${
                  active
                    ? "bg-primary border-primary hover:opacity-90 shadow-md shadow-primary/20"
                    : ""
                }`}
                icon={<ArrowRightOutlined />}
                iconPosition="end"
              >
                {isInvited
                  ? "Chờ phụ huynh xác nhận"
                  : active
                    ? "Vào chiến dịch"
                    : "Xem kết quả"}
              </Button>
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
    <p className="text-gray-400 text-base">{message}</p>
  </div>
);

// ─── CampaignGrid ─────────────────────────────────────────────────────────────

function CampaignGrid({ campaigns, onSelect }) {
  if (campaigns.length === 0) return null;
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {campaigns.map((c) => (
        <Suspense
          key={c.id}
          fallback={
            <Card
              className="rounded-2xl border-2 border-gray-200 h-64 flex items-center justify-center"
              bodyStyle={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <LoadingOutlined className="text-2xl text-gray-300" />
            </Card>
          }
        >
          <CampaignCard campaign={c} onSelect={onSelect} />
        </Suspense>
      ))}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CampaignSelection() {
  const navigate = useNavigate();
  const { campaigns, loading } = useStudentCampaigns();
  const { setSelectedCampaign, clearCampaign } = useCampaignContext();

  const handleLogout = () => {
    try {
      Modal.confirm({
        title: "Xác nhận đăng xuất",
        content: "Bạn có chắc chắn muốn thoát khỏi hệ thống không?",
        okText: "Đăng xuất",
        cancelText: "Hủy",
        okType: "danger",
        centered: true,
        onOk: async () => {
          const res = await logoutFunction();
          if (res) {
            toast.success("Đăng xuất thành công!");
            navigate("/auth/student");
          } else {
            toast.error("Đăng xuất thất bại!");
          }
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelect = (campaign) => {
    setSelectedCampaign(campaign);
    navigate(`/student/campaign/${campaign.id}`);
  };

  const normalize = (s) => s?.toUpperCase() ?? "";

  const { active, completed } = useMemo(
    () => ({
      active: campaigns.filter((c) => normalize(c.status) === "ON_GOING"),
      completed: campaigns.filter((c) => normalize(c.status) === "COMPLETED"),
    }),
    [campaigns],
  );

  const tabItems = [
    {
      key: "active",
      label: (
        <span className="flex items-center gap-2">
          Đang diễn ra
          {active.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
              {active.length}
            </span>
          )}
        </span>
      ),
      children:
        active.length === 0 ? (
          <EmptyState message="Chưa có chiến dịch nào đang diễn ra" />
        ) : (
          <CampaignGrid campaigns={active} onSelect={handleSelect} />
        ),
    },
    {
      key: "completed",
      label: `Đã kết thúc (${completed.length})`,
      children:
        completed.length === 0 ? (
          <EmptyState message="Chưa có chiến dịch nào đã kết thúc" />
        ) : (
          <CampaignGrid campaigns={completed} onSelect={handleSelect} />
        ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Spin size="large" />
          <p className="text-muted-foreground">Đang tải chiến dịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top action bar */}
          <div className="flex items-center justify-end gap-3 mb-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate("/student/profile")}
                icon={<UserOutlined />}
                className="rounded-xl border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400"
              >
                Hồ sơ
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="primary"
                onClick={() => navigate("/student/rewards")}
                icon={<GiftOutlined />}
                className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 border-0 hover:from-amber-500 hover:to-orange-600"
              >
                Đổi quà
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                danger
                onClick={handleLogout}
                icon={<LogoutOutlined />}
                className="rounded-xl border-2 border-red-100 hover:bg-red-50 flex items-center"
              >
                Đăng xuất
              </Button>
            </motion.div>
          </div>

          {/* Title block */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold"
            >
              <StarOutlined />
              <span className="text-sm">Chọn chiến dịch để bắt đầu</span>
            </motion.div>

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
              Tham gia chiến dịch để học hỏi, chơi game và nhận phần thưởng hấp
              dẫn
            </motion.p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
