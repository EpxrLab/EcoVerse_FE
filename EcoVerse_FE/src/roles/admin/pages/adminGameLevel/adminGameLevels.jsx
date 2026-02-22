import { useState, useMemo } from "react";
import {
  Table,
  Tabs,
  Button,
  Badge,
  Card,
  Modal,
  Input,
  Form,
  Select,
  Checkbox,
  Statistic,
  Tag,
  Dropdown,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  StarOutlined,
  AppstoreOutlined,
  TrophyOutlined,
  TeamOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

const { TabPane } = Tabs;

// ─── Icons (inline SVG shortcuts via emoji + antd) ──────────────────────────

const GamepadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className="w-7 h-7 text-white"
  >
    <rect x="2" y="6" width="20" height="12" rx="4" />
    <path d="M6 12h4M8 10v4M15 11h2M15 13h2" />
  </svg>
);

const RecycleIcon = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={className}
  >
    <polyline points="1 4 1 10 7 10" />
    <polyline points="23 20 23 14 17 14" />
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
  </svg>
);

const ZapIcon = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={className}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const HandshakeIcon = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={className}
  >
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
  </svg>
);

const SchoolIcon = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={className}
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const BIN_TYPES = [
  { id: "plastic", label: "Rác nhựa", icon: "🥤", color: "bg-blue-500" },
  { id: "paper", label: "Rác giấy", icon: "📄", color: "bg-yellow-500" },
  { id: "organic", label: "Hữu cơ", icon: "🍎", color: "bg-green-500" },
  { id: "others", label: "Khác", icon: "🥡", color: "bg-gray-500" },
];

const DIFFICULTY_CONFIG = {
  Dễ: { color: "success", tw: "bg-green-50 text-green-600 border-green-200" },
  "Trung bình": {
    color: "warning",
    tw: "bg-amber-50 text-amber-600 border-amber-200",
  },
  Khó: { color: "error", tw: "bg-red-50 text-red-600 border-red-200" },
};

const BIN_LABEL = {
  plastic: "Nhựa",
  paper: "Giấy",
  organic: "Hữu cơ",
  others: "Khác",
};
const BIN_TAG_COLOR = {
  plastic: "blue",
  paper: "green",
  organic: "gold",
  others: "default",
};

const DEMO_LEVELS = [
  {
    id: 1,
    name: "Phân loại cơ bản 1",
    gameType: "sorting",
    difficulty: "Dễ",
    binTypes: ["plastic", "paper"],
    items: 10,
    passRate: "70%",
    coinsReward: 50,
    description: "Mức nhập môn",
    target: "school",
  },
  {
    id: 2,
    name: "Chạy nhanh 1",
    gameType: "runner",
    difficulty: "Trung bình",
    binTypes: ["organic", "others"],
    items: 15,
    passRate: "65%",
    coinsReward: 80,
    description: "Phân loại trong khi chạy",
    target: "school",
  },
  {
    id: 3,
    name: "Thử thách khó",
    gameType: "sorting",
    difficulty: "Khó",
    binTypes: ["plastic", "paper", "organic", "others"],
    items: 25,
    passRate: "80%",
    coinsReward: 150,
    description: "Dành cho người chơi giỏi",
    target: "school",
  },
  {
    id: 4,
    name: "Đối tác - Cấp 1",
    gameType: "sorting",
    difficulty: "Dễ",
    binTypes: ["plastic"],
    items: 8,
    passRate: "60%",
    coinsReward: 40,
    description: "",
    target: "partnership",
  },
];

const defaultForm = {
  name: "",
  gameType: "sorting",
  difficulty: "Dễ",
  binTypes: [],
  items: 10,
  passRate: "70%",
  coinsReward: 50,
  description: "",
};

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};

// ─── Form body (non-lazy, controlled via parent state) ───────────────────────
// Không dùng lazy ở đây vì component cần nhận controlled props (gameType,
// difficulty) từ parent để active-state luôn phản ánh đúng React state.

