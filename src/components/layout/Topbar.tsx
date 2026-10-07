import React from 'react';
import { useLocation } from 'react-router-dom';
import { BellIcon, MenuIcon } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { PAGE_TITLES } from '../../lib/navigation';

export interface TopbarProps {
  onOpenSidebar: () => void;
    search?: string;
  onSearchChange?: (value: string) => void;
}

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/missions/')) return 'Mission detail';
  return 'Meridian';
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
    const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        className="rounded-xl p-2 text-fg-muted transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg lg:hidden">
        
        <MenuIcon size={18} />
      </button>

      <h2 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-fg">
        {resolveTitle(pathname)}
      </h2>

      <div className="ml-auto flex items-center gap-2">

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2 text-fg-muted transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg">
          
          <BellIcon size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" aria-hidden />
        </button>

        <div className="mx-1 h-6 w-px bg-line" aria-hidden />

        <UserMenu />
      </div>
    </header>);

}