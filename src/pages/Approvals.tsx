import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  CheckIcon,
  InboxIcon,
  MapPinIcon,
  XIcon
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterTabs } from '../components/ui/FilterTabs';
import { SkeletonText } from '../components/ui/Skeleton';
import { DecisionDialog } from '../components/missions/DecisionDialog';
import { usePendingApprovals } from '../hooks/useApprovals';
import { cn, formatDate, titleCase } from '../lib/utils';
import type { PendingApprovalItem } from '../types/approval';

interface DecisionTarget {
  item: PendingApprovalItem;
  decision: 'APPROVED' | 'REJECTED';
}

type StageFilter = string;

function stageLabel(step: string | null | undefined): string {
  if (!step || step === 'UNASSIGNED') return 'Unassigned';
  return titleCase(step);
}

export function Approvals() {
  const { data, isLoading } = usePendingApprovals();
  const [target, setTarget] = useState<DecisionTarget | null>(null);
  const [stageFilter, setStageFilter] = useState<StageFilter>('ALL');

  const queue = data ?? [];

  const stages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of queue) {
      const key = item.currentApprovalStep ?? 'UNASSIGNED';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [queue]);

  const filtered = useMemo(() => {
    if (stageFilter === 'ALL') return queue;
    return queue.filter(
      (item) => (item.currentApprovalStep ?? 'UNASSIGNED') === stageFilter
    );
  }, [queue, stageFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, PendingApprovalItem[]>();
    for (const item of filtered) {
      const key = item.currentApprovalStep ?? 'UNASSIGNED';
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

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

      {!isLoading && queue.length > 0 && (
        <div className="mb-5 overflow-x-auto pb-1">
          <FilterTabs
            ariaLabel="Filter by approval stage"
            layoutId="approvals-stage-filter"
            value={stageFilter}
            onChange={setStageFilter}
            options={[
              { value: 'ALL', label: 'All stages', count: queue.length },
              ...stages.map(([key, count]) => ({
                value: key,
                label: stageLabel(key),
                count
              }))
            ]}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <SkeletonText lines={3} />
          <SkeletonText lines={3} />
          <SkeletonText lines={3} />
        </div>
      ) : queue.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface shadow-soft">
          <EmptyState
            icon={InboxIcon}
            title="The queue is clear"
            description="Nothing is waiting on a decision right now. New submissions land here as soon as they are raised."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface shadow-soft">
          <EmptyState
            icon={InboxIcon}
            title="Nothing in this stage"
            description="Try another stage filter — other items may still be waiting."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([stage, items]) => (
            <section key={stage} className="space-y-3">
              <div className="flex items-center justify-between gap-3 px-0.5">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-fg">
                    {stageLabel(stage)}
                  </h2>
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-muted px-1.5 text-[11px] font-semibold tabular-nums text-fg-muted">
                    {items.length}
                  </span>
                </div>
                <p className="hidden text-[12px] text-fg-subtle sm:block">
                  Approving advances to the next stage
                </p>
              </div>

              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li
                    key={item.missionId}
                    className={cn(
                      'group rounded-2xl border border-line bg-surface p-4 shadow-soft',
                      'transition-[border-color,box-shadow,transform] duration-200 ease-out',
                      'hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card'
                    )}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11.5px] text-fg-subtle">
                            {item.missionCode ?? `MSN-${item.missionId}`}
                          </span>
                          <Badge tone="brand">{titleCase(item.status)}</Badge>
                        </div>

                        <Link
                          to={`/missions/${item.missionId}`}
                          className="mt-1.5 inline-flex max-w-full items-center gap-1.5 text-[15px] font-semibold tracking-[-0.01em] text-fg transition-colors duration-150 ease-out hover:text-brand-text"
                        >
                          <span className="truncate">{item.requesterName}</span>
                          <ArrowRightIcon
                            size={14}
                            className="shrink-0 text-fg-subtle opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                            aria-hidden
                          />
                        </Link>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-fg-muted">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPinIcon size={13} className="text-fg-subtle" aria-hidden />
                            {item.destinationLocation}
                          </span>
                          <span>
                            {formatDate(item.departureDate, 'MMM d')} –{' '}
                            {formatDate(item.arrivalDate, 'MMM d, yyyy')}
                          </span>
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
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <DecisionDialog
        item={target?.item ?? null}
        decision={target?.decision ?? 'APPROVED'}
        onClose={() => setTarget(null)}
      />
    </PageTransition>
  );
}
