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
import { formatCurrency, formatDate, formatNumber, titleCase } from '../lib/utils';
import type { MileageClaim, MileageClaimStatus } from '../types/annex';

type Filter = 'ALL' | MileageClaimStatus;

const FILTERS: Filter[] = ['ALL', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'];

export function MileageClaims() {
  const { data, isLoading } = useMileageClaims();
  const updateStatus = useAnnexStatusUpdate('mileage-claims');
  const [filter, setFilter] = useState<Filter>('ALL');

  const claims = data ?? [];
  const rows = useMemo(
    () => claims.filter((claim) => filter === 'ALL' || claim.status === filter),
    [claims, filter]
  );

  const outstanding = claims
    .filter((claim) => claim.status !== 'PAID')
    .reduce((sum, claim) => sum + claim.totalClaimAmount, 0);
  const totalDistance = claims.reduce((sum, claim) => sum + claim.totalDistanceKm, 0);

  const columns: Array<Column<MileageClaim>> = [
    {
      key: 'claim',
      header: 'Claim',
      render: (claim) => (
        <div>
          <span className="font-mono text-[11.5px] text-fg-subtle">CLM-{claim.id}</span>
          <p className="mt-0.5 text-[13.5px] font-medium text-fg">{claim.requesterName}</p>
        </div>
      )
    },
    {
      key: 'mission',
      header: 'Mission',
      render: (claim) => <span className="font-mono text-[12px] text-fg">MSN-{claim.missionId}</span>
    },
    {
      key: 'window',
      header: 'Travel window',
      render: (claim) => (
        <span className="text-[13px] text-fg">
          {formatDate(claim.travelStartDate, 'MMM d')} – {formatDate(claim.travelEndDate, 'MMM d, yyyy')}
        </span>
      )
    },
    {
      key: 'distance',
      header: 'Distance',
      align: 'right',
      render: (claim) => (
        <span className="text-[13px] tabular-nums text-fg">{formatNumber(claim.totalDistanceKm)} km</span>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (claim) => (
        <span className="text-[13.5px] font-semibold tabular-nums text-fg">
          {formatCurrency(claim.totalClaimAmount, 'USD')}
        </span>
      )
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
      render: (claim) => (
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
            }
          ]}
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-label={`Actions for claim ${claim.id}`}
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
        title="Mileage Claims"
        description="Annex D personal and company vehicle mileage submitted for reimbursement."
        meta={
          <>
            <Badge tone="warning" dot>
              {formatCurrency(outstanding, 'USD')} outstanding
            </Badge>
            <Badge tone="neutral">{formatNumber(totalDistance)} km claimed</Badge>
          </>
        }
      />

      <div className="mb-4 overflow-x-auto pb-1">
        <FilterTabs
          ariaLabel="Filter mileage claims"
          layoutId="mileage-filter"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((value) => ({
            value,
            label: value === 'ALL' ? 'All' : titleCase(value),
            count: value === 'ALL' ? claims.length : claims.filter((c) => c.status === value).length
          }))}
        />
      </div>

      <DataTable
        caption="Mileage claims"
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(claim) => String(claim.id)}
        empty={
          <EmptyState
            icon={RouteIcon}
            title="No mileage claims"
            description="Claims appear here once staff log distance travelled against a completed mission."
          />
        }
      />
    </PageTransition>
  );
}
