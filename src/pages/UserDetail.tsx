import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, ShieldOffIcon } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Avatar } from '../components/shared/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { UserFormModal } from '../components/users/UserFormModal';
import { useDeactivateUser, useUpdateUser, useUser } from '../hooks/useUsers';
import type { UpdateUserPayload } from '../api/users';
import { roleLabel } from '../lib/roles';
import { formatDate } from '../lib/utils';

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(id);
  const updateUser = useUpdateUser();
  const deactivateUser = useDeactivateUser();

  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <PageTransition>
        <Skeleton className="h-8 w-40" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </PageTransition>
    );
  }

  if (!user) {
    return (
      <PageTransition>
        <EmptyState
          title="User not found"
          description="This account may have been removed."
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <button
        type="button"
        onClick={() => navigate('/users')}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted transition-colors hover:text-fg"
      >
        <ArrowLeftIcon size={15} />
        Back to users
      </button>

      <PageHeader
        title={user.fullName}
        description={user.email}
        meta={<StatusBadge status={user.status} />}
        actions={
          <>
            <Button variant="secondary" className="gap-2" onClick={() => setFormOpen(true)}>
              <PencilIcon size={15} />
              Edit
            </Button>
            <Button
              variant="secondary"
              className="gap-2 text-danger"
              disabled={user.status === 'SUSPENDED'}
              onClick={() => setConfirmOpen(true)}
            >
              <ShieldOffIcon size={15} />
              Deactivate
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <Avatar name={user.fullName} />
            <div>
              <p className="text-[15px] font-medium text-fg">{user.fullName}</p>
              <p className="text-[13px] text-fg-subtle">{user.email}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-3 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-fg-muted">Department</dt>
              <dd className="text-fg">{user.department}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">Missions raised</dt>
              <dd className="tabular-nums text-fg">{user.missions}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">Last active</dt>
              <dd className="text-fg">{formatDate(user.lastActiveAt, 'MMM d, yyyy HH:mm')}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <p className="text-[13px] font-medium text-fg">Roles</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {user.roles.map((role) => (
              <Badge key={role} tone="brand">
                {roleLabel(role)}
              </Badge>
            ))}
          </div>
        </section>
      </div>

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        mode="edit"
        user={user}
        loading={updateUser.isPending}
        onSubmit={(payload) =>
          updateUser.mutate(
            { id: user.id, payload: payload as UpdateUserPayload },
            { onSuccess: () => setFormOpen(false) }
          )
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        tone="danger"
        title="Deactivate this account?"
        message={`${user.fullName} will immediately lose access. Any missions they raised stay in the register.`}
        confirmLabel="Deactivate"
        loading={deactivateUser.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          deactivateUser.mutate(user.id, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </PageTransition>
  );
}
