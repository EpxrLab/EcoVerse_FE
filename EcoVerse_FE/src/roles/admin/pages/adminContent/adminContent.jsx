import { useState, useRef, useMemo, lazy, Suspense } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  Modal,
  Form,
  Upload,
  Tag,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

const { TextArea } = Input;

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_WASTE_ITEMS = [
  {
    id: 1,
    image: "🥤",
    name: "Chai nhựa",
    category: "plastic",
    description: "Chai nhựa nước uống",
    funFact: "Có thể tái chế 100%",
  },
  {
    id: 2,
    image: "📄",
    name: "Giấy A4",
    category: "paper",
    description: "Giấy in văn phòng",
    funFact: "1 tấn giấy cứu được 17 cây",
  },
  {
    id: 3,
    image: "🍎",
    name: "Vỏ táo",
    category: "organic",
    description: "Vỏ hoa quả hữu cơ",
    funFact: "Phân hủy trong 2 tuần",
  },
  {
    id: 4,
    image: "🥡",
    name: "Hộp xốp",
    category: "others",
    description: "Hộp đựng thức ăn",
    funFact: "Mất 500 năm phân hủy",
  },
  {
    id: 5,
    image: "🧃",
    name: "Hộp sữa",
    category: "plastic",
    description: "Hộp sữa nhựa",
    funFact: "Tái chế thành ghế nhựa",
  },
  {
    id: 6,
    image: "📰",
    name: "Báo cũ",
    category: "paper",
    description: "Tờ báo đã đọc",
    funFact: "Tái chế tiết kiệm 70% năng lượng",
  },
  {
    id: 7,
    image: "🍌",
    name: "Vỏ chuối",
    category: "organic",
    description: "Vỏ trái cây",
    funFact: "Làm phân bón tốt",
  },
  {
    id: 8,
    image: "🔋",
    name: "Pin",
    category: "others",
    description: "Pin điện tử",
    funFact: "Chứa chất độc hại",
  },
];

const CATEGORY_CONFIG = {
  plastic: {
    label: "Nhựa",
    color: "blue",
    tw: "bg-blue-50 text-blue-600 border-blue-200",
  },
  paper: {
    label: "Giấy",
    color: "green",
    tw: "bg-green-50 text-green-600 border-green-200",
  },
  organic: {
    label: "Hữu cơ",
    color: "orange",
    tw: "bg-amber-50 text-amber-600 border-amber-200",
  },
  others: {
    label: "Khác",
    color: "default",
    tw: "bg-gray-50 text-gray-600 border-gray-200",
  },
};

// ─── Lazy-loaded form body ────────────────────────────────────────────────────

