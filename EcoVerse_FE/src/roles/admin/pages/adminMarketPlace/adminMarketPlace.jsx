import { useState, useMemo, lazy, Suspense } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  Modal,
  Form,
  Switch,
  Upload,
  Statistic,
  Dropdown,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  RiseOutlined,
  InboxOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

const { TextArea } = Input;

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_MARKETPLACE_ITEMS = [
  {
    id: 1,
    name: "Avatar Siêu anh hùng",
    image: "🦸",
    type: "avatar",
    description: "Hóa thân thành siêu anh hùng",
    price: 500,
    stock: null,
    totalRedeemed: 234,
    isActive: true,
  },
  {
    id: 2,
    name: "Avatar Khủng long",
    image: "🦖",
    type: "avatar",
    description: "Avatar khủng long ngầu",
    price: 300,
    stock: 50,
    totalRedeemed: 156,
    isActive: true,
  },
  {
    id: 3,
    name: "Avatar Ninja",
    image: "🥷",
    type: "avatar",
    description: "Ninja bí ẩn",
    price: 450,
    stock: null,
    totalRedeemed: 189,
    isActive: true,
  },
  {
    id: 4,
    name: "Avatar Robot",
    image: "🤖",
    type: "avatar",
    description: "Robot công nghệ cao",
    price: 600,
    stock: 20,
    totalRedeemed: 98,
    isActive: false,
  },
  {
    id: 5,
    name: "Avatar Công chúa",
    image: "👸",
    type: "avatar",
    description: "Công chúa xinh đẹp",
    price: 400,
    stock: null,
    totalRedeemed: 267,
    isActive: true,
  },
  {
    id: 6,
    name: "Avatar Phi hành gia",
    image: "👨‍🚀",
    type: "avatar",
    description: "Khám phá vũ trụ",
    price: 550,
    stock: 30,
    totalRedeemed: 142,
    isActive: true,
  },
];

// Helper
const isImageUrl = (img) =>
  img && (img.startsWith("http") || img.startsWith("data:"));

// ─── Lazy-loaded form body ────────────────────────────────────────────────────

