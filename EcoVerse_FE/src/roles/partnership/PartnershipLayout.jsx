import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import {
  LayoutDashboard,
  Gift,
  Settings,
  LogOut,
  Handshake,
  Loader2,
  Leaf,
  TreePine,
  Sparkles,
  FileQuestion,
  Flag,
  Trophy,
  CreditCard,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import { NotificationDropdown } from "@/shared/components/NotificationDropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { logoutFunction } from "../../features/auth/services";
import toast from "react-hot-toast";
import { usePartnership } from "./hooks/usePartnership";

const menuItems = [
  { title: "Tổng quan", url: "/partnership", icon: LayoutDashboard },
  { title: "Chiến dịch", url: "/partnership/campaigns", icon: Flag },
  { title: "Bảng xếp hạng", url: "/partnership/leaderboard", icon: Trophy },
  { title: "Quiz", url: "/partnership/quizzes", icon: FileQuestion },
  { title: "Phần thưởng", url: "/partnership/rewards", icon: Gift },
  { title: "Gói đăng ký", url: "/partnership/subscription", icon: CreditCard },
];

function PartnershipSidebar({ partnershipInfo, getPartnershipTypeLabel }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    try {
      const res = await logoutFunction();
      if (res) {
        toast.success("Đăng xuất thành công!");
        navigate("/auth/partnership");
      } else {
        toast.error("Đăng xuất thất bại!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-2 border-eco-blue/15 bg-sidebar"
    >
      <SidebarContent>
        {/* Partnership Info Header */}
        <div
          className={cn(
            "border-b-2 border-eco-blue/15",
            isCollapsed ? "p-2" : "p-5",
          )}
        >
          <div
            className={cn(
              "flex items-center mb-5",
              isCollapsed ? "justify-center" : "gap-3",
            )}
          >
            <div className="relative">
              <div
                className={cn(
                  "rounded-2xl bg-eco-blue flex items-center justify-center",
                  isCollapsed ? "w-8 h-8" : "w-12 h-12",
                )}
              >
                <Handshake
                  className={cn(
                    isCollapsed ? "w-4 h-4" : "w-6 h-6",
                    "text-primary-foreground",
                  )}
                />
              </div>
              {!isCollapsed && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-eco-blue border-2 border-sidebar flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-primary-foreground" />
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden flex-1">
                <h2 className="font-bold text-sidebar-foreground text-sm truncate">
                  {partnershipInfo?.organizationName || "Partnership"}
                </h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TreePine className="w-3 h-3" />
                  EcoVerse Partner
                </p>
              </div>
            )}
          </div>

          {/* Quick Info - hide when collapsed */}
          {!isCollapsed && partnershipInfo && (
            <div className="p-3 rounded-xl bg-eco-blue/8 border border-eco-blue/20">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Lĩnh vực
              </p>
              <p className="text-sm font-bold text-eco-blue">
                {getPartnershipTypeLabel(partnershipInfo.partnershipType)}
              </p>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="py-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-muted-foreground text-[11px] font-bold px-5 py-2 uppercase tracking-wider">
              Quản lý
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent className={cn(isCollapsed ? "px-1" : "px-3")}>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== "/partnership" &&
                    location.pathname.startsWith(item.url));

                const menuButton = (
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center rounded-xl transition-all duration-200 w-full group",
                        isCollapsed
                          ? "justify-center p-2"
                          : "gap-3 px-3 py-2.5",
                        isActive
                          ? "bg-eco-blue/12 text-eco-blue font-semibold border border-eco-blue/25"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-lg flex items-center justify-center transition-all duration-200",
                          isCollapsed ? "w-8 h-8" : "w-8 h-8",
                          isActive
                            ? "bg-eco-blue text-primary-foreground"
                            : "bg-muted/60 group-hover:bg-muted",
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="text-sm">{item.title}</span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-eco-blue" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                );

                return (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      menuButton
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Menu */}
        <SidebarGroup className="mt-auto pb-4">
          <SidebarGroupContent className={cn(isCollapsed ? "px-1" : "px-3")}>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to="/partnership/settings"
                          className="flex items-center justify-center p-2 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted/60 hover:text-foreground w-full group border border-transparent"
                        >
                          <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center group-hover:bg-muted transition-colors">
                            <Settings className="w-4 h-4" />
                          </div>
                        </NavLink>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      Cài đặt
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/partnership/settings"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted/60 hover:text-foreground w-full group border border-transparent"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center group-hover:bg-muted transition-colors">
                        <Settings className="w-4 h-4" />
                      </div>
                      <span className="text-sm">Cài đặt</span>
                    </NavLink>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
              <SidebarMenuItem>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center p-2 rounded-xl transition-all duration-200 text-destructive hover:bg-destructive/10 w-full group border border-transparent"
                        >
                          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                            <LogOut className="w-4 h-4" />
                          </div>
                        </button>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      Đăng xuất
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuButton asChild>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-destructive hover:bg-destructive/10 w-full group border border-transparent"
                    >
                      <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">Đăng xuất</span>
                    </button>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function PartnershipLayout() {
  const navigate = useNavigate();
  const { partnershipInfo, isLoading, getPartnershipTypeLabel } =
    usePartnership();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-eco-blue/12 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-eco-blue" />
          </div>
          <p className="text-muted-foreground font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PartnershipSidebar
          partnershipInfo={partnershipInfo}
          getPartnershipTypeLabel={getPartnershipTypeLabel}
        />
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b-2 border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted/60 rounded-xl transition-colors" />
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground">
                    EcoVerse
                  </span>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Partnership Portal
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <div
                className="flex items-center gap-3 pl-3 border-l-2 border-border cursor-pointer hover:opacity-80 transition-all group"
                onClick={() => navigate("/partnership/profile")}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-foreground group-hover:text-eco-blue transition-colors">
                    {partnershipInfo?.contactPerson || "Partner"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {partnershipInfo?.position || "Đối tác"}
                  </p>
                </div>
                <Avatar className="w-9 h-9 border-2 border-eco-blue/20 transition-transform group-hover:scale-105">
                  {partnershipInfo?.logoUrl ? (
                    <AvatarImage src={partnershipInfo.logoUrl} alt="Logo" />
                  ) : null}
                  <AvatarFallback className="bg-eco-blue text-primary-foreground font-bold text-sm">
                    {partnershipInfo?.organizationName?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6 bg-background">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
