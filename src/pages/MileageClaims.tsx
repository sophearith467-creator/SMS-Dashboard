import React, { useMemo, useState } from 'react';
import { MoreHorizontalIcon, RouteIcon } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterTabs } from '../components/ui/FilterTabs';
import { useAnnexStatusUpdate, useMileageClaims } from '../hooks/useAnnexes';
import { formatCurrency, formatDate, formatNumber } from '../lib/utils';
import type { MileageClaim } from '../types/annex';

type Filter = 'ALL' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PAID';

const FILTERS: Filter[] = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID'];

export function MileageClaims() {
  const { data, isLoading } = useMileageClaims();
  const updateStatus = useAnnexStatusUpdate('mileage-claims');
  const [filter, setFilter] = useState<Filter>('ALL');

  const claims = data ?? [];
  const rows = useMemo(
    () => claims.filter((claim) => filter === 'ALL' || claim.status === filter),
    [claims, filter]
  );

  const outstanding = claims.
  filter((claim) => claim.status !== 'PAID').
  reduce((sum, claim) => sum + claim.amount, 0);
  const totalDistance = claims.reduce((sum, claim) => sum + claim.distanceKm, 0);

  const columns: Array<Column<MileageClaim>> = [
  {
    key: 'claim',
    header: 'Claim',
    render: (claim) =>
    <div>
          <span className="font-mono text-[11.5px] text-fg-subtle">{claim.reference}</span>
          <p className="mt-0.5 text-[13.5px] font-medium text-fg">{claim.claimantName}</p>
        </div>

  },
  {
    key: 'mission',
    header: 'Mission',
    render: (claim) => <span className="font-mono text-[12px] text-fg">{claim.missionReference}</span>
  },
  {
    key: 'vehicle',
    header: 'Vehicle',
    render: (claim) =>
    <span className="rounded-md bg-surface-muted px-2 py-1 font-mono text-[11.5px] text-fg-muted">
          {claim.vehiclePlate}
        </span>

  },
  {
    key: 'travelDate',
    header: 'Travel date',
    render: (claim) => <span className="text-[13px] text-fg">{formatDate(claim.travelDate)}</span>
  },
  {
    key: 'distance',
    header: 'Distance',
    align: 'right',
    render: (claim) =>
    <span className="text-[13px] tabular-nums text-fg">{formatNumber(claim.distanceKm)} km</span>

  },
  {
    key: 'rate',
    header: 'Rate',
    align: 'right',
    render: (claim) =>
    <span className="text-[13px] tabular-nums text-fg-muted">${claim.ratePerKm.toFixed(2)}/km</span>

  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (claim) =>
    <span className="text-[13.5px] font-semibold tabular-nums text-fg">
          {formatCurrency(claim.amount, claim.currency)}
        </span>

  },
  {
    key: 'status',
    header: 'Status',
    align: 'right',
    render: (claim) => <StatusBadge status={claim.status} />
  },
  {
    key: 'actions',
    header: <span className="sr-only">Actions</span>,
    align: 'right',
    render: (claim) =>
    <DropdownMenu
      items={[
      {
        label: 'Approve claim',
        onSelect: () => updateStatus.mutate({ id: claim.id, status: 'APPROVED' })
      },
      {
        label: 'Mark as paid',
        onSelect: () => updateStatus.mutate({ id: claim.id, status: 'PAID' })
      },
      {
        label: 'Reject claim',
        tone: 'danger',
        onSelect: () => updateStatus.mutate({ id: claim.id, status: 'REJECTED' })
      }]
      }
      trigger={({ toggle }) =>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Actions for ${claim.reference}`}
        className="rounded-lg p-1.5 text-fg-subtle transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg">
        
              <MoreHorizontalIcon size={16} />
            </button>
      } />


  }];


  return (
    <PageTransition>
      <PageHeader
        title="Mileage Claims"
        description="Annex D personal and company vehicle mileage submitted for reimbursement."
        meta={
        <>
            <Badge tone="warning" dot>
              {formatCurrency(outstanding, 'USD')} outstanding
            </Badge>
            <Badge tone="neutral">{formatNumber(totalDistance)} km claimed</Badge>
          </>
        } />
      

      <div className="mb-4 overflow-x-auto pb-1">
        <FilterTabs
          ariaLabel="Filter mileage claims"
          layoutId="mileage-filter"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((value) => ({
            value,
            label:
            value === 'ALL' ?
            'All' :
            value === 'UNDER_REVIEW' ?
            'Under review' :
            value.charAt(0) + value.slice(1).toLowerCase(),
            count: value === 'ALL' ? claims.length : claims.filter((c) => c.status === value).length
          }))} />
        
      </div>

      <DataTable
        caption="Mileage claims"
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(claim) => claim.id}
        empty={
        <EmptyState
          icon={RouteIcon}
          title="No mileage claims"
          description="Claims appear here once staff log distance travelled against a completed mission." />

        } />
      
    </PageTransition>);

}