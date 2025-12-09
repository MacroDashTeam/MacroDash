import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";
import ThemeProvider from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate, useParams, Outlet } from "react-router";

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

// Dispatches 'navigate-stock' event so StockDetail can pick up the symbol
function StockDetailWrapper() {
  const { symbol } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (symbol) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigate-stock', {
          detail: { symbol }
        }));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [symbol]);

  return <StockDetail onBack={() => navigate('/')} />;
}

// Dispatches 'navigate-to-crypto' event so CryptoDetail can pick up the symbol
function CryptoDetailWrapper() {
  const { symbol } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (symbol) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigate-to-crypto', {
          detail: symbol
        }));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [symbol]);

  return <CryptoDetail onBack={() => navigate('/')} />;
}

function DashboardLayout({ user, onSignOut }: { user: User | null, onSignOut: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveView = (path: string) => {
    if (path === '/' || path === '') return 'home';
    if (path.startsWith('/browse')) return 'browse';
    if (path.startsWith('/explorer')) return 'explorer';
    if (path.startsWith('/custom')) return 'custom';
    if (path.startsWith('/displays')) return 'manage-display';
    if (path.startsWith('/users')) return 'user-management';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/crypto')) return 'crypto';
    return 'home';
  };

  const activeView = getActiveView(location.pathname);

  const handleSidebarNavigate = (view: string) => {
    const viewToPath: Record<string, string> = {
      'home': '/',
      'browse': '/browse',
      'crypto': '/crypto',
      'explorer': '/explorer',
      'custom': '/custom',
      'manage-display': '/displays',
      'user-management': '/users',
      'settings': '/settings'
    };
    navigate(viewToPath[view] || '/');
  };

  return (
    <SidebarProvider>
      <AppHeader user={user || undefined} onSignOut={onSignOut} onSignIn={() => navigate('/login')} />
      <div className="flex min-h-[calc(100vh-var(--app-header-h))] pt-[var(--app-header-h)] md:pt-0 w-full">
        <AppSidebar
          activeView={activeView}
          onNavigate={handleSidebarNavigate}
          isAdmin={user?.is_admin || false}
        >
          <Outlet />
        </AppSidebar>
      </div>
    </SidebarProvider>
  );
}

function PasswordResetWrapper() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  if (!uid || !token) return <Navigate to="/login" />;

  return <PasswordResetConfirm uid={uid} token={token} onSuccess={() => navigate('/login')} />;
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const navigate = useNavigate();

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
    const handleLegacyNavigate = (e: CustomEvent) => {
      if (!e.detail) return;
      const { mode, symbol } = e.detail;

      if (mode === 'stock' && symbol) {
        navigate(`/stock/${symbol}`);
      } else if (mode === 'indicator') {
        navigate('/indicator');
      } else if (mode === 'crypto') {
        navigate('/crypto');
      } else if (mode === 'dashboard') {
        navigate('/');
      }
    };

    const handleLegacyCryptoNav = (e: CustomEvent) => {
      if (typeof e.detail === 'string') {
        navigate(`/crypto/${e.detail}`);
      } else {
        navigate('/crypto');
      }
    };

    window.addEventListener('navigate' as any, handleLegacyNavigate);
    window.addEventListener('navigate-to-crypto' as any, handleLegacyCryptoNav);

    return () => {
      window.removeEventListener('navigate' as any, handleLegacyNavigate);
      window.removeEventListener('navigate-to-crypto' as any, handleLegacyCryptoNav);
    }
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      await fetch(`${API_BASE}/api/auth/logout/`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('user');
    setUser(null);
    // Reload page to clear all cached data and redirect to login
    window.location.reload();
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

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/login" element={
            <LoginScreen
              onSignIn={() => {
                window.location.reload();
              }}
              onSkip={() => navigate('/')}
            />
          } />

          <Route path="/password-reset/confirm/:uid/:token" element={<PasswordResetWrapper />} />

          <Route element={<DashboardLayout user={user} onSignOut={handleSignOut} />}>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/browse" element={<BrowseStocks />} />
            <Route path="/crypto" element={<CryptoDashboard />} />
            <Route path="/explorer" element={<DataExplorer />} />
            <Route path="/custom" element={<CustomAnalysis />} />
            <Route path="/displays" element={<ManageDisplay />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/settings" element={<Settings user={user || undefined} onSignOut={handleSignOut} />} />
          </Route>

          <Route path="/indicator" element={<IndicatorChart onBack={() => navigate('/')} />} />
          <Route path="/stock/:symbol" element={<StockDetailWrapper />} />
          <Route path="/crypto/:symbol" element={<CryptoDetailWrapper />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
