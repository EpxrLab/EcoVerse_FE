import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router";
import { Card, Button, Badge, Tabs, Skeleton } from "antd";
import {
  GiftOutlined,
  HomeOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  BgColorsOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// ─── Demo Data ────────────────────────────────────────────────────────────────

const mockStudent = { name: "Minh Anh", coins: 2450 };

const virtualRewards = [
  { id: 1, name: "Avatar Gấu Xanh", price: 500, emoji: "🐻" },
  { id: 2, name: "Avatar Thỏ Trắng", price: 400, emoji: "🐰" },
  { id: 5, name: "Avatar Cáo Cam", price: 600, emoji: "🦊" },
  { id: 6, name: "Avatar Sư Tử", price: 800, emoji: "🦁" },
  { id: 9, name: "Avatar Gấu Trúc", price: 700, emoji: "🐼" },
  { id: 10, name: "Avatar Chim Cánh Cụt", price: 550, emoji: "🐧" },
];

const physicalRewards = [
  { id: 3, name: "Voucher Sách 50K", price: 2000, emoji: "📚" },
  { id: 4, name: "Bút Eco Friendly", price: 1500, emoji: "✏️" },
  { id: 7, name: "Túi vải Eco", price: 1800, emoji: "👜" },
  { id: 8, name: "Sticker Pack", price: 800, emoji: "⭐" },
  { id: 11, name: "Bình nước Eco", price: 2500, emoji: "💧" },
  { id: 12, name: "Sổ tay tái chế", price: 1200, emoji: "📓" },
];

const mockRequests = [
  {
    id: 1,
    name: "Avatar Gấu Xanh",
    type: "virtual",
    coins: 500,
    status: "completed",
    requestedAt: "2024-01-15",
    completedAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Voucher Sách 50K",
    type: "physical",
    coins: 2000,
    status: "pending",
    requestedAt: "2024-01-18",
    expiresAt: "2024-01-25",
  },
  {
    id: 3,
    name: "Avatar Thỏ Trắng",
    type: "virtual",
    coins: 400,
    status: "completed",
    requestedAt: "2024-01-10",
    completedAt: "2024-01-10",
  },
  {
    id: 4,
    name: "Bút Eco Friendly",
    type: "physical",
    coins: 1500,
    status: "cancelled",
    requestedAt: "2024-01-05",
    cancelledAt: "2024-01-08",
    reason: "Hết hàng",
  },
  {
    id: 5,
    name: "Túi vải Eco",
    type: "physical",
    coins: 1800,
    status: "pending",
    requestedAt: "2024-01-20",
    expiresAt: "2024-01-27",
  },
];

const mockPartnershipRewards = [
  {
    id: 1,
    campaign: "Không khói bụi cho tương lai",
    name: "Voucher Grab 100K",
    date: "20/01/2024",
    status: "at_school",
  },
  {
    id: 2,
    campaign: "Không khói bụi cho tương lai",
    name: "Túi canvas cao cấp",
    date: "15/01/2024",
    status: "collected",
  },
  {
    id: 3,
    campaign: "Tháng hành động vì môi trường",
    name: "Bình nước thủy tinh",
    date: "25/01/2024",
    status: "shipping",
  },
];

// ─── CoinIcon ─────────────────────────────────────────────────────────────────

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

// ─── Lazy-loaded Reward Card ──────────────────────────────────────────────────

const RewardCard = lazy(() =>
  Promise.resolve({
    default: ({ reward, type, canAfford, onRedeem }) => (
      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={`rounded-2xl border-2 hover:shadow-xl transition-all ${
            type === "virtual"
              ? "hover:border-green-300"
              : "hover:border-orange-300"
          }`}
          bodyStyle={{ padding: "24px", textAlign: "center" }}
        >
          <div className="text-6xl mb-4">{reward.emoji}</div>
          <h3 className="font-bold text-lg text-gray-800 mb-3">
            {reward.name}
          </h3>
          <div className="flex items-center justify-center gap-2 text-amber-500 mb-4 p-2 rounded-lg bg-amber-50">
            <CoinIcon className="w-5 h-5" />
            <span className="text-xl font-bold">{reward.price}</span>
          </div>
          <Button
            block
            type={canAfford ? "primary" : "default"}
            size="large"
            disabled={!canAfford}
            onClick={onRedeem}
            icon={type === "virtual" ? <BgColorsOutlined /> : <GiftOutlined />}
            className={`rounded-xl font-semibold ${
              canAfford
                ? type === "virtual"
                  ? "bg-green-500 border-green-500 hover:bg-green-600"
                  : "bg-orange-500 border-orange-500 hover:bg-orange-600"
                : ""
            }`}
          >
            {canAfford
              ? type === "virtual"
                ? "Đổi ngay"
                : "Yêu cầu đổi"
              : "Không đủ xu"}
          </Button>
        </Card>
      </motion.div>
    ),
  }),
);

// ─── Main Component ────────────────────────────────────────────────────────────

export default function StudentRewards() {
  const navigate = useNavigate();
  const [student] = useState(mockStudent);
  const [requests, setRequests] = useState(mockRequests);

  const handleRedeem = (reward, type) => {
    if (student.coins < reward.price) {
      toast.error("Không đủ xu!");
      return;
    }
    if (type === "virtual") {
      toast.success(`Đã đổi ${reward.name}! Avatar của bạn đã được cập nhật.`);
    } else {
      toast.success(
        `Đã tạo yêu cầu đổi ${reward.name}! Vui lòng chờ xác nhận từ giáo viên.`,
      );
    }
  };

  const handleCancelRequest = (requestId) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: "cancelled",
              cancelledAt: new Date().toISOString().split("T")[0],
              reason: "Tự huỷ bởi học sinh",
            }
          : req,
      ),
    );
  };

  const pending = requests.filter((r) => r.status === "pending");
  const completed = requests.filter((r) => r.status === "completed");
  const cancelled = requests.filter((r) => r.status === "cancelled");

  const getStatusBadge = (status) => {
    const config = {
      pending: {
        icon: <ClockCircleOutlined />,
        text: "Đang chờ",
        tw: "bg-amber-50 text-amber-600 border-amber-200",
      },
      completed: {
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
        tw: "bg-green-50 text-green-600 border-green-200",
      },
      cancelled: {
        icon: <CloseCircleOutlined />,
        text: "Đã huỷ",
        tw: "bg-red-50 text-red-600 border-red-200",
      },
    };
    const cfg = config[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.tw}`}
      >
        {cfg.icon}
        {cfg.text}
      </span>
    );
  };

  const renderRequestCard = (request) => (
    <Card
      key={request.id}
      className="rounded-2xl border-2 hover:shadow-lg transition-all"
      bodyStyle={{ padding: 0 }}
    >
      <div className="flex">
        {/* Left stripe */}
        <div
          className={`w-2 ${
            request.status === "pending"
              ? "bg-amber-500"
              : request.status === "completed"
                ? "bg-green-500"
                : "bg-red-500"
          }`}
        />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border ${
                  request.type === "virtual"
                    ? "bg-blue-50 border-blue-100"
                    : "bg-orange-50 border-orange-100"
                }`}
              >
                {request.type === "virtual" ? "🎨" : "🎁"}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  {request.name}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1.5 font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                    <CoinIcon className="w-3.5 h-3.5" />
                    {request.coins} xu
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockCircleOutlined className="text-xs" />
                    {request.requestedAt}
                  </span>
                </div>
              </div>
            </div>
            {getStatusBadge(request.status)}
          </div>

          {/* Footer */}
          <div className="mt-2 pt-3 border-t border-dashed border-gray-200">
            {request.status === "pending" && request.expiresAt && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <WarningOutlined />
                  <span className="font-medium">
                    Hết hạn: {request.expiresAt}
                  </span>
                </div>
                <Button
                  type="text"
                  size="small"
                  danger
                  onClick={() => handleCancelRequest(request.id)}
                  className="text-red-500 hover:bg-red-50"
                >
                  Huỷ yêu cầu
                </Button>
              </div>
            )}
            {request.status === "completed" && request.completedAt && (
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircleOutlined />
                <span>Đã giao thành công vào {request.completedAt}</span>
              </div>
            )}
            {request.status === "cancelled" && request.reason && (
              <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                <CloseCircleOutlined />
                <span>Đã huỷ: {request.reason}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

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

        {/* Header */}
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
              <div className="relative flex items-center justify-between">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                      <GiftOutlined className="text-2xl text-white" />
                    </div>
                    Cửa hàng quà tặng
                  </h1>
                  <p className="text-gray-500 text-lg">
                    Sử dụng xu để đổi phần thưởng hấp dẫn
                  </p>
                </div>
                <Card
                  className="border-2 border-amber-300 shadow-xl rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50"
                  bodyStyle={{ padding: "24px" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <CoinIcon />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Số xu hiện có
                      </p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {student.coins}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Shop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className="rounded-3xl border-2 shadow-sm"
            title={
              <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                <ShoppingOutlined className="text-blue-500" />
                Cửa hàng quà tặng
              </div>
            }
            bodyStyle={{ paddingTop: 8 }}
          >
            <Tabs
              defaultActiveKey="virtual"
              centered
              size="large"
              items={[
                {
                  key: "virtual",
                  label: (
                    <span className="flex items-center gap-2">
                      <BgColorsOutlined />
                      Quà ảo (Avatar)
                    </span>
                  ),
                  children: (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                        <p className="text-sm text-blue-600 flex items-center gap-2">
                          <BgColorsOutlined />
                          Đổi avatar mới và thay đổi hình đại diện của bạn ngay
                          lập tức!
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {virtualRewards.map((reward) => (
                          <Suspense
                            key={reward.id}
                            fallback={
                              <Card
                                className="rounded-2xl border-2"
                                bodyStyle={{ padding: 80 }}
                              >
                                <Skeleton.Avatar
                                  active
                                  size={60}
                                  className="mx-auto mb-2"
                                />
                                <Skeleton active paragraph={{ rows: 2 }} />
                              </Card>
                            }
                          >
                            <RewardCard
                              reward={reward}
                              type="virtual"
                              canAfford={student.coins >= reward.price}
                              onRedeem={() => handleRedeem(reward, "virtual")}
                            />
                          </Suspense>
                        ))}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "physical",
                  label: (
                    <span className="flex items-center gap-2">
                      <GiftOutlined />
                      Quà thật
                    </span>
                  ),
                  children: (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                        <p className="text-sm text-orange-600 flex items-center gap-2">
                          <GiftOutlined />
                          Quà thật sẽ được gửi yêu cầu đến giáo viên và cần được
                          xác nhận trước khi nhận!
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {physicalRewards.map((reward) => (
                          <Suspense
                            key={reward.id}
                            fallback={
                              <Card
                                className="rounded-2xl border-2"
                                bodyStyle={{ padding: 80 }}
                              >
                                <Skeleton.Avatar
                                  active
                                  size={60}
                                  className="mx-auto mb-2"
                                />
                                <Skeleton active paragraph={{ rows: 2 }} />
                              </Card>
                            }
                          >
                            <RewardCard
                              reward={reward}
                              type="physical"
                              canAfford={student.coins >= reward.price}
                              onRedeem={() => handleRedeem(reward, "physical")}
                            />
                          </Suspense>
                        ))}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </motion.div>

        {/* Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            className="rounded-3xl border-2 shadow-sm"
            title={
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-800">
                  Yêu cầu đổi quà của bạn
                </span>
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                    {pending.length} đang chờ
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
                    {completed.length} hoàn thành
                  </span>
                </div>
              </div>
            }
            bodyStyle={{ paddingTop: 8 }}
          >
            <Tabs
              defaultActiveKey="pending"
              items={[
                {
                  key: "pending",
                  label: `Đang chờ (${pending.length})`,
                  children:
                    pending.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <ClockCircleOutlined className="text-5xl mb-3 opacity-50" />
                        <p>Chưa có yêu cầu nào đang chờ</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pending.map(renderRequestCard)}
                      </div>
                    ),
                },
                {
                  key: "completed",
                  label: `Hoàn thành (${completed.length})`,
                  children:
                    completed.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <CheckCircleOutlined className="text-5xl mb-3 opacity-50" />
                        <p>Chưa có yêu cầu nào hoàn thành</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {completed.map(renderRequestCard)}
                      </div>
                    ),
                },
                {
                  key: "cancelled",
                  label: `Đã huỷ (${cancelled.length})`,
                  children:
                    cancelled.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <CloseCircleOutlined className="text-5xl mb-3 opacity-50" />
                        <p>Chưa có yêu cầu nào bị huỷ</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cancelled.map(renderRequestCard)}
                      </div>
                    ),
                },
                {
                  key: "partnership",
                  label: <span className="text-blue-500">Quà từ Đối tác</span>,
                  children:
                    mockPartnershipRewards.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <GiftOutlined className="text-5xl mb-3 opacity-50" />
                        <p>Chưa có quà từ chiến dịch đối tác</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {mockPartnershipRewards.map((reward) => (
                          <Card
                            key={reward.id}
                            className="rounded-2xl border-2 hover:shadow-lg transition-all"
                            bodyStyle={{ padding: 0 }}
                          >
                            <div className="flex">
                              <div
                                className={`w-2 ${
                                  reward.status === "collected"
                                    ? "bg-green-500"
                                    : reward.status === "at_school"
                                      ? "bg-blue-500"
                                      : "bg-orange-500"
                                }`}
                              />
                              <div className="flex-1 p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center border border-blue-200">
                                      <GiftOutlined className="text-2xl text-blue-500" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                                          {reward.campaign}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                          <ClockCircleOutlined /> {reward.date}
                                        </span>
                                      </div>
                                      <h3 className="font-bold text-lg text-gray-800">
                                        {reward.name}
                                      </h3>
                                    </div>
                                  </div>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                                      reward.status === "collected"
                                        ? "bg-green-500"
                                        : reward.status === "at_school"
                                          ? "bg-blue-500 animate-pulse"
                                          : "bg-orange-500"
                                    }`}
                                  >
                                    {reward.status === "shipping"
                                      ? "Đang vận chuyển"
                                      : reward.status === "at_school"
                                        ? "Đã về trường"
                                        : "Đã nhận"}
                                  </span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                  <p className="text-sm font-medium flex items-center gap-2">
                                    {reward.status === "shipping" ? (
                                      <>
                                        <GiftOutlined className="text-orange-500" />
                                        <span className="text-gray-500">
                                          Phần thưởng đang trên đường về trường.
                                        </span>
                                      </>
                                    ) : reward.status === "at_school" ? (
                                      <>
                                        <GiftOutlined className="text-blue-500" />
                                        <span className="text-blue-600">
                                          Đã về trường! Hãy đến phòng Admin để
                                          nhận nhé.
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span className="text-green-600">
                                          Bạn đã nhận phần quà này. Chúc mừng!
                                        </span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ),
                },
              ]}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
