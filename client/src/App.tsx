import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";
import ThemeProvider from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import DashboardHome from '@/components/dashboard-home';
import BrowseStocks from '@/components/browse-stocks';
import IndicatorChart from '@/components/indicator-chart';
import StockDetail from '@/components/stock-detail';
import Settings from '@/components/settings';
import CryptoDashboard from '@/components/crypto-dashboard';
import CryptoDetail from '@/components/crypto-detail';
import CustomAnalysis from '@/components/custom-analysis';
import DataExplorer from '@/components/data-explorer';
import ManageDisplay from '@/components/manage-display';
import UserManagement from '@/components/user-management';
import LoginScreen from '@/components/login/login-screen';
import PasswordResetConfirm from '@/components/login/password-reset-confirm';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_admin: boolean;
}

function App() {
  // Core UI state
  const [activeView, setActiveView] = useState<string>('home');
  const [viewMode, setViewMode] = useState<'dashboard' | 'indicator' | 'stock' | 'crypto'>('dashboard');
  const [user, setUser] = useState<User | null>(null);

  // Auth & login flow state
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Password‑reset flow state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetUid, setResetUid] = useState('');
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem('user');
        }
      }
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
        const resp = await fetch(`${API_BASE}/api/auth/user/`, { credentials: 'include' });
        if (resp.ok) {
          const data = await resp.json();
          console.log("DATA", data);
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } else if (!stored) {
          setUser(null);
        }
      } catch (e) {
        console.error('Auth check failed', e);
      } finally {
        setIsAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/password-reset\/confirm\/([^\/]+)\/([^\/]+)\//);
    if (match) {
      setResetUid(match[1]);
      setResetToken(match[2]);
      setShowPasswordReset(true);
      // Clean the URL so the app stays on the main page after handling
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      setTimeout(() => setViewMode(e.detail.mode), 300);
    };
    const handleCryptoNav = () => {
      setTimeout(() => setViewMode('crypto'), 300);
    };
    window.addEventListener('navigate' as any, handleNavigate);
    window.addEventListener('navigate-to-crypto' as any, handleCryptoNav);
    return () => {
      window.removeEventListener('navigate' as any, handleNavigate);
      window.removeEventListener('navigate-to-crypto' as any, handleCryptoNav);
    };
  }, []);

  const handleSignIn = () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      await fetch(`${API_BASE}/api/auth/logout/`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleBackToDashboard = () => {
    setTimeout(() => setViewMode('dashboard'), 300);
  };

  if (!isAuthChecked) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </ThemeProvider>
    );
  }

  if (showPasswordReset) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <PasswordResetConfirm uid={resetUid} token={resetToken} onSuccess={() => setShowPasswordReset(false)} />
      </ThemeProvider>
    );
  }

  if (showLogin && !user) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <LoginScreen
          onSignIn={() => {
            handleSignIn();
            setShowLogin(false);
          }}
          onSkip={() => setShowLogin(false)}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <div className="relative w-full h-screen overflow-hidden">
          {/* Dashboard view */}
          <div
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${viewMode === 'dashboard' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
              }`}
          >
            <SidebarProvider>
              <AppHeader user={user || undefined} onSignOut={handleSignOut} onSignIn={() => setShowLogin(true)} />
              <div className="flex min-h-[calc(100vh-var(--app-header-h))] pt-[var(--app-header-h)] md:pt-0 w-full">
                <AppSidebar activeView={activeView} onNavigate={setActiveView} isAdmin={user?.is_admin || false}>
                  {activeView === 'home' && <DashboardHome />}
                  {activeView === 'browse' && <BrowseStocks />}
                  {activeView === 'crypto' && <CryptoDashboard />}
                  {activeView === 'explorer' && <DataExplorer />}
                  {activeView === 'custom' && <CustomAnalysis />}
                  {activeView === 'manage-display' && <ManageDisplay />}
                  {activeView === 'user-management' && <UserManagement />}
                  {activeView === 'settings' && <Settings user={user || undefined} onSignOut={handleSignOut} />}
                  {activeView === 'password-reset-confirm' && <PasswordResetConfirm uid={resetUid} token={resetToken} onSuccess={() => setShowPasswordReset(false)} />}
                </AppSidebar>
              </div>
            </SidebarProvider>
          </div>

          {/* Indicator chart view */}
          <div
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${viewMode === 'indicator' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
              }`}
          >
            <IndicatorChart onBack={handleBackToDashboard} />
          </div>

          {/* Stock detail view */}
          <div
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${viewMode === 'stock' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
              }`}
          >
            <StockDetail onBack={handleBackToDashboard} />
          </div>

          {/* Crypto detail view */}
          <div
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-all duration-300 ease-in-out ${viewMode === 'crypto' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
              }`}
          >
            <CryptoDetail onBack={handleBackToDashboard} />
          </div>
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
