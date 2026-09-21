import React, { useMemo, useState } from 'react';
import { MoreHorizontalIcon, SearchIcon, UsersIcon } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Avatar } from '../components/shared/Avatar';
import { DataTable, type Column } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { useUserStatusUpdate, useUsers } from '../hooks/useUsers';
import type { DirectoryUser } from '../data/users';
import { roleLabel } from '../lib/roles';
import { formatDate } from '../lib/utils';

export function Users() {
  const { data, isLoading } = useUsers();
  const updateStatus = useUserStatusUpdate();
  const [search, setSearch] = useState('');
  const [pendingSuspend, setPendingSuspend] = useState<DirectoryUser | null>(null);

  const users = data ?? [];
  const rows = useMemo(
    () =>
    users.filter((user) =>
    !search.trim() ?
    true :
    [user.fullName, user.email, user.department].join(' ').toLowerCase().includes(search.trim().toLowerCase())
    ),
    [users, search]
  );

  const columns: Array<Column<DirectoryUser>> = [
  {
    key: 'user',
    header: 'User',
    render: (user) =>
    <div className="flex items-center gap-3">
          <Avatar name={user.fullName} />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium text-fg">{user.fullName}</p>
            <p className="truncate text-[12px] text-fg-subtle">{user.email}</p>
          </div>
        </div>

  },
  {
    key: 'department',
    header: 'Department',
    render: (user) => <span className="text-[13px] text-fg">{user.department}</span>
  },
  {
    key: 'roles',
    header: 'Roles',
    render: (user) =>
    <div className="flex flex-wrap gap-1.5">
          {user.roles.map((role) =>
      <Badge key={role} tone="brand">
              {roleLabel(role)}
            </Badge>
      )}
        </div>

  },
  {
    key: 'missions',
    header: 'Missions',
    align: 'right',
    render: (user) => <span className="text-[13px] tabular-nums text-fg">{user.missions}</span>
  },
  {
    key: 'lastActive',
    header: 'Last active',
    render: (user) =>
    <span className="text-[13px] text-fg-muted">{formatDate(user.lastActiveAt, 'MMM d, HH:mm')}</span>

  },
  {
    key: 'status',
    header: 'Status',
    align: 'right',
    render: (user) => <StatusBadge status={user.status} />
  },
  {
    key: 'actions',
    header: <span className="sr-only">Actions</span>,
    align: 'right',
    render: (user) =>
    <DropdownMenu
      items={[
      {
        label: 'Reactivate account',
        disabled: user.status === 'ACTIVE',
        onSelect: () => updateStatus.mutate({ id: user.id, status: 'ACTIVE' })
      },
      {
        label: 'Resend invite',
        disabled: user.status !== 'INVITED',
        onSelect: () => updateStatus.mutate({ id: user.id, status: 'INVITED' })
      },
      {
        label: 'Suspend account',
        tone: 'danger',
        disabled: user.status === 'SUSPENDED',
        onSelect: () => setPendingSuspend(user)
      }]
      }
      trigger={({ toggle }) =>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Actions for ${user.fullName}`}
        className="rounded-lg p-1.5 text-fg-subtle transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg">
        
              <MoreHorizontalIcon size={16} />
            </button>
      } />


  }];


  return (
    <PageTransition>
      <PageHeader
        title="Users"
        description="Manage who can raise missions, approve them and close out settlements."
        meta={
        <Badge tone="neutral">
            {users.filter((user) => user.status === 'ACTIVE').length} active of {users.length}
          </Badge>
        } />
      

      <DataTable
        caption="User directory"
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(user) => user.id}
        toolbar={
        <>
            <p className="text-[13px] text-fg-muted">
              <span className="font-medium text-fg">{rows.length}</span> accounts
            </p>
            <div className="w-full sm:w-72">
              <Input
              type="search"
              icon={SearchIcon}
              aria-label="Filter users"
              placeholder="Filter by name, email or team"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9" />
            
            </div>
          </>
        }
        empty={
        <EmptyState
          icon={UsersIcon}
          title="No users match that search"
          description="Try a different name, email address or department." />

        } />
      

      <ConfirmDialog
        open={Boolean(pendingSuspend)}
        tone="danger"
        title="Suspend this account?"
        message={
        pendingSuspend ?
        `${pendingSuspend.fullName} will immediately lose access to the console. Any missions they raised stay in the register.` :
        ''
        }
        confirmLabel="Suspend account"
        loading={updateStatus.isPending}
        onCancel={() => setPendingSuspend(null)}
        onConfirm={() => {
          if (pendingSuspend) {
            updateStatus.mutate({ id: pendingSuspend.id, status: 'SUSPENDED' });
          }
          setPendingSuspend(null);
        }} />
      
    </PageTransition>);

}