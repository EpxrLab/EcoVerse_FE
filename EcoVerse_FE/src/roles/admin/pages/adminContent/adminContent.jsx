import { useState, useMemo, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  Modal,
  Form,
  Tag,
  Tabs,
  Switch,
  InputNumber,
  Spin,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  CloseCircleOutlined,
  AppstoreOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import {
  addNewSubWasteCategory,
  addWasteItem,
  deleteSubWasteCategory,
  deleteWasteItem,
  getAllSubWasteCategories,
  getAllWasteItems,
  updateSubWasteCategory,
  updateWasteItem,
  uploadIconImage,
  uploadModel3D,
} from "../../services";
import toast from "react-hot-toast";

const { TextArea } = Input;

// ─── Constants ────────────────────────────────────────────────────────────────

const MAIN_CATEGORIES = [
  { value: "RECYCLABLE", label: "Tái chế được", color: "blue" },
  { value: "ORGANIC", label: "Hữu cơ", color: "green" },
  { value: "HAZARDOUS", label: "Nguy hại", color: "red" },
  { value: "GENERAL", label: "Rác thông thường", color: "default" },
];
const CATEGORY_STYLE = {
  RECYCLABLE: "bg-blue-50 text-blue-600 border-blue-200",
  ORGANIC: "bg-green-50 text-green-600 border-green-200",
  HAZARDOUS: "bg-red-50 text-red-600 border-red-200",
  GENERAL: "bg-gray-50 text-gray-600 border-gray-200",
};
const CATEGORY_LABEL = {
  RECYCLABLE: "Tái chế được",
  ORGANIC: "Hữu cơ",
  HAZARDOUS: "Nguy hại",
  GENERAL: "Rác thông thường",
};

// ─── Animations ───────────────────────────────────────────────────────────────

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

function ImageUploadInput({
  previewUrl,
  setPreviewUrl,
  onUploadedUrl,
  isUploading,
  setIsUploading,
  uploadFn,
  isModel = false,
  label = "Tải ảnh",
}) {
  const inputId = `img-upload-${Math.random().toString(36).slice(2, 7)}`;

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const data = new FormData();
      data.append("file", file);

      const uploadedUrl = await uploadFn(data);

      if (uploadedUrl) {
        onUploadedUrl(uploadedUrl);
        toast.success("Tải lên thành công!");
      } else {
        toast.error("Tải lên thất bại!");
        setPreviewUrl(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải ảnh lên!");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="relative inline-block">
      {previewUrl ? (
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-xl border-2 border-gray-200 overflow-hidden">
            {isUploading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <Spin size="small" />
              </div>
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setPreviewUrl(null);
              onUploadedUrl(null);
            }}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm transition-colors"
          >
            <CloseCircleOutlined style={{ fontSize: 14 }} />
          </button>
        </div>
      ) : (
        // Drop zone — click mở file picker
        <label
          htmlFor={inputId}
          className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          {isUploading ? (
            <Spin size="small" />
          ) : (
            <>
              <InboxOutlined className="text-2xl text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">{label}</span>
            </>
          )}
        </label>
      )}
      {/* Input ẩn — chỉ nhận image */}
      <input
        id={inputId}
        type="file"
        accept={isModel ? ".glb,.gltf" : "image/*"}
        className="hidden"
        onChange={handleChange}
        disabled={isUploading}
      />
    </div>
  );
}

function WasteItemModalForm({
  imageUrl,
  setImageUrl,
  onUploadedUrl,
  isUploading,
  setIsUploading,
  subCategories,
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-700 mb-2">
        Hình ảnh vật phẩm
      </p>
      <ImageUploadInput
        previewUrl={imageUrl}
        setPreviewUrl={setImageUrl}
        onUploadedUrl={onUploadedUrl}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        uploadFn={uploadModel3D}
        isModel={true}
        label="Tải model 3D"
      />

      <Form.Item
        label="Tên vật phẩm"
        name="itemName"
        rules={[{ required: true, message: "Nhập tên vật phẩm" }]}
        className="mt-3"
      >
        <Input placeholder="VD: Chai nhựa PET" className="rounded-lg" />
      </Form.Item>

      <Form.Item label="Phân loại phụ (Sub-category)" name="subCategoryId">
        <Select
          placeholder="Chọn phân loại phụ"
          className="rounded-lg"
          allowClear
          options={subCategories.map((s) => ({
            value: s.id,
            label: `${s.displayName} (${CATEGORY_LABEL[s.category] ?? s.category})`,
          }))}
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
          placeholder="Thông tin thú vị"
          className="rounded-lg"
        />
      </Form.Item>

      <div className="grid grid-cols-2 gap-3">
        <Form.Item label="Thời gian phân hủy" name="decompositionTime">
          <Input placeholder="VD: 450 năm" className="rounded-lg" />
        </Form.Item>
        <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
          <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
        </Form.Item>
      </div>

      <Form.Item label="Mẹo tái chế" name="recyclingTips">
        <TextArea
          rows={2}
          placeholder="Hướng dẫn tái chế"
          className="rounded-lg"
        />
      </Form.Item>
    </div>
  );
}

function SubCategoryModalForm({
  imageUrl,
  setImageUrl,
  onUploadedUrl,
  isUploading,
  setIsUploading,
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-700 mb-2">Icon danh mục</p>
      <ImageUploadInput
        previewUrl={imageUrl}
        setPreviewUrl={setImageUrl}
        onUploadedUrl={onUploadedUrl} // ← URL thật từ BE, sẽ gắn vào payload
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        uploadFn={uploadIconImage}
        isModel={false}
        label="Tải icon"
      />

      <Form.Item
        label="Danh mục chính"
        name="category"
        rules={[{ required: true, message: "Chọn danh mục" }]}
        className="mt-3"
      >
        <Select
          placeholder="Chọn danh mục chính"
          className="rounded-lg"
          options={MAIN_CATEGORIES.map((c) => ({
            value: c.value,
            label: c.label,
          }))}
        />
      </Form.Item>

      <div className="grid grid-cols-2 gap-3">
        <Form.Item
          label="Mã phân loại"
          name="subCategoryCode"
          rules={[{ required: true, message: "Nhập mã" }]}
        >
          <Input
            placeholder="VD: PLASTIC"
            className="rounded-lg"
            onChange={(e) => (e.target.value = e.target.value.toUpperCase())}
          />
        </Form.Item>
        <Form.Item
          label="Tên hiển thị"
          name="displayName"
          rules={[{ required: true, message: "Nhập tên" }]}
        >
          <Input placeholder="VD: Nhựa" className="rounded-lg" />
        </Form.Item>
      </div>

      <Form.Item label="Mô tả" name="description">
        <TextArea
          rows={2}
          placeholder="Mô tả phân loại"
          className="rounded-lg"
        />
      </Form.Item>

      <div className="grid grid-cols-2 gap-3">
        <Form.Item label="Thứ tự hiển thị" name="displayOrder">
          <InputNumber className="w-full rounded-lg" min={0} placeholder="1" />
        </Form.Item>
        <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
          <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
        </Form.Item>
      </div>
    </div>
  );
}

function WasteItemsTab({ wasteItems, subCategories, onRefresh }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [addModelUrl, setAddModelUrl] = useState(null);
  const [addUploadedUrl, setAddUploadedUrl] = useState(null);
  const [addUploading, setAddUploading] = useState(false);
  const [editModelUrl, setEditModelUrl] = useState(null);
  const [editUploadedUrl, setEditUploadedUrl] = useState(null);
  const [editUploading, setEditUploading] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (wasteItems ?? []).filter((i) => {
      const matchSearch =
        i.itemName?.toLowerCase().includes(q) ||
        (i.description ?? "").toLowerCase().includes(q);
      const matchCat = catFilter === "all" || i.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [wasteItems, search, catFilter]);

  const openAdd = () => {
    addForm.resetFields();
    setAddModelUrl(null);
    setAddUploadedUrl(null);
    setIsAddOpen(true);
  };

  const handleAdd = async () => {
    try {
      const vals = await addForm.validateFields();
      const payload = {
        ...vals,
        imageUrl: addUploadedUrl?.data?.url,
      };

      const res = await addWasteItem(payload);
      if (res) {
        toast.success("Thêm vật phẩm thành công!");
      } else {
        toast.error("Thêm vật phẩm thất bại!");
      }

      onRefresh();
      setIsAddOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    editForm.setFieldsValue({
      itemName: item.itemName,
      category: item.category,
      subCategoryId: item.subCategoryId,
      description: item.description,
      funFact: item.funFact,
      decompositionTime: item.decompositionTime,
      recyclingTips: item.recyclingTips,
      isActive: item.isActive,
    });
    setEditModelUrl(item.imageUrl ?? null);
    setEditUploadedUrl(item.imageUrl ?? null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const vals = await editForm.validateFields();
      const payload = {
        ...vals,
        imageUrl: editUploadedUrl,
      };
      const res = await updateWasteItem(editingItem.id, payload);
      if (res) {
        toast.success("Cập nhật rác thành công!");
      } else {
        toast.error("Cập nhật rác thất bại!");
      }

      onRefresh();
      setIsEditOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteWasteItem(id);
      if (res) {
        toast.success("Xóa rác thành công!");
      } else {
        toast.error("Xóa rác thất bại!");
      }
      onRefresh();
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => {
        return <span className="font-medium text-gray-500">{index + 1}</span>;
      },
    },
    {
      title: "Tên vật phẩm",
      key: "itemName",
      render: (_, row) => (
        <div>
          <p className="font-semibold text-gray-800">{row.itemName}</p>
          <p className="text-xs text-gray-400 truncate max-w-[200px]">
            {row.description}
          </p>
        </div>
      ),
    },
    {
      title: "Danh mục",
      key: "category",
      render: (_, row) => (
        <span
          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_STYLE[row.category] ?? CATEGORY_STYLE.GENERAL}`}
        >
          {CATEGORY_LABEL[row.category] ?? row.category}
        </span>
      ),
    },
    {
      title: "Phân loại phụ",
      key: "subCategory",
      render: (_, row) =>
        row.subCategoryDisplayName ? (
          <Tag className="rounded-full">{row.subCategoryDisplayName}</Tag>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        ),
    },
    {
      title: "Trạng thái",
      key: "isActive",
      width: 100,
      render: (_, row) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${row.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}
        >
          {row.isActive ? "Hiện" : "Ẩn"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      render: (_, row) => (
        <div className="flex gap-1">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEdit(row)}
            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(row.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        className="rounded-2xl border-0 shadow-sm"
        bodyStyle={{ padding: 0 }}
      >
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3 justify-between">
          <div className="flex gap-2 flex-1 max-w-2xl">
            <Input
              prefix={<SearchOutlined className="text-gray-300" />}
              placeholder="Tìm vật phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="flex-1 rounded-xl"
            />
            <Select
              value={catFilter}
              onChange={setCatFilter}
              className="w-44"
              options={[
                { value: "all", label: "Tất cả danh mục" },
                ...MAIN_CATEGORIES.map((c) => ({
                  value: c.value,
                  label: c.label,
                })),
              ]}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAdd}
            className="rounded-xl bg-blue-500 border-blue-500 hover:bg-blue-600"
          >
            Thêm vật phẩm
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${catFilter}-${search}`}
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
                  <div className="flex flex-col items-center gap-3 py-16">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <AppstoreOutlined className="text-3xl text-gray-300" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-500">
                        Chưa có vật phẩm rác nào
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Hãy thêm vật phẩm đầu tiên bằng nút phía trên
                      </p>
                    </div>
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

      {/* Add Modal */}
      <Modal
        open={isAddOpen}
        onCancel={() => setIsAddOpen(false)}
        centered
        width={520}
        className="[&_.ant-modal-content]:rounded-2xl"
        title={
          <span className="font-bold text-gray-800">Thêm vật phẩm rác mới</span>
        }
        styles={{
          body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 },
        }}
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
              onClick={handleAdd}
              disabled={addUploading}
              className="flex-1 rounded-xl bg-blue-500 border-blue-500 hover:bg-blue-600 font-semibold"
            >
              Thêm vật phẩm
            </Button>
          </div>
        }
      >
        <Form
          form={addForm}
          layout="vertical"
          initialValues={{ isActive: false }}
        >
          <WasteItemModalForm
            imageUrl={addModelUrl}
            setImageUrl={setAddModelUrl}
            onUploadedUrl={setAddUploadedUrl}
            isUploading={addUploading}
            setIsUploading={setAddUploading}
            subCategories={subCategories}
          />
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        centered
        width={520}
        className="[&_.ant-modal-content]:rounded-2xl"
        title={
          <span className="font-bold text-gray-800">
            Chỉnh sửa: {editingItem?.itemName}
          </span>
        }
        styles={{
          body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 },
        }}
        footer={
          <div className="flex gap-3 pt-1">
            <Button
              onClick={() => setIsEditOpen(false)}
              className="flex-1 rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleSaveEdit}
              disabled={editUploading}
              className="flex-1 rounded-xl bg-green-500 border-green-500 hover:bg-green-600 font-semibold"
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        {editingItem && (
          <Form
            form={editForm}
            layout="vertical"
            initialValues={{ imageUrl: editingItem?.imageUrl }}
          >
            <WasteItemModalForm
              imageUrl={editModelUrl}
              setImageUrl={setEditModelUrl}
              onUploadedUrl={setEditUploadedUrl}
              isUploading={editUploading}
              setIsUploading={setEditUploading}
              subCategories={subCategories}
            />
          </Form>
        )}
      </Modal>
    </>
  );
}

function SubCategoriesTab({ subCategories, onRefresh }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [addImageUrl, setAddImageUrl] = useState(null);
  const [addUploadedUrl, setAddUploadedUrl] = useState(null);
  const [addUploading, setAddUploading] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState(null);
  const [editUploadedUrl, setEditUploadedUrl] = useState(null);
  const [editUploading, setEditUploading] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (subCategories ?? []).filter((s) => {
      const matchSearch =
        s.displayName.toLowerCase().includes(q) ||
        s.subCategoryCode.toLowerCase().includes(q);
      const matchCat = catFilter === "all" || s.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [subCategories, search, catFilter]);

  const openAdd = () => {
    addForm.resetFields();
    addForm.setFieldsValue({ isActive: true, displayOrder: 1 });
    setAddImageUrl(null);
    setAddUploadedUrl(null);
    setIsAddOpen(true);
  };

  const handleAdd = async () => {
    try {
      const vals = await addForm.validateFields();

      const payload = {
        category: vals.category,
        subCategoryCode: (vals.subCategoryCode ?? "").toUpperCase(),
        displayName: vals.displayName,
        description: vals.description ?? "",
        iconUrl: addUploadedUrl?.data?.url ?? null,
        displayOrder: vals.displayOrder ?? 1,
        isActive: vals.isActive ?? true,
      };

      const res = await addNewSubWasteCategory(payload);
      console.log(res);
      if (res) {
        toast.success("Thêm phân loại phụ thành công!");
      } else {
        toast.error("Thêm phân loại phụ thất bại!");
      }
      onRefresh?.();
      setIsAddOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    editForm.setFieldsValue({
      category: item.category,
      subCategoryCode: item.subCategoryCode,
      displayName: item.displayName,
      description: item.description,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setEditImageUrl(item.iconPresignedUrl ?? null);
    setEditUploadedUrl(item.iconUrl ?? null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const vals = await editForm.validateFields();
      const payload = {
        category: vals.category,
        subCategoryCode: (vals.subCategoryCode ?? "").toUpperCase(),
        displayName: vals.displayName,
        description: vals.description ?? "",
        iconUrl:
          editUploadedUrl?.split("%")[0] ?? editingItem.iconUrl?.split("%")[0],
        displayOrder: vals.displayOrder ?? 1,
        isActive: vals.isActive ?? true,
      };
      console.log(editingItem);
      const res = await updateSubWasteCategory(editingItem.id, payload);
      if (res) {
        toast.success("Cập nhật phân loại phụ thành công!");
      } else {
        toast.error("Cập nhật phân loại phụ thất bại!");
      }

      onRefresh?.();
      setIsEditOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteSubWasteCategory(id);
      if (res) {
        toast.success("Xóa phân loại phụ thành công!");
      } else {
        toast.error("Xóa phân loại phụ thất bại!");
      }
      onRefresh();
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      title: "Icon",
      key: "icon",
      width: 70,
      render: (_, row) =>
        row.iconPresignedUrl ? (
          <img
            src={row.iconPresignedUrl}
            alt={row.displayName}
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
            <TagsOutlined />
          </div>
        ),
    },
    {
      title: "Tên phân loại",
      key: "displayName",
      render: (_, row) => (
        <div>
          <p className="font-semibold text-gray-800">{row.displayName}</p>
          <p className="text-xs text-gray-400 font-mono">
            {row.subCategoryCode}
          </p>
        </div>
      ),
    },
    {
      title: "Danh mục chính",
      key: "category",
      render: (_, row) => (
        <span
          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_STYLE[row.category] ?? CATEGORY_STYLE.GENERAL}`}
        >
          {CATEGORY_LABEL[row.category] ?? row.category}
        </span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <span className="text-gray-500 text-sm truncate block max-w-[200px]">
          {text || "—"}
        </span>
      ),
    },
    {
      title: "Thứ tự",
      dataIndex: "displayOrder",
      key: "displayOrder",
      width: 80,
      render: (v) => <span className="text-gray-500 text-sm">{v}</span>,
    },
    {
      title: "Trạng thái",
      key: "isActive",
      width: 100,
      render: (_, row) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${row.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}
        >
          {row.isActive ? "Hiện" : "Ẩn"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      render: (_, row) => (
        <div className="flex gap-1">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEdit(row)}
            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(row.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        className="rounded-2xl border-0 shadow-sm"
        bodyStyle={{ padding: 0 }}
      >
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3 justify-between">
          <div className="flex gap-2 flex-1 max-w-2xl">
            <Input
              prefix={<SearchOutlined className="text-gray-300" />}
              placeholder="Tìm phân loại phụ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="flex-1 rounded-xl"
            />
            <Select
              value={catFilter}
              onChange={setCatFilter}
              className="w-44"
              options={[
                { value: "all", label: "Tất cả danh mục" },
                ...MAIN_CATEGORIES.map((c) => ({
                  value: c.value,
                  label: c.label,
                })),
              ]}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAdd}
            className="rounded-xl bg-purple-500 border-purple-500 hover:bg-purple-600"
          >
            Thêm phân loại
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`sc-${catFilter}-${search}`}
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
                showTotal: (t) => `${t} phân loại`,
                className: "px-6 pb-4",
              }}
              locale={{
                emptyText: (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <TagsOutlined className="text-3xl text-gray-300" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-500">
                        Chưa có phân loại phụ nào
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Hãy thêm phân loại đầu tiên bằng nút phía trên
                      </p>
                    </div>
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

      {/* Add Modal */}
      <Modal
        open={isAddOpen}
        onCancel={() => setIsAddOpen(false)}
        centered
        width={480}
        className="[&_.ant-modal-content]:rounded-2xl"
        title={
          <span className="font-bold text-gray-800">
            Thêm phân loại phụ mới
          </span>
        }
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto", paddingTop: 8 },
        }}
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
              onClick={handleAdd}
              disabled={addUploading}
              className="flex-1 rounded-xl bg-purple-500 border-purple-500 hover:bg-purple-600 font-semibold"
            >
              Thêm phân loại
            </Button>
          </div>
        }
      >
        <Form form={addForm} layout="vertical">
          <SubCategoryModalForm
            imageUrl={addImageUrl}
            setImageUrl={setAddImageUrl}
            onUploadedUrl={setAddUploadedUrl}
            isUploading={addUploading}
            setIsUploading={setAddUploading}
          />
        </Form>
      </Modal>

      <Modal
        open={isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        centered
        width={480}
        className="[&_.ant-modal-content]:rounded-2xl"
        title={
          <span className="font-bold text-gray-800">
            Chỉnh sửa: {editingItem?.displayName}
          </span>
        }
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto", paddingTop: 8 },
        }}
        footer={
          <div className="flex gap-3 pt-1">
            <Button
              onClick={() => setIsEditOpen(false)}
              className="flex-1 rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleSaveEdit}
              disabled={editUploading}
              className="flex-1 rounded-xl bg-green-500 border-green-500 hover:bg-green-600 font-semibold"
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        {editingItem && (
          <Form form={editForm} layout="vertical">
            <SubCategoryModalForm
              imageUrl={editImageUrl}
              setImageUrl={setEditImageUrl}
              onUploadedUrl={setEditUploadedUrl}
              isUploading={editUploading}
              setIsUploading={setEditUploading}
            />
          </Form>
        )}
      </Modal>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminContent = () => {
  const [wasteItems, setWasteItems] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("waste-items");

  const fetchData = async () => {
    try {
      const [res1, res2] = await Promise.all([
        getAllWasteItems(),
        getAllSubWasteCategories(),
      ]);
      setWasteItems(res1?.data ?? res1 ?? []);
      setSubCategories(res2?.data ?? res2 ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được dữ liệu!");
    }
  };
  console.log(subCategories);

  useEffect(() => {
    fetchData();
  }, []);

  const tabItems = [
    {
      key: "waste-items",
      label: (
        <span className="flex items-center gap-2">
          <AppstoreOutlined />
          Vật phẩm rác
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-600 font-semibold">
            {wasteItems.length || ""}
          </span>
        </span>
      ),
      children: (
        <WasteItemsTab
          wasteItems={wasteItems}
          subCategories={subCategories}
          onRefresh={fetchData}
        />
      ),
    },
    {
      key: "sub-categories",
      label: (
        <span className="flex items-center gap-2">
          <TagsOutlined />
          Phân loại phụ
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-600 font-semibold">
            {subCategories.length || ""}
          </span>
        </span>
      ),
      children: (
        <SubCategoriesTab subCategories={subCategories} onRefresh={fetchData} />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Quản lý nội dung game
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Quản lý vật phẩm rác và phân loại trong game phân loại rác
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {MAIN_CATEGORIES.map((cat) => {
            const count = wasteItems.filter(
              (i) => i.category === cat.value,
            ).length;
            return (
              <Card
                key={cat.value}
                className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow"
                bodyStyle={{ padding: "14px 18px" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${CATEGORY_STYLE[cat.value]}`}
                  >
                    {cat.label}
                  </span>
                  <span className="text-2xl font-bold text-gray-800">
                    {count}
                  </span>
                </div>
              </Card>
            );
          })}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="[&_.ant-tabs-nav]:mb-4 [&_.ant-tabs-tab]:font-medium [&_.ant-tabs-tab-active]:font-bold"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminContent;
