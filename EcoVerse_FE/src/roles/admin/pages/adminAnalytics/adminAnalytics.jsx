import React, { useEffect, useState, lazy, Suspense, useMemo } from "react";
import { Select, Skeleton, Card, Tooltip } from "antd";
import {
  TeamOutlined,
  BankOutlined,
  RocketOutlined,
  BookOutlined,
  DollarOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  StopOutlined,
  BarChartOutlined,
  UserOutlined,
  GlobalOutlined,
  TrophyOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
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
  Legend,
} from "recharts";
import { getAdminReport, getCampaignAnalytics } from "../../services";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { value: "THIS_WEEK", label: "Tuần này" },
  { value: "THIS_MONTH", label: "Tháng này" },
  { value: "LAST_3_MONTHS", label: "3 tháng qua" },
  { value: "THIS_YEAR", label: "Năm nay" },
];

const STATUS_CFG = {
  DRAFT: { label: "Bản nháp", color: "#94a3b8" },
  SCHEDULED: { label: "Đã lên lịch", color: "#60a5fa" },
  INVITING: { label: "Đang mời", color: "#a78bfa" },
  JOINING: { label: "Đang tham gia", color: "#34d399" },
  EXTENDED: { label: "Gia hạn", color: "#fbbf24" },
  ON_GOING: { label: "Đang diễn ra", color: "#10b981" },
  COMPLETED: { label: "Hoàn thành", color: "#3b82f6" },
  CANCELLED: { label: "Đã huỷ", color: "#f87171" },
};

const CHART_PALETTE = [
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
];

const fmtMoney = (v) => {
  if (!v && v !== 0) return "0";
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return `${v}`;
};
const fmtN = (v) => (v ?? 0).toLocaleString("vi-VN");

// ─── Animation presets ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, ease: "easeOut", delay },
});

