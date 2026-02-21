import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  Table,
  Input,
  Button,
  Badge,
  Tabs,
  Modal,
  Dropdown,
  Card,
  Statistic,
  Tag,
} from "antd";
import {
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  GlobalOutlined,
  FileTextOutlined,
  LinkOutlined,
  ReloadOutlined,
  StopOutlined,
  UnlockOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

// Lazy-loaded detail content
const PartnerDetailContent = lazy(() =>
  Promise.resolve({
    default: ({ reg, PARTNERSHIP_TYPE_LABELS }) => (
      <div className="space-y-5">
        {/* Org Header */}
        <div className="flex items-start gap-4">
          {reg.logo_url ? (
            <img
              src={reg.logo_url}
              alt="Logo"
              className="w-20 h-20 rounded-2xl object-cover shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center shadow-inner">
              <TeamOutlined style={{ fontSize: 32, color: "#3b82f6" }} />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {reg.organization_name}
            </h3>
            <Tag color="blue" className="mt-1">
              {PARTNERSHIP_TYPE_LABELS[reg.partnership_type] ||
                reg.partnership_type}
            </Tag>
          </div>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MailOutlined className="text-gray-400" />
            <span>{reg.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <PhoneOutlined className="text-gray-400" />
            <span>{reg.phone}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600 md:col-span-2">
            <EnvironmentOutlined className="text-gray-400 mt-0.5" />
            <span>{reg.address}</span>
          </div>
          {reg.website && (
            <div className="flex items-center gap-2 text-sm">
              <GlobalOutlined className="text-gray-400" />
              <a
                href={reg.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1"
              >
                {reg.website}
                <LinkOutlined style={{ fontSize: 11 }} />
              </a>
            </div>
          )}
        </div>

        {/* Representative */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <UserOutlined className="text-gray-400" />
            <span className="font-semibold text-gray-700">Người đại diện</span>
          </div>
          <p className="text-gray-800">{reg.representative_name}</p>
          {reg.representative_position && (
            <p className="text-sm text-gray-500">
              {reg.representative_position}
            </p>
          )}
        </div>

        {reg.description && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Mô tả tổ chức</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              {reg.description}
            </p>
          </div>
        )}

        {reg.collaboration_proposal && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">
              Đề xuất hợp tác
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              {reg.collaboration_proposal}
            </p>
          </div>
        )}

        {reg.license_url && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">
              Giấy phép kinh doanh
            </h4>
            <a
              href={reg.license_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-500 hover:underline"
            >
              <FileTextOutlined />
              Xem giấy phép
              <LinkOutlined style={{ fontSize: 11 }} />
            </a>
          </div>
        )}

        {reg.status === "rejected" && reg.rejection_reason && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100">
            <h4 className="font-semibold text-red-600 mb-1">Lý do từ chối</h4>
            <p className="text-sm text-red-500">{reg.rejection_reason}</p>
          </div>
        )}
      </div>
    ),
  }),
);

// ─── Constants ───────────────────────────────────────────────────────────────

const PARTNERSHIP_TYPE_LABELS = {
  sponsor: "Nhà tài trợ",
  ngo: "Tổ chức phi chính phủ",
  media: "Truyền thông",
  technology: "Công nghệ",
  education: "Giáo dục",
  other: "Khác",
};

const STATUS_CONFIG = {
  pending: {
    color: "warning",
    icon: <ClockCircleOutlined />,
    label: "Chờ duyệt",
    tagColor: "gold",
  },
  approved: {
    color: "success",
    icon: <CheckCircleOutlined />,
    label: "Đã duyệt",
    tagColor: "green",
  },
  rejected: {
    color: "error",
    icon: <CloseCircleOutlined />,
    label: "Từ chối",
    tagColor: "red",
  },
};

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon, value, label, bgClass, iconClass, delay }) => (
  <motion.div variants={cardVariants} custom={delay}>
    <Card
      className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow duration-300"
      bodyStyle={{ padding: "16px 20px" }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgClass}`}
        >
          <span className={`text-xl ${iconClass}`}>{icon}</span>
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

const AdminPartnerships = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch ──
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      // Replace with your actual data fetching logic (supabase, axios, etc.)
      // const { data, error } = await supabase.from('partnership_registrations').select('*').order('created_at', { ascending: false });
      // if (error) throw error;
      // setRegistrations(data || []);

      // Demo data for preview
      setRegistrations([
        {
          id: "1",
          organization_name: "GreenTech Corp",
          email: "contact@greentech.vn",
          phone: "028 1234 5678",
          address: "123 Nguyễn Huệ, Q.1, TP.HCM",
          representative_name: "Nguyễn Văn A",
          representative_position: "Giám đốc",
          partnership_type: "technology",
          website: "https://greentech.vn",
          tax_code: "0123456789",
          description: "Công ty công nghệ xanh hàng đầu Việt Nam.",
          collaboration_proposal:
            "Đề xuất hợp tác phát triển phần mềm bền vững.",
          logo_url: null,
          license_url: null,
          status: "pending",
          rejection_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: "u1",
          is_banned: false,
        },
        {
          id: "2",
          organization_name: "EcoMedia VN",
          email: "hello@ecomedia.vn",
          phone: "024 9876 5432",
          address: "45 Hoàng Diệu, Ba Đình, Hà Nội",
          representative_name: "Trần Thị B",
          representative_position: "Trưởng phòng",
          partnership_type: "media",
          website: null,
          tax_code: null,
          description: "Truyền thông số về môi trường.",
          collaboration_proposal: null,
          logo_url: null,
          license_url: null,
          status: "approved",
          rejection_reason: null,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString(),
          user_id: "u2",
          is_banned: false,
        },
        {
          id: "3",
          organization_name: "CleanFund NGO",
          email: "info@cleanfund.org",
          phone: "0909 123 456",
          address: "88 Lê Lợi, Q.3, TP.HCM",
          representative_name: "Lê Văn C",
          representative_position: null,
          partnership_type: "ngo",
          website: "https://cleanfund.org",
          tax_code: null,
          description: null,
          collaboration_proposal: "Tài trợ cho các dự án môi trường cộng đồng.",
          logo_url: null,
          license_url: null,
          status: "rejected",
          rejection_reason: "Hồ sơ chưa đầy đủ thông tin pháp lý.",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date().toISOString(),
          user_id: "u3",
          is_banned: false,
        },
      ]);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // ── Filters ──
  const filteredRegistrations = registrations.filter((reg) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      reg.organization_name.toLowerCase().includes(q) ||
      reg.email.toLowerCase().includes(q) ||
      reg.representative_name.toLowerCase().includes(q);
    return matchesSearch && reg.status === activeTab;
  });

  // ── Actions ──
  const handleApprove = async (registration) => {
    try {
      setActionLoading(true);
      // await supabase.from('partnership_registrations').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', registration.id);
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registration.id ? { ...r, status: "approved" } : r,
        ),
      );
      setIsDetailOpen(false);
    } catch (error) {
      console.error("Lỗi duyệt đối tác:", error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRegistration) return;
    try {
      setActionLoading(true);
      // await supabase.from('partnership_registrations').update({ status: 'rejected', rejection_reason: rejectionReason, reviewed_at: new Date().toISOString() }).eq('id', selectedRegistration.id);
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === selectedRegistration.id
            ? { ...r, status: "rejected", rejection_reason: rejectionReason }
            : r,
        ),
      );
      setIsRejectDialogOpen(false);
      setIsDetailOpen(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Lỗi từ chối đối tác:", error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBan = async (registration) => {
    try {
      setActionLoading(true);
      const newBanStatus = !registration.is_banned;
      // await supabase.from('partnership_registrations').update({ is_banned: newBanStatus }).eq('id', registration.id);
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registration.id ? { ...r, is_banned: newBanStatus } : r,
        ),
      );
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Stats ──
  const stats = {
    pending: registrations.filter((r) => r.status === "pending").length,
    approved: registrations.filter((r) => r.status === "approved").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
    banned: registrations.filter((r) => r.is_banned).length,
  };

  // ── Table Columns ──
  const columns = [
    {
      title: "Tổ chức",
      key: "org",
      render: (_, reg) => (
        <div className="flex items-center gap-3">
          {reg.logo_url ? (
            <img
              src={reg.logo_url}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TeamOutlined style={{ color: "#3b82f6" }} />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800 leading-tight">
              {reg.organization_name}
            </p>
            <p className="text-xs text-gray-400">{reg.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Lĩnh vực",
      key: "type",
      render: (_, reg) => (
        <Tag color="blue" className="rounded-full">
          {PARTNERSHIP_TYPE_LABELS[reg.partnership_type] ||
            reg.partnership_type}
        </Tag>
      ),
    },
    {
      title: "Người đại diện",
      key: "rep",
      render: (_, reg) => (
        <div>
          <p className="font-medium text-gray-700">{reg.representative_name}</p>
          {reg.representative_position && (
            <p className="text-xs text-gray-400">
              {reg.representative_position}
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Liên hệ",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => <span className="text-sm text-gray-600">{phone}</span>,
    },
    {
      title: "Ngày đăng ký",
      key: "date",
      render: (_, reg) => (
        <span className="text-sm text-gray-500">
          {new Date(reg.created_at).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, reg) => {
        const cfg = STATUS_CONFIG[reg.status];
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag color={cfg.tagColor} icon={cfg.icon}>
              {cfg.label}
            </Tag>
            {reg.is_banned && (
              <Tag color="red" icon={<StopOutlined />}>
                Đã cấm
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, reg) => {
        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "Xem chi tiết",
            onClick: () => {
              setSelectedRegistration(reg);
              setIsDetailOpen(true);
            },
          },
          ...(reg.status === "pending"
            ? [
                {
                  key: "approve",
                  icon: <CheckCircleOutlined />,
                  label: <span className="text-green-600">Duyệt</span>,
                  onClick: () => handleApprove(reg),
                },
                {
                  key: "reject",
                  icon: <CloseCircleOutlined />,
                  label: <span className="text-red-500">Từ chối</span>,
                  onClick: () => {
                    setSelectedRegistration(reg);
                    setIsRejectDialogOpen(true);
                  },
                },
              ]
            : []),
          ...(reg.status === "approved"
            ? [
                {
                  key: "ban",
                  icon: reg.is_banned ? <UnlockOutlined /> : <StopOutlined />,
                  label: reg.is_banned ? (
                    <span className="text-green-600">Gỡ cấm</span>
                  ) : (
                    <span className="text-red-500">Cấm tài khoản</span>
                  ),
                  onClick: () => handleToggleBan(reg),
                },
              ]
            : []),
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              className="text-gray-400 hover:text-gray-700"
            />
          </Dropdown>
        );
      },
    },
  ];

  // ── Tab Items ──
  const tabItems = [
    {
      key: "pending",
      label: (
        <span className="flex items-center gap-1.5">
          <ClockCircleOutlined />
          Chờ duyệt
          <Badge count={stats.pending} color="#faad14" />
        </span>
      ),
    },
    {
      key: "approved",
      label: (
        <span className="flex items-center gap-1.5">
          <CheckCircleOutlined />
          Đã duyệt
          <Badge count={stats.approved} color="#52c41a" />
        </span>
      ),
    },
    {
      key: "rejected",
      label: (
        <span className="flex items-center gap-1.5">
          <CloseCircleOutlined />
          Từ chối
          <Badge count={stats.rejected} color="#ff4d4f" />
        </span>
      ),
    },
  ];

  // ── Render ──
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
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Quản lý Đối tác
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Duyệt và quản lý đăng ký đối tác
            </p>
          </div>
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchRegistrations}
            disabled={loading}
            className="rounded-xl"
          >
            Làm mới
          </Button>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<ClockCircleOutlined />}
            value={stats.pending}
            label="Chờ duyệt"
            bgClass="bg-amber-50"
            iconClass="text-amber-500"
            delay={0}
          />
          <StatCard
            icon={<CheckCircleOutlined />}
            value={stats.approved}
            label="Đã duyệt"
            bgClass="bg-green-50"
            iconClass="text-green-500"
            delay={1}
          />
          <StatCard
            icon={<CloseCircleOutlined />}
            value={stats.rejected}
            label="Từ chối"
            bgClass="bg-red-50"
            iconClass="text-red-500"
            delay={2}
          />
          <StatCard
            icon={<StopOutlined />}
            value={stats.banned}
            label="Đã cấm"
            bgClass="bg-gray-100"
            iconClass="text-gray-500"
            delay={3}
          />
        </div>

        {/* Main Card */}
        <motion.div variants={cardVariants}>
          <Card
            className="rounded-2xl border-0 shadow-sm"
            bodyStyle={{ padding: 0 }}
          >
            {/* Search + Tabs header */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
              <Input
                prefix={<SearchOutlined className="text-gray-300" />}
                placeholder="Tìm kiếm đối tác..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-xl"
                allowClear
              />
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                size="small"
                className="mb-0"
              />
            </div>

            {/* Table with animated rows */}
            <div className="overflow-x-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <Table
                    dataSource={filteredRegistrations}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: false,
                      showTotal: (total) => `${total} kết quả`,
                      className: "px-6 pb-4",
                    }}
                    locale={{ emptyText: "Không có đăng ký nào" }}
                    className="[&_.ant-table-thead_th]:bg-gray-50 [&_.ant-table-thead_th]:text-gray-500 [&_.ant-table-thead_th]:font-medium"
                    components={{
                      body: {
                        row: ({ children, ...props }) => (
                          <motion.tr
                            {...props}
                            variants={tableRowVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ duration: 0.2 }}
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
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Detail Modal ── */}
      <Modal
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        title={
          <div className="flex items-center gap-2 text-gray-800">
            <TeamOutlined className="text-blue-500" />
            Chi tiết đăng ký đối tác
          </div>
        }
        footer={
          selectedRegistration?.status === "pending" ? (
            <div className="flex justify-end gap-3 pt-2">
              <Button
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsRejectDialogOpen(true);
                }}
                danger
                icon={<CloseCircleOutlined />}
                disabled={actionLoading}
              >
                Từ chối
              </Button>
              <Button
                type="primary"
                onClick={() => handleApprove(selectedRegistration)}
                loading={actionLoading}
                icon={<CheckCircleOutlined />}
                className="bg-green-500 border-green-500 hover:bg-green-600"
              >
                Duyệt đối tác
              </Button>
            </div>
          ) : null
        }
        width={680}
        centered
        className="[&_.ant-modal-content]:rounded-2xl"
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto", paddingTop: 8 },
        }}
      >
        {selectedRegistration && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-40 text-gray-400">
                <ReloadOutlined spin className="mr-2" />
                Đang tải...
              </div>
            }
          >
            <PartnerDetailContent
              reg={selectedRegistration}
              PARTNERSHIP_TYPE_LABELS={PARTNERSHIP_TYPE_LABELS}
            />
          </Suspense>
        )}
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal
        open={isRejectDialogOpen}
        onCancel={() => setIsRejectDialogOpen(false)}
        title="Từ chối đăng ký đối tác"
        centered
        className="[&_.ant-modal-content]:rounded-2xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsRejectDialogOpen(false)}>Hủy</Button>
            <Button
              danger
              type="primary"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading}
              loading={actionLoading}
            >
              Xác nhận từ chối
            </Button>
          </div>
        }
      >
        <p className="text-gray-500 text-sm mb-3">
          Vui lòng nhập lý do từ chối để thông báo cho đối tác.
        </p>
        <Input.TextArea
          placeholder="Nhập lý do từ chối..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={4}
          className="rounded-xl"
        />
      </Modal>
    </div>
  );
};

export default AdminPartnerships;
