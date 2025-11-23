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
import CustomAnalysis from '@/components/custom-analysis'
import DataExplorer from '@/components/data-explorer'
import ManageDisplay from '@/components/manage-display'
import UserManagement from '@/components/user-management'
import LoginScreen from '@/components/login/login-screen'

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

interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
}

function App() {
  const [activeView, setActiveView] = useState<string>('home')
  const [viewMode, setViewMode] = useState<'dashboard' | 'indicator' | 'stock' | 'crypto'>('dashboard')
  const [user, setUser] = useState<User | null>(null)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      // First check localStorage
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          localStorage.removeItem('user')
        }
      }

      // Always verify with backend (handles SSO case where localStorage is empty)
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
        const response = await fetch(`${API_BASE}/api/auth/user/`, {
          credentials: 'include'
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        } else if (!storedUser) {
          // If backend says not logged in and nothing in localStorage, ensure we are clear
          setUser(null)
        }
      } catch (e) {
        console.error('Auth check failed', e)
      } finally {
        setIsAuthChecked(true)
      }
    }

    checkAuth()
  }, [])

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

  const handleSignIn = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
  }

  const handleSignOut = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
      await fetch(`${API_BASE}/api/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (e) {
      console.error('Logout error:', e)
    }
    localStorage.removeItem('user')
    setUser(null)
  }

  const handleBackToDashboard = () => {
    setTimeout(() => {
      setViewMode('dashboard')
    }, 300)
  }

  // Show loading state while checking auth
  if (!isAuthChecked) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </ThemeProvider>
    )
  }

  // Show login screen if explicitly requested (optional authentication)
  if (showLogin && !user) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <LoginScreen
          onSignIn={() => {
            handleSignIn()
            setShowLogin(false)
          }}
          onSkip={() => setShowLogin(false)}
        />
      </ThemeProvider>
    )
  }

  // Render based on view mode with transitions
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <div className="relative w-full h-screen overflow-hidden">
          {/* Dashboard View */}
          <div
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${viewMode === 'dashboard'
              ? 'translate-x-0 opacity-100'
              : '-translate-x-full opacity-0 pointer-events-none'
              }`}
          >
            <SidebarProvider>
              <AppHeader user={user || undefined} onSignOut={handleSignOut} onSignIn={() => setShowLogin(true)} />
              <div className="flex min-h-[calc(100vh-var(--app-header-h))] pt-[var(--app-header-h)] md:pt-0 w-full">
                <AppSidebar activeView={activeView} onNavigate={(view) => setActiveView(view)} isAdmin={user?.is_admin || false}>
                  {activeView === 'home' && <DashboardHome />}
                  {activeView === 'browse' && <BrowseStocks />}
                  {activeView === 'crypto' && <CryptoDashboard />}
                  {activeView === 'explorer' && <DataExplorer />}
                  {activeView === 'custom' && <CustomAnalysis />}
                  {activeView === 'manage-display' && <ManageDisplay />}
                  {activeView === 'user-management' && <UserManagement />}
                  {activeView === 'settings' && <Settings user={user || undefined} onSignOut={handleSignOut} />}
                </AppSidebar>
              </div>
            </SidebarProvider>
          </div>

          {/* Indicator Chart View */}
          <div
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${viewMode === 'indicator'
              ? 'translate-x-0 opacity-100'
              : 'translate-x-full opacity-0 pointer-events-none'
              }`}
          >
            <IndicatorChart onBack={handleBackToDashboard} />
          </div>

          {/* Stock Detail View */}
          <div
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${viewMode === 'stock'
              ? 'translate-x-0 opacity-100'
              : 'translate-x-full opacity-0 pointer-events-none'
              }`}
          >
            <StockDetail onBack={handleBackToDashboard} />
          </div>

          {/* Crypto Detail View */}
          <div
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${viewMode === 'crypto'
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