const stagger = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const staggerChild = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, accent, delay = 0, trend }) {
  return (
    <motion.div {...fadeUp(delay)}>
      <div
        className={`relative overflow-hidden rounded-2xl border bg-white p-5 hover:shadow-lg transition-all duration-300 group ${accent.border}`}
      >
        {/* Decorative corner glow */}
        <div
          className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-2xl ${accent.glow}`}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-1.5">
              {label}
            </p>
            <p className={`text-3xl font-black leading-none ${accent.text}`}>
              {value}
            </p>
            {sub && (
              <p className="text-xs text-gray-400 mt-1.5 font-medium">{sub}</p>
            )}
            {trend != null && (
              <div
                className={`inline-flex items-center gap-1 mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
              >
                {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
              </div>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${accent.icon} group-hover:scale-110 transition-transform`}
          >
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionTitle({ icon, title, sub }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-base flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-black text-slate-800 leading-tight">
          {title}
        </h2>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Status distribution bar ──────────────────────────────────────────────────

function StatusBar({ counts, label }) {
  const entries = Object.entries(counts ?? {}).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {entries.map(([key, val]) => (
          <Tooltip key={key} title={`${STATUS_CFG[key]?.label ?? key}: ${val}`}>
            <div
              className="transition-all hover:opacity-80 cursor-default"
              style={{
                width: `${(val / total) * 100}%`,
                background: STATUS_CFG[key]?.color ?? "#94a3b8",
              }}
            />
          </Tooltip>
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {entries.map(([key, val]) => (
          <div
            key={key}
            className="flex items-center gap-1.5 text-xs text-slate-600"
          >
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: STATUS_CFG[key]?.color ?? "#94a3b8" }}
            />
            <span className="font-medium">{STATUS_CFG[key]?.label ?? key}</span>
            <span className="text-slate-400 font-bold">({val})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mini Donut ───────────────────────────────────────────────────────────────

function MiniDonut({ data, title }) {
  const filtered = data.filter((d) => d.value > 0);
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        {title}
      </p>
      <div className="flex items-center gap-4">
        <div style={{ width: 110, height: 110 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filtered}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={48}
                paddingAngle={3}
              >
                {filtered.map((_, i) => (
                  <Cell
                    key={i}
                    fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                  />
                ))}
              </Pie>
              <ReTooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          {filtered.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }}
              />
              <span className="text-slate-600 truncate">{d.name}</span>
              <span className="font-black text-slate-800 ml-auto">
                {fmtN(d.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Custom Tooltip for revenue chart ────────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xl px-4 py-3 text-sm">
      <p className="font-bold text-slate-600 mb-1">{label}</p>
      <p className="font-black text-blue-600">
        {fmtMoney(payload[0]?.value)} VND
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

function AdminAnalytics() {
  const [report, setReport] = useState(null);
  const [cAnalytics, setCAnalytics] = useState(null);
  const [period, setPeriod] = useState("THIS_MONTH");
  const [loading, setLoading] = useState(true);

  const fetchReport = async (p) => {
    setLoading(true);
    try {
      const res = await getAdminReport(p);
      setReport(res?.data ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await getCampaignAnalytics();
      setCAnalytics(res?.data ?? null);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);
  useEffect(() => {
    fetchReport(period);
  }, [period]);

  // ── Computed values ──
  const r = report;
  const ca = cAnalytics;

  const revenueTrend = useMemo(
    () =>
      (r?.last12MonthsRevenueTrend ?? []).map((d) => ({
        name: d.label,
        revenue: d.totalRevenue,
      })),
    [r],
  );

  const campaignTypePie = useMemo(
    () =>
      ca
        ? [
            { name: "Trường học", value: ca.totalSchoolCampaigns },
            { name: "Đối tác", value: ca.totalPartnershipCampaigns },
          ]
        : [],
    [ca],
  );

  const invitationPie = useMemo(
    () =>
      ca
        ? [
            { name: "Đã duyệt", value: ca.approvedSchoolInvitations },
            {
              name: "Chờ duyệt",
              value:
                (ca.totalSchoolInvitations ?? 0) -
                (ca.approvedSchoolInvitations ?? 0),
            },
          ]
        : [],
    [ca],
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] px-5 py-7 space-y-8">
      {/* ── Header ── */}
      <motion.div
        {...fadeUp(0)}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">
            Quản trị hệ thống
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
            Phân tích chuyên sâu
          </h1>
          {r && (
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Dữ liệu từ {r.fromDate} → {r.toDate}
            </p>
          )}
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Kỳ báo cáo:
          </span>
          <Select
            value={period}
            onChange={setPeriod}
            options={PERIOD_OPTIONS}
            size="middle"
            style={{ width: 160 }}
            className="rounded-xl"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton active paragraph={{ rows: 3 }} />
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ) : (
        <>
          {/* ── Section 1: Người dùng ── */}
          <section>
            <motion.div {...fadeUp(0.04)}>
              <SectionTitle
                icon={<TeamOutlined />}
                title="Người dùng & Tổ chức"
                sub={`Đăng ký mới kỳ này: +${fmtN(r?.newRegistrationsInPeriod)}`}
              />
            </motion.div>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              {[
                {
                  label: "Học sinh",
                  value: fmtN(r?.totalStudents),
                  icon: <UserOutlined />,
                  accent: {
                    border: "border-blue-100",
                    text: "text-blue-700",
                    icon: "bg-blue-50 text-blue-500",
                    glow: "bg-blue-400",
                  },
                },
                {
                  label: "Phụ huynh",
                  value: fmtN(r?.totalParents),
                  icon: <TeamOutlined />,
                  accent: {
                    border: "border-indigo-100",
                    text: "text-indigo-700",
                    icon: "bg-indigo-50 text-indigo-500",
                    glow: "bg-indigo-400",
                  },
                },
                {
                  label: "Trường học",
                  value: fmtN(r?.totalSchools),
                  icon: <BankOutlined />,
                  accent: {
                    border: "border-teal-100",
                    text: "text-teal-700",
                    icon: "bg-teal-50 text-teal-500",
                    glow: "bg-teal-400",
                  },
                },
                {
                  label: "Đối tác",
                  value: fmtN(r?.totalPartnerships),
                  icon: <GlobalOutlined />,
                  accent: {
                    border: "border-cyan-100",
                    text: "text-cyan-700",
                    icon: "bg-cyan-50 text-cyan-500",
                    glow: "bg-cyan-400",
                  },
                },
              ].map((d, i) => (
                <motion.div key={i} variants={staggerChild}>
                  <KpiCard {...d} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pending row */}
            {(r?.pendingSchools ?? 0) + (r?.pendingPartnerships ?? 0) > 0 && (
              <motion.div
                {...fadeUp(0.18)}
                className="mt-3 flex gap-3 flex-wrap"
              >
                {r.pendingSchools > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-sm font-bold text-amber-700">
                    <ClockCircleOutlined /> {r.pendingSchools} trường chờ duyệt
                  </div>
                )}
                {r.pendingPartnerships > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-sm font-bold text-orange-700">
                    <ClockCircleOutlined /> {r.pendingPartnerships} đối tác chờ
                    duyệt
                  </div>
                )}
              </motion.div>
            )}
          </section>

          {/* ── Section 2: Doanh thu ── */}
          <section>
            <motion.div {...fadeUp(0.08)}>
              <SectionTitle
                icon={<DollarOutlined />}
                title="Doanh thu & Đăng ký"
              />
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Revenue KPIs */}
              <motion.div {...fadeUp(0.1)} className="space-y-3">
                {[
                  {
                    label: "Doanh thu kỳ này",
                    value: `${fmtMoney(r?.totalRevenueInPeriod)} VND`,
                    sub: "Đã thu trong kỳ",
                    accent: {
                      border: "border-emerald-100",
                      text: "text-emerald-700",
                      icon: "bg-emerald-50 text-emerald-600",
                      glow: "bg-emerald-400",
                    },
                    icon: <DollarOutlined />,
                  },
                  {
                    label: "Doanh thu tổng",
                    value: `${fmtMoney(r?.totalRevenueAllTime)} VND`,
                    sub: "Tất cả thời gian",
                    accent: {
                      border: "border-green-100",
                      text: "text-green-700",
                      icon: "bg-green-50 text-green-600",
                      glow: "bg-green-400",
                    },
                    icon: <BarChartOutlined />,
                  },
                  {
                    label: "Gói đăng ký hoạt động",
                    value: fmtN(r?.activeSubscriptions),
                    sub: "Đang hiệu lực",
                    accent: {
                      border: "border-sky-100",
                      text: "text-sky-700",
                      icon: "bg-sky-50 text-sky-600",
                      glow: "bg-sky-400",
                    },
                    icon: <CheckCircleOutlined />,
                  },
                ].map((d, i) => (
                  <KpiCard key={i} {...d} />
                ))}
              </motion.div>

              {/* Revenue trend chart */}
              <motion.div
                {...fadeUp(0.14)}
                className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Xu hướng doanh thu 12 tháng
                </p>
                {revenueTrend.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                    Chưa có dữ liệu
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={revenueTrend}>
                      <defs>
                        <linearGradient
                          id="revGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.18}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                      />
                      <YAxis
                        tickFormatter={fmtMoney}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        width={50}
                      />
                      <ReTooltip content={<RevenueTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fill="url(#revGrad)"
                        dot={{ r: 3, fill: "#3b82f6" }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </motion.div>
            </div>
          </section>

          {/* ── Section 3: Hoạt động học tập ── */}
          <section>
            <motion.div {...fadeUp(0.1)}>
              <SectionTitle
                icon={<RocketOutlined />}
                title="Hoạt động học tập"
              />
            </motion.div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              {[
                {
                  label: "Phiên game hoàn thành",
                  value: fmtN(r?.totalGameSessionsCompleted),
                  icon: <RocketOutlined />,
                  accent: {
                    border: "border-violet-100",
                    text: "text-violet-700",
                    icon: "bg-violet-50 text-violet-600",
                    glow: "bg-violet-400",
                  },
                },
                {
                  label: "Lượt quiz hoàn thành",
                  value: fmtN(r?.totalQuizAttemptsCompleted),
                  icon: <BookOutlined />,
                  accent: {
                    border: "border-pink-100",
                    text: "text-pink-700",
                    icon: "bg-pink-50 text-pink-600",
                    glow: "bg-pink-400",
                  },
                },
                {
                  label: "Chiến dịch đang diễn ra",
                  value: fmtN(r?.activeCampaigns),
                  icon: <FireOutlined />,
                  accent: {
                    border: "border-amber-100",
                    text: "text-amber-700",
                    icon: "bg-amber-50 text-amber-600",
                    glow: "bg-amber-400",
                  },
                },
              ].map((d, i) => (
                <motion.div key={i} variants={staggerChild}>
                  <KpiCard {...d} />
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ── Section 4: Phân tích chiến dịch ── */}
          {ca && (
            <section>
              <motion.div {...fadeUp(0.12)}>
                <SectionTitle
                  icon={<PieChartOutlined />}
                  title="Phân tích chiến dịch"
                  sub={`Tổng cộng ${fmtN(ca.totalCampaigns)} chiến dịch · ${fmtN(ca.totalParticipants)} người tham gia`}
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {/* Campaign KPIs */}
                <motion.div
                  {...fadeUp(0.14)}
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4"
                >
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tổng quan chiến dịch
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: "Tổng chiến dịch",
                        value: fmtN(ca.totalCampaigns),
                        color: "bg-blue-50 text-blue-700",
                      },
                      {
                        label: "Người tham gia",
                        value: fmtN(ca.totalParticipants),
                        color: "bg-teal-50 text-teal-700",
                      },
                      {
                        label: "Trường học",
                        value: fmtN(ca.totalSchoolCampaigns),
                        color: "bg-indigo-50 text-indigo-700",
                      },
                      {
                        label: "Đối tác",
                        value: fmtN(ca.totalPartnershipCampaigns),
                        color: "bg-cyan-50 text-cyan-700",
                      },
                      {
                        label: "Lời mời trường",
                        value: fmtN(ca.totalSchoolInvitations),
                        color: "bg-amber-50 text-amber-700",
                      },
                      {
                        label: "Lời mời được duyệt",
                        value: fmtN(ca.approvedSchoolInvitations),
                        color: "bg-green-50 text-green-700",
                      },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className={`px-3 py-2.5 rounded-xl text-center ${s.color}`}
                      >
                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider">
                          {s.label}
                        </p>
                        <p className="text-xl font-black">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Donut charts */}
                <motion.div
                  {...fadeUp(0.16)}
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-5"
                >
                  <MiniDonut data={campaignTypePie} title="Phân bổ theo loại" />
                  <Divider className="my-0" />
                  <MiniDonut
                    data={invitationPie}
                    title="Tình trạng lời mời trường"
                  />
                </motion.div>

                {/* Status breakdown */}
                <motion.div
                  {...fadeUp(0.18)}
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-5 xl:col-span-1"
                >
                  <StatusBar
                    counts={ca.schoolCampaignStatusCounts}
                    label="Trạng thái — Chiến dịch trường học"
                  />
                  <div className="border-t border-slate-100 pt-4">
                    <StatusBar
                      counts={ca.partnershipCampaignStatusCounts}
                      label="Trạng thái — Chiến dịch đối tác"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Stacked bar comparison */}
              <motion.div
                {...fadeUp(0.2)}
                className="mt-5 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  So sánh số lượng theo trạng thái
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={(() => {
                      const allKeys = new Set([
                        ...Object.keys(ca.schoolCampaignStatusCounts ?? {}),
                        ...Object.keys(
                          ca.partnershipCampaignStatusCounts ?? {},
                        ),
                      ]);
                      return [...allKeys]
                        .map((k) => ({
                          status: STATUS_CFG[k]?.label ?? k,
                          Trường: ca.schoolCampaignStatusCounts?.[k] ?? 0,
                          "Đối tác":
                            ca.partnershipCampaignStatusCounts?.[k] ?? 0,
                        }))
                        .filter((d) => d["Trường"] + d["Đối tác"] > 0);
                    })()}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="status"
                      width={90}
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                    />
                    <ReTooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="Trường"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="Đối tác"
                      fill="#06b6d4"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

// Tiny divider
function Divider({ className = "" }) {
  return <hr className={`border-0 border-t border-slate-100 ${className}`} />;
}

export default AdminAnalytics;
