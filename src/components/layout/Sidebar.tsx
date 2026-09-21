import React from 'react';
import { NavLink } from 'react-router-dom';
import { MoonIcon, SunIcon, XIcon } from 'lucide-react';
import { NAV_ITEMS, type NavItem } from '../../lib/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import { cn } from '../../lib/utils';

const GROUP_ORDER: Array<NavItem['group']> = ['Overview', 'Operations', 'Finance', 'Administration'];

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white shadow-brand">
        M
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-[-0.01em] text-fg">Meridian</p>
        <p className="text-[11px] text-fg-subtle">Mission Management</p>
      </div>
    </div>);

}

export function Sidebar({ onNavigate }: {onNavigate?: () => void;}) {
  const { can } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const status = useBackendStatus();

  const visible = NAV_ITEMS.filter((item) => can(item.roles));

  return (
    <div className="flex h-full flex-col border-r border-line bg-surface">
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        <BrandMark />
        {onNavigate &&
        <button
          type="button"
          onClick={onNavigate}
          aria-label="Close navigation"
          className="rounded-lg p-1.5 text-fg-subtle transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg lg:hidden">
          
            <XIcon size={18} />
          </button>
        }
      </div>

      <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-2">
        {GROUP_ORDER.map((group) => {
          const items = visible.filter((item) => item.group === group);
          if (items.length === 0) return null;

          return (
            <div key={group}>
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
                {group}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) =>
                <li key={item.to}>
                    <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium',
                      'transition-[background-color,color] duration-150 ease-out',
                      isActive ?
                      'bg-brand-soft text-brand-text' :
                      'text-fg-muted hover:bg-surface-muted hover:text-fg'
                    )
                    }>
                    
                      {({ isActive }) =>
                    <>
                          <item.icon
                        size={17}
                        aria-hidden
                        className={isActive ? 'text-brand' : 'text-fg-subtle group-hover:text-fg-muted'} />
                      
                          {item.label}
                        </>
                    }
                    </NavLink>
                  </li>
                )}
              </ul>
            </div>);

        })}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-line p-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium text-fg-muted transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg">
          
          {theme === 'dark' ? <SunIcon size={17} aria-hidden /> : <MoonIcon size={17} aria-hidden />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        <div className="flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2.5">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              status === 'online' ? 'bg-success' : status === 'offline' ? 'bg-warning' : 'bg-fg-subtle'
            )}
            aria-hidden />
          
          <p className="text-[11.5px] leading-tight text-fg-muted">
            {status === 'online' ?
            'Connected to API' :
            status === 'offline' ?
            'Offline — demo dataset' :
            'Checking API…'}
          </p>
        </div>
      </div>
    </div>);

}