import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BanknoteIcon,
  CheckIcon,
  MoreHorizontalIcon,
  RouteIcon,
  SearchIcon,
  XIcon
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterTabs } from '../components/ui/FilterTabs';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { useAnnexStatusUpdate, useMileageClaims } from '../hooks/useAnnexes';
import { cn, formatCurrency, formatDateRange, formatNumber, titleCase } from '../lib/utils';
import type { MileageClaim, MileageClaimStatus } from '../types/annex';

type Filter = 'ALL' | MileageClaimStatus;

const FILTERS: Filter[] = ['ALL', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'];

interface StatProps {
  label: string;
  value: string;
  caption: string;
  loading?: boolean;
  tone?: 'default' | 'warning' | 'success';
}

function Stat({ label, value, caption, loading, tone = 'default' }: StatProps) {
  return (
    <div className="bg-surface px-5 py-4">
      <div className="flex items-center gap-2">
        {tone !== 'default' && (
          <span
            aria-hidden
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              tone === 'warning' ? 'bg-warning-text' : 'bg-success-text'
            )}
          />
        )}
        <p className="text-[12px] font-medium text-fg-muted">{label}</p>
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-28" />
      ) : (
        <p className="mt-1.5 text-[22px] font-semibold tabular-nums leading-none tracking-[-0.02em] text-fg">
          {value}
        </p>
      )}
      <p className="mt-2 text-[12px] text-fg-subtle">{caption}</p>
    </div>
  );
}

export function MileageClaims() {
  const { data, isLoading } = useMileageClaims();
  const updateStatus = useAnnexStatusUpdate('mileage-claims');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');

  const claims = data ?? [];

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return claims.filter((claim) => {
      const matchesFilter = filter === 'ALL' || claim.status === filter;
      const matchesSearch =
        !q ||
        [
          claim.requesterName,
          claim.travelObjectives,
          claim.destinationLocation ?? '',
          `CLM-${claim.id}`,
          `MSN-${claim.missionId}`
        ]
          .join(' ')
          .toLowerCase()
          .includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [claims, filter, search]);

  const unpaid = claims.filter((claim) => claim.status !== 'PAID');
  const paid = claims.filter((claim) => claim.status === 'PAID');
  const outstanding = unpaid.reduce((sum, claim) => sum + claim.totalClaimAmount, 0);
  const paidTotal = paid.reduce((sum, claim) => sum + claim.totalClaimAmount, 0);
  const totalDistance = claims.reduce((sum, claim) => sum + claim.totalDistanceKm, 0);

  const columns: Array<Column<MileageClaim>> = [
    {
      key: 'claim',
      header: 'Claim',
      render: (claim) => (
        <div className="min-w-0 max-w-[280px]">
          <p className="truncate text-[13.5px] font-medium tracking-[-0.01em] text-fg">
            {claim.travelObjectives || 'Mileage claim'}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-fg-subtle">CLM-{claim.id}</p>
        </div>
      )
    },
    {
      key: 'requester',
      header: 'Requester',
      render: (claim) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-fg">{claim.requesterName}</p>
          <p className="mt-0.5 text-[12px] text-fg-subtle">{claim.destinationLocation ?? '—'}</p>
        </div>
      )
    },
    {
      key: 'mission',
      header: 'Mission',
      render: (claim) => (
        <Link
          to={`/missions/${claim.missionId}`}
          className="font-mono text-[12px] text-brand-text transition-colors duration-150 ease-out hover:text-brand"
        >
          MSN-{claim.missionId}
        </Link>
      )
    },
    {
      key: 'window',
      header: 'Travel period',
      render: (claim) => (
        <span className="text-[13px] tabular-nums text-fg">
          {formatDateRange(claim.travelStartDate, claim.travelEndDate)}
        </span>
      )
    },
    {
      key: 'distance',
      header: 'Distance',
      align: 'right',
      render: (claim) => (
        <span className="text-[13px] tabular-nums text-fg-muted">
          {formatNumber(claim.totalDistanceKm)} km
        </span>
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
              icon: CheckIcon,
              disabled: claim.status === 'APPROVED' || claim.status === 'PAID',
              onSelect: () => updateStatus.mutate({ id: claim.id, status: 'APPROVED' })
            },
            {
              label: 'Mark as paid',
              icon: BanknoteIcon,
              disabled: claim.status === 'PAID',
              onSelect: () => updateStatus.mutate({ id: claim.id, status: 'PAID' })
            },
            {
              label: 'Reject claim',
              icon: XIcon,
              tone: 'danger',
              disabled: claim.status === 'REJECTED' || claim.status === 'PAID',
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
      />

      <div className="mb-5 grid gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-soft sm:grid-cols-3">
        <Stat
          label="Outstanding"
          tone="warning"
          loading={isLoading}
          value={formatCurrency(outstanding, 'USD')}
          caption={`${unpaid.length} ${unpaid.length === 1 ? 'claim' : 'claims'} awaiting payment`}
        />
        <Stat
          label="Paid"
          tone="success"
          loading={isLoading}
          value={formatCurrency(paidTotal, 'USD')}
          caption={`${paid.length} ${paid.length === 1 ? 'claim' : 'claims'} settled`}
        />
        <Stat
          label="Distance claimed"
          loading={isLoading}
          value={`${formatNumber(totalDistance)} km`}
          caption={`Across ${claims.length} ${claims.length === 1 ? 'claim' : 'claims'}`}
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="overflow-x-auto pb-1">
          <FilterTabs
            ariaLabel="Filter mileage claims"
            layoutId="mileage-filter"
            value={filter}
            onChange={setFilter}
            options={FILTERS.map((value) => ({
              value,
              label: value === 'ALL' ? 'All' : titleCase(value),
              count:
                value === 'ALL'
                  ? claims.length
                  : claims.filter((c) => c.status === value).length
            }))}
          />
        </div>
        <div className="w-full sm:w-72">
          <Input
            type="search"
            icon={SearchIcon}
            aria-label="Search mileage claims"
            placeholder="Search requester, objective, mission…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9"
          />
        </div>
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
