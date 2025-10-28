import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";
import LoginScreen from "@/components/login/login-screen";

import ThemeProvider from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import DashboardHome from '@/components/dashboard-home'

import './App.css'

const queryClient = new QueryClient()

function App({ children }: { children?: React.ReactNode }) {
    const [activeView, setActiveView] = useState<string>('home')
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // temporarily hardcoded while the backend is built

    const handleLogout = () => {
      setIsAuthenticated(false)
      localStorage.removeItem('isAuthenticated')
    }

    if (!isAuthenticated) {
      return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <LoginScreen onSignIn={() => setIsAuthenticated(true)} />
        </ThemeProvider>
      )
    }

    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <AppHeader onLogout={handleLogout} />

            <div className="flex min-h-[calc(100vh-var(--app-header-h))] pt-[var(--app-header-h)] md:pt-0">
              <AppSidebar activeView={activeView} onNavigate={(view) => setActiveView(view)}>
                <SidebarTrigger />
                {activeView === 'home' ? (
                  <div className="flex-1">
                    <DashboardHome />
                  </div>
                ) : (
                  children
                )}
              </AppSidebar>
            </div>
          </SidebarProvider>
        </QueryClientProvider>
      </ThemeProvider>
    )
  }

export default App
