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
import {
  getAllPartnershipAccounts,
  updatePartnershipAccountStatus,
} from "../../services";
import toast from "react-hot-toast";

// ─── BE Schema (tham khảo) ────────────────────────────────────────────────────
// {
//   id, userId,
//   organizationName, partnershipType,
//   taxCode, contactEmail, phoneNumber,
//   registeredAddress, geographicScopeWard, geographicScopeProvince,
//   contactPerson, position,
//   linkWeb, description,
//   logoUrl, licenseUrl,
//   approvalStatus ("PENDING"|"APPROVED"|"REJECTED"),
//   accountStatus, isActive,
//   createdAt, updatedAt
// }

// ─── Lazy Detail ──────────────────────────────────────────────────────────────
const PartnerDetailContent = lazy(() =>
  Promise.resolve({
    default: ({ reg, PARTNERSHIP_TYPE_LABELS }) => (
      <div className="space-y-5">
        {/* Org Header */}
        <div className="flex items-start gap-4">
          {reg.logoUrl ? (
            <img
              src={reg.logoUrl}
              alt="Logo"
              className="w-20 h-20 rounded-2xl object-cover shadow-md"
            />
          ) : (
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner ${reg.isBanned ? "bg-red-50" : "bg-blue-50"}`}
            >
              <TeamOutlined
                style={{
                  fontSize: 32,
                  color: reg.isBanned ? "#ef4444" : "#3b82f6",
                }}
              />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {reg.organizationName}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Tag color="blue">
                {PARTNERSHIP_TYPE_LABELS[reg.partnershipType] ||
                  reg.partnershipType}
              </Tag>
              {reg.accountStatus === "BANNED" && (
                <Tag color="red" icon={<StopOutlined />}>
                  Đã cấm
                </Tag>
              )}
            </div>
          </div>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MailOutlined className="text-gray-400" />
            <span>{reg.contactEmail}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <PhoneOutlined className="text-gray-400" />
            <span>{reg.phoneNumber}</span>
          </div>
          {/* Ghép địa chỉ từ 3 field BE */}
          <div className="flex items-start gap-2 text-sm text-gray-600 md:col-span-2">
            <EnvironmentOutlined className="text-gray-400 mt-0.5" />
            <span>
              {[
                reg.registeredAddress,
                reg.geographicScopeWard,
                reg.geographicScopeProvince,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
          {reg.linkWeb && (
            <div className="flex items-center gap-2 text-sm">
              <GlobalOutlined className="text-gray-400" />
              <a
                href={reg.linkWeb}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1"
              >
                {reg.linkWeb}
                <LinkOutlined style={{ fontSize: 11 }} />
              </a>
            </div>
          )}
          {reg.taxCode && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileTextOutlined className="text-gray-400" />
              <span>Mã số thuế: {reg.taxCode}</span>
            </div>
          )}
        </div>

        {/* Representative */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <UserOutlined className="text-gray-400" />
            <span className="font-semibold text-gray-700">Người liên hệ</span>
          </div>
          <p className="text-gray-800">{reg.contactPerson}</p>
          {reg.position && (
            <p className="text-sm text-gray-500">{reg.position}</p>
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

        {reg.licenseUrl && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">
              Giấy phép kinh doanh
            </h4>
            <a
              href={reg.licenseUrl}
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

        {reg.approvalStatus === "REJECTED" && reg.rejectionReason && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100">
            <h4 className="font-semibold text-red-600 mb-1">Lý do từ chối</h4>
            <p className="text-sm text-red-500">{reg.rejectionReason}</p>
          </div>
        )}
      </div>
    ),
  }),
);

// ─── Constants ────────────────────────────────────────────────────────────────

const PARTNERSHIP_TYPE_LABELS = {
  SPONSOR: "Nhà tài trợ",
  NGO: "Tổ chức phi chính phủ",
  MEDIA: "Truyền thông",
  TECHNOLOGY: "Công nghệ",
  EDUCATION: "Giáo dục",
  YOUTH_UNION: "Đoàn Thanh Niên",
  WARD_GOVERNMENT: "Chính quyền phường",
  OTHER: "Khác",
};

// approvalStatus từ BE (PENDING / APPROVED / REJECTED)
const STATUS_CONFIG = {
  PENDING: {
    icon: <ClockCircleOutlined />,
    label: "Chờ duyệt",
    tagColor: "gold",
  },
  APPROVED: {
    icon: <CheckCircleOutlined />,
    label: "Đã duyệt",
    tagColor: "green",
  },
  REJECTED: {
    icon: <CloseCircleOutlined />,
    label: "Từ chối",
    tagColor: "red",
  },
};

// ─── Animations ───────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
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

// ─── Main ─────────────────────────────────────────────────────────────────────

const AdminPartnerships = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("PENDING");
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch ──
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await getAllPartnershipAccounts();
      setRegistrations(res.data.content || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter((reg) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      reg.organizationName?.toLowerCase().includes(q) ||
      reg.contactEmail?.toLowerCase().includes(q) ||
      reg.contactPerson?.toLowerCase().includes(q);
    if (activeTab === "BANNED")
      return matchesSearch && reg.accountStatus === "BANNED";
    return (
      matchesSearch &&
      reg.approvalStatus === activeTab &&
      reg.accountStatus !== "BANNED"
    );
  });

  // ── Stats ──
  const stats = {
    PENDING: registrations.filter(
      (r) => r.approvalStatus === "PENDING" && r.accountStatus !== "BANNED",
    ).length,
    APPROVED: registrations.filter(
      (r) => r.approvalStatus === "APPROVED" && r.accountStatus !== "BANNED",
    ).length,
    REJECTED: registrations.filter(
      (r) => r.approvalStatus === "REJECTED" && r.accountStatus !== "BANNED",
    ).length,
    BANNED: registrations.filter((r) => r.accountStatus === "BANNED").length,
  };

  // ── Actions ──
  const handleApprove = async (registration) => {
    try {
      setActionLoading(true);
      const payload = {
        status: "APPROVED",
      };
      const res = await updatePartnershipAccountStatus(
        registration.id,
        payload,
      );
      if (res) {
        toast.success("Phê duyệt tài khoản thành công!");
        fetchRegistrations();
      } else {
        toast.error("Phê duyệt tài khoản thất bại!");
      }
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

      const payload = {
        status: "REJECTED",
        reason: rejectionReason,
      };
      const res = await updatePartnershipAccountStatus(
        selectedRegistration.id,
        payload,
      );
      if (res) {
        toast.success("Từ chối tài khoản thành công!");
        fetchRegistrations();
      } else {
        toast.error("Từ chối tài khoản thất bại!");
      }

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
      const isBanned = registration.accountStatus === "BANNED";
      const newStatus = isBanned ? "ACTIVE" : "BANNED";
      // await api.patch(`/admin/partnership-registrations/${registration.id}`, { accountStatus: newStatus });
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registration.id ? { ...r, accountStatus: newStatus } : r,
        ),
      );
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Table Columns ──
  const columns = [
    {
      title: "Tổ chức",
      key: "org",
      render: (_, reg) => (
        <div className="flex items-center gap-3">
          {reg.logoUrl ? (
            <img
              src={reg.logoUrl}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center
              ${reg.accountStatus === "BANNED" ? "bg-red-50" : "bg-blue-50"}`}
            >
              <TeamOutlined
                style={{
                  color: reg.accountStatus === "BANNED" ? "#ef4444" : "#3b82f6",
                }}
              />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800 leading-tight">
              {reg.organizationName}
            </p>
            <p className="text-xs text-gray-400">{reg.contactEmail}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Lĩnh vực",
      key: "type",
      render: (_, reg) => (
        <Tag color="blue" className="rounded-full">
          {PARTNERSHIP_TYPE_LABELS[reg.partnershipType] || reg.partnershipType}
        </Tag>
      ),
    },
    {
      title: "Người liên hệ",
      key: "rep",
      render: (_, reg) => (
        <div>
          <p className="font-medium text-gray-700">{reg.contactPerson}</p>
          {reg.position && (
            <p className="text-xs text-gray-400">{reg.position}</p>
          )}
        </div>
      ),
    },
    {
      title: "Liên hệ",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (phone) => <span className="text-sm text-gray-600">{phone}</span>,
    },
    {
      title: "Ngày đăng ký",
      key: "date",
      render: (_, reg) => (
        <span className="text-sm text-gray-500">
          {new Date(reg.createdAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, reg) => {
        const cfg = STATUS_CONFIG[reg.approvalStatus];
        return (
          <div className="flex items-center gap-2 flex-wrap">
            {cfg && (
              <Tag color={cfg.tagColor} icon={cfg.icon}>
                {cfg.label}
              </Tag>
            )}
            {reg.accountStatus === "BANNED" && (
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
        const isBanned = reg.accountStatus === "BANNED";
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
          ...(reg.approvalStatus === "PENDING" && !isBanned
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
          ...(reg.approvalStatus === "APPROVED" && !isBanned
            ? [
                {
                  key: "ban",
                  icon: <StopOutlined />,
                  label: <span className="text-red-500">Cấm tài khoản</span>,
                  onClick: () => handleToggleBan(reg),
                },
              ]
            : []),
          ...(isBanned
            ? [
                {
                  key: "unban",
                  icon: <UnlockOutlined />,
                  label: <span className="text-green-600">Gỡ cấm</span>,
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

  // ── Tab Items — key là BE enum value ──
  const tabItems = [
    {
      key: "PENDING",
      label: (
        <span className="flex items-center gap-1.5">
          <ClockCircleOutlined />
          Chờ duyệt
          <Badge count={stats.PENDING} color="#faad14" />
        </span>
      ),
    },
    {
      key: "APPROVED",
      label: (
        <span className="flex items-center gap-1.5">
          <CheckCircleOutlined />
          Đã duyệt
          <Badge count={stats.APPROVED} color="#52c41a" />
        </span>
      ),
    },
    {
      key: "REJECTED",
      label: (
        <span className="flex items-center gap-1.5">
          <CloseCircleOutlined />
          Từ chối
          <Badge count={stats.REJECTED} color="#ff4d4f" />
        </span>
      ),
    },
    {
      key: "BANNED",
      label: (
        <span className="flex items-center gap-1.5">
          <StopOutlined />
          Đã cấm
          <Badge count={stats.BANNED} color="#6b7280" />
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
            value={stats.PENDING}
            label="Chờ duyệt"
            bgClass="bg-amber-50"
            iconClass="text-amber-500"
            delay={0}
          />
          <StatCard
            icon={<CheckCircleOutlined />}
            value={stats.APPROVED}
            label="Đã duyệt"
            bgClass="bg-green-50"
            iconClass="text-green-500"
            delay={1}
          />
          <StatCard
            icon={<CloseCircleOutlined />}
            value={stats.REJECTED}
            label="Từ chối"
            bgClass="bg-red-50"
            iconClass="text-red-500"
            delay={2}
          />
          <StatCard
            icon={<StopOutlined />}
            value={stats.BANNED}
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
                            className={`transition-colors ${activeTab === "BANNED" ? "hover:bg-red-50/30" : "hover:bg-blue-50/30"}`}
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

      {/* Detail Modal */}
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
          selectedRegistration?.approvalStatus === "PENDING" &&
          selectedRegistration?.accountStatus !== "BANNED" ? (
            <div className="flex justify-end gap-3 pt-2">
              <Button
                danger
                icon={<CloseCircleOutlined />}
                disabled={actionLoading}
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsRejectDialogOpen(true);
                }}
              >
                Từ chối
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={actionLoading}
                onClick={() => handleApprove(selectedRegistration)}
                className="bg-green-500 border-green-500 hover:bg-green-600"
              >
                Duyệt đối tác
              </Button>
            </div>
          ) : selectedRegistration?.accountStatus === "BANNED" ? (
            <div className="flex justify-end gap-3 pt-2">
              <Button
                icon={<UnlockOutlined />}
                loading={actionLoading}
                className="text-green-600 border-green-500 hover:bg-green-50"
                onClick={() => {
                  handleToggleBan(selectedRegistration);
                  setIsDetailOpen(false);
                }}
              >
                Gỡ cấm tài khoản
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

      {/* Reject Modal */}
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
