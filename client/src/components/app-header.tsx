import Bull from '../assets/bull.jpeg';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, LogIn } from 'lucide-react';

const APP_HEADER_H = "56px";

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

type AppHeaderProps = {
  user?: User;
  onSignOut?: () => void;
  onSignIn?: () => void;
};

interface style {
  height: string;
  "--app-header-h": string;
}

export default function AppHeader({ user, onSignOut, onSignIn }: AppHeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full bg-[#0B1320]/95 backdrop-blur"
      style={{ height: APP_HEADER_H, ["--app-header-h"]: APP_HEADER_H } as style}
    >
      <div className="flex h-full w-full items-center px-6 relative">
        {/* Centered MacroDash branding - accounting for sidebar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center" style={{ marginLeft: 'calc(var(--sidebar-width, 230px) / 2)' }}>
          <div className="flex items-center gap-2">
            <img src={Bull} alt="MacroDash Logo" className="h-7 w-7 shrink-0" />
            <span className="text-xl font-semibold tracking-tight text-white">
              MacroDash
            </span>
          </div>
          <span className="text-xs text-zinc-400 mt-0.5 tracking-wide font-light">Complete Market Intelligence, One Platform</span>
        </div>

        {/* Right side - User info and logout/login (positioned absolutely) */}
        <div className="absolute right-6 flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <UserIcon className="h-4 w-4" />
                <span>{user.first_name || user.email}</span>
              </div>
              {onSignOut && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </>
          ) : (
            onSignIn && (
              <Button
                variant="default"
                size="sm"
                onClick={onSignIn}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
