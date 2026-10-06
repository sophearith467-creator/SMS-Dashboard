import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDownIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon,
} from 'lucide-react';
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
import { useMissions } from '../hooks/useMissions';
import type { DirectoryUser } from '../data/users';
import type { CreateUserPayload, UpdateUserPayload } from '../api/users';
import { roleLabel } from '../lib/roles';
import { cn, formatDate } from '../lib/utils';

const PAGE_SIZE = 10;

type UserRole = DirectoryUser['roles'][number];
type StatusFilter = 'ALL' | 'ACTIVE' | 'SUSPENDED';

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

// "!" forces the left border back, even if DataTable uses `last:border-0`
const ROW_ACCENT: Record<string, string> = {
  ACTIVE: 'border-l-2 border-l-success !border-l-2',
  SUSPENDED: 'border-l-2 border-l-danger !border-l-2',
};
const ROW_ACCENT_DEFAULT = 'border-l-2 border-l-transparent !border-l-2';

const FILTER_BUTTON_CLASS =
  'inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-[13px] font-medium text-fg shadow-soft transition-colors duration-150 ease-out hover:border-line-strong';

export function Users() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const { data, isLoading, isFetching } = useUsers({ page, pageSize: PAGE_SIZE, search });
  const { data: missions = [] } = useMissions();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deactivateUser = useDeactivateUser();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<DirectoryUser | null>(null);
  const [pendingDeactivate, setPendingDeactivate] = useState<DirectoryUser | null>(null);

  // Collect every role we have seen so far, so the dropdown always uses real values
  const [knownRoles, setKnownRoles] = useState<UserRole[]>([]);
  useEffect(() => {
    const items = data?.items ?? [];
    if (items.length === 0) return;
    setKnownRoles((previous) => {
      const next = new Set<UserRole>(previous);
      for (const user of items) {
        for (const role of user.roles) next.add(role);
      }
      return next.size === previous.length ? previous : Array.from(next).sort();
    });
  }, [data]);

  const missionCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const mission of missions) {
      counts.set(mission.requesterId, (counts.get(mission.requesterId) ?? 0) + 1);
    }
    return counts;
  }, [missions]);

  const rows = (data?.items ?? [])
    .map((user) => ({
      ...user,
      missions: missionCounts.get(Number(user.id)) ?? user.missions,
    }))
    .filter((user) => {
      const matchesRole = roleFilter === 'ALL' || user.roles.includes(roleFilter);
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
      return matchesRole && matchesStatus;
    });

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const roleLabelText = roleFilter === 'ALL' ? 'All roles' : roleLabel(roleFilter);
  const statusLabelText =
    STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label ?? 'All statuses';

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
          placement="top"
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

      <div className="mb-4 flex flex-wrap gap-3">
        {/* Role filter */}
        <DropdownMenu
          align="left"
          width="w-56"
          maxHeight="max-h-80"
          items={[
            {
              label: 'All roles',
              selected: roleFilter === 'ALL',
              onSelect: () => {
                setRoleFilter('ALL');
                setPage(1);
              },
            },
            ...knownRoles.map((role) => ({
              label: roleLabel(role),
              selected: roleFilter === role,
              onSelect: () => {
                setRoleFilter(role);
                setPage(1);
              },
            })),
          ]}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className={FILTER_BUTTON_CLASS}
            >
              <span className="text-fg-subtle">Role:</span>
              {roleLabelText}
              <ChevronDownIcon
                size={15}
                className={cn('text-fg-subtle transition-transform duration-150', open && 'rotate-180')}
                aria-hidden
              />
            </button>
          )}
        />

        {/* Status filter */}
        <DropdownMenu
          align="left"
          width="w-52"
          items={STATUS_OPTIONS.map((option) => ({
            label: option.label,
            selected: statusFilter === option.value,
            onSelect: () => {
              setStatusFilter(option.value);
              setPage(1);
            },
          }))}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className={FILTER_BUTTON_CLASS}
            >
              <span className="text-fg-subtle">Status:</span>
              {statusLabelText}
              <ChevronDownIcon
                size={15}
                className={cn('text-fg-subtle transition-transform duration-150', open && 'rotate-180')}
                aria-hidden
              />
            </button>
          )}
        />
      </div>

      <DataTable
        caption="User directory"
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(user) => user.id}
        onRowClick={(user) => navigate(`/users/${user.id}`)}
        rowClassName={(user) => cn(ROW_ACCENT[user.status] ?? ROW_ACCENT_DEFAULT)}
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
            title="No users match those filters"
            description="Try a different name, role, status or department."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setRoleFilter('ALL');
                  setStatusFilter('ALL');
                  handleSearchChange('');
                }}
              >
                Reset filters
              </Button>
            }
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