const MarketplaceItemForm = lazy(() =>
  Promise.resolve({
    default: ({ form, imageUrl, setImageUrl }) => {
      const handleUploadChange = (info) => {
        if (info.file.status === "done" || info.file.originFileObj) {
          const url = URL.createObjectURL(info.file.originFileObj);
          setImageUrl(url);
        }
      };

      return (
        <div className="space-y-4">
          <Form.Item
            label="Tên Avatar"
            name="name"
            rules={[{ required: true, message: "Nhập tên avatar" }]}
          >
            <Input
              placeholder="VD: Avatar siêu anh hùng"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item label="Giá (xu)" name="price" rules={[{ required: true }]}>
            <Input type="number" min={0} className="rounded-lg" />
          </Form.Item>

          {/* Image Upload */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Hình ảnh / Emoji
            </p>
            {imageUrl ? (
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-xl border-2 border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50">
                  {isImageUrl(imageUrl) ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">{imageUrl}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl("🎁")}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                >
                  <CloseCircleOutlined style={{ fontSize: 14 }} />
                </button>
              </div>
            ) : null}
            <div className="mt-2 flex gap-2">
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleUploadChange}
              >
                <Button icon={<InboxOutlined />} size="small">
                  Tải ảnh lên
                </Button>
              </Upload>
              <Input
                placeholder="hoặc nhập emoji 🎁"
                className="flex-1 rounded-lg"
                onChange={(e) => setImageUrl(e.target.value || "🎁")}
              />
            </div>
          </div>

          <Form.Item label="Số lượng (để trống = không giới hạn)" name="stock">
            <Input
              type="number"
              min={0}
              placeholder="Không giới hạn"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <TextArea
              rows={2}
              placeholder="Mô tả ngắn về avatar..."
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label="Hiển thị trong Marketplace"
            name="isActive"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>
      );
    },
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

const StatCard = ({ icon, iconBg, iconColor, label, value }) => (
  <motion.div variants={itemVariants}>
    <Card
      className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow duration-300"
      bodyStyle={{ padding: "16px 20px" }}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
        >
          <span className={`text-xl ${iconColor}`}>{icon}</span>
        </div>
        <Statistic
          value={value}
          title={<span className="text-sm text-gray-400">{label}</span>}
          valueStyle={{ fontSize: 26, fontWeight: 700, color: "#1e293b" }}
        />
      </div>
    </Card>
  </motion.div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const AdminMarketplace = () => {
  const [items, setItems] = useState(DEMO_MARKETPLACE_ITEMS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formImage, setFormImage] = useState("🎁");
  const [form] = Form.useForm();

  // ── Stats ──
  const stats = useMemo(
    () => ({
      totalItems: items.length,
      activeItems: items.filter((i) => i.isActive).length,
      totalRedeemed: items.reduce((s, i) => s + i.totalRedeemed, 0),
    }),
    [items],
  );

  // ── Filtered items ──
  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);
      return matchSearch && matchStatus;
    });
  }, [items, searchTerm, statusFilter]);

  // ── Handlers ──
  const handleOpenAdd = () => {
    form.resetFields();
    setFormImage("🎁");
    setEditingItem(null);
    form.setFieldsValue({
      name: "",
      price: 100,
      stock: null,
      description: "",
      isActive: true,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormImage(item.image);
    form.setFieldsValue({
      name: item.name,
      price: item.price,
      stock: item.stock,
      description: item.description,
      isActive: item.isActive,
    });
    setIsAddOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, image: formImage, type: "avatar" };

      if (editingItem) {
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? { ...i, ...payload } : i)),
        );
        message.success(`Đã cập nhật ${values.name}`);
      } else {
        const newItem = { id: Date.now(), ...payload, totalRedeemed: 0 };
        setItems((prev) => [...prev, newItem]);
        message.success(`Đã thêm ${values.name} vào Marketplace`);
      }
      setIsAddOpen(false);
    } catch (_) {}
  };

  const handleDelete = (item) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    message.success(`Đã xóa ${item.name} khỏi Marketplace`);
  };

  const toggleStatus = (id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i)),
    );
  };

  // ── Table columns ──
  const columns = [
    {
      title: "Avatar",
      key: "avatar",
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-2xl overflow-hidden">
            {isImageUrl(item.image) ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              item.image
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800 leading-tight">
              {item.name}
            </p>
            <p className="text-xs text-gray-400 line-clamp-1">
              {item.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Giá (xu)",
      key: "price",
      render: (_, item) => (
        <span className="font-semibold text-blue-600">{item.price}</span>
      ),
    },
    {
      title: "Số lượng",
      key: "stock",
      render: (_, item) =>
        item.stock === null ? (
          <span className="text-gray-400 text-sm">Không giới hạn</span>
        ) : (
          <span className="text-gray-700">{item.stock}</span>
        ),
    },
    {
      title: "Đã đổi",
      dataIndex: "totalRedeemed",
      key: "redeemed",
      render: (v) => (
        <span className="text-gray-700">{v.toLocaleString()}</span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, item) => (
        <Switch
          checked={item.isActive}
          onChange={() => toggleStatus(item.id)}
          size="small"
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_, item) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: "Chỉnh sửa",
                icon: <EditOutlined />,
                onClick: () => handleOpenEdit(item),
              },
              { type: "divider" },
              {
                key: "delete",
                label: <span className="text-red-500">Xóa</span>,
                icon: <DeleteOutlined className="text-red-500" />,
                onClick: () => handleDelete(item),
              },
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            size="small"
            className="text-gray-400 hover:text-gray-700"
          />
        </Dropdown>
      ),
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
              Quản lý Avatar
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Tùy chỉnh avatar cho học sinh đổi xu
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenAdd}
              className="rounded-xl bg-blue-500 border-blue-500 hover:bg-blue-600"
            >
              Thêm Avatar
            </Button>
          </motion.div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<ShoppingOutlined />}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            label="Tổng Avatar"
            value={stats.totalItems}
          />
          <StatCard
            icon={<AppstoreOutlined />}
            iconBg="bg-green-50"
            iconColor="text-green-500"
            label="Đang hoạt động"
            value={stats.activeItems}
          />
          <StatCard
            icon={<RiseOutlined />}
            iconBg="bg-purple-50"
            iconColor="text-purple-500"
            label="Lượt đổi"
            value={stats.totalRedeemed.toLocaleString()}
          />
        </div>

        {/* ── Filters ── */}
        <motion.div variants={itemVariants}>
          <Card
            className="rounded-2xl border-0 shadow-sm"
            bodyStyle={{ padding: "16px 20px" }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                prefix={<SearchOutlined className="text-gray-300" />}
                placeholder="Tìm kiếm avatar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                className="flex-1 rounded-xl"
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-36"
                options={[
                  { value: "all", label: "Tất cả" },
                  { value: "active", label: "Đang bật" },
                  { value: "inactive", label: "Đã tắt" },
                ]}
              />
            </div>
          </Card>
        </motion.div>

        {/* ── Items Table ── */}
        <motion.div variants={itemVariants}>
          <Card
            className="rounded-2xl border-0 shadow-sm"
            title={
              <span className="font-bold text-gray-800">
                Danh sách Avatar ({items.length})
              </span>
            }
            bodyStyle={{ padding: 0 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${statusFilter}-${searchTerm}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <Table
                  dataSource={filtered}
                  columns={columns}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showTotal: (t) => `${t} avatar`,
                    className: "px-6 pb-4",
                  }}
                  locale={{
                    emptyText: (
                      <div className="flex flex-col items-center gap-2 py-12">
                        <AppstoreOutlined className="text-4xl text-gray-200" />
                        <p className="text-gray-400 font-medium">
                          Không tìm thấy avatar
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

      {/* ── Add/Edit Modal ── */}
      <Modal
        open={isAddOpen}
        onCancel={() => setIsAddOpen(false)}
        title={
          <span className="font-bold text-gray-800">
            {editingItem ? "Chỉnh sửa Avatar" : "Thêm Avatar mới"}
          </span>
        }
        centered
        width={520}
        className="[&_.ant-modal-content]:rounded-2xl"
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
        footer={
          <div className="flex gap-3 pt-1">
            <Button
              onClick={() => setIsAddOpen(false)}
              className="flex-1 rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              className="flex-1 rounded-xl bg-blue-500 border-blue-500 hover:bg-blue-600 font-semibold"
            >
              {editingItem ? "Cập nhật" : "Thêm Avatar"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
                <ReloadOutlined spin />
                Đang tải...
              </div>
            }
          >
            <MarketplaceItemForm
              form={form}
              imageUrl={formImage}
              setImageUrl={setFormImage}
            />
          </Suspense>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminMarketplace;
