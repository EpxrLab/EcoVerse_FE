import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams, useLocation } from "react-router";
import { Layout, Menu, Button, Badge, Drawer, Dropdown } from "antd";
import {
  HomeOutlined,
  PlayCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  GiftOutlined,
  ArrowLeftOutlined,
  LogoutOutlined,
  MenuOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useCampaignContext, useStudentContext } from "../context";
import { useStudentCampaigns } from "../hooks/useStudentCampaign";
import { logoutFunction } from "../../../features/auth/services";
import toast from "react-hot-toast";
import { NotificationDropdown } from "@/shared/components/NotificationDropdown";

const { Sider, Header, Content } = Layout;

// ─── CoinIcon ─────────────────────────────────────────────────────────────────

const CoinIcon = ({ className = "w-5 h-5 text-amber-500" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="10" opacity="0.2" />
    <circle cx="12" cy="12" r="8" />
    <text
      x="12"
      y="16"
      fontSize="10"
      fontWeight="bold"
      fill="white"
      textAnchor="middle"
    >
      ₫
    </text>
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export default function StudentDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { campaignId } = useParams();
  const { setSelectedCampaign } = useCampaignContext();
  const { getCampaignById } = useStudentCampaigns();
  const { currentStudent } = useStudentContext();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Find campaign
  const campaign = getCampaignById(campaignId);
  const isCompleted = campaign?.status === "COMPLETED";

  if (campaign) {
    setSelectedCampaign(campaign);
  }

  useEffect(() => {
    if (isCompleted) {
      const isRestrictedPath =
        location.pathname === `/student/campaign/${campaignId}` ||
        location.pathname === `/student/campaign/${campaignId}/` ||
        location.pathname.includes("/game") ||
        location.pathname.includes("/quiz");

      if (isRestrictedPath) {
        navigate(`/student/campaign/${campaignId}/leaderboard`, {
          replace: true,
        });
      }
    }
  }, [isCompleted, location.pathname, campaignId, navigate]);
  // Menu items
  const menuItems = [
    {
      key: "dashboard",
      label: "Tổng quan",
      icon: <HomeOutlined />,
      path: `/student/campaign/${campaignId}`,
      disabled: isCompleted,
    },
    {
      key: "game",
      label: "Chơi game",
      icon: <PlayCircleOutlined />,
      path: `/student/campaign/${campaignId}/game`,
      disabled: isCompleted,
    },
    {
      key: "quiz",
      label: "Làm Quiz",
      icon: <BookOutlined />,
      path: `/student/campaign/${campaignId}/quiz`,
      disabled: isCompleted,
    },
    {
      key: "leaderboard",
      label: "Bảng xếp hạng",
      icon: <TrophyOutlined />,
      path: `/student/campaign/${campaignId}/leaderboard`,
      disabled: false,
    },
  ];

  // Active menu key
  const activeKey =
    menuItems.find((item) => location.pathname === item.path)?.key ||
    "dashboard";

  const handleLogout = async () => {
    try {
      const res = await logoutFunction();

      if (res) {
        toast.success("Đăng xuất thành công!");
        navigate("/auth/student");
      } else {
        toast.error("Đăng xuất thất bại!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Click menu
  const handleMenuClick = ({ key }) => {
    const item = menuItems.find((i) => i.key === key);
    if (item) {
      navigate(item.path);
      setMobileDrawerOpen(false);
    }
  };

  // Notifications dropdown
  const notificationItems = [
    { key: "1", label: "Bạn có 1 thông báo mới" },
    { key: "2", label: "Quiz mới đã sẵn sàng" },
  ];

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-400 mb-4">
            Không tìm thấy chiến dịch
          </p>
          <Button
            type="primary"
            onClick={() => navigate("/student")}
            className="rounded-xl"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  // ─── Sidebar Content ───────────────────────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Campaign Header */}
      <div className="p-4 border-b border-gray-100">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/student")}
          className="w-full justify-start mb-3 text-gray-600 hover:text-gray-800"
        >
          Đổi chiến dịch
        </Button>
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-gray-800 line-clamp-2">
            {campaign.name}
          </h3>
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
            {campaign.type === "school" ? "Trường học" : "Đối tác"}
          </span>
        </div>
      </div>

      {/* Student Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl">{currentStudent?.imagePresignedUrl}</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-800 truncate">
              {currentStudent?.fullName}
            </p>
            <p className="text-xs text-gray-400">
              Lớp {currentStudent?.className} •{" "}
              {currentStudent?.school.schoolName}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50">
            <div className="flex items-center gap-2">
              <CoinIcon />
              <span className="font-bold text-amber-600">
                {currentStudent?.totalCoins}
              </span>
            </div>
            <span className="text-xs text-gray-400">xu</span>
          </div>
          <Button
            block
            icon={<GiftOutlined />}
            onClick={() => navigate("/student/rewards")}
            className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-600 hover:border-amber-300"
          >
            Đổi quà
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </p>
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            onClick={handleMenuClick}
            items={menuItems.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              disabled: item.disabled,
            }))}
            className="border-0"
            style={{ background: "transparent" }}
          />
        </div>
      </div>

      {/* Logout */}
      <div className="mt-auto p-4 border-t border-gray-100">
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="w-full justify-start text-gray-400 hover:text-gray-700"
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sidebar */}
      <Sider
        width={280}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
        className="hidden lg:block bg-white border-r border-gray-100"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          overflow: "auto",
        }}
      >
        <SidebarContent />
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        width={280}
        className="lg:hidden"
        bodyStyle={{ padding: 0 }}
      >
        <SidebarContent />
      </Drawer>

      <Layout
        style={{ marginLeft: collapsed ? 0 : 280 }}
        className="transition-all duration-200 lg:ml-[280px]"
      >
        {/* Top Bar */}
        <Header
          className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 flex items-center gap-4"
          style={{ height: 64, lineHeight: "64px", padding: "0 24px" }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden"
          />
          <div className="flex-1" />
          <NotificationDropdown />
        </Header>

        {/* Page Content */}
        <Content className="p-6 bg-gradient-to-b from-white to-gray-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
}
