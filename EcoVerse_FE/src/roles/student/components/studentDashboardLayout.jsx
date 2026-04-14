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
    <div className="flex flex-col h-full bg-sidebar-background">
      {/* Campaign Header */}
      <div className="p-4 border-b border-border">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/student")}
          className="w-full justify-start mb-3 text-muted-foreground hover:text-primary transition-colors"
        >
          Đổi chiến dịch
        </Button>
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-foreground line-clamp-2">
            {campaign.name}
          </h3>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            {campaign.type === "school" ? "Trường học" : "Đối tác"}
          </span>
        </div>
      </div>

      {/* Student Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl filter drop-shadow-sm">{currentStudent?.imagePresignedUrl}</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground truncate">
              {currentStudent?.fullName}
            </p>
            <p className="text-xs text-muted-foreground">
              Lớp {currentStudent?.className} •{" "}
              {currentStudent?.school.schoolName}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <CoinIcon />
              <span className="font-bold text-amber-600">
                {currentStudent?.totalCoins}
              </span>
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">xu</span>
          </div>
          <Button
            block
            icon={<GiftOutlined />}
            onClick={() => navigate("/student/rewards")}
            className="rounded-xl bg-gradient-mint-eco text-white border-0 shadow-sm hover:opacity-90 transition-all font-semibold"
          >
            Đổi quà
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-4">
          <p className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">
            Menu Chính
          </p>
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            onClick={handleMenuClick}
            items={menuItems.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: <span className="font-medium">{item.label}</span>,
              disabled: item.disabled,
            }))}
            className="border-0"
          />
        </div>
      </div>

      {/* Logout */}
      <div className="mt-auto p-4 border-t border-border">
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive transition-colors"
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sider
        width={280}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
        className="hidden lg:block bg-card border-r border-border"
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
          className="sticky top-0 z-10 bg-card border-b border-border px-6 flex items-center gap-4"
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
        <Content className="p-6">
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
