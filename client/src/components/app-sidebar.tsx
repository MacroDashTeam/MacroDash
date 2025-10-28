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
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Home, Search, Database, LayoutDashboard, Settings, TrendingUp, Bitcoin } from "lucide-react";

const navItems = [
  { title: "Home", url: "/", icon: Home, view: "home" },
  { title: "Browse Stocks", url: "/browse", icon: TrendingUp, view: "browse" },
  { title: "Cryptocurrency", url: "/crypto", icon: Bitcoin, view: "crypto" },
  { title: "Search Time Series", url: "/search", icon: Search, view: null },
  { title: "Browse Catalog", url: "/catalog", icon: Database, view: null },
  { title: "Manage Displays", url: "/displays", icon: LayoutDashboard, view: null },
  { title: "Settings", url: "/settings", icon: Settings, view: "settings" },
] as const;

type AppSidebarProps = {
  onNavigate?: (view: string) => void;
  activeView?: string;
};

export default function AppSidebar({ onNavigate, activeView, children }: React.PropsWithChildren<AppSidebarProps>) {
  return (
    <>
      <Sidebar
        collapsible="icon"
        className="top-0 h-screen z-50 bg-[#0B1320]/95 backdrop-blur"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {navItems.map((item) => (
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
