import { useState, useMemo, lazy, Suspense } from "react";
import { Table, Button, Card, Input, Select, Tag, Statistic } from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Demo Data ────────────────────────────────────────────────────────────────

const MONTHLY_REVENUE = [
  { month: "T1", revenue: 42 },
  { month: "T2", revenue: 55 },
  { month: "T3", revenue: 61 },
  { month: "T4", revenue: 58 },
  { month: "T5", revenue: 74 },
  { month: "T6", revenue: 91 },
];

const DEMO_TRANSACTIONS = [
  {
    id: "TXN-0001",
    school: "Trường THCS Lê Lợi",
    schoolId: "SCH-001",
    plan: "Pro",
    amount: 1200000,
    status: "completed",
    date: "15/06/2024",
  },
  {
    id: "TXN-0002",
    school: "Trường TH Nguyễn Du",
    schoolId: "SCH-002",
    plan: "Basic",
    amount: 500000,
    status: "pending",
    date: "14/06/2024",
  },
  {
    id: "TXN-0003",
    school: "THPT Trần Phú",
    schoolId: "SCH-003",
    plan: "Enterprise",
    amount: 2500000,
    status: "completed",
    date: "13/06/2024",
  },
  {
    id: "TXN-0004",
    school: "Trường TH Hoàng Văn Thụ",
    schoolId: "SCH-004",
    plan: "Basic",
    amount: 500000,
    status: "failed",
    date: "12/06/2024",
  },
  {
    id: "TXN-0005",
    school: "THCS Chu Văn An",
    schoolId: "SCH-005",
    plan: "Pro",
    amount: 1200000,
    status: "completed",
    date: "11/06/2024",
  },
  {
    id: "TXN-0006",
    school: "Trường TH Kim Đồng",
    schoolId: "SCH-006",
    plan: "Enterprise",
    amount: 2500000,
    status: "pending",
    date: "10/06/2024",
  },
  {
    id: "TXN-0007",
    school: "THPT Lý Tự Trọng",
    schoolId: "SCH-007",
    plan: "Pro",
    amount: 1200000,
    status: "completed",
    date: "09/06/2024",
  },
  {
    id: "TXN-0008",
    school: "Trường TH Ngô Quyền",
    schoolId: "SCH-008",
    plan: "Basic",
    amount: 500000,
    status: "completed",
    date: "08/06/2024",
  },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  completed: {
    label: "Hoàn thành",
    color: "success",
    icon: <CheckCircleOutlined />,
    tw: "text-green-600 bg-green-50 border-green-200",
  },
  pending: {
    label: "Đang xử lý",
    color: "warning",
    icon: <ClockCircleOutlined />,
    tw: "text-amber-600 bg-amber-50 border-amber-200",
  },
  failed: {
    label: "Thất bại",
    color: "error",
    icon: <CloseCircleOutlined />,
    tw: "text-red-600 bg-red-50 border-red-200",
  },
};

const PLAN_COLOR = { Basic: "default", Pro: "blue", Enterprise: "purple" };

const formatCurrency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v,
  );

// ─── Lazy-loaded chart section ────────────────────────────────────────────────

