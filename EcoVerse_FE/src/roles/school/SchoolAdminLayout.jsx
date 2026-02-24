import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
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
  Users, 
  GraduationCap, 
  FileQuestion, 
  Gift, 
  CreditCard,
  Settings, 
  LogOut,
  School,
  Loader2,
  Leaf,
  TreePine,
  Sparkles,
  Trophy,
  Flag,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/hooks/use-toast";
import { SchoolNotificationDropdown } from "./SchoolNotificationDropdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

const menuItems = [
  { title: "Tổng quan", url: "/school", icon: LayoutDashboard },
  { title: "Lớp & Học sinh", url: "/school/classes", icon: GraduationCap },
  { title: "Chiến dịch", url: "/school/campaigns", icon: Flag },
  { title: "Xếp hạng", url: "/school/leaderboard", icon: Trophy },
  { title: "Quiz", url: "/school/quizzes", icon: FileQuestion },
  { title: "Phần thưởng", url: "/school/rewards", icon: Gift },
  { title: "Gói đăng ký", url: "/school/subscription", icon: CreditCard },
];

function SchoolAdminSidebar({ schoolInfo }) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    try {
      // TODO: Implement logout with your auth provider
      console.log('Logging out...');
    } catch (error) {
      console.error('Logout error:', error);
    }
    toast({
      title: "Đã đăng xuất",
      description: "Hẹn gặp lại!",
    });
    // TODO: Navigate to login page
  };

  return (
    <Sidebar collapsible="icon" className="border-r-2 border-eco-green/15 bg-sidebar">
      <SidebarContent>
        {/* School Info Header */}
        <div className={cn("border-b-2 border-eco-green/15", isCollapsed ? "p-2" : "p-5")}>
          <div className={cn("flex items-center mb-5", isCollapsed ? "justify-center" : "gap-3")}>
            <div className="relative">
              {schoolInfo?.logo_url ? (
                <img 
                  src={schoolInfo.logo_url} 
                  alt="School logo" 
                  className={cn(
                    "rounded-2xl object-cover border-2 border-eco-green/20",
                    isCollapsed ? "w-8 h-8" : "w-12 h-12"
                  )}
                />
              ) : (
                <div className={cn(
                  "rounded-2xl bg-eco-green flex items-center justify-center",
                  isCollapsed ? "w-8 h-8" : "w-12 h-12"
                )}>
                  <School className={cn(isCollapsed ? "w-4 h-4" : "w-6 h-6", "text-primary-foreground")} />
                </div>
              )}
              {!isCollapsed && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-eco-green border-2 border-sidebar flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-primary-foreground" />
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden flex-1">
                <h2 className="font-bold text-sidebar-foreground text-sm truncate">
                  {schoolInfo?.school_name || "School Admin"}
                </h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TreePine className="w-3 h-3" />
                  EcoVerse Portal
                </p>
              </div>
            )}
          </div>
          
          {/* Quick Stats - hide when collapsed */}
          {!isCollapsed && (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-eco-green/8 border border-eco-green/20 text-center">
                <p className="text-lg font-bold text-eco-green">156</p>
                <p className="text-[10px] text-muted-foreground font-medium">Học sinh</p>
              </div>
              <div className="p-3 rounded-xl bg-eco-blue/8 border border-eco-blue/20 text-center">
                <p className="text-lg font-bold text-eco-blue">87%</p>
                <p className="text-[10px] text-muted-foreground font-medium">Độ chính xác</p>
              </div>
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
                const isActive = location.pathname === item.url || 
                  (item.url !== "/school" && location.pathname.startsWith(item.url));
                
                const menuButton = (
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center rounded-xl transition-all duration-200 w-full group",
                        isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5",
                        isActive 
                          ? "bg-eco-green/12 text-eco-green font-semibold border border-eco-green/25" 
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "rounded-lg flex items-center justify-center transition-all duration-200",
                        isCollapsed ? "w-8 h-8" : "w-8 h-8",
                        isActive 
                          ? "bg-eco-green text-primary-foreground" 
                          : "bg-muted/60 group-hover:bg-muted"
                      )}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="text-sm">{item.title}</span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-eco-green" />
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
                        <TooltipTrigger asChild>
                          {menuButton}
                        </TooltipTrigger>
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
                          to="/school/settings"
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
                      to="/school/settings"
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

export default function SchoolAdminLayout() {
  const [schoolInfo, setSchoolInfo] = useState({
    school_name: "EcoVerse School",
    logo_url: null,
    representative_name: "Admin",
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SchoolAdminSidebar schoolInfo={schoolInfo} />
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b-2 border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted/60 rounded-xl transition-colors" />
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground">EcoVerse</span>
                  <p className="text-[10px] text-muted-foreground font-medium">School Portal</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SchoolNotificationDropdown />
              <div className="flex items-center gap-3 pl-3 border-l-2 border-border">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-foreground">
                    {schoolInfo?.representative_name || "Admin"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">Quản trị viên</p>
                </div>
                <Avatar className="w-9 h-9 border-2 border-primary/20">
                  {schoolInfo?.logo_url ? (
                    <AvatarImage src={schoolInfo.logo_url} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                    {schoolInfo?.representative_name?.charAt(0) || "A"}
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