import React, { useMemo, useState } from 'react';
import { ArrowRightIcon, CarFrontIcon, MoreHorizontalIcon, UsersIcon } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterTabs } from '../components/ui/FilterTabs';
import { useAnnexStatusUpdate, useVehicleRequests } from '../hooks/useAnnexes';
import { formatDate, titleCase } from '../lib/utils';
import type { VehicleRequest } from '../types/annex';

type Filter = 'ALL' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'DRAFT';

const FILTERS: Filter[] = ['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'DRAFT'];

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
    render: (request) =>
    <div>
          <span className="font-mono text-[11.5px] text-fg-subtle">{request.reference}</span>
          <p className="mt-0.5 text-[13.5px] font-medium text-fg">{titleCase(request.vehicleType)}</p>
        </div>

  },
  {
    key: 'mission',
    header: 'Mission',
    render: (request) =>
    <span className="font-mono text-[12px] text-fg">{request.missionReference}</span>

  },
  {
    key: 'requester',
    header: 'Requester',
    render: (request) => <span className="text-[13px] text-fg">{request.requesterName}</span>
  },
  {
    key: 'route',
    header: 'Route',
    render: (request) =>
    <div className="flex items-center gap-2 text-[13px] text-fg">
          <span className="truncate">{request.pickupLocation}</span>
          <ArrowRightIcon size={13} className="shrink-0 text-fg-subtle" aria-hidden />
          <span className="truncate">{request.dropoffLocation}</span>
        </div>

  },
  {
    key: 'pickup',
    header: 'Pickup',
    render: (request) =>
    <span className="text-[13px] text-fg">
          {formatDate(request.pickupAt, "MMM d, HH:mm")}
        </span>

  },
  {
    key: 'crew',
    header: 'Crew',
    render: (request) =>
    <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">
            <UsersIcon size={12} aria-hidden />
            {request.passengers}
          </Badge>
          {request.driverRequired && <Badge tone="brand">Driver</Badge>}
        </div>

  },
  {
    key: 'status',
    header: 'Status',
    render: (request) => <StatusBadge status={request.status} />
  },
  {
    key: 'actions',
    header: <span className="sr-only">Actions</span>,
    align: 'right',
    render: (request) =>
    <DropdownMenu
      items={[
      {
        label: 'Assign vehicle',
        onSelect: () => updateStatus.mutate({ id: request.id, status: 'APPROVED' })
      },
      {
        label: 'Decline request',
        tone: 'danger',
        onSelect: () => updateStatus.mutate({ id: request.id, status: 'REJECTED' })
      }]
      }
      trigger={({ toggle }) =>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Actions for ${request.reference}`}
        className="rounded-lg p-1.5 text-fg-subtle transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg">
        
              <MoreHorizontalIcon size={16} />
            </button>
      } />


  }];


  return (
    <PageTransition>
      <PageHeader
        title="Vehicle Requests"
        description="Annex C fleet bookings raised against approved missions." />
      

      <div className="mb-4 overflow-x-auto pb-1">
        <FilterTabs
          ariaLabel="Filter vehicle requests"
          layoutId="vehicles-filter"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((value) => ({
            value,
            label: value === 'ALL' ? 'All' : value.charAt(0) + value.slice(1).toLowerCase(),
            count: value === 'ALL' ? requests.length : requests.filter((r) => r.status === value).length
          }))} />
        
      </div>

      <DataTable
        caption="Vehicle requests"
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(request) => request.id}
        empty={
        <EmptyState
          icon={CarFrontIcon}
          title="No vehicle requests"
          description="Fleet bookings raised alongside a mission will show up here for dispatch to assign." />

        } />
      
    </PageTransition>);

}