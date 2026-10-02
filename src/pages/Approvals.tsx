import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  InboxIcon,
  MapPinIcon,
  SearchIcon
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterTabs } from '../components/ui/FilterTabs';
import { Input } from '../components/ui/Input';
import { SkeletonText } from '../components/ui/Skeleton';
import { usePendingApprovals } from '../hooks/useApprovals';
import { useMissions } from '../hooks/useMissions';
import { getApprovalHistory } from '../api/approvals';
import { queryKeys } from '../lib/queryKeys';
import { cn, formatDate, titleCase } from '../lib/utils';
import type { PendingApprovalItem } from '../types/approval';
import type { ApprovalStage } from '../types/mission';

type StageFilter = string;
const APPROVAL_STAGES: ApprovalStage[] = [
  'FUNCTION_MANAGER',
  'HRBP',
  'FINANCE',
  'BIZOPS',
  'EXECUTIVE',
];

function stageLabel(step: string | null | undefined): string {
  if (!step || step === 'UNASSIGNED') return 'Unassigned';
  return titleCase(step);
}

export function Approvals() {
  const { data, isLoading } = usePendingApprovals();
  const { data: missions } = useMissions();
  const [stageFilter, setStageFilter] = useState<StageFilter>('ALL');
  const [search, setSearch] = useState('');

  const queue = data ?? [];
  const recentlyApproved = useMemo(
    () => (missions ?? [])
      .filter((mission) => mission.status === 'APPROVED')
      .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt)),
    [missions]
  );
  const historyQueries = useQueries({
    queries: queue.map((item) => ({
      queryKey: queryKeys.approvals.history(item.missionId),
      queryFn: () => getApprovalHistory(item.missionId),
    })),
  });
  const historyByMission = new Map(
    queue.map((item, index) => [item.missionId, historyQueries[index]?.data ?? []])
  );

  function isFullyApproved(item: PendingApprovalItem): boolean {
    if (item.status === 'APPROVED') return true;
    const approvedStages = new Set(
      (historyByMission.get(item.missionId) ?? [])
        .filter((entry) => entry.decision === 'APPROVED')
        .map((entry) => entry.step)
    );
    return APPROVAL_STAGES.every((approvalStage) => approvedStages.has(approvalStage));
  }

  const stages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of queue) {
      const key = item.currentApprovalStep ?? 'UNASSIGNED';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [queue]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return queue.filter((item) => {
      const matchesStage = stageFilter === 'ALL' || (item.currentApprovalStep ?? 'UNASSIGNED') === stageFilter;
      const matchesSearch = !normalizedSearch || [
        item.missionCode ?? '',
        item.requesterName,
        item.destinationLocation,
        item.departureDate,
        item.arrivalDate,
      ].join(' ').toLowerCase().includes(normalizedSearch);
      return matchesStage && matchesSearch;
    });
  }, [queue, stageFilter, search]);

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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="overflow-x-auto pb-1">
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
          <div className="w-full sm:w-72">
            <Input
              type="search"
              icon={SearchIcon}
              aria-label="Search approvals"
              placeholder="Search code, requester or destination"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9"
            />
          </div>
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
        <ul className="space-y-2.5">
                {filtered.map((item) => (
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
                          {(() => {
                            const history = historyByMission.get(item.missionId) ?? [];
                            const approvedStages = new Set(
                              history.filter((entry) => entry.decision === 'APPROVED').map((entry) => entry.step)
                            );
                            const allApproved = isFullyApproved(item);
                            const status = allApproved ? 'APPROVED' : item.status;
                            return (
                              <>
                                <Badge tone={status === 'APPROVED' ? 'success' : 'brand'}>
                                  {titleCase(status)}
                                </Badge>
                                <div className="flex flex-wrap gap-1.5" aria-label="Approval stages">
                                  {APPROVAL_STAGES.map((approvalStage) => {
                                    const complete = approvedStages.has(approvalStage);
                                    return (
                                      <span
                                        key={approvalStage}
                                        className={cn(
                                          'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                          complete
                                            ? 'bg-success-soft text-success-text'
                                            : 'bg-surface-muted text-fg-muted'
                                        )}
                                      >
                                        {titleCase(approvalStage)}
                                      </span>
                                    );
                                  })}
                                </div>
                              </>
                            );
                          })()}
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

                    </div>
                  </li>
                ))}
        </ul>
      )}

      {!isLoading && recentlyApproved.length > 0 && (
        <section className="mt-8 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-semibold text-fg">Recently approved</h2>
            <Badge tone="success" dot>{recentlyApproved.length} approved</Badge>
          </div>
          <ul className="space-y-2.5">
            {recentlyApproved.map((mission) => (
              <li key={mission.id} className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11.5px] text-fg-subtle">
                        {mission.missionCode ?? `MSN-${mission.id}`}
                      </span>
                      <Badge tone="success">Approved</Badge>
                    </div>
                    <Link
                      to={`/missions/${mission.id}`}
                      className="mt-1.5 inline-flex text-[15px] font-semibold text-fg hover:text-brand-text"
                    >
                      {mission.requesterName}
                    </Link>
                    <p className="mt-1 text-[13px] text-fg-muted">
                      {formatDate(mission.departureDate, 'MMM d')} – {formatDate(mission.arrivalDate, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5" aria-label="All approval stages complete">
                    {APPROVAL_STAGES.map((approvalStage) => (
                      <span
                        key={approvalStage}
                        className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-medium text-success-text"
                      >
                        {titleCase(approvalStage)}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

    </PageTransition>
  );
}
