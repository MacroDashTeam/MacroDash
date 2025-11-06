import Bull from '../assets/bull.jpeg';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';

const APP_HEADER_H = "56px";

interface User {
  id: number;
  username: string;
  email: string;
}

type AppHeaderProps = {
  user?: User;
  onSignOut?: () => void;
};

interface style {
  height: string;
  "--app-header-h": string;
}

export default function AppHeader({ user, onSignOut }: AppHeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 w-full bg-[#0B1320]/95 backdrop-blur"
      style={{ height: APP_HEADER_H, ["--app-header-h"]: APP_HEADER_H } as style}
    >
      <div className="flex h-full w-full items-center justify-between px-4">
        <a href="#/home" className="group flex items-center gap-2">
          <img src={Bull} alt="MacroDash Logo" className="h-7 w-7 shrink-0" />
          <span className="text-lg font-semibold tracking-tight">
            MacroDash
          </span>
        </a>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <UserIcon className="h-4 w-4" />
              <span>{user.username}</span>
            </div>
          )}

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
        </div>
      </div>
    </header>
  );
}