const RevenueChart = lazy(() =>
  Promise.resolve({
    default: ({ data }) => (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              unit="M"
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: 13,
              }}
              formatter={(v) => [`${v} triệu`, "Doanh thu"]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ fill: "#22c55e", r: 4, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#22c55e" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    ),
  }),
);

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  extra,
}) => (
  <motion.div variants={itemVariants}>
    <Card
      className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow duration-300"
      bodyStyle={{ padding: "16px 20px" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
          {extra && (
            <div
              className={`flex items-center gap-1 mt-1 text-xs ${extra.color}`}
            >
              {extra.icon}
              <span>{extra.text}</span>
            </div>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
        >
          <span className={`text-lg ${iconColor}`}>{icon}</span>
        </div>
      </div>
    </Card>
  </motion.div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const AdminTransactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  // ── Derived stats ──
  const totalRevenue = useMemo(
    () =>
      DEMO_TRANSACTIONS.filter((t) => t.status === "completed").reduce(
        (s, t) => s + t.amount,
        0,
      ),
    [],
  );
  const pendingAmount = useMemo(
    () =>
      DEMO_TRANSACTIONS.filter((t) => t.status === "pending").reduce(
        (s, t) => s + t.amount,
        0,
      ),
    [],
  );
  const completedCount = useMemo(
    () => DEMO_TRANSACTIONS.filter((t) => t.status === "completed").length,
    [],
  );
  const successRate = useMemo(
    () => Math.round((completedCount / DEMO_TRANSACTIONS.length) * 100),
    [completedCount],
  );

  // ── Filtered rows ──
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return DEMO_TRANSACTIONS.filter((tx) => {
      const matchSearch =
        tx.id.toLowerCase().includes(q) || tx.school.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || tx.status === statusFilter;
      const matchPlan = planFilter === "all" || tx.plan === planFilter;
      return matchSearch && matchStatus && matchPlan;
    });
  }, [searchQuery, statusFilter, planFilter]);

  // ── Table columns ──
  const columns = [
    {
      title: "Mã GD",
      key: "id",
      render: (_, tx) => (
        <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
          {tx.id}
        </span>
      ),
    },
    {
      title: "Trường",
      key: "school",
      render: (_, tx) => (
        <div>
          <p className="font-semibold text-gray-800 leading-tight">
            {tx.school}
          </p>
          <p className="text-xs text-gray-400">{tx.schoolId}</p>
        </div>
      ),
    },
    {
      title: "Gói",
      key: "plan",
      render: (_, tx) => (
        <Tag
          color={PLAN_COLOR[tx.plan] || "default"}
          className="rounded-full text-xs font-medium"
        >
          {tx.plan}
        </Tag>
      ),
    },
    {
      title: "Số tiền",
      key: "amount",
      render: (_, tx) => (
        <span className="font-semibold text-gray-800">
          {formatCurrency(tx.amount)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, tx) => {
        const cfg = STATUS_CONFIG[tx.status];
        return (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.tw}`}
          >
            {cfg.icon}
            {cfg.label}
          </span>
        );
      },
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (v) => <span className="text-sm text-gray-500">{v}</span>,
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Header ── */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Lịch sử giao dịch
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Theo dõi thanh toán và doanh thu
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              icon={<DownloadOutlined />}
              className="rounded-xl border-gray-200"
            >
              Xuất báo cáo
            </Button>
          </motion.div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<DollarOutlined />}
            iconBg="bg-green-50"
            iconColor="text-green-500"
            label="Tổng doanh thu"
            value={formatCurrency(totalRevenue)}
            valueColor="text-green-600"
            extra={{
              icon: <ArrowUpOutlined />,
              text: "+23% so với tháng trước",
              color: "text-green-500",
            }}
          />
          <StatCard
            icon={<FileTextOutlined />}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            label="Đang chờ xử lý"
            value={formatCurrency(pendingAmount)}
            valueColor="text-amber-600"
          />
          <StatCard
            icon={<CheckCircleOutlined />}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            label="Giao dịch thành công"
            value={completedCount}
            valueColor="text-blue-600"
          />
          <StatCard
            icon={<ArrowUpOutlined />}
            iconBg="bg-purple-50"
            iconColor="text-purple-500"
            label="Tỷ lệ thành công"
            value={`${successRate}%`}
            valueColor="text-purple-600"
          />
        </div>

        {/* ── Revenue Chart (lazy) ── */}
        <motion.div variants={itemVariants}>
          <Card
            className="rounded-2xl border-0 shadow-sm"
            title={
              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-green-500" />
                <span className="font-bold text-gray-800">
                  Doanh thu 6 tháng gần nhất (triệu VNĐ)
                </span>
              </div>
            }
            bodyStyle={{ paddingTop: 8 }}
          >
            <Suspense
              fallback={
                <div className="h-64 flex items-center justify-center text-gray-400 gap-2">
                  <ReloadOutlined spin />
                  Đang tải biểu đồ...
                </div>
              }
            >
              <RevenueChart data={MONTHLY_REVENUE} />
            </Suspense>
          </Card>
        </motion.div>

        {/* ── Filters ── */}
        <motion.div variants={itemVariants}>
          <Card
            className="rounded-2xl border-0 shadow-sm"
            bodyStyle={{ padding: "16px 20px" }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                prefix={<SearchOutlined className="text-gray-300" />}
                placeholder="Tìm kiếm theo mã giao dịch hoặc tên trường..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                className="flex-1 rounded-xl"
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-40"
                options={[
                  { value: "all", label: "Tất cả" },
                  { value: "completed", label: "Hoàn thành" },
                  { value: "pending", label: "Đang xử lý" },
                  { value: "failed", label: "Thất bại" },
                ]}
              />
              <Select
                value={planFilter}
                onChange={setPlanFilter}
                className="w-40"
                options={[
                  { value: "all", label: "Tất cả gói" },
                  { value: "Basic", label: "Basic" },
                  { value: "Pro", label: "Pro" },
                  { value: "Enterprise", label: "Enterprise" },
                ]}
              />
            </div>
          </Card>
        </motion.div>

        {/* ── Transactions Table ── */}
        <motion.div variants={itemVariants}>
          <Card
            className="rounded-2xl border-0 shadow-sm"
            bodyStyle={{ padding: 0 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${statusFilter}-${planFilter}-${searchQuery}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <Table
                  dataSource={filtered}
                  columns={columns}
                  rowKey="id"
                  pagination={{
                    pageSize: 8,
                    showSizeChanger: false,
                    showTotal: (t) => `${t} giao dịch`,
                    className: "px-6 pb-4",
                  }}
                  locale={{
                    emptyText: (
                      <div className="flex flex-col items-center gap-2 py-12">
                        <FileTextOutlined className="text-4xl text-gray-200" />
                        <p className="text-gray-400 font-medium">
                          Không tìm thấy giao dịch
                        </p>
                      </div>
                    ),
                  }}
                  className="[&_.ant-table-thead_th]:bg-gray-50 [&_.ant-table-thead_th]:text-gray-500 [&_.ant-table-thead_th]:font-medium"
                  components={{
                    body: {
                      row: ({ children, ...props }) => (
                        <motion.tr
                          {...props}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.18 }}
                          className="hover:bg-gray-50/80 transition-colors"
                        >
                          {children}
                        </motion.tr>
                      ),
                    },
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminTransactions;
