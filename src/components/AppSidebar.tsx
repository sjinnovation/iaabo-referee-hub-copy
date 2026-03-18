import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogOut, LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SidebarMenuItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  isLabel?: boolean;
  hidden?: boolean;
}

interface AppSidebarProps {
  label: string;
  menuItems: SidebarMenuItem[];
  showUserInfo?: boolean;
}

export function AppSidebar({ label, menuItems, showUserInfo = false }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const initials = profile
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() || "U"
    : "U";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <TooltipProvider delayDuration={0}>
              <SidebarMenu className="gap-0.5">
                {menuItems.filter((item) => !item.hidden).map((item, index) => {
                  if (item.isLabel) {
                    if (collapsed) {
                      return (
                        <div
                          key={`label-${item.title}-${index}`}
                          className="my-2 mx-1.5 h-px bg-border/60"
                        />
                      );
                    }
                    return (
                      <div
                        key={`label-${item.title}-${index}`}
                        className="flex items-center gap-2 px-3 pt-5 pb-1.5"
                      >
                        <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
                          {item.title}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
                      </div>
                    );
                  }

                  if (!item.url || !item.icon) return null;

                  const active = isActive(item.url);
                  const Icon = item.icon;

                  const button = (
                    <SidebarMenuItem key={`${item.title}-${index}`}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className="transition-colors duration-150"
                      >
                        <NavLink to={item.url} end>
                          <Icon className={`w-4 h-4 shrink-0 transition-colors duration-150 ${active ? "text-primary" : ""}`} />
                          {!collapsed && (
                            <span className="truncate">{item.title}</span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={`${item.title}-${index}`}>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return button;
                })}
              </SidebarMenu>
            </TooltipProvider>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            {showUserInfo && !collapsed && profile && (
              <div className="px-2 py-3 border-t border-border/60">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate leading-tight">
                      {profile.first_name} {profile.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <TooltipProvider delayDuration={0}>
              <SidebarMenu>
                <SidebarMenuItem>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          onClick={handleLogout}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
                        >
                          <LogOut className="w-4 h-4" />
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        Logout
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton
                      onClick={handleLogout}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </TooltipProvider>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
