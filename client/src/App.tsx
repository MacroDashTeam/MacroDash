import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";

import ThemeProvider from "@/components/theme-provider";

import './App.css'

  function App({ children }) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

        <SidebarProvider>
          <AppHeader />

          <div className="flex min-h-[calc(100vh-var(--app-header-h))] pt-[var(--app-header-h)] md:pt-0">
            <AppSidebar>
              <SidebarTrigger />
              {children}
            </AppSidebar>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    )
  }

export default App