const WasteItemForm = lazy(() =>
  Promise.resolve({
    default: ({ form, imageUrl, setImageUrl, isEdit, item }) => {
      const handleUploadChange = (info) => {
        if (info.file.status === "done" || info.file.originFileObj) {
          const url = URL.createObjectURL(info.file.originFileObj);
          setImageUrl(url);
        }
      };

      const handleRemove = () => {
        setImageUrl(null);
        return true;
      };

      return (
        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Hình ảnh vật phẩm
            </p>
            {imageUrl ? (
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-xl border-2 border-gray-200 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                >
                  <CloseCircleOutlined style={{ fontSize: 14 }} />
                </button>
              </div>
            ) : (
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleUploadChange}
                onRemove={handleRemove}
              >
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <InboxOutlined className="text-2xl text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Tải ảnh</span>
                </div>
              </Upload>
            )}
          </div>

          {/* Form fields */}
          <Form.Item
            label="Tên vật phẩm"
            name="name"
            rules={[{ required: true, message: "Nhập tên vật phẩm" }]}
          >
            <Input placeholder="VD: Chai nhựa" className="rounded-lg" />
          </Form.Item>

          <Form.Item
            label="Loại rác"
            name="category"
            rules={[{ required: true, message: "Chọn loại rác" }]}
          >
            <Select
              placeholder="Chọn loại"
              className="rounded-lg"
              options={[
                { value: "plastic", label: "Nhựa" },
                { value: "paper", label: "Giấy" },
                { value: "organic", label: "Hữu cơ" },
                { value: "others", label: "Khác" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <TextArea
              rows={2}
              placeholder="Mô tả ngắn về vật phẩm"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item label="Fun Fact" name="funFact">
            <TextArea
              rows={2}
              placeholder="Thông tin thú vị về vật phẩm"
              className="rounded-lg"
            />
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

// ─── Main Component ────────────────────────────────────────────────────────────

const AdminContent = () => {
  const [items, setItems] = useState(DEMO_WASTE_ITEMS);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [addImageUrl, setAddImageUrl] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // ── Filtered items ──
  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      const matchCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [items, searchTerm, categoryFilter]);

  // ── Handlers ──
  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      const newItem = {
        id: Date.now(),
        image: "📦", // placeholder
        ...values,
      };
      setItems((prev) => [...prev, newItem]);
      setIsAddOpen(false);
      addForm.resetFields();
      setAddImageUrl(null);
    } catch (_) {}
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    editForm.setFieldsValue({
      name: item.name,
      category: item.category,
      description: item.description,
      funFact: item.funFact,
    });
    setEditImageUrl(null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? { ...i, ...values } : i)),
      );
      setIsEditOpen(false);
      setEditImageUrl(null);
    } catch (_) {}
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // ── Table columns ──
  const columns = [
    {
      title: "Hình",
      key: "image",
      width: 70,
      render: (_, item) => <span className="text-3xl">{item.image}</span>,
    },
    {
      title: "Tên vật phẩm",
      key: "name",
      render: (_, item) => (
        <span className="font-semibold text-gray-800">{item.name}</span>
      ),
    },
    {
      title: "Loại",
      key: "category",
      render: (_, item) => {
        const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.others;
        return (
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.tw}`}
          >
            {cfg.label}
          </span>
        );
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <span className="text-gray-500 text-sm max-w-xs truncate block">
          {text}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 110,
      render: (_, item) => (
        <div className="flex gap-1">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(item)}
            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(item.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          />
        </div>
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
        <motion.div variants={itemVariants}>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Quản lý nội dung game
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Quản lý vật phẩm rác trong game
            </p>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div variants={itemVariants}>
          <Card
            className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow duration-300"
            bodyStyle={{ padding: "16px 20px" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <AppstoreOutlined className="text-2xl text-blue-500" />
              </div>
              <Statistic
                value={items.length}
                title={
                  <span className="text-sm text-gray-400">Vật phẩm rác</span>
                }
                valueStyle={{ fontSize: 26, fontWeight: 700, color: "#1e293b" }}
              />
            </div>
          </Card>
        </motion.div>

        {/* ── Waste Items Table ── */}
        <motion.div variants={itemVariants}>
          <Card
            className="rounded-2xl border-0 shadow-sm"
            bodyStyle={{ padding: 0 }}
          >
            {/* Filters + Add button */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3 justify-between">
              <div className="flex gap-2 flex-1 max-w-2xl">
                <Input
                  prefix={<SearchOutlined className="text-gray-300" />}
                  placeholder="Tìm vật phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                  className="flex-1 rounded-xl"
                />
                <Select
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  className="w-36"
                  options={[
                    { value: "all", label: "Tất cả" },
                    { value: "plastic", label: "Nhựa" },
                    { value: "paper", label: "Giấy" },
                    { value: "organic", label: "Hữu cơ" },
                    { value: "others", label: "Khác" },
                  ]}
                />
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddOpen(true)}
                  className="rounded-xl bg-blue-500 border-blue-500 hover:bg-blue-600"
                >
                  Thêm vật phẩm
                </Button>
              </motion.div>
            </div>

            {/* Animated table */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${categoryFilter}-${searchTerm}`}
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
                    showTotal: (t) => `${t} vật phẩm`,
                    className: "px-6 pb-4",
                  }}
                  locale={{
                    emptyText: (
                      <div className="flex flex-col items-center gap-2 py-12">
                        <AppstoreOutlined className="text-4xl text-gray-200" />
                        <p className="text-gray-400 font-medium">
                          Không tìm thấy vật phẩm
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

      {/* ── Add Item Modal ── */}
      <Modal
        open={isAddOpen}
        onCancel={() => {
          setIsAddOpen(false);
          addForm.resetFields();
          setAddImageUrl(null);
        }}
        title={
          <span className="font-bold text-gray-800">Thêm vật phẩm rác mới</span>
        }
        centered
        width={480}
        className="[&_.ant-modal-content]:rounded-2xl"
        footer={
          <div className="flex gap-3 pt-1">
            <Button
              onClick={() => {
                setIsAddOpen(false);
                addForm.resetFields();
                setAddImageUrl(null);
              }}
              className="flex-1 rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleAdd}
              className="flex-1 rounded-xl bg-blue-500 border-blue-500 hover:bg-blue-600 font-semibold"
            >
              Thêm vật phẩm
            </Button>
          </div>
        }
      >
        <Form form={addForm} layout="vertical">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
                <ReloadOutlined spin />
                Đang tải...
              </div>
            }
          >
            <WasteItemForm
              form={addForm}
              imageUrl={addImageUrl}
              setImageUrl={setAddImageUrl}
              isEdit={false}
              item={null}
            />
          </Suspense>
        </Form>
      </Modal>

      {/* ── Edit Item Modal ── */}
      <Modal
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          setEditImageUrl(null);
        }}
        title={
          <span className="font-bold text-gray-800">Chỉnh sửa vật phẩm</span>
        }
        centered
        width={480}
        className="[&_.ant-modal-content]:rounded-2xl"
        footer={
          <div className="flex gap-3 pt-1">
            <Button
              onClick={() => {
                setIsEditOpen(false);
                setEditImageUrl(null);
              }}
              className="flex-1 rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleSaveEdit}
              className="flex-1 rounded-xl bg-green-500 border-green-500 hover:bg-green-600 font-semibold"
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        {editingItem && (
          <Form form={editForm} layout="vertical">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
                  <ReloadOutlined spin />
                  Đang tải...
                </div>
              }
            >
              <WasteItemForm
                form={editForm}
                imageUrl={editImageUrl}
                setImageUrl={setEditImageUrl}
                isEdit={true}
                item={editingItem}
              />
            </Suspense>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default AdminContent;
