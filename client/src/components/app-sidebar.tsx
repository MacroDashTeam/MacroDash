import * as React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Home, Search, LayoutDashboard, Settings, TrendingUp, Bitcoin, Calculator, Users } from "lucide-react";

const navItems = [
  { title: "Home", url: "/", icon: Home, view: "home", adminOnly: false },
  { title: "Browse Stocks", url: "/browse", icon: TrendingUp, view: "browse", adminOnly: false },
  { title: "Cryptocurrency", url: "/crypto", icon: Bitcoin, view: "crypto", adminOnly: false },
  { title: "Data Explorer", url: "/explorer", icon: Search, view: "explorer", adminOnly: false },
  { title: "Custom Analysis", url: "/custom", icon: Calculator, view: "custom", adminOnly: false },
  { title: "Dashboard", url: "/displays", icon: LayoutDashboard, view: "manage-display", adminOnly: false },
  { title: "User Management", url: "/users", icon: Users, view: "user-management", adminOnly: true },
  { title: "Settings", url: "/settings", icon: Settings, view: "settings", adminOnly: false },
];

type AppSidebarProps = {
  onNavigate?: (view: string) => void;
  activeView?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
};

export default function AppSidebar({ onNavigate, activeView, isAdmin = false, isSuperAdmin = false, children }: React.PropsWithChildren<AppSidebarProps>) {
  const filteredNavItems = isSuperAdmin
    ? navItems
    : navItems.filter(item => !item.adminOnly || !isAdmin);

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="top-0 h-screen z-50 bg-[#0B1320]/95 backdrop-blur"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={item.view === activeView}
                    asChild
                    tooltip={item.title}
                    className="
                      group-data-[collapsible=icon]/sidebar:justify-center
                      group-data-[collapsible=icon]/sidebar:px-0
                    "
                  >
                    {item.view ? (
                      <a
                        href={item.url}
                        onClick={(e) => {
                          if (onNavigate) {
                            e.preventDefault();
                            onNavigate(item.view);
                          }
                        }}
                        className="flex w-full items-center gap-2"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]/sidebar:hidden">
                          {item.title}
                        </span>
                      </a>
                    ) : (
                      <a href={item.url} className="flex w-full items-center gap-2">
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]/sidebar:hidden">
                          {item.title}
                        </span>
                      </a>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter />
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {children}
      </SidebarInset>
    </>
  );
}
