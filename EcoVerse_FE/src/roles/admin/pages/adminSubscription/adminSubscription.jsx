import { useState, useMemo, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Modal,
  Form,
  Input,
  Tag,
  Statistic,
  Progress,
  Select,
  InputNumber,
  Tooltip,
  Switch,
  Popconfirm,
  Segmented,
} from "antd";
import {
  CreditCardOutlined,
  EditOutlined,
  CheckOutlined,
  StarOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  PoweroffOutlined,
  StopOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import {
  addNewSubscriptionPackage,
  deleteSubsciptionPackage,
  getAllSubscriptionPackages,
  toggleSubsciptionActive,
  updateSubscriptionPackage,
} from "../../services";
import toast from "react-hot-toast";

const SUBSCRIBER_TYPES = [
  { value: "SCHOOL", label: "Trường học" },
  { value: "PARTNERSHIP", label: "Đối tác" },
];
const CURRENCIES = ["VND", "USD"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const fmtPrice = (v) => {
  if (!v && v !== 0) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return `${v}`;
};
// Màu theo subscriberType: SCHOOL=xanh dương, PARTNERSHIP=xanh lá
const getPlanColor = (plan) =>
  plan.subscriberType === "SCHOOL" ? "#3b82f6" : "#22c55e";

// ─── Plan Form Modal ──────────────────────────────────────────────────────────
const PlanFormModal = ({ open, onClose, onSave, initialValues, isCreate }) => {
  const [form] = Form.useForm();
  const [featureKeys, setFeatureKeys] = useState([""]);
  const subscriberType = Form.useWatch("subscriberType", form);

  // Auto-set values when subscriberType is SCHOOL
  useEffect(() => {
    if (subscriberType === "SCHOOL") {
      form.setFieldsValue({
        maxRoundsPerCampaign: 1,
        maxSchoolsPerCampaign: 1,
      });
    }
  }, [subscriberType, form]);

  useEffect(() => {
    if (!open) return;
    const featureValues = initialValues
      ? Object.values(initialValues.features || {})
      : [""];
    setFeatureKeys(featureValues.length > 0 ? featureValues : [""]);
    const featFields = featureValues.reduce((acc, v, i) => {
      acc[`feat_key_${i}`] = v;
      return acc;
    }, {});
    form.resetFields();
    form.setFieldsValue(
      initialValues
        ? {
            planCode: initialValues.planCode,
            planName: initialValues.planName,
            subscriberType: initialValues.subscriberType,
            description: initialValues.description,
            durationDays: initialValues.durationDays,
            price: initialValues.price,
            currency: initialValues.currency,
            maxStudents: initialValues.maxStudents,
            maxCampaignsPerMonth: initialValues.maxCampaignsPerMonth,
            maxRoundsPerCampaign: initialValues.maxRoundsPerCampaign,
            maxSchoolsPerCampaign: initialValues.maxSchoolsPerCampaign,
            maxAiQuizGenerationsPerPeriod:
              initialValues.maxAiQuizGenerationsPerPeriod,
            gracePeriodDays: initialValues.gracePeriodDays,
            displayOrder: initialValues.displayOrder,
            ...featFields,
          }
        : {
            subscriberType: "SCHOOL",
            currency: "VND",
            durationDays: 30,
            gracePeriodDays: 7,
            displayOrder: 1,
            maxCampaignsPerMonth: 3,
            maxRoundsPerCampaign: 3,
            maxSchoolsPerCampaign: 1,
            maxAiQuizGenerationsPerPeriod: 0,
          },
    );
  }, [open, initialValues]);

  const handleOk = async () => {
    try {
      const vals = await form.validateFields();
      const features = {};
      let propIdx = 1;
      featureKeys.forEach((_, i) => {
        const val = vals[`feat_key_${i}`];
        if (val?.trim()) {
          features[`additionalProp${propIdx}`] = val.trim();
          propIdx++;
        }
      });
      onSave({
        planCode: vals.planCode,
        planName: vals.planName,
        subscriberType: vals.subscriberType,
        description: vals.description || "",
        durationDays: Number(vals.durationDays),
        price: Number(vals.price),
        currency: vals.currency,
        maxStudents: Number(vals.maxStudents),
        maxCampaignsPerMonth: Number(vals.maxCampaignsPerMonth),
        maxRoundsPerCampaign: Number(vals.maxRoundsPerCampaign),
        maxSchoolsPerCampaign: Number(vals.maxSchoolsPerCampaign),
        maxAiQuizGenerationsPerPeriod: Number(
          vals.maxAiQuizGenerationsPerPeriod,
        ),
        features,
        gracePeriodDays: Number(vals.gracePeriodDays),
        displayOrder: Number(vals.displayOrder),
      });
    } catch (_) {}
  };

  const lbl = "text-sm font-medium";
  const inp = "rounded-lg";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      width={700}
      className="[&_.ant-modal-content]:rounded-2xl"
      styles={{ body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }}
      title={
        <div className="flex items-center gap-2">
          {isCreate ? (
            <PlusOutlined className="text-green-500" />
          ) : (
            <EditOutlined className="text-blue-500" />
          )}
          <span className="font-bold text-gray-800">
            {isCreate
              ? "Tạo gói đăng ký mới"
              : `Chỉnh sửa: ${initialValues?.planName}`}
          </span>
        </div>
      }
      footer={
        <div className="flex gap-3 pt-1">
          <Button onClick={onClose} className="flex-1 rounded-xl">
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleOk}
            className={`flex-1 rounded-xl font-semibold ${isCreate ? "bg-green-500 border-green-500 hover:bg-green-600" : "bg-blue-500 border-blue-500 hover:bg-blue-600"}`}
          >
            {isCreate ? "Tạo gói" : "Lưu thay đổi"}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <div className="bg-gray-50 rounded-xl p-4 mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Thông tin cơ bản
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={
                <span className={lbl}>
                  Tên gói <span className="text-red-500">*</span>
                </span>
              }
              name="planName"
              rules={[{ required: true, message: "Nhập tên gói" }]}
            >
              <Input className={inp} placeholder="VD: Tiêu chuẩn" />
            </Form.Item>
            <Form.Item
              label={
                <span className={`flex items-center gap-1 ${lbl}`}>
                  Mã gói <span className="text-red-500">*</span>
                  <Tooltip
                    title={
                      isCreate
                        ? "Mã định danh nội bộ — chỉ tạo 1 lần, không thể chỉnh sửa sau khi lưu"
                        : "Không thể chỉnh sửa sau khi tạo"
                    }
                  >
                    <InfoCircleOutlined className="text-gray-400 text-xs" />
                  </Tooltip>
                </span>
              }
              name="planCode"
              rules={[{ required: true, message: "Nhập mã gói" }]}
              extra={
                isCreate ? (
                  <span className="text-amber-500 text-xs">
                    ⚠️ Quan trọng — chỉ tạo 1 lần, không thể chỉnh sửa
                  </span>
                ) : undefined
              }
            >
              <Input
                className={inp}
                placeholder="VD: STANDARD"
                disabled={!isCreate}
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={
                <span className={`flex items-center gap-1 ${lbl}`}>
                  Loại đối tượng
                  {isCreate && (
                    <Tooltip title="Quyết định màu sắc và phân loại gói — chỉ tạo 1 lần, không thể thay đổi">
                      <InfoCircleOutlined className="text-gray-400 text-xs" />
                    </Tooltip>
                  )}
                </span>
              }
              name="subscriberType"
              extra={
                isCreate ? (
                  <span className="text-amber-500 text-xs">
                    ⚠️ Quan trọng — chỉ tạo 1 lần, không thể chỉnh sửa
                  </span>
                ) : undefined
              }
            >
              <Select
                className="w-full"
                options={SUBSCRIBER_TYPES}
                disabled={!isCreate}
              />
            </Form.Item>
            <Form.Item
              label={
                <span className={`flex items-center gap-1 ${lbl}`}>
                  Thứ tự hiển thị
                  <Tooltip title="Số nhỏ hơn hiển thị trước">
                    <InfoCircleOutlined className="text-gray-400 text-xs" />
                  </Tooltip>
                </span>
              }
              name="displayOrder"
            >
              <InputNumber
                className="w-full rounded-lg"
                min={0}
                placeholder="1"
              />
            </Form.Item>
          </div>
          <Form.Item
            label={<span className={lbl}>Mô tả</span>}
            name="description"
          >
            <Input.TextArea
              rows={2}
              className={inp}
              placeholder="Mô tả ngắn về gói dịch vụ..."
            />
          </Form.Item>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Giá & Thời hạn
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Form.Item
              label={
                <span className={lbl}>
                  Giá <span className="text-red-500">*</span>
                </span>
              }
              name="price"
              rules={[{ required: true }]}
            >
              <InputNumber
                className="w-full rounded-lg"
                min={0}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(v) => v.replace(/,/g, "")}
                placeholder="500000"
              />
            </Form.Item>
            <Form.Item
              label={<span className={lbl}>Tiền tệ</span>}
              name="currency"
            >
              <Select
                className="w-full"
                options={CURRENCIES.map((c) => ({ value: c, label: c }))}
              />
            </Form.Item>
            <Form.Item
              label={
                <span className={lbl}>
                  Thời hạn (ngày) <span className="text-red-500">*</span>
                </span>
              }
              name="durationDays"
              rules={[{ required: true }]}
            >
              <InputNumber
                className="w-full rounded-lg"
                min={1}
                placeholder="30"
              />
            </Form.Item>
          </div>
          <Form.Item
            label={
              <span className={`flex items-center gap-1 ${lbl}`}>
                Gia hạn thêm (ngày)
                <Tooltip title="Số ngày cho phép dùng tiếp sau khi hết hạn trước khi tự động khóa">
                  <InfoCircleOutlined className="text-gray-400 text-xs" />
                </Tooltip>
              </span>
            }
            name="gracePeriodDays"
          >
            <InputNumber
              className="w-full rounded-lg"
              min={0}
              placeholder="7"
            />
          </Form.Item>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Giới hạn sử dụng
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={
                <span className={lbl}>
                  Học sinh tối đa <span className="text-red-500">*</span>
                </span>
              }
              name="maxStudents"
              rules={[{ required: true }]}
            >
              <InputNumber
                className="w-full rounded-lg"
                min={0}
                placeholder="200"
              />
            </Form.Item>
            <Form.Item
              label={<span className={lbl}>Chiến dịch/tháng</span>}
              name="maxCampaignsPerMonth"
            >
              <InputNumber
                className="w-full rounded-lg"
                min={1}
                placeholder="3"
              />
            </Form.Item>
            <Form.Item
              label={<span className={lbl}>Vòng/chiến dịch</span>}
              name="maxRoundsPerCampaign"
            >
              <InputNumber
                className="w-full rounded-lg"
                min={1}
                placeholder="3"
                disabled={subscriberType === "SCHOOL"}
              />
            </Form.Item>
            <Form.Item
              label={
                <span className={`flex items-center gap-1 ${lbl}`}>
                  Trường/chiến dịch
                  <Tooltip title="Số trường tối đa trong 1 chiến dịch liên trường">
                    <InfoCircleOutlined className="text-gray-400 text-xs" />
                  </Tooltip>
                </span>
              }
              name="maxSchoolsPerCampaign"
            >
              <InputNumber
                className="w-full rounded-lg"
                min={1}
                placeholder="1"
                disabled={subscriberType === "SCHOOL"}
              />
            </Form.Item>
            <Form.Item
              label={
                <span className={`flex items-center gap-1 ${lbl}`}>
                  Lượt tạo Quiz AI
                  <Tooltip title="Số lượt cho phép AI tạo quiz trong thời gian sử dụng gói">
                    <InfoCircleOutlined className="text-gray-400 text-xs" />
                  </Tooltip>
                </span>
              }
              name="maxAiQuizGenerationsPerPeriod"
            >
              <InputNumber
                className="w-full rounded-lg"
                min={0}
                placeholder="10"
              />
            </Form.Item>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Tính năng (features)
            </p>
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setFeatureKeys((p) => [...p, ""])}
              className="rounded-lg text-xs"
            >
              Thêm
            </Button>
          </div>
          <div className="space-y-2">
            {featureKeys.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Form.Item name={`feat_key_${i}`} className="mb-0 flex-1">
                  <Input className="rounded-lg" placeholder="VD: Hỗ trợ 24/7" />
                </Form.Item>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={featureKeys.length <= 1}
                  onClick={() =>
                    setFeatureKeys((p) => p.filter((_, j) => j !== i))
                  }
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Mỗi dòng là 1 tính năng hiển thị trên card gói đăng ký.
          </p>
        </div>
      </Form>
    </Modal>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminSubscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(""); // NEW: search by planCode/planName

  const fetchSubscriptionPackages = async () => {
    try {
      const res = await getAllSubscriptionPackages();
      setPlans(res?.data || res || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSubscriptionPackages();
  }, []);

  // Filter: type + search
  const filteredPlans = useMemo(() => {
    let result =
      typeFilter === "ALL"
        ? plans
        : plans.filter((p) => p.subscriberType === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.planCode?.toLowerCase().includes(q) ||
          p.planName?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [plans, typeFilter, searchQuery]);

  const totalSchools = useMemo(
    () => plans.reduce((s, p) => s + (p.schools || 0), 0),
    [plans],
  );
  const totalRevenue = useMemo(
    () => plans.reduce((s, p) => s + p.price * (p.schools || 0), 0),
    [plans],
  );
  const activeCount = useMemo(
    () => plans.filter((p) => p.isActive).length,
    [plans],
  );

  const handleCreate = async (data) => {
    try {
      const res = await addNewSubscriptionPackage(data);
      if (res) {
        toast.success("Tạo gói đăng ký mới thành công!");
        fetchSubscriptionPackages();
      } else toast.error("Tạo gói đăng ký mới thất bại!");
    } catch (e) {
      console.log(e);
    }
    setIsCreateOpen(false);
  };

  const handleEdit = async (data) => {
    try {
      const res = await updateSubscriptionPackage(selectedPlan.id, data);
      if (res) {
        toast.success("Cập nhật gói đăng ký thành công!");
        fetchSubscriptionPackages();
      } else toast.error("Cập nhật gói đăng ký thất bại!");
    } catch (e) {
      console.log(e);
    }
    setIsEditOpen(false);
  };

  const handleToggleActive = async (plan) => {
    try {
      const res = await toggleSubsciptionActive(plan.id);
      if (res) {
        toast.success(
          plan.isActive
            ? "Vô hiệu gói đăng ký thành công!"
            : "Kích hoạt gói thành công!",
        );
        fetchSubscriptionPackages();
      } else {
        toast.error(
          plan.isActive
            ? "Vô hiệu gói đăng ký thất bại!"
            : "Kích hoạt gói thất bại!",
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeletePlan = async (plan) => {
    try {
      const res = await deleteSubsciptionPackage(plan.id);
      if (res) {
        toast.success("Xóa gói đăng ký thành công!");
        fetchSubscriptionPackages();
      } else toast.error("Xóa gói đăng ký thất bại!");
    } catch (e) {
      console.log(e);
    }
  };

  const openEdit = (plan) => {
    setSelectedPlan(plan);
    setIsEditOpen(true);
  };

  const tableColumns = [
    {
      title: "Gói",
      key: "plan",
      render: (_, plan) => {
        const color = getPlanColor(plan);
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-2.5 h-8 rounded-full flex-shrink-0"
              style={{ background: plan.isActive ? color : "#d1d5db" }}
            />
            <div>
              <div className="flex items-center gap-2">
                <p
                  className={`font-semibold leading-tight ${plan.isActive ? "text-gray-800" : "text-gray-400"}`}
                >
                  {plan.planName}
                </p>
                {!plan.isActive && (
                  <Tag color="default" className="rounded-full text-xs">
                    Tắt
                  </Tag>
                )}
              </div>
              <p className="text-xs text-gray-400 font-mono">{plan.planCode}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Loại",
      key: "type",
      render: (_, plan) => (
        <Tag
          color={plan.subscriberType === "SCHOOL" ? "blue" : "cyan"}
          className="rounded-full"
        >
          {plan.subscriberType === "SCHOOL" ? "Trường học" : "Đối tác"}
        </Tag>
      ),
    },
    {
      title: "Giá",
      key: "price",
      render: (_, plan) => (
        <span
          className={`font-medium ${plan.isActive ? "text-gray-700" : "text-gray-400"}`}
        >
          {fmtPrice(plan.price)}
          <span className="text-gray-400 text-xs ml-1">
            {plan.currency}/{plan.durationDays}ngày
          </span>
        </span>
      ),
    },
    {
      title: "Giới hạn",
      key: "limits",
      render: (_, plan) => (
        <div
          className={`text-xs space-y-0.5 ${plan.isActive ? "text-gray-500" : "text-gray-400"}`}
        >
          <p>
            {plan.maxStudents >= 9000
              ? "∞"
              : plan.maxStudents?.toLocaleString()}{" "}
            học sinh
          </p>
          <p>{plan.maxCampaignsPerMonth} chiến dịch/tháng</p>
          <p>{plan.maxAiQuizGenerationsPerPeriod} lượt AI Quiz</p>
        </div>
      ),
    },
    {
      title: "Số trường",
      dataIndex: "schools",
      key: "schools",
      render: (v, plan) => (
        <span
          className={`font-medium ${plan.isActive ? "text-gray-800" : "text-gray-400"}`}
        >
          {v ?? 0}
        </span>
      ),
    },
    {
      title: "Doanh thu/tháng",
      key: "revenue",
      render: (_, plan) => (
        <span
          className={`font-semibold ${plan.isActive ? "text-gray-800" : "text-gray-400"}`}
        >
          {fmtPrice(plan.price * (plan.schools || 0))}
        </span>
      ),
    },
    {
      title: "% Tổng",
      key: "percent",
      render: (_, plan) => {
        const pct =
          totalSchools > 0
            ? Math.round(((plan.schools || 0) / totalSchools) * 100)
            : 0;
        const color = plan.isActive ? getPlanColor(plan) : "#d1d5db";
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <Progress
              percent={pct}
              showInfo={false}
              strokeColor={color}
              trailColor="#f3f4f6"
              size="small"
              className="flex-1"
            />
            <span
              className={`text-sm w-9 text-right ${plan.isActive ? "text-gray-500" : "text-gray-400"}`}
            >
              {pct}%
            </span>
          </div>
        );
      },
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, plan) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(plan)}
            className="rounded-lg border-gray-200 hover:border-blue-400"
          >
            Sửa
          </Button>
          <Popconfirm
            title={plan.isActive ? "Tắt gói này?" : "Bật gói này?"}
            description={
              plan.isActive
                ? "Trường mới sẽ không thể đăng ký gói này."
                : "Gói sẽ hiển thị và cho phép đăng ký trở lại."
            }
            onConfirm={() => handleToggleActive(plan)}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ danger: plan.isActive }}
          >
            <Button
              size="small"
              icon={plan.isActive ? <StopOutlined /> : <PoweroffOutlined />}
              className={`rounded-lg ${plan.isActive ? "border-red-200 text-red-500 hover:border-red-400 hover:text-red-600" : "border-green-200 text-green-600 hover:border-green-400"}`}
            >
              {plan.isActive ? "Tắt" : "Bật"}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        className="max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Gói đăng ký
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Quản lý các gói dịch vụ và định giá
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-md shadow-green-200 transition-colors"
          >
            <PlusOutlined />
            Thêm gói mới
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: <CreditCardOutlined className="text-2xl text-blue-500" />,
              bg: "bg-blue-50",
              value: totalSchools,
              label: "Trường đang dùng",
            },
            {
              icon: <StarOutlined className="text-2xl text-green-500" />,
              bg: "bg-green-50",
              value: `₫${(totalRevenue / 1_000_000).toFixed(1)}M`,
              label: "Doanh thu ước tính/tháng",
            },
            {
              icon: <PoweroffOutlined className="text-2xl text-emerald-500" />,
              bg: "bg-emerald-50",
              value: `${activeCount}/${plans.length}`,
              label: "Gói đang hoạt động",
            },
          ].map((s, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card
                className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow duration-300"
                bodyStyle={{ padding: "20px 24px" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg}`}
                  >
                    {s.icon}
                  </div>
                  <Statistic
                    value={s.value}
                    title={
                      <span className="text-sm text-gray-400">{s.label}</span>
                    }
                    valueStyle={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Cards section */}
        <motion.div variants={itemVariants}>
          {/* ── Toolbar: Search + Type filter ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-bold text-gray-700">Danh sách gói</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder="Tìm theo mã gói hoặc tên gói..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                className="rounded-xl w-72"
              />
              <Segmented
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { label: "Tất cả", value: "ALL" },
                  { label: "Trường học", value: "SCHOOL" },
                  { label: "Đối tác", value: "PARTNERSHIP" },
                ]}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Empty state */}
          {filteredPlans.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <SearchOutlined className="text-4xl mb-3 opacity-40" />
              <p className="text-sm">Không tìm thấy gói nào phù hợp</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs text-blue-500 hover:underline"
                >
                  Xóa tìm kiếm
                </button>
              )}
            </div>
          )}

          {/* Plan Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredPlans.map((plan) => {
                const color = getPlanColor(plan);
                const inactive = !plan.isActive;
                // ── features: hiển thị tối đa 5, badge phần còn lại ──
                const allFeats = Object.values(plan.features || {});
                const visibleFeats = allFeats.slice(0, 5);
                const hiddenCount = allFeats.length - visibleFeats.length;

                return (
                  <motion.div
                    key={plan.id}
                    layout
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={
                      inactive ? {} : { y: -4, transition: { duration: 0.2 } }
                    }
                    className="relative"
                  >
                    {inactive && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-gray-400 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          Đã tắt
                        </span>
                      </div>
                    )}
                    <Card
                      className={`rounded-2xl h-full border-2 transition-all duration-300 ${inactive ? "border-gray-100 shadow-sm opacity-60 grayscale-[30%]" : "border-gray-100 shadow-md hover:shadow-lg hover:border-gray-200"}`}
                      bodyStyle={{
                        padding: "22px",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      <div
                        className="h-1.5 rounded-full mb-4 -mx-[22px] -mt-[22px] rounded-t-2xl"
                        style={{ background: inactive ? "#e5e7eb" : color }}
                      />
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-1">
                          <h3
                            className={`text-lg font-bold ${inactive ? "text-gray-400" : "text-gray-800"}`}
                          >
                            {plan.planName}
                          </h3>
                          <Tag
                            color={
                              plan.subscriberType === "SCHOOL" ? "blue" : "cyan"
                            }
                            className="rounded-full text-xs flex-shrink-0 ml-2"
                          >
                            {plan.subscriberType === "SCHOOL"
                              ? "Trường"
                              : "Đối tác"}
                          </Tag>
                        </div>
                        <p
                          className={`text-xs font-mono mb-2 ${inactive ? "text-gray-300" : "text-gray-400"}`}
                        >
                          {plan.planCode}
                        </p>
                        <p
                          className={`text-sm line-clamp-2 ${inactive ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {plan.description}
                        </p>
                        <div className="mt-3">
                          <span
                            className={`text-2xl font-extrabold ${inactive ? "text-gray-400" : "text-gray-800"}`}
                          >
                            {fmtPrice(plan.price)}
                          </span>
                          <span
                            className={`text-sm ml-1 ${inactive ? "text-gray-300" : "text-gray-400"}`}
                          >
                            {plan.currency}/{plan.durationDays} ngày
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {plan.maxStudents > 0 && (
                          <span
                            className={`text-xs rounded-full px-2.5 py-1 ${inactive ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-600"}`}
                          >
                            {plan.maxStudents >= 9000
                              ? "∞"
                              : plan.maxStudents.toLocaleString()}{" "}
                            học sinh
                          </span>
                        )}
                        <span
                          className={`text-xs rounded-full px-2.5 py-1 ${inactive ? "bg-gray-100 text-gray-400" : "bg-indigo-50 text-indigo-600"}`}
                        >
                          {plan.maxCampaignsPerMonth} chiến dịch/tháng
                        </span>
                        <span
                          className={`text-xs rounded-full px-2.5 py-1 ${inactive ? "bg-gray-100 text-gray-400" : "bg-purple-50 text-purple-600"}`}
                        >
                          {plan.maxRoundsPerCampaign} vòng/chiến dịch
                        </span>
                      </div>

                      {/* Features — tối đa 5 dòng, badge cho phần còn lại */}
                      <ul className="space-y-1.5 flex-1 mb-4">
                        {visibleFeats.map((feat, idx) => (
                          <li
                            key={idx}
                            className={`flex items-center gap-2 text-sm ${inactive ? "text-gray-400" : "text-gray-600"}`}
                          >
                            <CheckOutlined
                              className={
                                inactive ? "text-gray-300" : "text-green-500"
                              }
                            />
                            {feat}
                          </li>
                        ))}
                        {hiddenCount > 0 && (
                          <li
                            className={`flex items-center gap-1.5 text-xs mt-0.5 ${inactive ? "text-gray-300" : "text-gray-400"}`}
                          >
                            <span
                              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold flex-shrink-0 ${inactive ? "bg-gray-200 text-gray-400" : "bg-gray-100 text-gray-500"}`}
                            >
                              +{hiddenCount}
                            </span>
                            tính năng khác — xem trong chỉnh sửa
                          </li>
                        )}
                      </ul>

                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-400">
                            Đang dùng
                          </span>
                          <Tag color="default" className="rounded-full text-xs">
                            {plan.schools ?? 0} trường
                          </Tag>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            block
                            icon={<EditOutlined />}
                            onClick={() => openEdit(plan)}
                            className="rounded-xl border-gray-200 hover:border-blue-400 flex-1"
                          >
                            Sửa
                          </Button>
                          <Popconfirm
                            title={
                              plan.isActive ? "Tắt gói này?" : "Bật gói này?"
                            }
                            description={
                              plan.isActive
                                ? "Trường mới sẽ không thể đăng ký."
                                : "Gói sẽ hiển thị và cho phép đăng ký lại."
                            }
                            onConfirm={() => handleToggleActive(plan)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okButtonProps={{ danger: plan.isActive }}
                          >
                            <Button
                              icon={
                                plan.isActive ? (
                                  <StopOutlined />
                                ) : (
                                  <PoweroffOutlined />
                                )
                              }
                              className={`rounded-xl ${plan.isActive ? "border-red-200 text-red-500 hover:border-red-400" : "border-green-300 text-green-600 hover:border-green-500"}`}
                            >
                              {plan.isActive ? "Tắt" : "Bật"}
                            </Button>
                          </Popconfirm>
                          <Popconfirm
                            title="Xóa gói này?"
                            description="Hành động này không thể hoàn tác."
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                            onConfirm={() => handleDeletePlan(plan)}
                          >
                            <Button
                              icon={<DeleteOutlined />}
                              danger
                              className="rounded-xl"
                            >
                              Xóa
                            </Button>
                          </Popconfirm>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Detail Table */}
        <motion.div variants={itemVariants}>
          <Card
            className="rounded-2xl border-0 shadow-sm"
            title={
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">
                  Chi tiết theo gói
                </span>
                <span className="text-xs text-gray-400 font-normal">
                  {filteredPlans.length} gói
                  {typeFilter !== "ALL" &&
                    ` • ${typeFilter === "SCHOOL" ? "Trường học" : "Đối tác"}`}
                  {searchQuery.trim() && ` • "${searchQuery.trim()}"`}
                </span>
              </div>
            }
            bodyStyle={{ padding: 0 }}
          >
            <Table
              dataSource={filteredPlans}
              columns={tableColumns}
              rowKey="id"
              pagination={false}
              className="[&_.ant-table-thead_th]:bg-gray-50 [&_.ant-table-thead_th]:text-gray-500 [&_.ant-table-thead_th]:font-medium"
              rowClassName={(plan) => (plan.isActive ? "" : "opacity-60")}
              components={{
                body: {
                  row: ({ children, ...props }) => (
                    <motion.tr
                      {...props}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
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
      </motion.div>

      <PlanFormModal
        open={isCreateOpen}
        isCreate
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreate}
        initialValues={null}
      />
      <PlanFormModal
        open={isEditOpen}
        isCreate={false}
        onClose={() => setIsEditOpen(false)}
        onSave={handleEdit}
        initialValues={selectedPlan}
      />
    </div>
  );
};

export default AdminSubscriptions;