function LevelFormBody({
  form,
  selectedBins,
  setSelectedBins,
  gameType,
  setGameType,
  difficulty,
  setDifficulty,
}) {
  const toggleBin = (id) =>
    setSelectedBins((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );

  const handleGameTypeChange = (value) => {
    setGameType(value);
    form.setFieldValue("gameType", value);
  };

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
    form.setFieldValue("difficulty", value);
  };

  return (
    <div className="space-y-6">
      {/* Game Type */}
      <div>
        <p className="font-semibold text-gray-700 mb-3">
          Loại game <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              value: "sorting",
              label: "Thu thập & Phân loại",
              icon: <RecycleIcon className="w-4 h-4" />,
              color: "green",
            },
            {
              value: "runner",
              label: "Chạy & Phân loại",
              icon: <ZapIcon className="w-4 h-4" />,
              color: "blue",
            },
          ].map(({ value, label, icon, color }) => {
            const active = gameType === value;
            return (
              <motion.div
                key={value}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleGameTypeChange(value)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                  ${
                    active
                      ? color === "green"
                        ? "border-green-400 bg-green-50"
                        : "border-blue-400 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
              >
                <span
                  className={
                    active
                      ? color === "green"
                        ? "text-green-600"
                        : "text-blue-600"
                      : "text-gray-400"
                  }
                >
                  {icon}
                </span>
                <span
                  className={`font-medium text-sm ${active ? (color === "green" ? "text-green-700" : "text-blue-700") : "text-gray-600"}`}
                >
                  {label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Name */}
      <Form.Item
        label="Tên cấp độ"
        name="name"
        rules={[{ required: true, message: "Nhập tên cấp độ" }]}
      >
        <Input
          placeholder="VD: Thu thập cơ bản - Cấp 1"
          className="rounded-lg"
        />
      </Form.Item>

      {/* Difficulty */}
      <div>
        <p className="font-semibold text-gray-700 mb-3">
          Độ khó <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {["Dễ", "Trung bình", "Khó"].map((d) => {
            const active = difficulty === d;
            const cls = {
              Dễ: active
                ? "border-green-400 bg-green-500 text-white"
                : "border-green-200 text-green-600 hover:bg-green-50",
              "Trung bình": active
                ? "border-amber-400 bg-amber-500 text-white"
                : "border-amber-200 text-amber-600 hover:bg-amber-50",
              Khó: active
                ? "border-red-400 bg-red-500 text-white"
                : "border-red-200 text-red-600 hover:bg-red-50",
            }[d];
            return (
              <motion.button
                key={d}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDifficultyChange(d)}
                className={`border-2 rounded-lg py-2 text-sm font-semibold transition-all ${cls}`}
              >
                {d}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <Form.Item label="Mô tả cấp độ" name="description">
        <Input.TextArea
          rows={2}
          placeholder="Mô tả về cấp độ này..."
          className="rounded-lg"
        />
      </Form.Item>

      {/* Numeric fields */}
      <div className="grid grid-cols-3 gap-4">
        <Form.Item
          label="Số vật phẩm"
          name="items"
          rules={[{ required: true }]}
        >
          <Input type="number" min={1} max={50} className="rounded-lg" />
        </Form.Item>
        <Form.Item label="Tỷ lệ đạt" name="passRate">
          <Input placeholder="70%" className="rounded-lg" />
        </Form.Item>
        <Form.Item label="Xu thưởng" name="coinsReward">
          <Input type="number" placeholder="100" className="rounded-lg" />
        </Form.Item>
      </div>

      {/* Bin Types */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-700">
            Loại thùng rác <span className="text-red-500">*</span>
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {selectedBins.length}/4 thùng
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {BIN_TYPES.map((bin) => {
            const isSelected = selectedBins.includes(bin.id);
            return (
              <motion.div
                key={bin.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleBin(bin.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all
                  ${isSelected ? "border-green-400 bg-green-50 shadow-sm ring-1 ring-green-300" : "border-gray-200 hover:border-gray-300 bg-white"}`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm ${bin.color}`}
                >
                  <span className="text-xl">{bin.icon}</span>
                </div>
                <div>
                  <p
                    className={`font-semibold text-sm ${isSelected ? "text-green-700" : "text-gray-700"}`}
                  >
                    {bin.label}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{bin.id}</p>
                </div>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto text-green-500 text-lg leading-none"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
        {selectedBins.length === 0 && (
          <p className="text-xs text-red-500 mt-2">
            ⚠️ Cần chọn ít nhất 1 loại thùng rác
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon, value, label, iconBg, iconColor, borderColor }) => (
  <motion.div variants={cardVariants}>
    <Card
      className={`rounded-2xl border-2 ${borderColor} hover:shadow-md transition-shadow duration-300`}
      bodyStyle={{ padding: "12px 16px" }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}
        >
          <span className={`text-xl ${iconColor}`}>{icon}</span>
        </div>
        <Statistic
          value={value}
          title={label}
          valueStyle={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}
        />
      </div>
    </Card>
  </motion.div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminGameLevels() {
  const [levels, setLevels] = useState(DEMO_LEVELS);
  const [activeTarget, setActiveTarget] = useState("school");
  const [activeGameType, setActiveGameType] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [selectedBins, setSelectedBins] = useState([]);
  // Controlled state cho active-highlight trong form
  const [formGameType, setFormGameType] = useState("sorting");
  const [formDifficulty, setFormDifficulty] = useState("Dễ");
  const [form] = Form.useForm();

  // ── Filters ──
  const filteredLevels = useMemo(() => {
    let result = levels.filter((l) => l.target === activeTarget);
    if (activeGameType !== "all")
      result = result.filter((l) => l.gameType === activeGameType);
    return result;
  }, [levels, activeTarget, activeGameType]);

  // ── Stats ──
  const targetLevels = levels.filter((l) => l.target === activeTarget);
  const stats = {
    total: targetLevels.length,
    sorting: targetLevels.filter((l) => l.gameType === "sorting").length,
    runner: targetLevels.filter((l) => l.gameType === "runner").length,
    easy: targetLevels.filter((l) => l.difficulty === "Dễ").length,
    medium: targetLevels.filter((l) => l.difficulty === "Trung bình").length,
    hard: targetLevels.filter((l) => l.difficulty === "Khó").length,
  };

  // ── Open / Close ──
  const openCreate = () => {
    setEditingLevel(null);
    setFormGameType(defaultForm.gameType);
    setFormDifficulty(defaultForm.difficulty);
    form.setFieldsValue({ ...defaultForm });
    setSelectedBins([]);
    setIsFormOpen(true);
  };

  const openEdit = (level) => {
    setEditingLevel(level);
    setFormGameType(level.gameType);
    setFormDifficulty(level.difficulty);
    form.setFieldsValue({
      name: level.name,
      gameType: level.gameType,
      difficulty: level.difficulty,
      items: level.items,
      passRate: level.passRate,
      coinsReward: level.coinsReward,
      description: level.description,
    });
    setSelectedBins(level.binTypes);
    setIsFormOpen(true);
  };

  // ── CRUD ──
  const handleDelete = (id) =>
    setLevels((prev) => prev.filter((l) => l.id !== id));

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (selectedBins.length === 0) return;
      // Merge controlled states (not tracked by antd form) into values
      const finalValues = {
        ...values,
        gameType: formGameType,
        difficulty: formDifficulty,
      };
      if (editingLevel) {
        setLevels((prev) =>
          prev.map((l) =>
            l.id === editingLevel.id
              ? { ...l, ...finalValues, binTypes: selectedBins }
              : l,
          ),
        );
      } else {
        setLevels((prev) => [
          ...prev,
          {
            id: Date.now(),
            ...finalValues,
            binTypes: selectedBins,
            target: activeTarget,
          },
        ]);
      }
      setIsFormOpen(false);
    } catch (_) {}
  };

  // ── Table Columns ──
  const columns = [
    {
      title: "Tên cấp độ",
      key: "name",
      render: (_, level) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            {level.difficulty === "Dễ" && (
              <StarOutlined className="text-green-500" />
            )}
            {level.difficulty === "Trung bình" && (
              <AppstoreOutlined className="text-amber-500" />
            )}
            {level.difficulty === "Khó" && (
              <TrophyOutlined className="text-red-500" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800 leading-tight">
              {level.name}
            </p>
            {level.description && (
              <p className="text-xs text-gray-400 truncate max-w-[180px]">
                {level.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Loại game",
      key: "gameType",
      render: (_, level) => (
        <Tag
          color={level.gameType === "sorting" ? "green" : "blue"}
          className="rounded-full text-xs"
        >
          {level.gameType === "sorting"
            ? "Thu thập & Phân loại"
            : "Chạy & Phân loại"}
        </Tag>
      ),
    },
    {
      title: "Độ khó",
      key: "difficulty",
      render: (_, level) => {
        const cfg = DIFFICULTY_CONFIG[level.difficulty] || {};
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.tw}`}
          >
            {level.difficulty}
          </span>
        );
      },
    },
    {
      title: "Loại thùng",
      key: "binTypes",
      render: (_, level) => (
        <div className="flex flex-wrap gap-1">
          {level.binTypes.map((t) => (
            <Tag
              key={t}
              color={BIN_TAG_COLOR[t]}
              className="rounded-full text-xs m-0"
            >
              {BIN_LABEL[t]}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Vật phẩm",
      dataIndex: "items",
      key: "items",
      align: "center",
      render: (v) => <span className="font-semibold text-gray-700">{v}</span>,
    },
    {
      title: "Xu thưởng",
      dataIndex: "coinsReward",
      key: "coins",
      align: "center",
      render: (v) => (
        <span className="font-semibold text-amber-500">{v} xu</span>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, level) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: "Sửa",
                icon: <EditOutlined />,
                onClick: () => openEdit(level),
              },
              { type: "divider" },
              {
                key: "delete",
                label: <span className="text-red-500">Xóa</span>,
                icon: <DeleteOutlined className="text-red-500" />,
                onClick: () => handleDelete(level.id),
              },
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            className="text-gray-400 hover:text-gray-700"
          />
        </Dropdown>
      ),
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          variants={cardVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-200">
              <GamepadIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                Quản lý Cấp độ Game
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Tạo và quản lý cấp độ game cho Trường học & Đối tác
              </p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
              className="rounded-xl bg-green-500 border-green-500 hover:bg-green-600 font-semibold"
            >
              Tạo Cấp độ
            </Button>
          </motion.div>
        </motion.div>

        {/* Target Tabs (Trường học / Đối tác) */}
        <motion.div variants={cardVariants}>
          <Card
            className="rounded-2xl border-0 shadow-sm"
            bodyStyle={{ padding: "6px 8px" }}
          >
            <Tabs
              activeKey={activeTarget}
              onChange={(v) => {
                setActiveTarget(v);
                setActiveGameType("all");
              }}
              centered
              items={[
                {
                  key: "school",
                  label: (
                    <span className="flex items-center gap-2 px-2">
                      <SchoolIcon className="w-4 h-4" />
                      Trường học
                    </span>
                  ),
                },
                {
                  key: "partnership",
                  label: (
                    <span className="flex items-center gap-2 px-2">
                      <HandshakeIcon className="w-4 h-4" />
                      Đối tác
                    </span>
                  ),
                },
              ]}
            />
          </Card>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<AppstoreOutlined />}
            value={stats.total}
            label="Tổng cấp độ"
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            borderColor="border-blue-100"
          />
          <StatCard
            icon={<StarOutlined />}
            value={stats.easy}
            label="Dễ"
            iconBg="bg-green-50"
            iconColor="text-green-500"
            borderColor="border-green-100"
          />
          <StatCard
            icon={<AppstoreOutlined />}
            value={stats.medium}
            label="Trung bình"
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            borderColor="border-amber-100"
          />
          <StatCard
            icon={<TrophyOutlined />}
            value={stats.hard}
            label="Khó"
            iconBg="bg-red-50"
            iconColor="text-red-500"
            borderColor="border-red-100"
          />
        </div>

        {/* Game Type Filter + Table */}
        <motion.div variants={cardVariants}>
          <Card
            className="rounded-2xl border-0 shadow-sm"
            bodyStyle={{ padding: 0 }}
          >
            {/* Sub-tabs */}
            <div className="px-4 pt-3 border-b border-gray-100">
              <Tabs
                activeKey={activeGameType}
                onChange={setActiveGameType}
                size="small"
                items={[
                  { key: "all", label: `Tất cả (${stats.total})` },
                  {
                    key: "sorting",
                    label: (
                      <span className="flex items-center gap-1.5">
                        <RecycleIcon className="w-3.5 h-3.5" />
                        Thu thập & Phân loại ({stats.sorting})
                      </span>
                    ),
                  },
                  {
                    key: "runner",
                    label: (
                      <span className="flex items-center gap-1.5">
                        <ZapIcon className="w-3.5 h-3.5" />
                        Chạy & Phân loại ({stats.runner})
                      </span>
                    ),
                  },
                ]}
              />
            </div>

            {/* Animated table */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTarget}-${activeGameType}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <Table
                  dataSource={filteredLevels}
                  columns={columns}
                  rowKey="id"
                  pagination={{
                    pageSize: 8,
                    showSizeChanger: false,
                    showTotal: (t) => `${t} cấp độ`,
                    className: "px-6 pb-4",
                  }}
                  locale={{
                    emptyText: (
                      <div className="flex flex-col items-center gap-2 py-14">
                        <AppstoreOutlined className="text-4xl text-gray-200" />
                        <p className="font-semibold text-gray-400">
                          Chưa có cấp độ nào
                        </p>
                        <p className="text-sm text-gray-300">
                          Tạo cấp độ đầu tiên cho{" "}
                          {activeTarget === "school" ? "Trường học" : "Đối tác"}
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
                          className="hover:bg-blue-50/30 transition-colors"
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

      {/* ── Create / Edit Modal ── */}
      <Modal
        open={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
        title={
          <span className="text-lg font-bold text-gray-800">
            {editingLevel
              ? "Cập nhật cấp độ game"
              : `Tạo cấp độ game mới — ${activeTarget === "school" ? "Trường học" : "Đối tác"}`}
          </span>
        }
        width={680}
        centered
        className="[&_.ant-modal-content]:rounded-2xl"
        styles={{
          body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 },
        }}
        footer={
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => setIsFormOpen(false)}
              className="flex-1 rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={selectedBins.length === 0}
              className="flex-1 rounded-xl bg-green-500 border-green-500 hover:bg-green-600 font-semibold"
            >
              {editingLevel ? "Cập nhật" : "Tạo cấp độ"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" initialValues={defaultForm}>
          <LevelFormBody
            form={form}
            selectedBins={selectedBins}
            setSelectedBins={setSelectedBins}
            gameType={formGameType}
            setGameType={setFormGameType}
            difficulty={formDifficulty}
            setDifficulty={setFormDifficulty}
          />
        </Form>
      </Modal>
    </div>
  );
}
