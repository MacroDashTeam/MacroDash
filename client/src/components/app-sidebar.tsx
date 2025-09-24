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
} from "@/components/ui/sidebar";
import { Home, Search, Database, LayoutDashboard, Settings } from "lucide-react";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Search Time Series", url: "/search", icon: Search },
  { title: "Browse Catalog", url: "/catalog", icon: Database },
  { title: "Manage Displays", url: "/displays", icon: LayoutDashboard },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export default function AppSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      className="top-0 h-screen z-50 bg-[#0B1320]/95 backdrop-blur"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
              <SidebarMenuButton
                className="
                  group-data-[collapsible=icon]/sidebar:justify-center
                  group-data-[collapsible=icon]/sidebar:px-0
                "
              >
                <SidebarTrigger className="h-5 w-5 shrink-0" />
              </SidebarMenuButton>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className="
                    group-data-[collapsible=icon]/sidebar:justify-center
                    group-data-[collapsible=icon]/sidebar:px-0
                  "
                >
                  <a href={item.url} className="flex w-full items-center gap-2">
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="truncate group-data-[collapsible=icon]/sidebar:hidden">
                      {item.title}
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
