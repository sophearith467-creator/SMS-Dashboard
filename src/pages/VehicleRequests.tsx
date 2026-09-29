import React, { useMemo, useState } from 'react';
import { CarFrontIcon, MoreHorizontalIcon } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterTabs } from '../components/ui/FilterTabs';
import { useAnnexStatusUpdate, useVehicleRequests } from '../hooks/useAnnexes';
import { formatDate, titleCase } from '../lib/utils';
import type { VehicleRequest, VehicleRequestStatus } from '../types/annex';

type Filter = 'ALL' | VehicleRequestStatus;

const FILTERS: Filter[] = ['ALL', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'];

export function VehicleRequests() {
  const { data, isLoading } = useVehicleRequests();
  const updateStatus = useAnnexStatusUpdate('vehicle-requests');
  const [filter, setFilter] = useState<Filter>('ALL');

  const requests = data ?? [];
  const rows = useMemo(
    () => requests.filter((request) => filter === 'ALL' || request.status === filter),
    [requests, filter]
  );

  const columns: Array<Column<VehicleRequest>> = [
    {
      key: 'request',
      header: 'Request',
      render: (request) => (
        <div>
          <span className="font-mono text-[11.5px] text-fg-subtle">VR-{request.id}</span>
          <p className="mt-0.5 text-[13.5px] font-medium text-fg">{request.requesterName}</p>
        </div>
      )
    },
    {
      key: 'mission',
      header: 'Mission',
      render: (request) => (
        <span className="font-mono text-[12px] text-fg">MSN-{request.missionId}</span>
      )
    },
    {
      key: 'route',
      header: 'Route',
      render: (request) => (
        <div className="text-[13px] text-fg">
          <p className="truncate">{request.basedLocation ?? '—'} → {request.destinationLocation ?? '—'}</p>
          <p className="text-[11.5px] text-fg-subtle">{request.travelDetails.length} stop(s) logged</p>
        </div>
      )
    },
    {
      key: 'window',
      header: 'Travel window',
      render: (request) => (
        <span className="text-[13px] text-fg">
          {formatDate(request.travelStartDate, 'MMM d')} – {formatDate(request.travelEndDate, 'MMM d, yyyy')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (request) => <StatusBadge status={request.status} />
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (request) => (
        <DropdownMenu
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
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-label={`Actions for vehicle request ${request.id}`}
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

      <div className="mb-4 overflow-x-auto pb-1">
        <FilterTabs
          ariaLabel="Filter vehicle requests"
          layoutId="vehicles-filter"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((value) => ({
            value,
            label: value === 'ALL' ? 'All' : titleCase(value),
            count: value === 'ALL' ? requests.length : requests.filter((r) => r.status === value).length
          }))}
        />
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
