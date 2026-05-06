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
  UserOutlined,
  GlobalOutlined,
  ControlOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router";
import { logoutFunction } from "../../features/auth/services";
import toast from "react-hot-toast";

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: "/admin", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/admin/schools", label: "Quản lý trường", icon: <BankOutlined /> },
  {
    key: "/admin/partnerships",
    label: "Quản lý đối tác",
    icon: <GlobalOutlined />,
  },
  {
    key: "/admin/game-levels",
    label: "Loại & Cấp độ game",
    icon: <ControlOutlined />,
  },
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
];

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    try {
      const res = await logoutFunction();

      if (res) {
        toast.success("Đăng xuất thành công!");
        navigate("/auth/admin");
      } else {
        toast.error("Đăng xuất thất bại!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMenuClick = (item) => {
    setSelectedKey(item.key);
    navigate(item.key);
  };


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
        trigger={null}
        className="bg-white border-r border-gray-200 fixed left-0 top-0 h-screen"
      >
        <div className="flex flex-col h-full">
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
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg text-gray-800">EcoVerse</h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            )}
          </motion.div>

          {/* Menu trên */}
          <div className="flex-1 py-4">
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={handleMenuClick}
              className="border-0"
              items={menuItems}
            />
          </div>

          {/* Menu dưới */}
          <div className="border-t border-gray-200">
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
      <Layout style={{ marginLeft: collapsed ? 80 : 260 }}>
        {/* Header */}
        <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between h-16 sticky top-0 z-40">
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
                <Outlet />
              </div>
            )}
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
