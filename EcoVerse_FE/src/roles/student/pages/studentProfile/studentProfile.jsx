import { useState, useEffect, lazy, Suspense } from "react";
import {
  Card,
  Button,
  Tag,
  Select,
  Skeleton,
  Form,
  Input,
  Modal,
  Divider,
  Progress,
  Pagination,
  Empty,
} from "antd";
import {
  HomeOutlined,
  BookOutlined,
  RocketOutlined,
  CrownOutlined,
  CalendarOutlined,
  BankOutlined,
  IdcardOutlined,
  ManOutlined,
  WomanOutlined,
  EnvironmentOutlined,
  LockOutlined,
  KeyOutlined,
  SwapOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  BarChartOutlined,
  FireOutlined,
  RiseOutlined,
  ToolOutlined,
  TrophyOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import {
  getAuthenticatedStudentProfile,
  getStudentReport,
  getStudentCoinHistory,
  getStudentPerformance,
} from "../../services";
import toast from "react-hot-toast";
import { changePassword } from "../../../../features/auth/services";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { value: "THIS_WEEK", label: "Tuần này" },
  { value: "THIS_MONTH", label: "Tháng này" },
  { value: "LAST_3_MONTHS", label: "3 tháng qua" },
  { value: "THIS_YEAR", label: "Năm nay" },
];

const GENDER_MAP = {
  MALE: { label: "Nam", icon: <ManOutlined />, color: "blue" },
  FEMALE: { label: "Nữ", icon: <WomanOutlined />, color: "pink" },
};

const TX_TYPE_CFG = {
  EARN_GAME: {
    label: "Thắng game",
    icon: <RocketOutlined />,
    pos: true,
    cls: "bg-primary/10 text-primary",
  },
  EARN_QUIZ: {
    label: "Hoàn thành quiz",
    icon: <BookOutlined />,
    pos: true,
    cls: "bg-blue-50 text-blue-600",
  },
  EARN_TITLE: {
    label: "Nhận danh hiệu",
    icon: <CrownOutlined />,
    pos: true,
    cls: "bg-amber-50 text-amber-600",
  },
  SPEND_REWARD: {
    label: "Đổi quà",
    icon: <SwapOutlined />,
    pos: false,
    cls: "bg-red-50 text-red-500",
  },
  REFUND: {
    label: "Hoàn xu",
    icon: <HistoryOutlined />,
    pos: true,
    cls: "bg-teal-50 text-teal-600",
  },
  ADJUSTMENT: {
    label: "Điều chỉnh",
    icon: <ToolOutlined />,
    pos: true,
    cls: "bg-slate-50 text-slate-600",
  },
  COIN_EXPIRED: {
    label: "Xu hết hạn",
    icon: <ClockCircleOutlined />,
    pos: false,
    cls: "bg-gray-100 text-gray-400",
  },
};
 
const ACHIEVEMENT_IMAGES = {
  MOST_GAMES_COMPLETED: "/image/MOST_COMPLETED.png",
  BEST_ACCURACY_AND_TIME: "/image/BEST_ACCURACY_TIME.png",
  HIGHEST_ACCURACY: "/image/HIGHEST_ACCURACY.png",
  FASTEST_COMPLETION: "/image/FASTEST_COMPETION.png",
  MOST_QUIZZES_PASSED: "/image/MOST_QUIZ_PASSED.png",
};

const CAMPAIGN_TYPE_LABEL = {
  SCHOOL_INTERNAL: "Nội bộ",
  INTER_SCHOOL: "Liên trường",
  PARTNERSHIP_EVENT: "Đối tác",
};

const PERIOD_MAP = {
  THIS_WEEK: "Tuần này",
  THIS_MONTH: "Tháng này",
  LAST_3_MONTHS: "3 tháng qua",
  THIS_YEAR: "Năm nay",
  ALL_TIME: "Tất cả thời gian",
};

