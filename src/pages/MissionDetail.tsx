import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BanknoteIcon,
  BuildingIcon,
  CalculatorIcon,
  CalendarIcon,
  CheckIcon,
  MapPinIcon,
  PlaneIcon,
  SearchXIcon,
  UserIcon,
  XIcon } from
'lucide-react';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { ApprovalTimeline } from '../components/shared/ApprovalTimeline';
import { Avatar } from '../components/shared/Avatar';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton, SkeletonText } from '../components/ui/Skeleton';
import { AllowancePanel } from '../components/missions/AllowancePanel';
import { DecisionDialog } from '../components/missions/DecisionDialog';
import { useMission, useMissionAllowance } from '../hooks/useMissions';
import { useAuth } from '../context/AuthContext';
import { APPROVER_ROLES } from '../lib/roles';
import { durationInDays, formatCurrency, formatDate, formatDateRange, titleCase } from '../lib/utils';
import type { Mission } from '../types/mission';

export function MissionDetail() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const { data: mission, isLoading, isError } = useMission(id);
  const allowance = useMissionAllowance(id);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid gap-4 xl:grid-cols-12">
          <Skeleton className="h-64 rounded-2xl xl:col-span-8" />
          <Skeleton className="h-64 rounded-2xl xl:col-span-4" />
        </div>
      </div>);

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
          } />
        
      </Card>);

  }

  const canDecide = can(APPROVER_ROLES) && mission.status === 'PENDING';
  const details: Array<{icon: typeof UserIcon;label: string;value: string;}> = [
  { icon: UserIcon, label: 'Requester', value: mission.requesterName },
  { icon: BuildingIcon, label: 'Department', value: mission.department },
  { icon: MapPinIcon, label: 'Destination', value: `${mission.destination}, ${mission.country}` },
  {
    icon: CalendarIcon,
    label: 'Travel window',
    value: `${formatDateRange(mission.startDate, mission.endDate)} · ${durationInDays(mission.startDate, mission.endDate)} days`
  },
  { icon: PlaneIcon, label: 'Transport', value: titleCase(mission.transport) },
  {
    icon: BanknoteIcon,
    label: 'Estimated cost',
    value: formatCurrency(mission.estimatedCost, mission.currency)
  }];


  return (
    <PageTransition>
      <Link
        to="/missions"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted transition-colors duration-150 ease-out hover:text-fg">
        
        <ArrowLeftIcon size={14} aria-hidden />
        All missions
      </Link>

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-[12px] text-fg-subtle">{mission.reference}</span>
            <StatusBadge status={mission.status} />
            {mission.priority === 'HIGH' &&
            <span className="rounded-md bg-danger-soft px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-danger-text">
                High priority
              </span>
            }
          </div>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-fg">
            {mission.title}
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
            onClick={() => allowance.refetch()}>
            
            Calculate allowance
          </Button>
          {canDecide &&
          <>
              <Button variant="danger" icon={XIcon} onClick={() => setDecision('REJECTED')}>
                Reject
              </Button>
              <Button icon={CheckIcon} onClick={() => setDecision('APPROVED')}>
                Approve
              </Button>
            </>
          }
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <Card>
            <CardHeader title="Purpose" />
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">{mission.purpose}</p>

            <dl className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {details.map((detail) =>
              <div key={detail.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-fg-subtle">
                    <detail.icon size={15} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[12px] text-fg-subtle">{detail.label}</dt>
                    <dd className="mt-0.5 text-[13.5px] font-medium text-fg">{detail.value}</dd>
                  </div>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <CardHeader
              title="Allowance breakdown"
              description="Entitlement derived from the destination band rate and the mission duration." />
            
            <div className="mt-4">
              <AllowancePanel
                data={allowance.data}
                loading={allowance.isFetching && !allowance.data}
                onCalculate={() => allowance.refetch()} />
              
            </div>
          </Card>
        </div>

        <div className="xl:col-span-4">
          <Card className="xl:sticky xl:top-24">
            <CardHeader
              title="Approval chain"
              description={`${mission.approvals.filter((step) => step.decision === 'APPROVED').length} of ${mission.approvals.length} stages cleared.`} />
            
            <div className="mt-5">
              {mission.approvals.length === 0 ?
              <SkeletonText lines={4} /> :

              <ApprovalTimeline steps={mission.approvals} />
              }
            </div>
          </Card>
        </div>
      </div>

      <DecisionDialog
        mission={decision ? mission as Mission : null}
        decision={decision ?? 'APPROVED'}
        onClose={() => setDecision(null)} />
      
    </PageTransition>);

}