import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout, Menu, Avatar, Dropdown, Badge, Spin } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  CreditCardOutlined,
  TransactionOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AdminDashboard from "./pages/adminDashboard";

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: "/admin", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/admin/schools", label: "Quản lý trường", icon: <BankOutlined /> },
  {
    key: "/admin/subscriptions",
    label: "Gói đăng ký",
    icon: <CreditCardOutlined />,
  },
  {
    key: "/admin/transactions",
    label: "Giao dịch",
    icon: <TransactionOutlined />,
  },
  { key: "/admin/content", label: "Nội dung game", icon: <FileTextOutlined /> },
  {
    key: "/admin/marketplace",
    label: "Marketplace",
    icon: <ShoppingOutlined />,
  },
];

const AdminLayout = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedKey, setSelectedKey] = useState("/admin");

  useEffect(() => {
    // Simulate auth check
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUser({
        email: "admin@ecoverse.com",
        name: "Admin System",
      });
      setIsLoading(false);
    };

    checkAuth();

    // Set selected menu based on current path
    const currentPath = window.location.pathname;
    setSelectedKey(currentPath);
  }, []);

  const handleLogout = () => {
    console.log("Logging out...");
    // navigate('/admin/auth');
  };

  const handleMenuClick = (item) => {
    setSelectedKey(item.key);
    console.log("Navigate to:", item.key);
    // navigate(item.key);
  };

  const notificationMenu = (
    <div className="w-80 bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Thông báo</h3>
        <span className="text-xs text-gray-500">3 mới</span>
      </div>
      <div className="space-y-2">
        <div className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
          <p className="text-sm font-medium text-gray-800">
            Trường mới đăng ký
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Trường THPT Nguyễn Du vừa đăng ký gói Premium
          </p>
          <p className="text-xs text-gray-400 mt-1">5 phút trước</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
          <p className="text-sm font-medium text-gray-800">
            Thanh toán thành công
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Trường THCS Lê Lợi đã thanh toán 5,000,000 VNĐ
          </p>
          <p className="text-xs text-gray-400 mt-1">1 giờ trước</p>
        </div>
        <div className="p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
          <p className="text-sm font-medium text-gray-800">Yêu cầu hỗ trợ</p>
          <p className="text-xs text-gray-600 mt-1">
            Trường TH Trần Hưng Đạo cần hỗ trợ kỹ thuật
          </p>
          <p className="text-xs text-gray-400 mt-1">2 giờ trước</p>
        </div>
      </div>
      <button className="w-full mt-3 text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2">
        Xem tất cả thông báo
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        className="bg-white border-r border-gray-200"
        trigger={null}
      >
        {/* Logo */}
        <motion.div
          className="p-4 border-b border-gray-200 flex items-center gap-3"
          animate={{
            paddingLeft: collapsed ? "20px" : "16px",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl font-bold">🌱</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-bold text-lg text-gray-800">EcoVerse</h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Menu */}
        <div className="py-4">
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            className="border-0"
            items={menuItems}
          />

          {/* Bottom Menu */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
            <Menu
              mode="inline"
              className="border-0"
              items={[
                {
                  key: "/admin/settings",
                  label: collapsed ? null : "Cài đặt",
                  icon: <SettingOutlined />,
                },
                {
                  key: "logout",
                  label: collapsed ? null : "Đăng xuất",
                  icon: <LogoutOutlined />,
                  onClick: handleLogout,
                  danger: true,
                },
              ]}
            />
          </div>
        </div>
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between h-16 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {collapsed ? (
                <MenuUnfoldOutlined className="text-xl text-gray-600" />
              ) : (
                <MenuFoldOutlined className="text-xl text-gray-600" />
              )}
            </motion.button>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              dropdownRender={() => notificationMenu}
            >
              <span className="inline-block cursor-pointer">
                <div className="relative w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <Badge count={3} size="small">
                    <BellOutlined className="text-xl text-gray-600" />
                  </Badge>
                </div>
              </span>
            </Dropdown>

            {/* User Info */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Avatar
                size={40}
                className="bg-gradient-to-br from-green-500 to-blue-500"
                icon={<UserOutlined />}
              />
            </div>
          </div>
        </Header>

        {/* Content */}
        <Content className="bg-gray-50 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children || (
              <div className="bg-white rounded-lg shadow-sm p-6 min-h-[600px]">
                <AdminDashboard />
              </div>
            )}
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
