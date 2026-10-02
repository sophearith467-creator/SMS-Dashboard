import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon, BuildingIcon, CalculatorIcon, CalendarIcon, CarFrontIcon, CheckIcon,
  ChevronDownIcon, ChevronUpIcon,
  MapPinIcon, PencilIcon, SearchXIcon, SendIcon, TrashIcon, UserIcon, XIcon
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
import { ParticipantsPanel } from '../components/missions/ParticipantsPanel';
import { ApprovalChainPanel } from '../components/missions/ApprovalChainPanel';
import { DecisionDialog, type DecisionTarget } from '../components/missions/DecisionDialog';
import { MissionFormModal } from '../components/missions/MissionFormModal';
import { useMission, useMissionAllowance, useDeleteMission } from '../hooks/useMissions';
import { useApprovalHistory, useSubmitMission } from '../hooks/useApprovals';
import { useMissionVehicleRequest, useMissionVehicleRequests } from '../hooks/useAnnexes';
import { useAuth } from '../context/AuthContext';
import { APPROVER_ROLES } from '../lib/roles';
import { formatCurrency, formatDate } from '../lib/utils';

const REVIEW_STATUSES = ['SUBMITTED', 'FM_REVIEW', 'HRBP_REVIEW', 'FINANCE_REVIEW', 'BIZOPS_REVIEW', 'EXECUTIVE_REVIEW'];

export function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can, user } = useAuth();
  const missionId = id ? Number(id) : undefined;
  const { data: mission, isLoading, isError } = useMission(missionId);
  const allowance = useMissionAllowance(missionId);
  const vehicleRequests = useMissionVehicleRequests(missionId);
  const approvals = useApprovalHistory(missionId ?? 0);
  const deleteMission = useDeleteMission();
  const submitMission = useSubmitMission();
  const [expandedVehicleRequestId, setExpandedVehicleRequestId] = useState<number>();
  const vehicleRequestDetail = useMissionVehicleRequest(missionId, expandedVehicleRequestId);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

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
  const canSubmit = isOwnerDraft || (isAdmin && mission.status === 'DRAFT');
  const transportValue = vehicleRequests.isLoading
    ? 'Loading…'
    : vehicleRequests.data?.length
      ? 'Vehicle'
      : 'Not specified';

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
    { icon: CarFrontIcon, label: 'Transport', value: transportValue },
    {
      icon: CalculatorIcon,
      label: 'Estimated cost',
      value: mission.totalExpense == null ? 'Not calculated' : formatCurrency(mission.totalExpense),
    },
  ];

  async function handleConfirmDelete() {
    if (!mission) return;
    await deleteMission.mutateAsync(mission.id);
    navigate('/missions');
  }

  async function handleConfirmSubmit() {
    if (!mission) return;
    await submitMission.mutateAsync(mission.id);
    setSubmitOpen(false);
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
          {canSubmit && (
            <Button icon={SendIcon} onClick={() => setSubmitOpen(true)}>
              Submit for approval
            </Button>
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

          {mission.missionType === 'GROUP' && (
            <Card>
              <CardHeader
                title="Travelers"
                description="Each traveler's allowance is calculated from their own job level."
              />
              <div className="mt-4">
                <ParticipantsPanel participants={(allowance.data ?? mission).participants ?? []} />
              </div>
            </Card>
          )}
          {!!vehicleRequests.data?.length && (
            <Card>
              <CardHeader
                title="Vehicle requests"
                description={`${vehicleRequests.data.length} request${vehicleRequests.data.length === 1 ? '' : 's'} for this mission`}
              />
              <div className="mt-4 divide-y divide-line">
                {vehicleRequests.data.map((request) => {
                  const isExpanded = expandedVehicleRequestId === request.id;
                  return (
                    <section key={request.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-fg">Request VR-{request.id}</h3>
                            <StatusBadge status={request.status} />
                          </div>
                          <p className="mt-1 text-xs text-fg-muted">
                            {formatDate(request.travelStartDate)} – {formatDate(request.travelEndDate)}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedVehicleRequestId(isExpanded ? undefined : request.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-soft"
                        >
                          {isExpanded ? 'Hide details' : 'View details'}
                          {isExpanded
                            ? <ChevronUpIcon size={16} aria-hidden />
                            : <ChevronDownIcon size={16} aria-hidden />}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-4 border-t border-line pt-4">
                          {vehicleRequestDetail.isLoading ? (
                            <SkeletonText lines={3} />
                          ) : vehicleRequestDetail.isError ? (
                            <p className="text-sm text-danger-text">Could not load this vehicle request.</p>
                          ) : vehicleRequestDetail.data ? (
                            <>
                              <p className="text-sm leading-relaxed text-fg-muted">
                                {vehicleRequestDetail.data.travelObjectives}
                              </p>
                              <div className="mt-4 space-y-3">
                                {vehicleRequestDetail.data.travelDetails.map((trip) => (
                                  <div key={trip.id} className="rounded-lg bg-surface-muted p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <p className="text-sm font-medium text-fg">
                                        {trip.origin} <span className="px-1 text-fg-subtle">→</span> {trip.destination}
                                      </p>
                                      <span className="text-xs tabular-nums text-fg-muted">
                                        {formatDate(trip.date)} · {trip.distanceKm} km
                                      </span>
                                    </div>
                                    {trip.purposeOfTravel && (
                                      <p className="mt-2 text-sm text-fg-muted">{trip.purposeOfTravel}</p>
                                    )}
                                    {trip.remarks && (
                                      <p className="mt-1 text-xs text-fg-subtle">{trip.remarks}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : null}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </Card>
          )}

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

      <ConfirmDialog
        open={submitOpen}
        tone="default"
        title="Submit this mission for approval?"
        message={`${mission.missionCode ?? 'This mission'} will enter the approval chain, starting with the function manager. You won't be able to edit it while it's under review.`}
        confirmLabel="Submit"
        loading={submitMission.isPending}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setSubmitOpen(false)}
      />
    </PageTransition>
  );
}
