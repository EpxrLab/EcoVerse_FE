import { useState, useMemo, useEffect } from "react";
import { Card, Table, Tag, Select, Input, Button, Modal, Descriptions } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { getAllTransactions } from "../../services";

const STATUS_CFG = {
  ACTIVE: {
    label: "Đang hoạt động",
    color: "green",
    icon: <CheckCircleOutlined />,
    tw: "bg-green-50 text-green-700 border-green-200",
  },
  EXPIRED: {
    label: "Hết hạn",
    color: "orange",
    icon: <ClockCircleOutlined />,
    tw: "bg-amber-50 text-amber-700 border-amber-200",
  },
  CANCELLED: {
    label: "Đã huỷ",
    color: "red",
    icon: <CloseCircleOutlined />,
    tw: "bg-red-50 text-red-600 border-red-200",
  },
  PENDING: {
    label: "Chờ xử lý",
    color: "blue",
    icon: <ClockCircleOutlined />,
    tw: "bg-blue-50 text-blue-600 border-blue-200",
  },
};

const PAY_STATUS_CFG = {
  CANCELLED: { label: "Đã huỷ", color: "red" },
  COMPLETED: { label: "Hoàn thành", color: "green" },
  PENDING: { label: "Chờ thanh toán", color: "blue" },
  FAILED: { label: "Thất bại", color: "red" },
  REFUNDED: { label: "Hoàn tiền", color: "orange" },
};

const CHART_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

