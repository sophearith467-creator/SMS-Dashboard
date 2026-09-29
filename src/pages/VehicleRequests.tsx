import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CarFrontIcon,
  MoreHorizontalIcon,
  SearchIcon
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterTabs } from '../components/ui/FilterTabs';
import { Input } from '../components/ui/Input';
import { useAnnexStatusUpdate, useVehicleRequests } from '../hooks/useAnnexes';
import { formatDate, titleCase } from '../lib/utils';
import type { VehicleRequest, VehicleRequestStatus } from '../types/annex';

type Filter = 'ALL' | VehicleRequestStatus;

const FILTERS: Filter[] = [
  'ALL',
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'PAID'
];

export function VehicleRequests() {
  const { data, isLoading } = useVehicleRequests();
  const updateStatus = useAnnexStatusUpdate('vehicle-requests');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');

  const requests = data ?? [];
  const rows = useMemo(
    () =>
      requests.filter((request) => {
        const status = request.status ?? 'DRAFT';
        const matchesFilter = filter === 'ALL' || status === filter;
        const matchesSearch =
          !search.trim() ||
          [
            request.requesterName,
            request.basedLocation ?? '',
            request.destinationLocation ?? '',
            `MSN-${request.missionId}`,
            `VR-${request.id}`
          ]
            .join(' ')
            .toLowerCase()
            .includes(search.trim().toLowerCase());
        return matchesFilter && matchesSearch;
      }),
    [requests, filter, search]
  );

  const columns: Array<Column<VehicleRequest>> = [
    {
      key: 'request',
      header: 'Request',
      render: (request) => (
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium tracking-[-0.01em] text-fg">
            {request.requesterName}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-fg-subtle">VR-{request.id}</p>
        </div>
      )
    },
    {
      key: 'mission',
      header: 'Mission',
      render: (request) => (
        <Link
          to={`/missions/${request.missionId}`}
          className="font-mono text-[12px] text-brand-text transition-colors duration-150 ease-out hover:text-brand"
        >
          MSN-{request.missionId}
        </Link>
      )
    },
    {
      key: 'route',
      header: 'Route',
      render: (request) => (
        <div className="min-w-0 max-w-[220px]">
          <p className="truncate text-[13px] text-fg">
            {request.basedLocation ?? '—'} → {request.destinationLocation ?? '—'}
          </p>
          <p className="mt-0.5 text-[11.5px] text-fg-subtle">
            {request.travelDetails?.length ?? 0} stop
            {(request.travelDetails?.length ?? 0) === 1 ? '' : 's'}
          </p>
        </div>
      )
    },
    {
      key: 'window',
      header: 'Travel window',
      render: (request) => (
        <span className="text-[13px] tabular-nums text-fg">
          {formatDate(request.travelStartDate, 'MMM d')} –{' '}
          {formatDate(request.travelEndDate, 'MMM d, yyyy')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (request) => <StatusBadge status={request.status ?? 'DRAFT'} />
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (request) => (
        <DropdownMenu
          width="w-48"
          items={[
            {
              label: 'Approve request',
              onSelect: () => updateStatus.mutate({ id: request.id, status: 'APPROVED' })
            },
            {
              label: 'Decline request',
              tone: 'danger',
              onSelect: () => updateStatus.mutate({ id: request.id, status: 'REJECTED' })
            }
          ]}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-label={`Actions for vehicle request ${request.id}`}
              aria-expanded={open}
              className="rounded-lg p-1.5 text-fg-subtle transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg"
            >
              <MoreHorizontalIcon size={16} />
            </button>
          )}
        />
      )
    }
  ];

  return (
    <PageTransition>
      <PageHeader
        title="Vehicle Requests"
        description="Annex C fleet bookings raised against approved missions."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="overflow-x-auto pb-1">
          <FilterTabs
            ariaLabel="Filter vehicle requests"
            layoutId="vehicles-filter"
            value={filter}
            onChange={setFilter}
            options={FILTERS.map((value) => ({
              value,
              label: value === 'ALL' ? 'All' : titleCase(value),
              count:
                value === 'ALL'
                  ? requests.length
                  : requests.filter((r) => (r.status ?? 'DRAFT') === value).length
            }))}
          />
        </div>
        <div className="w-full sm:w-72">
          <Input
            type="search"
            icon={SearchIcon}
            aria-label="Search vehicle requests"
            placeholder="Search requester, route, mission…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9"
          />
        </div>
      </div>

      <DataTable
        caption="Vehicle requests"
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(request) => String(request.id)}
        empty={
          <EmptyState
            icon={CarFrontIcon}
            title="No vehicle requests"
            description="Fleet bookings raised alongside a mission will show up here for dispatch to assign."
          />
        }
      />
    </PageTransition>
  );
}
