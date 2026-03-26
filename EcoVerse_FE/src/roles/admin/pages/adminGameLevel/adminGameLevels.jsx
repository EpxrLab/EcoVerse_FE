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

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M18 6L6 18M6 6l12 12" />
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

const DEMO_PRESETS = [
  {
    id: 1,
    name: "Preset Cơ bản",
    gameType: "sorting",
    difficulty: "Dễ",
    levels: [
      { levelNumber: 1, itemCount: 15, timeLimitSeconds: 60, lives: null, binTypes: ["plastic", "paper", "organic"] }
    ]
  },
  {
    id: 2,
    name: "Preset Khởi động",
    gameType: "runner",
    difficulty: "Trung bình",
    levels: [
      { levelNumber: 1, itemCount: 20, timeLimitSeconds: 45, lives: 3, binTypes: ["plastic", "paper"] },
      { levelNumber: 2, itemCount: 25, timeLimitSeconds: 40, lives: 3, binTypes: ["plastic", "paper", "organic"] }
    ]
  },
];

const defaultForm = {
  name: "",
  gameType: "sorting",
  difficulty: "Dễ",
  levels: [
    { levelNumber: 1, itemCount: 10, timeLimitSeconds: 0, lives: null, binTypes: ["plastic", "paper", "organic", "others"] }
  ]
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
  gameType,
  setGameType,
  difficulty,
  setDifficulty,
}) {

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
      {/* Preset Name */}
      <Form.Item
        label={<span className="font-semibold text-gray-700">Tên Preset <span className="text-red-500">*</span></span>}
        name="name"
        rules={[{ required: true, message: "Vui lòng nhập tên Preset" }]}
        className="mb-0"
      >
        <Input placeholder="VD: Chiến dịch Mùa Hè - Dễ" size="large" className="rounded-xl" />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Game Type */}
        <div>
          <p className="font-semibold text-gray-700 mb-3">
            Loại game <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: "sorting",
                label: "Thu thập",
                icon: <RecycleIcon className="w-4 h-4" />,
                color: "green",
              },
              {
                value: "runner",
                label: "Chạy",
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
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all
                    ${
                      active
                        ? color === "green"
                          ? "border-green-400 bg-green-50 text-green-700"
                          : "border-blue-400 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 bg-white text-gray-500"
                    }`}
                >
                  <span>{icon}</span>
                  <span className="font-medium text-sm whitespace-nowrap">{label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <p className="font-semibold text-gray-700 mb-3">
            Độ khó <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "Dễ", color: "green", label: "Dễ" },
              { value: "Trung bình", color: "amber", label: "Trung bình" },
              { value: "Khó", color: "red", label: "Khó" },
            ].map(({ value, color, label }) => {
              const active = difficulty === value;
              return (
                <motion.div
                  key={value}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDifficultyChange(value)}
                  className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all text-center
                    ${
                      active
                        ? color === "green" ? "border-green-400 bg-green-50 text-green-700 shadow-sm" 
                        : color === "amber" ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                        : "border-red-400 bg-red-50 text-red-700 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white text-gray-600"
                    }`}
                >
                  <span className="font-semibold text-sm">{label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Levels */}
      <div className="border-t border-gray-100 pt-5">
        <p className="font-semibold text-gray-700 mb-3">Danh sách Cấp độ (Levels)</p>
        <Form.List name="levels">
          {(fields, { add, remove }) => (
            <div className="space-y-4">
              {fields.map(({ key, name, ...restField }, index) => (
                  <div className="relative bg-white border-2 border-dashed border-gray-200 rounded-2xl p-5 hover:border-blue-300 transition-colors">
                    <div className="absolute top-3 right-3">
                      <Tooltip title="Xóa cấp độ này">
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => remove(name)} 
                          className="hover:bg-red-50 rounded-xl w-8 h-8 flex items-center justify-center p-0"
                        />
                      </Tooltip>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-inner">
                        {index + 1}
                      </div>
                      <span className="text-gray-800 font-bold text-base tracking-tight">Cấu hình Cấp độ</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1">
                      <Form.Item
                        {...restField}
                        name={[name, 'levelNumber']}
                        label={<span className="text-gray-600 text-xs font-semibold min-h-[32px] flex items-end">Cấp độ</span>}
                        rules={[{ required: true, message: 'Bắt buộc' }]}
                      >
                        <Input type="number" min={1} className="rounded-xl bg-gray-50 border-gray-200 hover:bg-white focus:bg-white transition-colors" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'itemCount']}
                        label={<span className="text-gray-600 text-xs font-semibold min-h-[32px] flex items-end">Số lượng rác</span>}
                        rules={[{ required: true, message: 'Bắt buộc' }]}
                      >
                        <Input type="number" min={1} className="rounded-xl bg-gray-50 border-gray-200 hover:bg-white focus:bg-white transition-colors" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'timeLimitSeconds']}
                        label={<span className="text-gray-600 text-xs font-semibold min-h-[32px] flex items-end">Thời gian (giây)</span>}
                      >
                        <Input type="number" min={0} placeholder="0 = Vô hạn" className="rounded-xl bg-gray-50 border-gray-200 hover:bg-white focus:bg-white transition-colors" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'lives']}
                        label={<span className="text-gray-600 text-xs font-semibold min-h-[32px] flex items-end">Số mạng</span>}
                      >
                        <Input type="number" min={1} placeholder="Vô hạn" className="rounded-xl bg-gray-50 border-gray-200 hover:bg-white focus:bg-white transition-colors" />
                      </Form.Item>
                    </div>

                    <div className="mt-2">
                      <Form.Item
                        {...restField}
                        name={[name, 'binTypes']}
                        label={<span className="text-gray-600 text-xs font-semibold">Loại thùng rác xuất hiện</span>}
                        rules={[{ required: true, message: 'Chọn ít nhất 1 loại thùng rác' }]}
                        className="mb-0"
                      >
                        <Select
                          mode="multiple"
                          placeholder="Chọn các loại thùng rác (Nhựa, Giấy...)"
                          className="rounded-xl [&_.ant-select-selector]:rounded-xl [&_.ant-select-selector]:border-gray-200 hover:[&_.ant-select-selector]:border-blue-400"
                          options={BIN_TYPES.map(bin => ({ value: bin.id, label: bin.label }))}
                          tagRender={(props) => {
                            const { label, value, closable, onClose } = props;
                            const bin = BIN_TYPES.find(b => b.id === value);
                            const color = BIN_TAG_COLOR[value] || 'default';
                            return (
                              <Tag color={color} closable={closable} onClose={onClose} style={{ marginRight: 4, borderRadius: 6, padding: '2px 8px', fontSize: 13, border: 'none' }}>
                                <span className="mr-1">{bin?.icon}</span> {label}
                              </Tag>
                            );
                          }}
                        />
                      </Form.Item>
                    </div>
                  </div>
              ))}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button 
                  type="dashed" 
                  onClick={() => add({ levelNumber: fields.length + 1, itemCount: 10, timeLimitSeconds: 0, lives: null, binTypes: ["plastic", "paper", "organic", "others"] })} 
                  block 
                  icon={<PlusOutlined />} 
                  className="rounded-2xl h-12 border-2 border-green-200 text-green-600 hover:border-green-400 hover:text-green-700 bg-green-50/50 hover:bg-green-50"
                >
                  <span className="font-semibold">Thêm Cấp độ mới</span>
                </Button>
              </motion.div>
            </div>
          )}
        </Form.List>
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
  const [levels, setLevels] = useState(DEMO_PRESETS);
  const [activeGameType, setActiveGameType] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  
  // Controlled state cho active-highlight trong form
  const [formGameType, setFormGameType] = useState("sorting");
  const [formDifficulty, setFormDifficulty] = useState("Dễ");
  const [form] = Form.useForm();

  // ── Filters ──
  const filteredLevels = useMemo(() => {
    let result = [...levels];
    if (activeGameType !== "all")
      result = result.filter((l) => l.gameType === activeGameType);
    return result;
  }, [levels, activeGameType]);

  // ── Stats ──
  const stats = {
    total: levels.length,
    sorting: levels.filter((l) => l.gameType === "sorting").length,
    runner: levels.filter((l) => l.gameType === "runner").length,
    easy: levels.filter((l) => l.difficulty === "Dễ").length,
    medium: levels.filter((l) => l.difficulty === "Trung bình").length,
    hard: levels.filter((l) => l.difficulty === "Khó").length,
  };

  // ── Open / Close ──
  const openCreate = () => {
    setEditingLevel(null);
    setFormGameType(defaultForm.gameType);
    setFormDifficulty(defaultForm.difficulty);
    form.setFieldsValue({ ...defaultForm });
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
      levels: level.levels || [],
    });
    setIsFormOpen(true);
  };

  // ── CRUD ──
  const handleDelete = (id) =>
    setLevels((prev) => prev.filter((l) => l.id !== id));

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const finalValues = {
        name: values.name,
        gameType: formGameType,
        difficulty: formDifficulty,
        levels: values.levels ? values.levels.map(l => ({
          levelNumber: Number(l.levelNumber),
          itemCount: Number(l.itemCount),
          timeLimitSeconds: l.timeLimitSeconds ? Number(l.timeLimitSeconds) : 0,
          lives: l.lives ? Number(l.lives) : null,
          binTypes: l.binTypes || [],
        })) : [],
      };
      if (editingLevel) {
        setLevels((prev) =>
          prev.map((l) =>
            l.id === editingLevel.id ? { ...l, ...finalValues } : l,
          ),
        );
      } else {
        setLevels((prev) => [
          ...prev,
          {
            id: Date.now(),
            ...finalValues,
          },
        ]);
      }
      setIsFormOpen(false);
    } catch (_) {}
  };

  const columns = [
    {
      title: "Tên Preset",
      dataIndex: "name",
      key: "name",
      render: (v) => <span className="font-bold text-gray-800 text-base">{v}</span>,
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
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.tw}`}>
            {level.difficulty}
          </span>
        );
      },
    },
    {
      title: "Số cấp độ",
      key: "levelCount",
      align: "center",
      render: (_, level) => <Badge count={level.levels?.length || 0} showZero color="blue" />
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
          <Button type="text" icon={<MoreOutlined />} className="text-gray-400 hover:text-gray-700" />
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
                Quản lý Cấu hình (Presets)
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Tạo và quản lý Presets tham số Game dùng chung hệ thống
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
              Tạo Preset
            </Button>
          </motion.div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<AppstoreOutlined />}
            value={stats.total}
            label="Tổng Presets"
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
                key={activeGameType}
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
                          Chưa có Presets nào
                        </p>
                        <p className="text-sm text-gray-300">
                          Tạo Preset đầu tiên cho hệ thống
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
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              {editingLevel ? <EditOutlined className="text-blue-600 text-lg" /> : <PlusOutlined className="text-blue-600 text-lg" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight m-0">
                {editingLevel ? "Cập nhật Preset" : "Tạo Preset mới"}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Định nghĩa các tham số, độ khó và loại rác cho game
              </p>
            </div>
          </div>
        }
        width={720}
        centered
        className="[&_.ant-modal-content]:rounded-3xl [&_.ant-modal-content]:overflow-hidden [&_.ant-modal-header]:pt-6 [&_.ant-modal-header]:px-8 [&_.ant-modal-body]:px-8 [&_.ant-modal-footer]:px-8 [&_.ant-modal-footer]:pb-6 [&_.ant-modal-footer]:pt-4 [&_.ant-modal-footer]:border-t [&_.ant-modal-footer]:border-gray-100"
        styles={{
          body: { maxHeight: "68vh", overflowY: "auto", paddingTop: 16 },
        }}
        closeIcon={
          <div className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors">
            <XIcon />
          </div>
        }
        footer={
          <div className="flex gap-4">
            <Button
              onClick={() => setIsFormOpen(false)}
              className="flex-1 rounded-2xl h-12 text-base font-semibold border-2 hover:bg-gray-50 text-gray-600"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              className="flex-1 rounded-2xl h-12 text-base font-semibold bg-blue-600 border-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              {editingLevel ? "Lưu thay đổi" : "Lưu Preset mới"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" initialValues={defaultForm}>
          <LevelFormBody
            form={form}
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