const fmtVND = (v) => {
  if (!v && v !== 0) return "0";
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return `${v}`;
};
const fmtDate = (iso) => (iso ? dayjs(iso).format("DD/MM/YYYY") : "—");
const fmtDateTime = (iso) =>
  iso ? dayjs(iso).format("DD/MM/YYYY HH:mm") : "—";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ icon, iconBg, value, label, sub, subUp }) {
  return (
    <motion.div variants={fadeUp}>
      <Card
        className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow"
        bodyStyle={{ padding: "18px 20px" }}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-2xl font-bold text-gray-800 leading-tight truncate">
              {value}
            </p>
            {sub != null && (
              <p
                className={`text-xs mt-0.5 flex items-center gap-0.5 ${subUp ? "text-green-600" : "text-red-500"}`}
              >
                {subUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {sub}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminRevenue() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedTx, setSelectedTx] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getAllTransactions();
      setData(res.data.content);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Flatten tất cả transactions từ mọi subscription ──
  const allTransactions = useMemo(
    () => data.flatMap((sub) => sub.transactions.map((tx) => ({ ...tx, sub }))),
    [data],
  );

  // ── Filtered transactions (Combined) ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allTransactions.filter((tx) => {
      const s = tx.sub;
      const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
      const matchType = typeFilter === "ALL" || s.subscriberType === typeFilter;
      const matchSearch =
        !q ||
        s.subscriptionCode.toLowerCase().includes(q) ||
        s.subscriberName.toLowerCase().includes(q) ||
        s.planCode.toLowerCase().includes(q) ||
        s.planName.toLowerCase().includes(q) ||
        tx.paymentCode.toLowerCase().includes(q) ||
        (tx.transactionRef && tx.transactionRef.toLowerCase().includes(q));
      return matchStatus && matchType && matchSearch;
    });
  }, [allTransactions, search, statusFilter, typeFilter]);

  // ── Summary stats ──
  const stats = useMemo(() => {
    const completedTx = allTransactions.filter((t) => t.status === "COMPLETED");
    const totalRevenue = completedTx.reduce((s, t) => s + (t.amount ?? 0), 0);
    const activeCount = data.filter((s) => s.status === "ACTIVE").length;
    const pendingAmount = allTransactions
      .filter((t) => t.status === "PENDING")
      .reduce((s, t) => s + (t.amount ?? 0), 0);
    const schoolCount = data.filter(
      (s) => s.subscriberType === "SCHOOL",
    ).length;
    const partnerCount = data.filter(
      (s) => s.subscriberType === "PARTNERSHIP",
    ).length;
    const cancelledCount = data.filter((s) => s.status === "CANCELLED").length;
    const autoRenewCount = data.filter((s) => s.autoRenew).length;

    return {
      totalRevenue,
      activeCount,
      pendingAmount,
      schoolCount,
      partnerCount,
      cancelledCount,
      autoRenewCount,
      total: data.length,
    };
  }, [data, allTransactions]);

  // ── Chart: Revenue by plan ──
  const revenueByPlan = useMemo(() => {
    const map = {};
    allTransactions
      .filter((t) => t.status === "COMPLETED")
      .forEach((t) => {
        const key = t.sub.planName;
        map[key] = (map[key] ?? 0) + (t.amount ?? 0);
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [allTransactions]);

  // ── Chart: Status distribution ──
  const statusDist = useMemo(() => {
    const map = {};
    data.forEach((s) => {
      map[s.status] = (map[s.status] ?? 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({
      name: STATUS_CFG[status]?.label ?? status,
      value: count,
      status,
    }));
  }, [data]);

  // ── Chart: Type distribution ──
  const typeDist = useMemo(
    () => [
      { name: "Trường học", value: stats.schoolCount },
      { name: "Đối tác", value: stats.partnerCount },
    ],
    [stats],
  );

  // ── Chart: Monthly revenue (fake timeline từ transactions) ──
  const monthlyRevenue = useMemo(() => {
    const map = {};
    allTransactions
      .filter((t) => t.status === "COMPLETED" && t.paidAt)
      .forEach((t) => {
        const month = dayjs(t.paidAt).format("MM/YYYY");
        map[month] = (map[month] ?? 0) + (t.amount ?? 0);
      });
    return Object.entries(map)
      .sort(
        (a, b) => dayjs(a[0], "MM/YYYY").unix() - dayjs(b[0], "MM/YYYY").unix(),
      )
      .map(([month, revenue]) => ({ month, revenue }));
  }, [allTransactions]);

  // ─── Table: Subscriptions ──────────────────────────────────────────────────

  const columns = [
    {
      title: "Giao dịch / Gói",
      key: "sub",
      width: 220,
      render: (_, row) => (
        <div>
          <span className="font-mono text-sm font-bold text-blue-600 block">
            {row.paymentCode}
          </span>
          <p className="font-semibold text-gray-800 text-sm mt-0.5 truncate max-w-[180px]">
            {row.sub.subscriptionCode}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[180px]">
            {row.sub.planName}
          </p>
        </div>
      ),
    },
    {
      title: "Đơn vị đăng ký",
      key: "subscriber",
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-800 text-sm truncate max-w-[150px]">
            {row.sub.subscriberName}
          </p>
          <Tag
            color={row.sub.subscriberType === "SCHOOL" ? "blue" : "cyan"}
            className="rounded-full text-[10px] mt-0.5"
          >
            {row.sub.subscriberType === "SCHOOL" ? "Trường học" : "Đối tác"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Số tiền",
      key: "amount",
      align: "right",
      render: (_, row) => (
        <span
          className={`font-bold text-sm ${row.amount > 0 ? "text-gray-800" : "text-gray-400"}`}
        >
          {row.amount === 0
            ? "Miễn phí"
            : `${row.amount?.toLocaleString()} ${row.currency}`}
        </span>
      ),
    },
    {
      title: "Trạng thái TT",
      key: "payStatus",
      align: "center",
      render: (_, row) => {
        const cfg = PAY_STATUS_CFG[row.status] ?? {
          label: row.status,
          color: "default",
        };
        return (
          <Tag color={cfg.color} className="rounded-full text-[11px] m-0">
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái gói",
      key: "status",
      align: "center",
      render: (_, row) => {
        const cfg = STATUS_CFG[row.sub.status] ?? {};
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.tw}`}
          >
            {cfg.label}
          </span>
        );
      },
    },
    {
      title: "Thời hạn",
      key: "dates",
      render: (_, row) => (
        <div className="text-[11px] text-gray-500">
          <p>
            {fmtDate(row.sub.startDate)} - {fmtDate(row.sub.endDate)}
          </p>
        </div>
      ),
    },
    {
      title: "Thanh toán lúc",
      key: "paidAt",
      render: (_, row) => (
        <span className="text-[11px] text-gray-400">
          {row.paidAt ? fmtDateTime(row.paidAt) : "—"}
        </span>
      ),
    },
    {
      title: "Tác vụ",
      key: "action",
      align: "center",
      render: (_, row) => (
        <Button
          type="text"
          icon={<EyeOutlined className="text-blue-500" />}
          onClick={() => {
            setSelectedTx(row);
            setIsDetailOpen(true);
          }}
          className="hover:bg-blue-50 rounded-lg"
        />
      ),
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  // ── Charts block — inline (không dùng Tabs) ──

  const chartsBlock = (
    <div className="space-y-6">
      {/* Monthly revenue */}
      <Card
        className="rounded-2xl border-0 shadow-sm"
        title={
          <span className="font-bold text-gray-800">Doanh thu theo tháng</span>
        }
      >
        {monthlyRevenue.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            Chưa có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis
                tickFormatter={fmtVND}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                width={55}
              />
              <ReTooltip
                formatter={(v) => [`${v?.toLocaleString()} VND`, "Doanh thu"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by plan */}
        <Card
          className="rounded-2xl border-0 shadow-sm"
          title={
            <span className="font-bold text-gray-800">Doanh thu theo gói</span>
          }
        >
          {revenueByPlan.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Chưa có dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueByPlan} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  tickFormatter={fmtVND}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                />
                <ReTooltip
                  formatter={(v) => [`${v?.toLocaleString()} VND`, "Doanh thu"]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {revenueByPlan.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Status pie */}
        <Card
          className="rounded-2xl border-0 shadow-sm"
          title={
            <span className="font-bold text-gray-800">Phân bổ trạng thái</span>
          }
        >
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={statusDist}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                >
                  {statusDist.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {statusDist.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      background: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  <span className="text-gray-600">{entry.name}</span>
                  <span className="font-bold text-gray-800 ml-auto">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Type breakdown */}
      <Card
        className="rounded-2xl border-0 shadow-sm"
        title={
          <span className="font-bold text-gray-800">
            Phân bổ theo loại đăng ký
          </span>
        }
        bodyStyle={{ padding: "16px 20px" }}
      >
        <div className="grid grid-cols-2 gap-4">
          {typeDist.map((t, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
            >
              <span className="text-sm text-gray-600 font-medium">
                {t.name}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${stats.total > 0 ? (t.value / stats.total) * 100 : 0}%`,
                      background: CHART_COLORS[i],
                    }}
                  />
                </div>
                <span className="text-lg font-bold text-gray-800 w-6 text-right">
                  {t.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Doanh thu & Đăng ký
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Tổng quan giao dịch và gói dịch vụ
            </p>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              /* refetch */
            }}
            className="rounded-xl border-gray-200 hover:border-blue-400 text-gray-500"
          >
            Làm mới
          </Button>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<DollarOutlined className="text-xl text-blue-500" />}
            iconBg="bg-blue-50"
            label="Tổng doanh thu (đã thu)"
            value={`${fmtVND(stats.totalRevenue)} VND`}
          />
          <StatCard
            icon={<ClockCircleOutlined className="text-xl text-amber-500" />}
            iconBg="bg-amber-50"
            label="Chờ thanh toán"
            value={`${fmtVND(stats.pendingAmount)} VND`}
          />
          <StatCard
            icon={<CheckCircleOutlined className="text-xl text-green-500" />}
            iconBg="bg-green-50"
            label="Đang hoạt động"
            value={`${stats.activeCount}/${stats.total}`}
          />
          <StatCard
            icon={<TeamOutlined className="text-xl text-purple-500" />}
            iconBg="bg-purple-50"
            label="Trường / Đối tác"
            value={`${stats.schoolCount} / ${stats.partnerCount}`}
          />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Giao dịch hoàn thành",
              val: allTransactions.filter((t) => t.status === "COMPLETED")
                .length,
              color: "text-green-600",
            },
            {
              label: "Giao dịch chờ xử lý",
              val: allTransactions.filter((t) => t.status === "PENDING").length,
              color: "text-blue-500",
            },
            {
              label: "Đăng ký tự gia hạn",
              val: stats.autoRenewCount,
              color: "text-indigo-600",
            },
            {
              label: "Đăng ký đã huỷ",
              val: stats.cancelledCount,
              color: "text-red-500",
            },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card
                className="rounded-2xl border-0 shadow-sm"
                bodyStyle={{ padding: "14px 18px" }}
              >
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Charts ── */}
        <motion.div variants={fadeUp}>{chartsBlock}</motion.div>

        {/* ── Bảng Giao dịch & Đăng ký (Consolidated) ── */}
        <motion.div variants={fadeUp}>
          <Card
            className="rounded-2xl border-0 shadow-sm"
            bodyStyle={{ padding: 0 }}
            title={
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-gray-800">
                  Quản lý Giao dịch & Đăng ký
                </span>
                <span className="text-xs text-gray-400 font-normal">
                  {filtered.length} kết quả
                </span>
              </div>
            }
          >
            {/* Filters */}
            <div className="px-4 pb-3 pt-1 border-b border-gray-100 flex flex-wrap gap-3 items-center">
              <Input
                prefix={<SearchOutlined className="text-gray-300" />}
                placeholder="Tìm mã thanh toán, đơn vị, gói..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                className="rounded-xl w-72"
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-44"
                options={[
                  { value: "ALL", label: "Tất cả trạng thái gói" },
                  { value: "ACTIVE", label: "Đang hoạt động" },
                  { value: "EXPIRED", label: "Hết hạn" },
                  { value: "CANCELLED", label: "Đã huỷ" },
                  { value: "PENDING", label: "Chờ xử lý" },
                ]}
              />
              <Select
                value={typeFilter}
                onChange={setTypeFilter}
                className="w-40"
                options={[
                  { value: "ALL", label: "Tất cả loại" },
                  { value: "SCHOOL", label: "Trường học" },
                  { value: "PARTNERSHIP", label: "Đối tác" },
                ]}
              />
            </div>
            <Table
              dataSource={filtered}
              columns={columns}
              rowKey={(row) => `${row.paymentId}-${row.paymentCode}`}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (t) => `${t} giao dịch`,
                className: "px-4 pb-4",
              }}
              locale={{
                emptyText: (
                  <div className="py-12 text-gray-400 text-sm text-center">
                    Không tìm thấy dữ liệu phù hợp
                  </div>
                ),
              }}
              className="[&_.ant-table-thead_th]:bg-gray-50 [&_.ant-table-thead_th]:text-gray-500 [&_.ant-table-thead_th]:font-medium"
              components={{
                body: {
                  row: ({ children, ...props }) => (
                    <motion.tr
                      {...props}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.16 }}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      {children}
                    </motion.tr>
                  ),
                },
              }}
            />
          </Card>
        </motion.div>

        {/* ── Transaction Detail Modal ── */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <DollarOutlined className="text-blue-500 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold m-0">Chi tiết giao dịch</h3>
                <p className="text-xs text-gray-400 m-0 font-mono">
                  {selectedTx?.paymentCode}
                </p>
              </div>
            </div>
          }
          open={isDetailOpen}
          onCancel={() => setIsDetailOpen(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setIsDetailOpen(false)}
              className="rounded-xl border-gray-200"
            >
              Đóng
            </Button>,
          ]}
          width={700}
          className="rounded-2xl overflow-hidden"
        >
          {selectedTx && (
            <div className="py-2 space-y-6">
              <Descriptions
                title={<span className="text-base font-bold">Thông tin thanh toán</span>}
                bordered
                column={2}
                size="small"
                className="[&_.ant-descriptions-item-label]:bg-gray-50/50"
              >
                <Descriptions.Item label="Mã thanh toán">
                  <span className="font-mono font-bold text-blue-600">
                    {selectedTx.paymentCode}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền">
                  <span className="font-bold text-gray-800">
                    {selectedTx.amount?.toLocaleString()} {selectedTx.currency}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag
                    color={PAY_STATUS_CFG[selectedTx.status]?.color}
                    className="rounded-full m-0"
                  >
                    {PAY_STATUS_CFG[selectedTx.status]?.label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Mã giao dịch tham chiếu">
                  <span className="font-mono text-gray-600">
                    {selectedTx.transactionRef || "—"}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian tạo">
                  {fmtDateTime(selectedTx.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian thanh toán">
                  {selectedTx.paidAt ? fmtDateTime(selectedTx.paidAt) : "—"}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions
                title={<span className="text-base font-bold">Thông tin gói đăng ký</span>}
                bordered
                column={2}
                size="small"
                className="[&_.ant-descriptions-item-label]:bg-gray-50/50"
              >
                <Descriptions.Item label="Mã đăng ký">
                  <span className="font-bold">{selectedTx.sub.subscriptionCode}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Loại gói">
                  {selectedTx.sub.planName} ({selectedTx.sub.planCode})
                </Descriptions.Item>
                <Descriptions.Item label="Đơn vị">
                  {selectedTx.sub.subscriberName}
                </Descriptions.Item>
                <Descriptions.Item label="Loại đơn vị">
                  <Tag
                    color={selectedTx.sub.subscriberType === "SCHOOL" ? "blue" : "cyan"}
                    className="rounded-full m-0"
                  >
                    {selectedTx.sub.subscriberType === "SCHOOL" ? "Trường học" : "Đối tác"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái gói">
                  <Tag
                    color={STATUS_CFG[selectedTx.sub.status]?.color}
                    className="rounded-full m-0"
                  >
                    {STATUS_CFG[selectedTx.sub.status]?.label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tự động gia hạn">
                  {selectedTx.sub.autoRenew ? "Có" : "Không"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày bắt đầu">
                  {fmtDate(selectedTx.sub.startDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày kết thúc">
                  {fmtDate(selectedTx.sub.endDate)}
                </Descriptions.Item>
                {selectedTx.sub.cancelledAt && (
                  <>
                    <Descriptions.Item label="Ngày huỷ" span={1}>
                      <span className="text-red-500 font-bold">
                        {fmtDate(selectedTx.sub.cancelledAt)}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Lý do huỷ" span={1}>
                      {selectedTx.sub.cancellationReason || "—"}
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </div>
          )}
        </Modal>
      </motion.div>
    </div>
  );
}
