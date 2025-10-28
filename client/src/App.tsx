import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";

import ThemeProvider from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import DashboardHome from '@/components/dashboard-home'
import BrowseStocks from '@/components/browse-stocks'
import IndicatorChart from '@/components/indicator-chart'
import StockDetail from '@/components/stock-detail'
import Settings from '@/components/settings'
import CryptoDashboard from '@/components/crypto-dashboard'
import CryptoDetail from '@/components/crypto-detail'

import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // Data stays fresh for 30 seconds
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus (use intervals instead)
      refetchOnMount: false, // Don't refetch on mount if data exists
      retry: 1, // Only retry failed requests once
    },
  },
})

function App() {
  const [activeView, setActiveView] = useState<string>('home')
  const [viewMode, setViewMode] = useState<'dashboard' | 'indicator' | 'stock' | 'crypto'>('dashboard')

  useEffect(() => {
    // Listen for custom navigation events
    const handleNavigate = (e: CustomEvent) => {
      setTimeout(() => {
        setViewMode(e.detail.mode)
      }, 300)
    }

    // Listen for crypto navigation (when clicking on a crypto in the dashboard)
    const handleCryptoNav = () => {
      setTimeout(() => {
        setViewMode('crypto')
      }, 300)
    }

    window.addEventListener('navigate' as any, handleNavigate)
    window.addEventListener('navigate-to-crypto' as any, handleCryptoNav)
    return () => {
      window.removeEventListener('navigate' as any, handleNavigate)
      window.removeEventListener('navigate-to-crypto' as any, handleCryptoNav)
    }
  }, [])

  const handleBackToDashboard = () => {
    setTimeout(() => {
      setViewMode('dashboard')
    }, 300)
  }

  // Render based on view mode with transitions
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <div className="relative w-full h-screen overflow-hidden">
          {/* Dashboard View */}
          <div
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${
              viewMode === 'dashboard'
                ? 'translate-x-0 opacity-100'
                : '-translate-x-full opacity-0 pointer-events-none'
            }`}
          >
            <SidebarProvider>
              <AppHeader />
              <div className="flex min-h-[calc(100vh-var(--app-header-h))] pt-[var(--app-header-h)] md:pt-0">
                <AppSidebar activeView={activeView} onNavigate={(view) => setActiveView(view)}>
                  {activeView === 'home' && <DashboardHome />}
                  {activeView === 'browse' && <BrowseStocks />}
                  {activeView === 'crypto' && <CryptoDashboard />}
                  {activeView === 'settings' && <Settings />}
                </AppSidebar>
              </div>
            </SidebarProvider>
          </div>

          {/* Indicator Chart View */}
          <div
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${
              viewMode === 'indicator'
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0 pointer-events-none'
            }`}
          >
            <IndicatorChart onBack={handleBackToDashboard} />
          </div>

          {/* Stock Detail View */}
          <div
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${
              viewMode === 'stock'
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0 pointer-events-none'
            }`}
          >
            <StockDetail onBack={handleBackToDashboard} />
          </div>

          {/* Crypto Detail View */}
          <div
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${
              viewMode === 'crypto'
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0 pointer-events-none'
            }`}
          >
            <CryptoDetail onBack={handleBackToDashboard} />
          </div>
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
