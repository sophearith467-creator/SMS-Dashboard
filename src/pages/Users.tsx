import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontalIcon, PlusIcon, SearchIcon, UsersIcon } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Avatar } from '../components/shared/Avatar';
import { DataTable, type Column } from '../components/shared/DataTable';
import { Pagination } from '../components/shared/Pagination';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { UserFormModal } from '../components/users/UserFormModal';
import {
  useCreateUser,
  useDeactivateUser,
  useUpdateUser,
  useUsers,
} from '../hooks/useUsers';
import type { DirectoryUser } from '../data/users';
import type { CreateUserPayload, UpdateUserPayload } from '../api/users';
import { roleLabel } from '../lib/roles';
import { formatDate } from '../lib/utils';

const PAGE_SIZE = 10;

export function Users() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching } = useUsers({ page, pageSize: PAGE_SIZE, search });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deactivateUser = useDeactivateUser();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<DirectoryUser | null>(null);
  const [pendingDeactivate, setPendingDeactivate] = useState<DirectoryUser | null>(null);

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function openCreate() {
    setFormMode('create');
    setEditingUser(null);
    setFormOpen(true);
  }

  function openEdit(user: DirectoryUser) {
    setFormMode('edit');
    setEditingUser(user);
    setFormOpen(true);
  }

  function handleFormSubmit(payload: CreateUserPayload | UpdateUserPayload) {
    if (formMode === 'create') {
      createUser.mutate(payload as CreateUserPayload, {
        onSuccess: () => setFormOpen(false),
      });
    } else if (editingUser) {
      updateUser.mutate(
        { id: editingUser.id, payload: payload as UpdateUserPayload },
        { onSuccess: () => setFormOpen(false) }
      );
    }
  }

  const columns: Array<Column<DirectoryUser>> = [
    {
      key: 'user',
      header: 'User',
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium text-fg">{user.fullName}</p>
            <p className="truncate text-[12px] text-fg-subtle">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (user) => <span className="text-[13px] text-fg">{user.department}</span>,
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (user) => (
        <div className="flex flex-wrap gap-1.5">
          {user.roles.map((role) => (
            <Badge key={role} tone="brand">
              {roleLabel(role)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'missions',
      header: 'Missions',
      align: 'right',
      render: (user) => (
        <span className="text-[13px] tabular-nums text-fg">{user.missions}</span>
      ),
    },
    {
      key: 'lastActive',
      header: 'Last active',
      render: (user) => (
        <span className="text-[13px] text-fg-muted">
          {formatDate(user.lastActiveAt, 'MMM d, HH:mm')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (user) => (
        <DropdownMenu
          items={[
            {
              label: 'View details',
              onSelect: () => navigate(`/users/${user.id}`),
            },
            {
              label: 'Edit user',
              onSelect: () => openEdit(user),
            },
            {
              label: 'Deactivate account',
              tone: 'danger',
              disabled: user.status === 'SUSPENDED',
              onSelect: () => setPendingDeactivate(user),
            },
          ]}
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggle();
              }}
              aria-label={`Actions for ${user.fullName}`}
              className="rounded-lg p-1.5 text-fg-subtle transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg"
            >
              <MoreHorizontalIcon size={16} />
            </button>
          )}
        />
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader
        title="Users"
        description="Manage who can raise missions, approve them and close out settlements."
        meta={<Badge tone="neutral">{total} accounts</Badge>}
        actions={
          <Button onClick={openCreate} className="gap-2">
            <PlusIcon size={16} />
            Create user
          </Button>
        }
      />

      <DataTable
        caption="User directory"
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(user) => user.id}
        onRowClick={(user) => navigate(`/users/${user.id}`)}
        toolbar={
          <>
            <p className="text-[13px] text-fg-muted">
              <span className="font-medium text-fg">{rows.length}</span> of {total} shown
            </p>
            <div className="w-full sm:w-72">
              <Input
                type="search"
                icon={SearchIcon}
                aria-label="Filter users"
                placeholder="Filter by name, email or team"
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="h-9"
              />
            </div>
          </>
        }
        footer={
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            disabled={isFetching}
          />
        }
        empty={
          <EmptyState
            icon={UsersIcon}
            title="No users match that search"
            description="Try a different name, email address or department."
          />
        }
      />

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        mode={formMode}
        user={editingUser}
        loading={createUser.isPending || updateUser.isPending}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={Boolean(pendingDeactivate)}
        tone="danger"
        title="Deactivate this account?"
        message={
          pendingDeactivate
            ? `${pendingDeactivate.fullName} will immediately lose access. Any missions they raised stay in the register.`
            : ''
        }
        confirmLabel="Deactivate"
        loading={deactivateUser.isPending}
        onCancel={() => setPendingDeactivate(null)}
        onConfirm={() => {
          if (pendingDeactivate) {
            deactivateUser.mutate(pendingDeactivate.id, {
              onSuccess: () => setPendingDeactivate(null),
            });
          }
        }}
      />
    </PageTransition>
  );
}