const AchievementCard = ({ achievement }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -4 }}
    transition={{ duration: 0.2 }}
  >
    <Card
      className="border-2 border-primary/20 rounded-2xl bg-primary/5 hover:shadow-lg transition-shadow overflow-hidden"
      bodyStyle={{ padding: "0px", textAlign: "center" }}
    >
      <div className="relative group">
        {/* Image display based on criteriaType */}
        <div className="h-44 w-full bg-white flex items-center justify-center p-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-black/5 z-10" />
          <img 
            src={ACHIEVEMENT_IMAGES[achievement.criteriaType] || "/image/MOST_COMPLETED.png"} 
            alt={achievement.titleName}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://www.svgrepo.com/show/452030/avatar-default.svg";
            }}
            className="h-full w-full object-cover filter brightness-105 group-hover:scale-110 transition-all duration-500 transform"
          />
        </div>
        
        <div className="p-4 space-y-1">
          <h3 className="font-bold text-sm text-gray-800 line-clamp-1">
            {achievement.titleName}
          </h3>
          <p className="text-[10px] text-gray-500 font-medium">
            {achievement.campaignName}
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-primary text-white shadow-sm shadow-primary/10 italic">
               {fmtDate(achievement.earnedAt?.split('T')[0])}
            </span>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pct = (v) => `${(v ?? 0)}%`;
const fmtN = (v) => (v ?? 0).toLocaleString();
const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const calcAge = (dob) => {
  if (!dob) return null;
  return Math.floor(
    (Date.now() - new Date(dob)) / (1000 * 60 * 60 * 24 * 365.25),
  );
};

// ─── CoinIcon ─────────────────────────────────────────────────────────────────
const CoinIcon = ({ size = 16 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ width: size, height: size, display: "inline-block" }}
  >
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

// ─── Micro-components ─────────────────────────────────────────────────────────

function PeriodSelect({ value, onChange }) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={PERIOD_OPTIONS}
      size="middle"
      style={{ width: 160 }}
      className="rounded-xl"
    />
  );
}

