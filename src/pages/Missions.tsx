import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Avatar } from '../components/shared/Avatar';
import { DataTable, type Column } from '../components/shared/DataTable';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterTabs } from '../components/ui/FilterTabs';
import { Input } from '../components/ui/Input';
import { MissionFormModal } from '../components/missions/MissionFormModal';
import { useMissions } from '../hooks/useMissions';
import { useSearch } from '../context/SearchContext';
import { useScreenInit } from '../useScreenInit.js';
import { formatDate, titleCase } from '../lib/utils';
import type { Mission, MissionStatus } from '../types/mission';

type StatusFilter = 'ALL' | MissionStatus;

const FILTERS: StatusFilter[] = [
  'ALL', 'DRAFT', 'SUBMITTED',
  'FM_REVIEW', 'HRBP_REVIEW', 'FINANCE_REVIEW', 'BIZOPS_REVIEW', 'EXECUTIVE_REVIEW',
  'APPROVED', 'REJECTED', 'CANCELLED', 'REPORT_SUBMITTED', 'SETTLED'
];

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

  const columns: Array<Column<Mission>> = [
    {
      key: 'mission',
      header: 'Mission',
      render: (mission) => (
        <div className="min-w-0">
          <span className="font-mono text-[11.5px] text-fg-subtle">
            {mission.missionCode ?? `MSN-${mission.id}`}
          </span>
          <p className="mt-0.5 truncate text-[13.5px] font-medium text-fg">{mission.travelObjectives}</p>
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
        <div>
          <p className="text-[13px] text-fg">{mission.destinationLocation}</p>
          <p className="text-[11.5px] text-fg-subtle">{titleCase(mission.locationTier)}</p>
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
      <PageHeader
        title="Missions"
        description="Every mission request across the organisation, from draft through settlement."
        actions={
          <Button icon={PlusIcon} onClick={() => setCreateOpen(true)}>
            New mission
          </Button>
        }
      />

      <div className="mb-4 overflow-x-auto pb-1">
        <FilterTabs
          ariaLabel="Filter missions by status"
          layoutId="missions-filter"
          value={status}
          onChange={setStatus}
          options={FILTERS.map((value) => ({
            value,
            label: value === 'ALL' ? 'All' : titleCase(value),
            count: value === 'ALL' ? missions.length : missions.filter((m) => m.status === value).length
          }))}
        />
      </div>

      <DataTable
        caption="Missions"
        columns={columns}
        rows={filtered}
        loading={isLoading}
        getRowId={(mission) => mission.id}
        onRowClick={(mission) => navigate(`/missions/${mission.id}`)}
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