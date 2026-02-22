import { useState, useMemo, lazy, Suspense } from "react";
import {
  Table,
  Button,
  Badge,
  Card,
  Modal,
  Form,
  Input,
  Tag,
  Statistic,
  Progress,
} from "antd";
import {
  CreditCardOutlined,
  EditOutlined,
  CheckOutlined,
  StarOutlined,
  ReloadOutlined,
  CrownOutlined,
  BankOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

// ─── Demo Data ────────────────────────────────────────────────────────────────

const INITIAL_PLANS = [
  {
    id: 1,
    name: "Cơ bản",
    price: "500K",
    priceValue: 500000,
    period: "/tháng",
    students: 200,
    schools: 45,
    popular: false,
    colorTw: "bg-blue-500",
    colorHex: "#3b82f6",
    icon: "bank",
    features: [
      "Tối đa 200 học sinh",
      "Trò chơi phân loại cơ bản",
      "Bảng xếp hạng lớp",
      "Báo cáo tháng",
    ],
  },
  {
    id: 2,
    name: "Tiêu chuẩn",
    price: "1.2M",
    priceValue: 1200000,
    period: "/tháng",
    students: 500,
    schools: 72,
    popular: true,
    colorTw: "bg-green-500",
    colorHex: "#22c55e",
    icon: "star",
    features: [
      "Tối đa 500 học sinh",
      "Đầy đủ trò chơi",
      "Bảng xếp hạng toàn trường",
      "Báo cáo tuần",
      "Hỗ trợ ưu tiên",
    ],
  },
  {
    id: 3,
    name: "Nâng cao",
    price: "2.5M",
    priceValue: 2500000,
    period: "/tháng",
    students: 1000,
    schools: 28,
    popular: false,
    colorTw: "bg-purple-500",
    colorHex: "#a855f7",
    icon: "crown",
    features: [
      "Không giới hạn học sinh",
      "Tất cả tính năng",
      "Tuỳ chỉnh thương hiệu",
      "Báo cáo thời gian thực",
      "API tích hợp",
      "Hỗ trợ 24/7",
    ],
  },
];

// ─── Lazy-loaded Edit Modal Body ──────────────────────────────────────────────

const EditModalBody = lazy(() =>
  Promise.resolve({
    default: ({ form, plan }) => (
      <div className="space-y-4 py-2">
        <Form.Item
          label="Tên gói"
          name="name"
          rules={[{ required: true, message: "Nhập tên gói" }]}
        >
          <Input className="rounded-lg" placeholder="VD: Cơ bản" />
        </Form.Item>
        <Form.Item
          label="Giá (VNĐ/tháng)"
          name="priceValue"
          rules={[{ required: true }]}
        >
          <Input type="number" className="rounded-lg" placeholder="500000" />
        </Form.Item>
        <Form.Item
          label="Số học sinh tối đa"
          name="students"
          rules={[{ required: true }]}
        >
          <Input type="number" className="rounded-lg" placeholder="200" />
        </Form.Item>
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const planCardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: "easeOut" },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PlanIcon = ({ type, className = "text-2xl text-white" }) => {
  const map = {
    bank: <BankOutlined className={className} />,
    star: <StarOutlined className={className} />,
    crown: <CrownOutlined className={className} />,
  };
  return map[type] || <CreditCardOutlined className={className} />;
};

// ─── Main Component ────────────────────────────────────────────────────────────

const AdminSubscriptions = () => {
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form] = Form.useForm();

  // ── Derived stats ──
  const totalSchools = useMemo(
    () => plans.reduce((s, p) => s + p.schools, 0),
    [plans],
  );
  const totalRevenue = useMemo(
    () => plans.reduce((s, p) => s + p.priceValue * p.schools, 0),
    [plans],
  );

  // ── Handlers ──
  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    form.setFieldsValue({
      name: plan.name,
      priceValue: plan.priceValue,
      students: plan.students,
    });
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setPlans((prev) =>
        prev.map((p) =>
          p.id === selectedPlan.id
            ? {
                ...p,
                name: values.name,
                priceValue: Number(values.priceValue),
                students: Number(values.students),
                price: `${(Number(values.priceValue) / 1000).toFixed(0)}K`,
              }
            : p,
        ),
      );
      setIsEditOpen(false);
    } catch (_) {}
  };

  // ── Table columns ──
  const tableColumns = [
    {
      title: "Gói",
      key: "name",
      render: (_, plan) => (
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: plan.colorHex }}
          />
          <span className="font-semibold text-gray-800">{plan.name}</span>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (v) => (
        <span className="text-gray-700">
          {v}
          <span className="text-gray-400 text-xs">/tháng</span>
        </span>
      ),
    },
    {
      title: "Số trường",
      dataIndex: "schools",
      key: "schools",
      render: (v) => <span className="font-medium">{v}</span>,
    },
    {
      title: "Doanh thu/tháng",
      key: "revenue",
      render: (_, plan) => (
        <span className="font-semibold text-gray-800">
          {((plan.priceValue * plan.schools) / 1_000_000).toFixed(1)}M
        </span>
      ),
    },
    {
      title: "% Tổng",
      key: "percent",
      render: (_, plan) => {
        const pct =
          totalSchools > 0
            ? Math.round((plan.schools / totalSchools) * 100)
            : 0;
        return (
          <div className="flex items-center gap-3 min-w-[140px]">
            <Progress
              percent={pct}
              showInfo={false}
              strokeColor={plan.colorHex}
              trailColor="#f3f4f6"
              size="small"
              className="flex-1"
            />
            <span className="text-sm text-gray-500 w-10 text-right">
              {pct}%
            </span>
          </div>
        );
      },
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        className="max-w-7xl mx-auto space-y-8"
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
              Gói đăng ký
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Quản lý các gói dịch vụ và định giá
            </p>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div variants={itemVariants}>
            <Card
              className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow duration-300"
              bodyStyle={{ padding: "20px 24px" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <CreditCardOutlined className="text-2xl text-blue-500" />
                </div>
                <Statistic
                  value={totalSchools}
                  title={
                    <span className="text-sm text-gray-400">
                      Trường đăng ký
                    </span>
                  }
                  valueStyle={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#1e293b",
                  }}
                />
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card
              className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow duration-300"
              bodyStyle={{ padding: "20px 24px" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <StarOutlined className="text-2xl text-green-500" />
                </div>
                <Statistic
                  value={`₫${(totalRevenue / 1_000_000).toFixed(1)}M`}
                  title={
                    <span className="text-sm text-gray-400">
                      Doanh thu/tháng
                    </span>
                  }
                  valueStyle={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#1e293b",
                  }}
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ── Plan Cards ── */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              variants={planCardVariants}
              custom={i}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative"
            >
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
                >
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Phổ biến nhất
                  </span>
                </motion.div>
              )}

              <Card
                className={`rounded-2xl h-full flex flex-col border-2 transition-all duration-300
                  ${
                    plan.popular
                      ? "border-green-400 shadow-lg shadow-green-100"
                      : "border-gray-100 shadow-sm hover:border-gray-200"
                  }`}
                bodyStyle={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {/* Plan header */}
                <div className="text-center mb-5">
                  <div
                    className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-md ${plan.colorTw}`}
                  >
                    <PlanIcon type={plan.icon} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {plan.name}
                  </h3>
                  <div className="mt-3">
                    <span className="text-4xl font-extrabold text-gray-800">
                      {plan.price}
                    </span>
                    <span className="text-gray-400 text-sm ml-1">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Tối đa {plan.students.toLocaleString()} học sinh
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-5">
                  {plan.features.map((feat, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckOutlined className="text-green-500 flex-shrink-0" />
                      {feat}
                    </motion.li>
                  ))}
                </ul>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-400">
                      Trường đang dùng
                    </span>
                    <Tag color="default" className="rounded-full text-xs">
                      {plan.schools} trường
                    </Tag>
                  </div>
                  <Button
                    block
                    icon={<EditOutlined />}
                    onClick={() => handleEditPlan(plan)}
                    className="rounded-xl border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    Chỉnh sửa gói
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Detail Table ── */}
        <motion.div variants={itemVariants}>
          <Card
            className="rounded-2xl border-0 shadow-sm"
            title={
              <span className="font-bold text-gray-800">Chi tiết theo gói</span>
            }
            bodyStyle={{ padding: 0 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Table
                  dataSource={plans}
                  columns={tableColumns}
                  rowKey="id"
                  pagination={false}
                  className="[&_.ant-table-thead_th]:bg-gray-50 [&_.ant-table-thead_th]:text-gray-500 [&_.ant-table-thead_th]:font-medium"
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
              </motion.div>
            </AnimatePresence>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Edit Modal ── */}
      <Modal
        open={isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-blue-500" />
            <span className="font-bold text-gray-800">
              Chỉnh sửa gói {selectedPlan?.name}
            </span>
          </div>
        }
        centered
        className="[&_.ant-modal-content]:rounded-2xl"
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
              onClick={handleSave}
              className="flex-1 rounded-xl bg-green-500 border-green-500 hover:bg-green-600 font-semibold"
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-32 text-gray-400 gap-2">
                <ReloadOutlined spin />
                Đang tải...
              </div>
            }
          >
            <EditModalBody form={form} plan={selectedPlan} />
          </Suspense>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminSubscriptions;
