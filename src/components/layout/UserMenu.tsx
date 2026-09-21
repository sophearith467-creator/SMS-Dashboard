import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react';
import { DropdownMenu } from '../ui/DropdownMenu';
import { Avatar } from '../shared/Avatar';
import { useAuth } from '../../context/AuthContext';
import { roleLabel } from '../../lib/roles';
import { cn } from '../../lib/utils';

export function UserMenu() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <DropdownMenu
      width="w-64"
      header={
      <div className="flex items-center gap-3">
          <Avatar name={user.fullName} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-fg">{user.fullName}</p>
            <p className="truncate text-[11.5px] text-fg-muted">{user.email}</p>
          </div>
        </div>
      }
      items={[
      { label: 'Profile', icon: UserIcon, onSelect: () => navigate('/') },
      { label: 'Preferences', icon: SettingsIcon, onSelect: () => navigate('/') },
      {
        label: 'Sign out',
        icon: LogOutIcon,
        tone: 'danger',
        onSelect: () => {
          signOut();
          navigate('/login', { replace: true });
        }
      }]
      }
      trigger={({ open, toggle }) =>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2.5 rounded-xl border border-transparent py-1.5 pl-1.5 pr-2.5',
          'transition-[background-color,border-color] duration-150 ease-out hover:border-line hover:bg-surface-muted',
          open && 'border-line bg-surface-muted'
        )}>
        
          <Avatar name={user.fullName} size="sm" />
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[13px] font-medium text-fg">{user.fullName}</span>
            <span className="block text-[11px] text-fg-muted">{roleLabel(role)}</span>
          </span>
          <ChevronDownIcon
          size={15}
          aria-hidden
          className={cn('text-fg-subtle transition-transform duration-150 ease-out', open && 'rotate-180')} />
        
        </button>
      } />);


}