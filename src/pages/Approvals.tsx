import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, InboxIcon, XIcon } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonText } from '../components/ui/Skeleton';
import { DecisionDialog } from '../components/missions/DecisionDialog';
import { usePendingApprovals } from '../hooks/useApprovals';
import { formatDate, titleCase } from '../lib/utils';
import type { PendingApprovalItem } from '../types/approval';


// replace this interface
interface DecisionTarget {
  item: PendingApprovalItem;
  decision: 'APPROVED' | 'REJECTED';
}

export function Approvals() {
  const { data, isLoading } = usePendingApprovals();
  const [target, setTarget] = useState<DecisionTarget | null>(null);

  const queue = data ?? [];

  return (
    <PageTransition>
      <PageHeader
        title="Approvals"
        description="Missions waiting on a decision, ordered by the stage they are sitting in."
        meta={
          <Badge tone={queue.length > 0 ? 'warning' : 'success'} dot>
            {queue.length} awaiting decision
          </Badge>
        }
      />

      <Card padded={false}>
        <CardHeader
          className="px-5 pb-4 pt-5"
          title="Decision queue"
          description="Approving advances the mission to the next stage of the chain."
        />

        {isLoading ? (
          <div className="space-y-5 px-5 pb-5">
            <SkeletonText lines={3} />
            <SkeletonText lines={3} />
            <SkeletonText lines={3} />
          </div>
        ) : queue.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title="The queue is clear"
            description="Nothing is waiting on a decision right now. New submissions land here as soon as they are raised."
          />
        ) : (
          <ul className="divide-y divide-line">
            {queue.map((item) => (
              <li
                key={item.missionId}
                className="flex flex-col gap-4 px-5 py-4 transition-colors duration-150 ease-out hover:bg-surface-muted/60 lg:flex-row lg:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11.5px] text-fg-subtle">
                      {item.missionCode ?? `MSN-${item.missionId}`}
                    </span>
                    {item.currentApprovalStep && (
                      <Badge tone="brand">{titleCase(item.currentApprovalStep)}</Badge>
                    )}
                  </div>
                  <Link
                    to={`/missions/${item.missionId}`}
                    className="mt-1 block truncate text-[14px] font-medium text-fg transition-colors duration-150 ease-out hover:text-brand-text"
                  >
                    {item.requesterName} → {item.destinationLocation}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-fg-muted">
                    <span>
                      {formatDate(item.departureDate, 'MMM d')} – {formatDate(item.arrivalDate, 'MMM d, yyyy')}
                    </span>
                    <span className="text-fg-subtle">{titleCase(item.status)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={XIcon}
                    onClick={() => setTarget({ item, decision: 'REJECTED' })}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    icon={CheckIcon}
                    onClick={() => setTarget({ item, decision: 'APPROVED' })}
                  >
                    Approve
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <DecisionDialog
        item={target?.item ?? null}
        decision={target?.decision ?? 'APPROVED'}
        onClose={() => setTarget(null)}
      />
    </PageTransition>
  );
}