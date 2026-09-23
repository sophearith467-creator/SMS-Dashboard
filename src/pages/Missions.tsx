import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, MapIcon, SearchIcon } from 'lucide-react';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Avatar } from '../components/shared/Avatar';
import { DataTable, type Column } from '../components/shared/DataTable';
import { Button } from '../components/ui/Button';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { MissionFormModal } from '../components/missions/MissionFormModal';
import { MissionsHero } from '../components/missions/MissionsHero';
import { useMissions } from '../hooks/useMissions';
import { useSearch } from '../context/SearchContext';
import { useScreenInit } from '../useScreenInit.js';
import { cn, formatDate, titleCase } from '../lib/utils';
import type { Mission, MissionStatus } from '../types/mission';

type StatusFilter = 'ALL' | MissionStatus;

const FILTERS: StatusFilter[] = [
  'ALL', 'DRAFT', 'SUBMITTED',
  'FM_REVIEW', 'HRBP_REVIEW', 'FINANCE_REVIEW', 'BIZOPS_REVIEW', 'EXECUTIVE_REVIEW',
  'APPROVED', 'REJECTED', 'CANCELLED', 'REPORT_SUBMITTED', 'SETTLED'
];

const IN_REVIEW_STATUSES: MissionStatus[] = [
  'SUBMITTED', 'FM_REVIEW', 'HRBP_REVIEW', 'FINANCE_REVIEW', 'BIZOPS_REVIEW', 'EXECUTIVE_REVIEW'
];

const ROW_ACCENT: Record<MissionStatus, string> = {
  DRAFT: 'border-l-2 border-l-transparent',
  SUBMITTED: 'border-l-2 border-l-brand',
  FM_REVIEW: 'border-l-2 border-l-warning',
  HRBP_REVIEW: 'border-l-2 border-l-warning',
  FINANCE_REVIEW: 'border-l-2 border-l-warning',
  BIZOPS_REVIEW: 'border-l-2 border-l-warning',
  EXECUTIVE_REVIEW: 'border-l-2 border-l-warning',
  APPROVED: 'border-l-2 border-l-success',
  REJECTED: 'border-l-2 border-l-danger',
  CANCELLED: 'border-l-2 border-l-transparent',
  REPORT_SUBMITTED: 'border-l-2 border-l-brand',
  SETTLED: 'border-l-2 border-l-transparent',
};

export function Missions() {
  const navigate = useNavigate();
  const { data, isLoading } = useMissions();
  const { search: globalSearch } = useSearch();
  const screenInit = useScreenInit() as { createOpen?: boolean };
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [localSearch, setLocalSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(Boolean(screenInit.createOpen));

  const query = (localSearch || globalSearch).trim().toLowerCase();
  const missions = data ?? [];

  const filtered = useMemo(() => {
    return missions.filter((mission) => {
      const matchesStatus = status === 'ALL' || mission.status === status;
      const matchesQuery =
        !query ||
        [mission.missionCode ?? '', mission.requesterName, mission.destinationLocation, mission.business]
          .join(' ')
          .toLowerCase()
          .includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [missions, status, query]);

  const heroStats = useMemo(
    () => ({
      total: missions.length,
      inReview: missions.filter((m) => IN_REVIEW_STATUSES.includes(m.status)).length,
      approved: missions.filter((m) => m.status === 'APPROVED').length,
      settled: missions.filter((m) => m.status === 'SETTLED').length,
    }),
    [missions]
  );

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<StatusFilter, number>> = { ALL: missions.length };
    for (const value of FILTERS) {
      if (value === 'ALL') continue;
      counts[value] = missions.filter((m) => m.status === value).length;
    }
    return counts;
  }, [missions]);

  const activeLabel = status === 'ALL' ? 'All statuses' : titleCase(status);

  const columns: Array<Column<Mission>> = [
    {
      key: 'mission',
      header: 'Mission',
      render: (mission) => (
        <div className="min-w-0">
          <span className="inline-flex items-center rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-fg-subtle">
            {mission.missionCode ?? `MSN-${mission.id}`}
          </span>
          <p className="mt-1.5 truncate text-[13.5px] font-medium text-fg">{mission.travelObjectives}</p>
        </div>
      )
    },
    {
      key: 'requester',
      header: 'Requester',
      render: (mission) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={mission.requesterName} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-fg">{mission.requesterName}</p>
            <p className="truncate text-[11.5px] text-fg-subtle">{mission.business}</p>
          </div>
        </div>
      )
    },
    {
      key: 'destination',
      header: 'Destination',
      render: (mission) => (
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-fg">{mission.destinationLocation}</span>
          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10.5px] font-medium text-fg-subtle">
            {titleCase(mission.locationTier)}
          </span>
        </div>
      )
    },
    {
      key: 'dates',
      header: 'Window',
      render: (mission) => (
        <div>
          <p className="text-[13px] text-fg">
            {formatDate(mission.departureDate, 'MMM d')} – {formatDate(mission.arrivalDate, 'MMM d, yyyy')}
          </p>
          <p className="text-[11.5px] text-fg-subtle">{mission.numberOfTravelDays} days</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (mission) => <StatusBadge status={mission.status} />
    }
  ];

  return (
    <PageTransition>
      <MissionsHero
        total={heroStats.total}
        inReview={heroStats.inReview}
        approved={heroStats.approved}
        settled={heroStats.settled}
        onCreateMission={() => setCreateOpen(true)}
      />

      <div className="mb-4">
        <DropdownMenu
          align="left"
          width="w-64"
          maxHeight="max-h-80"
          items={FILTERS.map((value) => ({
            label: value === 'ALL' ? 'All statuses' : titleCase(value),
            selected: value === status,
            count: statusCounts[value] ?? 0,
            onSelect: () => setStatus(value),
          }))}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-[13px] font-medium text-fg shadow-soft transition-colors duration-150 ease-out hover:border-line-strong"
            >
              <span className="text-fg-subtle">Status:</span>
              {activeLabel}
              <ChevronDownIcon size={15} className={cn('text-fg-subtle transition-transform duration-150', open && 'rotate-180')} aria-hidden />
            </button>
          )}
        />
      </div>

      <DataTable
        caption="Missions"
        columns={columns}
        rows={filtered}
        loading={isLoading}
        getRowId={(mission) => mission.id}
        onRowClick={(mission) => navigate(`/missions/${mission.id}`)}
        rowClassName={(mission) => cn(ROW_ACCENT[mission.status])}
        toolbar={
          <>
            <p className="text-[13px] text-fg-muted">
              <span className="font-medium text-fg">{filtered.length}</span> of {missions.length} missions
            </p>
            <div className="w-full sm:w-72">
              <Input
                type="search"
                icon={SearchIcon}
                placeholder="Filter by code, requester or destination"
                aria-label="Filter missions"
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
                className="h-9"
              />
            </div>
          </>
        }
        empty={
          <EmptyState
            icon={MapIcon}
            title="No missions match this view"
            description="Try a different status filter or clear the search to see the full mission register."
            action={
              <Button variant="secondary" onClick={() => { setStatus('ALL'); setLocalSearch(''); }}>
                Reset filters
              </Button>
            }
          />
        }
      />

      <MissionFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </PageTransition>
  );
}