function StatTile({
  label,
  value,
  sub,
  icon,
  accent = "bg-teal-50 text-teal-600",
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all group">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${accent} group-hover:scale-105 transition-transform`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-lg font-black text-gray-800 leading-tight">
          {value}
        </p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Tab: Summary ─────────────────────────────────────────────────────────────
function SummaryTab() {
  const [period, setPeriod] = useState("THIS_MONTH");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getStudentReport(period)
      .then((r) => setData(r?.data ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const s = data;

  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-500">Tổng quan hoạt động</p>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : !s ? (
        <Empty description="Không có dữ liệu" className="py-10" />
      ) : (
        <>
          {/* Coin summary strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500 text-white shadow-md">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <CoinIcon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold opacity-75 uppercase tracking-wider">
                  Số dư xu
                </p>
                <p className="text-xl font-black">
                  {fmtN(s.currentCoinBalance)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">
                <DollarOutlined />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Đã kiếm
                </p>
                <p className="text-xl font-black text-primary">
                  {s.totalCoinsEarned > 0 ? "+" : ""}
                  {fmtN(s.totalCoinsEarned)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500 text-base">
                <SwapOutlined />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Đã dùng
                </p>
                <p className="text-xl font-black text-red-500">
                  {s.totalCoinsSpent !== 0 ? "-" : ""}
                  {fmtN(Math.abs(s.totalCoinsSpent))}
                </p>
              </div>
            </div>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile
              label="Chiến dịch"
              value={s.totalCampaignsJoined}
              sub={`Đang hoạt động: ${s.activeCampaigns}`}
              icon={<FireOutlined />}
              accent="bg-orange-50 text-orange-500"
            />
            <StatTile
              label="Độ chính xác game"
              value={pct(s.avgGameAccuracy)}
              sub={`Tốt nhất: ${pct(s.bestGameAccuracy)}`}
              icon={<AimOutlined />}
              accent="bg-primary/10 text-primary"
            />
            <StatTile
              label="Điểm quiz"
              value={pct(s.avgQuizScore)}
              sub={`Tỷ lệ đạt: ${pct(s.quizPassRate)}`}
              icon={<BookOutlined />}
              accent="bg-blue-50 text-blue-600"
            />
            <StatTile
              label="Hạng tốt nhất"
              value={s.bestOverallRank > 0 ? `#${s.bestOverallRank}` : "—"}
              sub={`Danh hiệu: ${s.totalTitlesEarned}`}
              icon={<TrophyOutlined />}
              accent="bg-amber-50 text-amber-600"
            />
            <StatTile
              label="Phiên game"
              value={s.totalGameSessionsCompleted}
              icon={<RocketOutlined />}
              accent="bg-purple-50 text-purple-600"
            />
            <StatTile
              label="Lượt quiz"
              value={s.totalQuizAttemptsCompleted}
              icon={<HistoryOutlined />}
              accent="bg-slate-50 text-slate-500"
            />
            <StatTile
              label="Đổi quà"
              value={s.totalRewardRequestsMade}
              sub={`Đang chờ: ${s.pendingRewardRequests}`}
              icon={<CrownOutlined />}
              accent="bg-pink-50 text-pink-500"
            />
            <StatTile
              label="Giai đoạn"
              value={PERIOD_MAP[s.period] ?? s.period ?? "—"}
              sub={
                s.fromDate
                  ? `${s.fromDate?.slice(0, 10)} → ${s.toDate?.slice(0, 10)}`
                  : ""
              }
              icon={<CalendarOutlined />}
              accent="bg-teal-50 text-teal-600"
            />
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile
              label="Chiến dịch"
              value={s.totalCampaignsJoined}
              sub={`Đang hoạt động: ${s.activeCampaigns}`}
              icon={<FireOutlined />}
              accent="bg-orange-50 text-orange-500"
            />
            <StatTile
              label="Độ chính xác game"
              value={pct(s.avgGameAccuracy)}
              sub={`Tốt nhất: ${pct(s.bestGameAccuracy)}`}
              icon={<AimOutlined />}
              accent="bg-primary/10 text-primary"
            />
            <StatTile
              label="Điểm quiz"
              value={pct(s.avgQuizScore)}
              sub={`Tỷ lệ đạt: ${pct(s.quizPassRate)}`}
              icon={<BookOutlined />}
              accent="bg-blue-50 text-blue-600"
            />
            <StatTile
              label="Hạng tốt nhất"
              value={s.bestOverallRank > 0 ? `#${s.bestOverallRank}` : "—"}
              sub={`Danh hiệu: ${s.totalTitlesEarned}`}
              icon={<TrophyOutlined />}
              accent="bg-amber-50 text-amber-600"
            />
            <StatTile
              label="Phiên game"
              value={s.totalGameSessionsCompleted}
              icon={<RocketOutlined />}
              accent="bg-purple-50 text-purple-600"
            />
            <StatTile
              label="Lượt quiz"
              value={s.totalQuizAttemptsCompleted}
              icon={<HistoryOutlined />}
              accent="bg-slate-50 text-slate-500"
            />
            <StatTile
              label="Đổi quà"
              value={s.totalRewardRequestsMade}
              sub={`Đang chờ: ${s.pendingRewardRequests}`}
              icon={<CrownOutlined />}
              accent="bg-pink-50 text-pink-500"
            />
            <StatTile
              label="Giai đoạn"
              value={PERIOD_MAP[s.period] ?? s.period ?? "—"}
              sub={
                s.fromDate
                  ? `${s.fromDate?.slice(0, 10)} → ${s.toDate?.slice(0, 10)}`
                  : ""
              }
              icon={<CalendarOutlined />}
              accent="bg-teal-50 text-teal-600"
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tab: Coins ───────────────────────────────────────────────────────────────
function CoinsTab() {
  const [period, setPeriod] = useState("THIS_MONTH");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    setPage(1);
    setLoading(true);
    getStudentCoinHistory(period)
      .then((r) => setData(r?.data ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const txs = data?.transactions ?? [];
  const paginated = txs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-500">Lịch sử xu thưởng</p>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !data ? (
        <Empty description="Không có dữ liệu" className="py-10" />
      ) : (
        <>
          {/* Balance cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-md">
              <p className="text-[10px] font-bold opacity-75 uppercase tracking-wider mb-1">
                Số dư hiện tại
              </p>
              <p className="text-2xl font-black">
                {fmtN(data.currentBalance)} xu
              </p>
              <p className="text-[11px] opacity-60 mt-0.5">
                Tổng kiếm: {fmtN(data.totalEarnedAllTime)} · Tổng dùng:{" "}
                {fmtN(data.totalSpentAllTime)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Kiếm (Kỳ này)
              </p>
              <p className="text-2xl font-black text-primary">
                {data.totalEarnedInPeriod > 0 ? "+" : ""}
                {fmtN(data.totalEarnedInPeriod)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Dùng (Kỳ này)
              </p>
              <p className="text-2xl font-black text-red-500">
                {data.totalSpentInPeriod !== 0 ? "-" : ""}
                {fmtN(Math.abs(data.totalSpentInPeriod))}
              </p>
            </div>
          </div>

          {/* Transaction list */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Giao dịch ({txs.length})
              </p>
            </div>
            {paginated.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                Không có giao dịch trong kỳ này
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {paginated.map((tx) => {
                  const cfg = TX_TYPE_CFG[tx.transactionType] ?? {
                    label: tx.transactionType,
                    icon: <DollarOutlined />,
                    pos: tx.amount > 0,
                    cls: "bg-gray-50 text-gray-500",
                  };
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${cfg.cls}`}
                      >
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">
                          {tx.description || cfg.label}
                        </p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                          <ClockCircleOutlined style={{ fontSize: 10 }} />{" "}
                          {fmtDate(tx.createdAt)}
                          <span className="mx-1 opacity-30">·</span>
                          <span className="text-gray-400">
                            Số dư: {fmtN(tx.balanceBefore)} →{" "}
                            {fmtN(tx.balanceAfter)}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`text-sm font-black flex-shrink-0 ${cfg.pos ? "text-primary" : "text-red-500"}`}
                      >
                        {cfg.pos ? "+" : ""}
                        {fmtN(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {txs.length > PAGE_SIZE && (
              <div className="px-4 py-3 border-t border-gray-100 flex justify-center">
                <Pagination
                  current={page}
                  onChange={setPage}
                  total={txs.length}
                  pageSize={PAGE_SIZE}
                  showSizeChanger={false}
                  size="small"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Section: Performance ────────────────────────────────────────────────────
function PerformanceSection() {
  const [period, setPeriod] = useState("THIS_MONTH");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    setPage(1);
    setLoading(true);
    getStudentPerformance(period)
      .then((r) => setData(r?.data ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const d = data;
  const breakdown = d?.campaignBreakdown ?? [];
  const paginated = breakdown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Card
      className="rounded-3xl border-0 shadow-lg overflow-hidden"
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-sm">
            <AimOutlined />
          </div>
          <h2 className="text-lg font-black text-gray-800">
            Hiệu suất học tập
          </h2>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      <div className="p-6">
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
          <CalendarOutlined />
          <span>Đang xem: {PERIOD_OPTIONS.find(o => o.value === period)?.label}</span>
        </div>
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : !d ? (
          <Empty description="Không có dữ liệu" className="py-10" />
        ) : (
          <div className="space-y-6">
            {/* Overview stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Game */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <div className="flex items-center gap-2 mb-4">
                  <RocketOutlined className="text-indigo-500 text-lg" />
                  <h3 className="font-black text-indigo-900 text-sm uppercase tracking-wider">
                    Game
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Kỳ này
                    </p>
                    <p className="text-2xl font-black text-gray-800">
                      {d.totalGameSessionsInPeriod}
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        / {d.totalGameSessionsCompleted} tổng
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Độ chính xác
                    </p>
                    <p className="text-2xl font-black text-primary">
                      {pct(d.avgGameAccuracyInPeriod)}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Tốt nhất: {pct(d.bestGameAccuracy)}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Độ chính xác TB toàn thời gian</span>
                    <span className="font-bold">{pct(d.avgGameAccuracy)}</span>
                  </div>
                  <Progress
                    percent={Number(
                      (d.avgGameAccuracy ?? 0).toFixed(1),
                    )}
                    showInfo={false}
                    strokeColor="var(--primary)"
                    trailColor="var(--primary-light)"
                    strokeWidth={6}
                  />
                </div>
              </div>

              {/* Quiz */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-2 mb-4">
                  <BookOutlined className="text-emerald-600 text-lg" />
                  <h3 className="font-black text-emerald-900 text-sm uppercase tracking-wider">
                    Quiz
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Kỳ này
                    </p>
                    <p className="text-2xl font-black text-gray-800">
                      {d.totalQuizAttemptsInPeriod}
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        / {d.totalQuizAttemptsCompleted} tổng
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Điểm TB kỳ này
                    </p>
                    <p className="text-2xl font-black text-teal-600">
                      {pct(d.avgQuizScoreInPeriod)}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Tỷ lệ đạt: {pct(d.quizPassRate)}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Điểm TB toàn thời gian</span>
                    <span className="font-bold">{pct(d.avgQuizScore)}</span>
                  </div>
                  <Progress
                    percent={Number((d.avgQuizScore ?? 0).toFixed(1))}
                    showInfo={false}
                    strokeColor="var(--primary)"
                    trailColor="var(--primary-light)"
                    strokeWidth={6}
                  />
                </div>
              </div>
            </div>

            {/* Campaign breakdown */}
            {breakdown.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Chi tiết theo chiến dịch ({breakdown.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paginated.map((c, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-teal-200 hover:shadow-md transition-all">
                        {/* Top bar */}
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate">
                              {c.campaignName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-semibold">
                                {CAMPAIGN_TYPE_LABEL[c.campaignType] ??
                                  c.campaignType}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  c.campaignStatus === "ON_GOING"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {c.campaignStatus}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[10px] text-gray-400 font-bold">
                              Hạng
                            </p>
                            <p className="text-lg font-black text-indigo-600">
                              #{c.overallRank}
                            </p>
                            {c.schoolRank > 0 && (
                              <p className="text-[10px] text-gray-400">
                                Trường: #{c.schoolRank}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Body */}
                        <div className="px-4 py-3 space-y-2.5">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">
                                Độ chính xác tổng hợp
                              </span>
                              <span className="font-bold text-primary">
                                {pct(c.combinedAccuracy)}
                              </span>
                            </div>
                            <Progress
                              percent={Number(
                                ((c.combinedAccuracy ?? 0) * 100).toFixed(1),
                              )}
                              showInfo={false}
                              strokeColor="var(--primary)"
                              trailColor="var(--primary-light)"
                              strokeWidth={5}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <div className="text-center p-2 rounded-xl bg-gray-50">
                              <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">
                                Game
                              </p>
                              <p className="text-sm font-black text-gray-700">
                                {c.gamesCompleted}
                              </p>
                            </div>
                            <div className="text-center p-2 rounded-xl bg-gray-50">
                              <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">
                                Quiz
                              </p>
                              <p className="text-sm font-black text-gray-700">
                                {c.quizzesCompleted}
                              </p>
                            </div>
                            <div className="text-center p-2 rounded-xl bg-amber-50">
                              <p className="text-[9px] font-bold text-amber-500 uppercase mb-0.5">
                                Xu
                              </p>
                              <p className="text-sm font-black text-amber-600">
                                {fmtN(c.totalCoinsEarned)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {breakdown.length > PAGE_SIZE && (
                  <div className="mt-4 flex justify-center">
                    <Pagination
                      current={page}
                      onChange={setPage}
                      total={breakdown.length}
                      pageSize={PAGE_SIZE}
                      showSizeChanger={false}
                      size="small"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudentProfile() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  const [pwOpen, setPwOpen] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwForm] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    getAuthenticatedStudentProfile()
      .then((r) => setStudent(r?.data ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChangePassword = async (vals) => {
    setPwLoading(true);
    try {
      const res = await changePassword(vals);
      if (res) toast.success("Đổi mật khẩu thành công!");
      else toast.error("Đổi mật khẩu thất bại!");
      setPwOpen(false);
      pwForm.resetFields();
    } catch {
      toast.error("Đổi mật khẩu thất bại!");
    } finally {
      setPwLoading(false);
    }
  };

  const gender = GENDER_MAP[student?.gender] ?? {
    label: student?.gender ?? "—",
  };
  const age = calcAge(student?.dateOfBirth);

  // ── Animation ──
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
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-7 space-y-6">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-gray-400"
        >
          <Button
            type="text"
            size="small"
            icon={<HomeOutlined />}
            onClick={() => navigate("/student")}
            className="text-gray-400 hover:text-primary"
          >
            Home
          </Button>
          <span>/</span>
          <span className="text-gray-700 font-semibold">Hồ sơ cá nhân</span>
        </motion.div>

        {/* ── 1. Personal Info ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42 }}
        >
          <Card
            className="rounded-3xl border-0 shadow-xl overflow-hidden"
            bodyStyle={{ padding: 0 }}
          >
            <div className="relative bg-primary/5 p-7 lg:p-9">
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8">
                {/* Avatar */}
                {loading ? (
                  <Skeleton.Avatar size={130} shape="square" active />
                ) : (
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-2 bg-primary/20 rounded-[2rem] blur-xl" />
                    {student?.avatarPresignedUrl ? (
                      <img
                        src={student.avatarPresignedUrl}
                        alt={student.fullName}
                        className="relative w-32 h-32 rounded-[1.75rem] object-cover border-4 border-white shadow-xl"
                      />
                    ) : (
                      <div className="relative w-32 h-32 rounded-[1.75rem] bg-primary flex items-center justify-center text-5xl font-black text-white border-4 border-white shadow-xl uppercase">
                        {student?.fullName?.charAt(0) ?? "?"}
                      </div>
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 text-center lg:text-left space-y-4 min-w-0">
                  {loading ? (
                    <Skeleton active paragraph={{ rows: 2 }} />
                  ) : (
                    <>
                      <div>
                        <h1 className="text-3xl lg:text-4xl font-black text-gray-800 tracking-tight mb-2">
                          {student?.fullName}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                          <Tag className="rounded-xl px-3 py-1 bg-teal-50 text-teal-700 border-teal-200 font-semibold flex items-center gap-1.5">
                            <BankOutlined />
                            {student?.school?.schoolName ?? "EcoVerse"}
                          </Tag>
                          <Tag className="rounded-xl px-3 py-1 bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold">
                            Lớp {student?.className}
                          </Tag>
                          <Tag className="rounded-xl px-3 py-1 bg-slate-100 text-slate-600 border-slate-200 font-semibold">
                            Khối {student?.gradeLevel}
                          </Tag>
                        </div>
                      </div>

                      {/* Detail fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto lg:mx-0">
                        {[
                          {
                            icon: <IdcardOutlined />,
                            label: "Mã học sinh",
                            value: (
                              <span className="font-mono font-bold">
                                {student?.studentCode ?? "—"}
                              </span>
                            ),
                          },
                          {
                            icon: <CalendarOutlined />,
                            label: "Ngày sinh",
                            value: `${fmtDate(student?.dateOfBirth)?.split(" ")[0] ?? "—"}${age ? ` (${age} tuổi)` : ""}`,
                          },
                          {
                            icon: gender.icon ?? <ManOutlined />,
                            label: "Giới tính",
                            value: (
                              <Tag
                                color={gender.color}
                                className="rounded-lg m-0 font-semibold"
                              >
                                {gender.label}
                              </Tag>
                            ),
                          },
                        ].map((f, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 border border-gray-100"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                              {f.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                {f.label}
                              </p>
                              <div className="text-sm font-semibold text-gray-700">
                                {f.value}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        icon={<KeyOutlined />}
                        onClick={() => setPwOpen(true)}
                        className="rounded-xl border-2 hover:border-teal-400 hover:text-teal-600 font-semibold h-9 px-5"
                      >
                        Đổi mật khẩu
                      </Button>
                    </>
                  )}
                </div>

                {/* Coin widget */}
                {!loading && student && (
                  <div className="flex-shrink-0">
                    <div className="bg-white rounded-2xl p-5 text-center border-2 border-amber-100 shadow-lg shadow-amber-50 min-w-[130px]">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2 shadow-md">
                        <CoinIcon size={24} />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        Xu tích lũy
                      </p>
                      <p className="text-2xl font-black text-gray-800">
                        {fmtN(student.totalCoins)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── 2. Reports Tabs (Summary + Coins) ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <Card
            className="rounded-3xl border-0 shadow-lg overflow-hidden"
            bodyStyle={{ padding: "0 24px 24px" }}
          >
            {/* Tab header */}
            <div className="flex border-b border-gray-100 mb-0">
              {[
                { key: "summary", icon: <RiseOutlined />, label: "Tổng quan" },
                {
                  key: "coins",
                  icon: <HistoryOutlined />,
                  label: "Lịch sử xu",
                },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 transition-all
                    ${
                      activeTab === t.key
                        ? "border-teal-500 text-teal-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "summary" ? <SummaryTab /> : <CoinsTab />}
              </motion.div>
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* ── 3. Performance ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          <PerformanceSection />
        </motion.div>

        {/* ── 4. Achievements ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className="rounded-3xl border-0 shadow-lg overflow-hidden"
            title={
              <div className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-white shadow-sm text-base">
                  <CrownOutlined />
                </div>
                <h2 className="text-lg font-black text-gray-800">
                  Danh hiệu & Thành tựu
                </h2>
              </div>
            }
            bodyStyle={{ padding: "24px" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {student?.earnedTitles?.map((achievement) => (
                <Suspense
                  key={achievement.studentTitleId}
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
            {(!student?.earnedTitles || student.earnedTitles.length === 0) && (
              <div className="py-12 text-center space-y-3 border-2 border-dashed border-gray-100 rounded-2xl">
                <div className="text-4xl opacity-20">🏆</div>
                <p className="text-gray-400 text-sm">Chưa có thành tựu nào đạt được</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* ── Password Modal ── */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-teal-600">
              <LockOutlined />
            </div>
            <span className="font-black text-gray-800">Đổi mật khẩu</span>
          </div>
        }
        open={pwOpen}
        onCancel={() => {
          setPwOpen(false);
          pwForm.resetFields();
        }}
        footer={null}
        centered
        width={460}
        className="[&_.ant-modal-content]:rounded-2xl"
      >
        <Form
          form={pwForm}
          layout="vertical"
          onFinish={handleChangePassword}
          className="mt-3 pb-2"
        >
          <Form.Item
            label={
              <span className="font-semibold text-gray-600">
                Mật khẩu hiện tại
              </span>
            }
            name="oldPassword"
            rules={[{ required: true, message: "Nhập mật khẩu hiện tại!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-300 mr-1" />}
              placeholder="Mật khẩu hiện tại"
              className="h-11 rounded-xl"
            />
          </Form.Item>
          <Divider className="my-4" />
          <Form.Item
            label={
              <span className="font-semibold text-gray-600">Mật khẩu mới</span>
            }
            name="newPassword"
            rules={[
              { required: true },
              {
                pattern:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: "≥8 ký tự, gồm hoa/thường/số/ký tự đặc biệt",
              },
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined className="text-gray-300 mr-1" />}
              placeholder="Tối thiểu 8 ký tự"
              className="h-11 rounded-xl"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="font-semibold text-gray-600">
                Xác nhận mật khẩu
              </span>
            }
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, v) {
                  if (!v || getFieldValue("newPassword") === v)
                    return Promise.resolve();
                  return Promise.reject("Mật khẩu không khớp!");
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined className="text-gray-300 mr-1" />}
              placeholder="Nhập lại mật khẩu mới"
              className="h-11 rounded-xl"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={pwLoading}
            className="h-12 rounded-xl bg-teal-600 border-teal-600 hover:bg-teal-700 font-bold text-base mt-2"
          >
            Cập nhật mật khẩu
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
