import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  Button,
  Tabs,
  Tag,
  Empty,
  Spin,
  Popconfirm,
  Pagination,
} from "antd";
import {
  GiftOutlined,
  HomeOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  BgColorsOutlined,
  TagOutlined,
  InboxOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  getAllRewards,
  getAuthenticatedStudentProfile,
  createRewardRequest,
  getAllMyRequests,
  cancelMyRequest,
} from "../../services";

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  PHYSICAL: {
    label: "Quà thật",
    icon: <GiftOutlined />,
    emoji: "🎁",
    color: "bg-orange-50 border-orange-200 text-orange-600",
    badge: "bg-orange-500",
    btnClass: "bg-orange-500 border-orange-500 hover:bg-orange-600",
  },
  VOUCHER: {
    label: "Voucher",
    icon: <TagOutlined />,
    emoji: "🏷️",
    color: "bg-purple-50 border-purple-200 text-purple-600",
    badge: "bg-purple-500",
    btnClass: "bg-purple-500 border-purple-500 hover:bg-purple-600",
  },
};

const STATUS_CONFIG = {
  PENDING: {
    icon: <ClockCircleOutlined />,
    text: "Đang chờ",
    tw: "bg-amber-50 text-amber-600 border-amber-200",
    stripe: "bg-amber-500",
  },
  APPROVED: {
    icon: <CheckCircleOutlined />,
    text: "Đã duyệt",
    tw: "bg-blue-50 text-blue-600 border-blue-200",
    stripe: "bg-blue-500",
  },
  COMPLETED: {
    icon: <CheckCircleOutlined />,
    text: "Hoàn thành",
    tw: "bg-green-50 text-green-600 border-green-200",
    stripe: "bg-green-500",
  },
  CANCELLED: {
    icon: <CloseCircleOutlined />,
    text: "Đã huỷ",
    tw: "bg-red-50 text-red-600 border-red-200",
    stripe: "bg-red-500",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const CoinIcon = ({ className = "w-5 h-5" }) => (
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

function RewardCard({ reward, coins, onRedeem }) {
  const cfg = TYPE_CONFIG[reward.rewardType] ?? TYPE_CONFIG.PHYSICAL;
  const inStock = reward.isUnlimited || reward.stockQuantity > 0;
  const canAfford = coins >= reward.coinCost;
  const canRedeem = inStock && canAfford && reward.isActive;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={canRedeem ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="rounded-2xl border-2 hover:shadow-xl transition-all h-full flex flex-col"
        bodyStyle={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Image / Emoji */}
        <div
          className={`w-full h-32 rounded-xl mb-4 flex items-center justify-center text-5xl border ${cfg.color}`}
        >
          {reward.imagePresignedUrl ? (
            <img
              src={reward.imagePresignedUrl}
              alt={reward.rewardName}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            cfg.emoji
          )}
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-800 text-base leading-tight flex-1">
            {reward.rewardName}
          </h3>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex-shrink-0 ${cfg.badge}`}
          >
            {cfg.icon}
            {cfg.label}
          </span>
        </div>

        {/* Description */}
        {reward.description && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2 flex-1">
            {reward.description}
          </p>
        )}

        {/* Stock */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <span
            className={`font-medium ${!inStock ? "text-red-500" : "text-gray-400"}`}
          >
            {reward.isUnlimited
              ? "Không giới hạn"
              : inStock
                ? `Còn lại: ${reward.stockQuantity}`
                : "Hết hàng"}
          </span>
          {reward.termsConditions && (
            <span
              className="text-gray-300 truncate max-w-[120px]"
              title={reward.termsConditions}
            >
              *Có điều kiện
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm ${canAfford ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400"}`}
          >
            <CoinIcon
              className={`w-4 h-4 ${canAfford ? "text-amber-500" : "text-gray-400"}`}
            />
            {reward.coinCost.toLocaleString()}
          </div>
          <Button
            type="primary"
            size="small"
            disabled={!canRedeem}
            onClick={() => onRedeem(reward)}
            className={`rounded-xl font-semibold text-xs px-4 ${canRedeem ? cfg.btnClass : ""}`}
          >
            {!reward.isActive
              ? "Ngừng hoạt động"
              : !inStock
                ? "Hết hàng"
                : !canAfford
                  ? "Không đủ xu"
                  : "Đổi ngay"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function RequestCard({ request, onCancel }) {
  const sc = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.PENDING;
  const tc = TYPE_CONFIG[request.rewardType] ?? TYPE_CONFIG.PHYSICAL;

  return (
    <Card
      className="rounded-2xl border-2 hover:shadow-lg transition-all overflow-hidden"
      bodyStyle={{ padding: 0 }}
    >
      <div className="flex">
        <div className={`w-1.5 flex-shrink-0 ${sc.stripe}`} />

        <div className="flex-1 p-4">
          {/* Header: Ảnh, Tên phần thưởng và Mã yêu cầu */}
          <div className="flex items-start gap-3 mb-3">
            <img
              src={request.rewardImageUrl}
              alt={request.rewardName}
              className="w-14 h-14 rounded-xl object-cover border border-gray-100 bg-gray-50"
              onError={(e) => {
                e.target.src = "https://placehold.co/100x100?text=Gift";
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800 truncate pr-2">
                  {request.rewardName}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap ${tc.badge}`}
                >
                  {tc.label}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono">
                #{request.requestCode}
              </p>

              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 font-bold text-amber-600 text-sm">
                  <CoinIcon className="w-3.5 h-3.5" />
                  {request.totalCoins}
                </span>
                {request.quantity > 1 && (
                  <span className="text-xs text-gray-500">
                    x{request.quantity}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Body: Trạng thái và Thời gian */}
          <div className="flex items-center justify-between py-2 border-t border-gray-50">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Ngày yêu cầu
              </span>
              <span className="text-xs text-gray-600 font-medium">
                {new Date(request.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${sc.tw}`}
            >
              {sc.icon} {sc.text}
            </span>
          </div>

          {/* Footer: Hành động hoặc Thông tin chi tiết trạng thái */}
          <div className="mt-2 pt-2 border-t border-dashed border-gray-100">
            {request.status === "PENDING" && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-500 italic flex items-center gap-1">
                  <ClockCircleOutlined /> Đang chờ duyệt...
                </span>
                <Popconfirm
                  title="Hủy yêu cầu đổi quà"
                  description="Bạn có chắc chắn muốn hủy yêu cầu này không?"
                  onConfirm={() => onCancel(request.id)}
                  okText="Xác nhận hủy"
                  cancelText="Quay lại"
                  okButtonProps={{ danger: true }}
                  icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                  placement="topRight"
                >
                  <Button
                    type="primary"
                    danger
                    ghost
                    size="small"
                    className="text-[11px] h-7 rounded-md font-medium"
                  >
                    Huỷ yêu cầu
                  </Button>
                </Popconfirm>
              </div>
            )}

            {request.status === "APPROVED" && (
              <div className="flex flex-col gap-2">
                <div className="text-[11px] text-blue-600 bg-blue-50 p-2 rounded-lg flex items-start gap-1.5">
                  <CheckCircleOutlined className="mt-0.5" />
                  <div className="flex flex-col">
                    <span>
                      <strong>Nhà trường đã duyệt:</strong> Đang chuẩn bị quà để
                      trao cho bạn.
                    </span>
                    {request.approvedAt && (
                      <span className="text-[10px] opacity-70">
                        Thời gian duyệt:{" "}
                        {new Date(request.approvedAt).toLocaleString("vi-VN")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {request.status === "CANCELLED" && (
              <div className="text-[11px] text-red-500 bg-red-50 p-2 rounded-lg flex items-start gap-1.5">
                <CloseCircleOutlined className="mt-0.5" />
                <span>
                  <strong>Đã huỷ:</strong>{" "}
                  {request.cancelledReason || "Người dùng tự hủy hoặc hết hạn"}
                </span>
              </div>
            )}

            {request.status === "REJECTED" && (
              <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg flex items-start gap-1.5">
                <WarningOutlined className="mt-0.5" />
                <span>
                  <strong>Từ chối:</strong> {request.rejectedReason}
                </span>
              </div>
            )}

            {request.status === "COMPLETED" && (
              <div className="flex items-center justify-between text-[11px] text-green-600 font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircleOutlined /> Đã nhận quà
                </span>
                <span className="text-gray-400 font-normal">
                  {request.deliveredAt
                    ? new Date(request.deliveredAt).toLocaleDateString("vi-VN")
                    : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function RewardGrid({ rewards, coins, type, onRedeem }) {
  const items = rewards.filter((r) => r.rewardType === type && r.isActive);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">
          {TYPE_CONFIG[type]?.emoji ?? "🎁"}
        </div>
        <p className="font-medium">Chưa có phần thưởng nào</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((r) => (
        <RewardCard key={r.id} reward={r} coins={coins} onRedeem={onRedeem} />
      ))}
    </motion.div>
  );
}

export default function StudentRewards() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [requests, setRequests] = useState([]);
  const [shopTab, setShopTab] = useState("PHYSICAL");
  const [reqTab, setReqTab] = useState("PENDING");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [reqTab]);

  const paginatedRequests = useMemo(() => {
    const filtered = requests.filter((r) => r.status === reqTab);

    const sorted = [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const startIndex = (currentPage - 1) * pageSize;
    return sorted.slice(startIndex, startIndex + pageSize);
  }, [requests, reqTab, currentPage]);

  const fetchData = async () => {
    try {
      const res1 = await getAllRewards();
      setRewards(res1.data);
      const res2 = await getAuthenticatedStudentProfile();
      setStudent(res2.data);
      const res3 = await getAllMyRequests();
      setRequests(res3.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRedeem = async (reward) => {
    if (student?.totalCoins < reward.coinCost) {
      toast.error("Không đủ xu!");
      return;
    }
    if (!reward.isUnlimited && reward.stockQuantity <= 0) {
      toast.error("Phần thưởng đã hết hàng!");
      return;
    }

    const payload = {
      rewardId: reward.id,
      quantity: 1,
      notes: "",
      studentId: student.id,
    };
    const res = await createRewardRequest(payload);
    if (res) {
      toast.success(`Tạo yêu cầu đổi "${reward.rewardName} thành công"!`);
    } else {
      toast.error(`Tạo yêu cầu đổi "${reward.rewardName}" thất bại!`);
    }

    fetchData();
  };

  const handleCancel = async (id) => {
    try {
      const res = await cancelMyRequest(id);
      if (res) {
        toast.success("Huỷ yêu cầu thành công!");
      } else {
        toast.error("Huỷ yêu cầu thất bại!");
      }
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  const byStatus = (s) => requests.filter((r) => r.status === s);
  const counts = {
    PENDING: byStatus("PENDING").length,
    APPROVED: byStatus("APPROVED").length,
    COMPLETED: byStatus("COMPLETED").length,
    CANCELLED: byStatus("CANCELLED").length,
  };

  const shopTabs = [
    {
      key: "PHYSICAL",
      label: (
        <span className="flex items-center gap-1.5">
          <GiftOutlined />
          Quà thật
        </span>
      ),
    },
    {
      key: "VOUCHER",
      label: (
        <span className="flex items-center gap-1.5">
          <TagOutlined />
          Voucher
        </span>
      ),
    },
  ];

  const reqTabs = [
    { key: "PENDING", label: `Đang chờ (${counts.PENDING})` },
    { key: "APPROVED", label: `Đã xác nhận (${counts.APPROVED})` },
    { key: "COMPLETED", label: `Hoàn thành (${counts.COMPLETED})` },
    { key: "CANCELLED", label: `Đã huỷ (${counts.CANCELLED})` },
  ];

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
          <span className="text-gray-700 font-medium">Đổi quà</span>
        </motion.div>

        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="border-2 shadow-lg overflow-hidden rounded-3xl"
            bodyStyle={{ padding: 0 }}
          >
            <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                      <GiftOutlined className="text-2xl text-white" />
                    </div>
                    Cửa hàng phần thưởng
                  </h1>
                  <p className="text-gray-500 ml-15 pl-0.5">
                    Dùng xu để đổi quà thật, quà số và voucher hấp dẫn
                  </p>
                </div>

                {/* Coin display */}
                <Card
                  className="border-2 border-amber-300 shadow-xl rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex-shrink-0"
                  bodyStyle={{ padding: "18px 24px" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                      <CoinIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">
                        Xu hiện có
                      </p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {student?.totalCoins?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick stats */}
              <div className="relative flex gap-3 mt-5 flex-wrap">
                {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                  const cnt = rewards.filter(
                    (r) => r.rewardType === type && r.isActive,
                  ).length;
                  return (
                    <button
                      key={type}
                      onClick={() => setShopTab(type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${shopTab === type ? `${cfg.color} shadow-sm` : "bg-white/60 text-gray-500 border-gray-200 hover:bg-white"}`}
                    >
                      {cfg.icon}
                      {cfg.label}
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-white/70 font-bold">
                        {cnt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Shop ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card
            className="rounded-3xl border-2 shadow-sm"
            title={
              <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                <ShoppingOutlined className="text-blue-500" />
                Danh sách phần thưởng
              </div>
            }
            bodyStyle={{ paddingTop: 8 }}
          >
            <Tabs
              activeKey={shopTab}
              onChange={setShopTab}
              items={shopTabs.map((t) => ({
                key: t.key,
                label: t.label,
                children: (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={t.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Hint banner */}
                      <div
                        className={`mb-4 p-3 rounded-xl border text-sm flex items-center gap-2 ${TYPE_CONFIG[t.key]?.color}`}
                      >
                        {TYPE_CONFIG[t.key]?.icon}
                        {t.key === "PHYSICAL" &&
                          "Quà thật sẽ được xác nhận bởi giáo viên trước khi nhận."}
                        {t.key === "VOUCHER" &&
                          "Mã voucher sẽ được gửi qua hệ thống sau khi xác nhận."}
                      </div>
                      <RewardGrid
                        rewards={rewards}
                        coins={student?.totalCoins}
                        type={t.key}
                        onRedeem={handleRedeem}
                      />
                    </motion.div>
                  </AnimatePresence>
                ),
              }))}
            />
          </Card>
        </motion.div>

        {/* ── Requests ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card
            className="rounded-3xl border-2 shadow-sm"
            title={
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-lg font-bold text-gray-800">
                  Lịch sử yêu cầu đổi quà
                </span>
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                    {counts.PENDING} đang chờ
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                    {counts.APPROVED} đã duyệt
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
                    {counts.COMPLETED} hoàn thành
                  </span>
                </div>
              </div>
            }
            bodyStyle={{ paddingTop: 8 }}
          >
            {/* Tìm đến phần render Tabs của Requests và sửa lại như sau: */}

            <Tabs
              activeKey={reqTab}
              onChange={setReqTab}
              items={reqTabs.map((t) => ({
                key: t.key,
                label: t.label,
                children: (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={t.key}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      {paginatedRequests.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-14 text-gray-400">
                          <InboxOutlined className="text-5xl opacity-30" />
                          <p className="font-medium">
                            Chưa có yêu cầu nào ở trạng thái này
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            {paginatedRequests.map((req) => (
                              <RequestCard
                                key={req.id}
                                request={req}
                                onCancel={handleCancel}
                              />
                            ))}
                          </div>

                          {/* Thêm phần phân trang ở đây */}
                          <div className="flex justify-center pt-4">
                            <Pagination
                              current={currentPage}
                              pageSize={pageSize}
                              total={
                                requests.filter((r) => r.status === reqTab)
                                  .length
                              }
                              onChange={(page) => setCurrentPage(page)}
                              showSizeChanger={false}
                              size="small"
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                ),
              }))}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
