import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon, BuildingIcon, CalculatorIcon, CalendarIcon, CheckIcon,
  MapPinIcon, PencilIcon, SearchXIcon, TrashIcon, UserIcon, XIcon
} from 'lucide-react';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Avatar } from '../components/shared/Avatar';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton, SkeletonText } from '../components/ui/Skeleton';
import { AllowancePanel } from '../components/missions/AllowancePanel';
import { ApprovalChainPanel } from '../components/missions/ApprovalChainPanel';
import { DecisionDialog, type DecisionTarget } from '../components/missions/DecisionDialog';
import { MissionFormModal } from '../components/missions/MissionFormModal';
import { useMission, useMissionAllowance, useDeleteMission } from '../hooks/useMissions';
import { useApprovalHistory } from '../hooks/useApprovals';
import { useAuth } from '../context/AuthContext';
import { APPROVER_ROLES } from '../lib/roles';
import { formatDate } from '../lib/utils';

const REVIEW_STATUSES = ['SUBMITTED', 'FM_REVIEW', 'HRBP_REVIEW', 'FINANCE_REVIEW', 'BIZOPS_REVIEW', 'EXECUTIVE_REVIEW'];

export function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can, user } = useAuth();
  const missionId = id ? Number(id) : undefined;
  const { data: mission, isLoading, isError } = useMission(missionId);
  const allowance = useMissionAllowance(missionId);
  const approvals = useApprovalHistory(missionId ?? 0);
  const deleteMission = useDeleteMission();
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid gap-4 xl:grid-cols-12">
          <Skeleton className="h-64 rounded-2xl xl:col-span-8" />
          <Skeleton className="h-64 rounded-2xl xl:col-span-4" />
        </div>
      </div>
    );
  }

  if (isError || !mission) {
    return (
      <Card>
        <EmptyState
          icon={SearchXIcon}
          title="Mission not found"
          description="This mission may have been withdrawn, or the reference is incorrect."
          action={
            <Button variant="secondary" icon={ArrowLeftIcon} onClick={() => navigate('/missions')}>
              Back to missions
            </Button>
          }
        />
      </Card>
    );
  }

  const canDecide = can(APPROVER_ROLES) && REVIEW_STATUSES.includes(mission.status);
  const isAdmin = can(['ROLE_ADMIN']);
  const isOwnerDraft = mission.requesterId === Number(user?.id) && mission.status === 'DRAFT';
  const canManage = isAdmin || isOwnerDraft;

  const target: DecisionTarget = {
    missionId: mission.id,
    label: mission.missionCode ?? `MSN-${mission.id}`,
    requesterName: mission.requesterName,
  };

  const details: Array<{ icon: typeof UserIcon; label: string; value: string }> = [
    { icon: UserIcon, label: 'Requester', value: mission.requesterName },
    { icon: BuildingIcon, label: 'Business', value: mission.business },
    { icon: MapPinIcon, label: 'Destination', value: mission.destinationLocation },
    {
      icon: CalendarIcon,
      label: 'Travel window',
      value: `${formatDate(mission.departureDate, 'MMM d')} – ${formatDate(mission.arrivalDate, 'MMM d, yyyy')} · ${mission.numberOfTravelDays} days`
    },
  ];

  async function handleConfirmDelete() {
    if (!mission) return;
    await deleteMission.mutateAsync(mission.id);
    navigate('/missions');
  }

  return (
    <PageTransition>
      <Link
        to="/missions"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted transition-colors duration-150 ease-out hover:text-fg"
      >
        <ArrowLeftIcon size={14} aria-hidden />
        All missions
      </Link>

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-[12px] text-fg-subtle">
              {mission.missionCode ?? `MSN-${mission.id}`}
            </span>
            <StatusBadge status={mission.status} />
          </div>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-fg">
            {mission.travelObjectives}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-[13px] text-fg-muted">
            <Avatar name={mission.requesterName} size="sm" />
            Raised by {mission.requesterName} · {formatDate(mission.createdAt)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            icon={CalculatorIcon}
            loading={allowance.isFetching}
            onClick={() => allowance.refetch()}
          >
            Calculate allowance
          </Button>
          {canManage && (
            <>
              <Button variant="secondary" icon={PencilIcon} onClick={() => setEditOpen(true)}>
                Edit
              </Button>
              <Button variant="danger" icon={TrashIcon} onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </>
          )}
          {canDecide && (
            <>
              <Button variant="danger" icon={XIcon} onClick={() => setDecision('REJECTED')}>
                Reject
              </Button>
              <Button icon={CheckIcon} onClick={() => setDecision('APPROVED')}>
                Approve
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <Card>
            <CardHeader title="Purpose" />
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">{mission.travelObjectives}</p>
            {mission.description && (
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{mission.description}</p>
            )}

            <dl className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {details.map((detail) => (
                <div key={detail.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-fg-subtle">
                    <detail.icon size={15} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[12px] text-fg-subtle">{detail.label}</dt>
                    <dd className="mt-0.5 text-[13.5px] font-medium text-fg">{detail.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <CardHeader
              title="Allowance breakdown"
              description="Entitlement derived from the destination band rate and the mission duration."
            />
            <div className="mt-4">
              <AllowancePanel
                data={allowance.data ?? (mission.totalExpense != null ? mission : undefined)}
                loading={allowance.isFetching}
                onCalculate={() => allowance.refetch()}
              />
            </div>
          </Card>
        </div>

        <div className="xl:col-span-4">
          <Card className="xl:sticky xl:top-24">
            <CardHeader title="Approval chain" />
            <div className="mt-5">
              {approvals.isLoading ? (
                <SkeletonText lines={4} />
              ) : (
                <ApprovalChainPanel
                  history={approvals.data ?? []}
                  currentStep={mission.currentApprovalStep}
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      <DecisionDialog
        target={decision ? target : null}
        decision={decision ?? 'APPROVED'}
        onClose={() => setDecision(null)}
      />

      <MissionFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editMission={mission}
      />

      <ConfirmDialog
        open={deleteOpen}
        tone="danger"
        title="Delete this mission?"
        message={`${mission.missionCode ?? 'This mission'} will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete mission"
        loading={deleteMission.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </PageTransition>
  );
}
