import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  Input,
  Button,
  Table,
  Tag,
  Modal,
  Dropdown,
  Menu,
  Tabs,
  Spin,
  message,
} from "antd";
import {
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  FileTextOutlined,
  PictureOutlined,
  LinkOutlined,
  ReloadOutlined,
  DownloadOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const { TextArea } = Input;
const { TabPane } = Tabs;

const AdminSchools = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Mock data - replace with your actual data fetching
  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockData = [
        {
          id: "1",
          school_name: "THPT Nguyễn Du",
          email: "nguyendu@edu.vn",
          phone: "0123456789",
          address: "123 Đường Nguyễn Du, Q1, TP.HCM",
          representative_name: "Nguyễn Văn A",
          representative_position: "Hiệu trưởng",
          school_type: "public",
          student_count: 1200,
          website: "https://nguyendu.edu.vn",
          tax_code: "0123456789",
          description: "Trường THPT công lập có lịch sử lâu đời",
          logo_url: null,
          license_url: null,
          status: "pending",
          rejection_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: "user1",
          is_banned: false,
        },
        {
          id: "2",
          school_name: "THCS Lê Lợi",
          email: "leloi@edu.vn",
          phone: "0987654321",
          address: "456 Đường Lê Lợi, Q3, TP.HCM",
          representative_name: "Trần Thị B",
          representative_position: "Hiệu trưởng",
          school_type: "private",
          student_count: 800,
          website: null,
          tax_code: "9876543210",
          description: "Trường THCS tư thục chất lượng cao",
          logo_url: null,
          license_url: null,
          status: "approved",
          rejection_reason: null,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          user_id: "user2",
          is_banned: false,
        },
      ];
      setRegistrations(mockData);
    } catch (error) {
      message.error("Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.representative_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = reg.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    pending: registrations.filter((r) => r.status === "pending").length,
    approved: registrations.filter((r) => r.status === "approved").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
  };

  // Approve registration
  const handleApprove = async (registration) => {
    setActionLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success(`Đã duyệt "${registration.school_name}"`);
      setIsDetailOpen(false);
      setSelectedRegistration(null);
      fetchRegistrations();
    } catch (error) {
      message.error("Không thể duyệt");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject registration
  const handleReject = async () => {
    if (!selectedRegistration || !rejectionReason.trim()) {
      message.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setActionLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success(`Đã từ chối "${selectedRegistration.school_name}"`);
      setIsRejectDialogOpen(false);
      setIsDetailOpen(false);
      setSelectedRegistration(null);
      setRejectionReason("");
      fetchRegistrations();
    } catch (error) {
      message.error("Không thể từ chối");
    } finally {
      setActionLoading(false);
    }
  };

  // Ban/Unban school
  const handleToggleBan = async (registration) => {
    setActionLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newBanStatus = !registration.is_banned;
      message.success(
        newBanStatus
          ? `Đã khóa tài khoản "${registration.school_name}"`
          : `Đã mở khóa tài khoản "${registration.school_name}"`,
      );
      fetchRegistrations();
    } catch (error) {
      message.error("Không thể thực hiện");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusTag = (status, isBanned) => {
    if (isBanned) {
      return (
        <Tag icon={<LockOutlined />} color="error">
          Bị khóa
        </Tag>
      );
    }
    switch (status) {
      case "pending":
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Chờ duyệt
          </Tag>
        );
      case "approved":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã duyệt
          </Tag>
        );
      case "rejected":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Từ chối
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getSchoolTypeTag = (type) => {
    return type === "public" ? (
      <Tag color="blue">Công lập</Tag>
    ) : (
      <Tag color="default">Tư thục</Tag>
    );
  };

  const getActionsMenu = (record) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => {
          setSelectedRegistration(record);
          setIsDetailOpen(true);
        }}
      >
        Xem chi tiết
      </Menu.Item>
      {record.status === "pending" && (
        <>
          <Menu.Item
            key="approve"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record)}
          >
            <span className="text-green-600">Duyệt</span>
          </Menu.Item>
          <Menu.Item
            key="reject"
            icon={<CloseCircleOutlined />}
            onClick={() => {
              setSelectedRegistration(record);
              setIsRejectDialogOpen(true);
            }}
          >
            <span className="text-red-600">Từ chối</span>
          </Menu.Item>
        </>
      )}
      {record.status === "approved" && (
        <Menu.Item
          key="ban"
          icon={record.is_banned ? <UnlockOutlined /> : <LockOutlined />}
          onClick={() => handleToggleBan(record)}
        >
          <span className={record.is_banned ? "text-blue-600" : "text-red-600"}>
            {record.is_banned ? "Mở khóa tài khoản" : "Khóa tài khoản"}
          </span>
        </Menu.Item>
      )}
    </Menu>
  );

  const columns = [
    {
      title: "Trường",
      key: "school",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <BankOutlined className="text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{record.school_name}</p>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">
              {record.address}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "school_type",
      key: "type",
      render: (type) => getSchoolTypeTag(type),
    },
    {
      title: "Người đại diện",
      key: "rep",
      render: (_, record) => (
        <div>
          <p className="font-medium">{record.representative_name}</p>
          {record.representative_position && (
            <p className="text-xs text-gray-500">
              {record.representative_position}
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Liên hệ",
      key: "contact",
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <MailOutlined className="text-gray-400" />
            <span className="truncate max-w-[150px]">{record.email}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <PhoneOutlined className="text-gray-400" />
            {record.phone}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "created_at",
      key: "created",
      render: (date) => format(new Date(date), "dd/MM/yyyy", { locale: vi }),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => getStatusTag(record.status, record.is_banned),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Dropdown overlay={getActionsMenu(record)} trigger={["click"]}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Quản lý trường học
            </h1>
            <p className="text-gray-600">
              Duyệt đăng ký và quản lý các trường sử dụng EcoVerse
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              icon={<ReloadOutlined spin={loading} />}
              onClick={fetchRegistrations}
            >
              Làm mới
            </Button>
            <Button icon={<DownloadOutlined />}>Xuất Excel</Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            key: "pending",
            label: "Chờ duyệt",
            count: stats.pending,
            icon: ClockCircleOutlined,
            color: "orange",
          },
          {
            key: "approved",
            label: "Đang hoạt động",
            count: stats.approved,
            icon: BankOutlined,
            color: "blue",
          },
          {
            key: "rejected",
            label: "Từ chối",
            count: stats.rejected,
            icon: CloseCircleOutlined,
            color: "red",
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.key} variants={itemVariants}>
              <Card
                hoverable
                className={`cursor-pointer transition-all ${
                  activeTab === stat.key ? `ring-2 ring-${stat.color}-500` : ""
                }`}
                onClick={() => setActiveTab(stat.key)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-600`}>
                      {stat.count}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center`}
                  >
                    <Icon className={`text-2xl text-${stat.color}-600`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs & Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane
                tab={
                  <span>
                    <ClockCircleOutlined /> Chờ duyệt ({stats.pending})
                  </span>
                }
                key="pending"
              />
              <TabPane
                tab={
                  <span>
                    <CheckCircleOutlined /> Đang hoạt động ({stats.approved})
                  </span>
                }
                key="approved"
              />
              <TabPane
                tab={
                  <span>
                    <CloseCircleOutlined /> Từ chối ({stats.rejected})
                  </span>
                }
                key="rejected"
              />
            </Tabs>

            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BankOutlined className="text-5xl mb-4 opacity-50" />
              <p>Không có trường nào</p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredRegistrations}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      </motion.div>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BankOutlined />
            <span>Chi tiết trường</span>
          </div>
        }
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={800}
        footer={
          selectedRegistration?.status === "pending"
            ? [
                <Button
                  key="reject"
                  onClick={() => setIsRejectDialogOpen(true)}
                >
                  <CloseCircleOutlined /> Từ chối
                </Button>,
                <Button
                  key="approve"
                  type="primary"
                  onClick={() => handleApprove(selectedRegistration)}
                  loading={actionLoading}
                  className="bg-green-600"
                >
                  <CheckCircleOutlined /> Duyệt
                </Button>,
              ]
            : null
        }
      >
        {selectedRegistration && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              {getStatusTag(
                selectedRegistration.status,
                selectedRegistration.is_banned,
              )}
              <span className="text-sm text-gray-500">
                Đăng ký:{" "}
                {format(
                  new Date(selectedRegistration.created_at),
                  "dd/MM/yyyy HH:mm",
                  { locale: vi },
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <BankOutlined className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Tên trường</p>
                    <p className="font-medium">
                      {selectedRegistration.school_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <EnvironmentOutlined className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-medium">
                      {selectedRegistration.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TeamOutlined className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Số học sinh</p>
                    <p className="font-medium">
                      {selectedRegistration.student_count || "Chưa cung cấp"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <UserOutlined className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Người đại diện</p>
                    <p className="font-medium">
                      {selectedRegistration.representative_name}
                    </p>
                    {selectedRegistration.representative_position && (
                      <p className="text-sm text-gray-500">
                        {selectedRegistration.representative_position}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MailOutlined className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedRegistration.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <PhoneOutlined className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Điện thoại</p>
                    <p className="font-medium">{selectedRegistration.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {selectedRegistration.description && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Mô tả</p>
                <p className="text-sm">{selectedRegistration.description}</p>
              </div>
            )}

            {selectedRegistration.status === "rejected" &&
              selectedRegistration.rejection_reason && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-red-600 font-medium mb-2">
                    Lý do từ chối
                  </p>
                  <p className="text-sm bg-red-50 p-3 rounded-lg">
                    {selectedRegistration.rejection_reason}
                  </p>
                </div>
              )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối đăng ký"
        open={isRejectDialogOpen}
        onCancel={() => setIsRejectDialogOpen(false)}
        onOk={handleReject}
        okText="Xác nhận từ chối"
        okButtonProps={{
          danger: true,
          loading: actionLoading,
          disabled: !rejectionReason.trim(),
        }}
        cancelText="Hủy"
      >
        <p className="mb-4 text-gray-600">
          Vui lòng nhập lý do từ chối để thông báo cho trường
        </p>
        <TextArea
          placeholder="Nhập lý do từ chối..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={4}
        />
      </Modal>
    </motion.div>
  );
};

export default AdminSchools;
