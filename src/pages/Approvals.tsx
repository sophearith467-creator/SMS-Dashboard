import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, InboxIcon, XIcon } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { Avatar } from '../components/shared/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonText } from '../components/ui/Skeleton';
import { DecisionDialog } from '../components/missions/DecisionDialog';
import { useMissions } from '../hooks/useMissions';
import { formatCurrency, formatDateRange, fromNow, titleCase } from '../lib/utils';
import type { Mission } from '../types/mission';

interface DecisionTarget {
  mission: Mission;
  decision: 'APPROVED' | 'REJECTED';
}

function currentStage(mission: Mission): string {
  const next = mission.approvals.find((step) => step.decision === 'PENDING');
  return next ? titleCase(next.stage) : 'Complete';
}

export function Approvals() {
  const { data, isLoading } = useMissions();
  const [target, setTarget] = useState<DecisionTarget | null>(null);

  const missions = data ?? [];
  const queue = useMemo(
    () => missions.filter((mission) => mission.status === 'PENDING'),
    [missions]
  );

  const history = useMemo(() => {
    return missions.
    flatMap((mission) =>
    mission.approvals.
    filter((step) => step.decidedAt).
    map((step) => ({ mission, step }))
    ).
    sort((a, b) => a.step.decidedAt! < b.step.decidedAt! ? 1 : -1).
    slice(0, 8);
  }, [missions]);

  return (
    <PageTransition>
      <PageHeader
        title="Approvals"
        description="Missions waiting on a decision, ordered by the stage they are sitting in."
        meta={
        <Badge tone={queue.length > 0 ? 'warning' : 'success'} dot>
            {queue.length} awaiting decision
          </Badge>
        } />
      

      <div className="grid gap-4 xl:grid-cols-12">
        <Card padded={false} className="xl:col-span-8">
          <CardHeader
            className="px-5 pb-4 pt-5"
            title="Decision queue"
            description="Approving advances the mission to the next stage of the chain." />
          

          {isLoading ?
          <div className="space-y-5 px-5 pb-5">
              <SkeletonText lines={3} />
              <SkeletonText lines={3} />
              <SkeletonText lines={3} />
            </div> :
          queue.length === 0 ?
          <EmptyState
            icon={InboxIcon}
            title="The queue is clear"
            description="Nothing is waiting on a decision right now. New submissions land here as soon as they are raised." /> :


          <ul className="divide-y divide-line">
              {queue.map((mission) =>
            <li
              key={mission.id}
              className="flex flex-col gap-4 px-5 py-4 transition-colors duration-150 ease-out hover:bg-surface-muted/60 lg:flex-row lg:items-center">
              
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11.5px] text-fg-subtle">{mission.reference}</span>
                      <Badge tone="brand">{currentStage(mission)}</Badge>
                      {mission.priority === 'HIGH' && <Badge tone="danger">High priority</Badge>}
                    </div>
                    <Link
                  to={`/missions/${mission.id}`}
                  className="mt-1 block truncate text-[14px] font-medium text-fg transition-colors duration-150 ease-out hover:text-brand-text">
                  
                      {mission.title}
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-fg-muted">
                      <span className="flex items-center gap-1.5">
                        <Avatar name={mission.requesterName} size="sm" />
                        {mission.requesterName}
                      </span>
                      <span>{formatDateRange(mission.startDate, mission.endDate)}</span>
                      <span className="font-medium text-fg">
                        {formatCurrency(mission.estimatedCost, mission.currency)}
                      </span>
                      <span className="text-fg-subtle">raised {fromNow(mission.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                  variant="secondary"
                  size="sm"
                  icon={XIcon}
                  onClick={() => setTarget({ mission, decision: 'REJECTED' })}>
                  
                      Reject
                    </Button>
                    <Button
                  size="sm"
                  icon={CheckIcon}
                  onClick={() => setTarget({ mission, decision: 'APPROVED' })}>
                  
                      Approve
                    </Button>
                  </div>
                </li>
            )}
            </ul>
          }
        </Card>

        <Card padded={false} className="xl:col-span-4">
          <CardHeader
            className="px-5 pb-4 pt-5"
            title="Approval history"
            description="The most recent decisions across all missions." />
          
          {isLoading ?
          <div className="px-5 pb-5">
              <SkeletonText lines={6} />
            </div> :

          <ul className="divide-y divide-line">
              {history.map(({ mission, step }) =>
            <li key={step.id} className="px-5 py-3.5">
                  <div className="flex items-start gap-3">
                    <span
                  className={
                  step.decision === 'APPROVED' ?
                  'mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-text' :
                  'mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger-text'
                  }>
                  
                      {step.decision === 'APPROVED' ? <CheckIcon size={13} /> : <XIcon size={13} />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] text-fg">
                        <span className="font-medium">{step.approverName}</span>{' '}
                        {step.decision === 'APPROVED' ? 'approved' : 'rejected'}{' '}
                        <Link
                      to={`/missions/${mission.id}`}
                      className="font-mono text-[12px] text-brand-text hover:underline">
                      
                          {mission.reference}
                        </Link>
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-fg-subtle">
                        {titleCase(step.stage)} · {fromNow(step.decidedAt as string)}
                      </p>
                    </div>
                  </div>
                </li>
            )}
            </ul>
          }
        </Card>
      </div>

      <DecisionDialog
        mission={target?.mission ?? null}
        decision={target?.decision ?? 'APPROVED'}
        onClose={() => setTarget(null)} />
      
    </PageTransition>);

}