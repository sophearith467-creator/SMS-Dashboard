import React, { useMemo, useState } from 'react';
import { MoreHorizontalIcon, ReceiptTextIcon } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterTabs } from '../components/ui/FilterTabs';
import { Skeleton } from '../components/ui/Skeleton';
import { useAnnexStatusUpdate, useSettlements } from '../hooks/useAnnexes';
import { cn, formatCurrency, formatDate, titleCase } from '../lib/utils';
import type { SettlementRecord, SettlementStatus } from '../types/annex';

type Filter = 'ALL' | SettlementStatus;

const FILTERS: Filter[] = ['ALL', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID'];

export function Settlement() {
  const { data, isLoading } = useSettlements();
  const updateStatus = useAnnexStatusUpdate('settlements');
  const [filter, setFilter] = useState<Filter>('ALL');

  const settlements = data ?? [];
  const rows = useMemo(
    () => settlements.filter((record) => filter === 'ALL' || record.status === filter),
    [settlements, filter]
  );

  const open = settlements.filter((record) => record.status !== 'PAID');
  const totalOutstanding = open.reduce((sum, r) => sum + r.grandTotal, 0);

  const columns: Array<Column<SettlementRecord>> = [
    {
      key: 'record',
      header: 'Settlement',
      render: (record) => (
        <div className="min-w-0">
          <span className="font-mono text-[11.5px] text-fg-subtle">STL-{record.id}</span>
          <p className="mt-0.5 truncate text-[13.5px] font-medium text-fg">Mission MSN-{record.missionId}</p>
        </div>
      )
    },
    {
      key: 'created',
      header: 'Created',
      render: (record) => <span className="text-[13px] text-fg">{formatDate(record.createdAt)}</span>
    },
    {
      key: 'allowance',
      header: 'Allowance',
      align: 'right',
      render: (record) => (
        <span className="text-[13px] tabular-nums text-fg-muted">
          {formatCurrency(record.totalAllowance, 'USD')}
        </span>
      )
    },
    {
      key: 'mileage',
      header: 'Mileage',
      align: 'right',
      render: (record) => (
        <span className="text-[13px] tabular-nums text-fg-muted">
          {formatCurrency(record.totalMileageClaim, 'USD')}
        </span>
      )
    },
    {
      key: 'grandTotal',
      header: 'Grand total',
      align: 'right',
      render: (record) => (
        <span className="text-[13.5px] font-semibold tabular-nums text-fg">
          {formatCurrency(record.grandTotal, 'USD')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (record) => <StatusBadge status={record.status} />
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (record) => (
        <DropdownMenu
          items={[
            {
              label: 'Start review',
              onSelect: () => updateStatus.mutate({ id: record.id, status: 'UNDER_REVIEW' })
            },
            {
              label: 'Approve settlement',
              onSelect: () => updateStatus.mutate({ id: record.id, status: 'APPROVED' })
            },
            {
              label: 'Mark as paid',
              onSelect: () => updateStatus.mutate({ id: record.id, status: 'PAID' })
            }
          ]}
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-label={`Actions for settlement ${record.id}`}
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
        title="Settlement"
        description="Reconcile mission allowances against mileage claims and close out the financial record."
      />

      <div className="mb-4 grid gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-soft sm:grid-cols-2">
        <div className="bg-surface px-5 py-4">
          <p className="text-[12.5px] text-fg-muted">Open settlements</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-6 w-24" />
          ) : (
            <p className="mt-1 text-xl font-semibold tabular-nums tracking-[-0.02em] text-fg">{open.length}</p>
          )}
        </div>
        <div className="bg-surface px-5 py-4">
          <p className="text-[12.5px] text-fg-muted">Outstanding total</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-6 w-24" />
          ) : (
            <p className="mt-1 text-xl font-semibold tabular-nums tracking-[-0.02em] text-danger-text">
              {formatCurrency(totalOutstanding, 'USD')}
            </p>
          )}
        </div>
      </div>

      <div className="mb-4 overflow-x-auto pb-1">
        <FilterTabs
          ariaLabel="Filter settlements"
          layoutId="settlement-filter"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((value) => ({
            value,
            label: value === 'ALL' ? 'All' : titleCase(value),
            count: value === 'ALL' ? settlements.length : settlements.filter((r) => r.status === value).length
          }))}
        />
      </div>

      <DataTable
        caption="Settlements"
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(record) => String(record.id)}
        empty={
          <EmptyState
            icon={ReceiptTextIcon}
            title="Nothing to settle"
            description="Settlements appear once a completed mission has its actual costs submitted by the traveller."
          />
        }
      />
    </PageTransition>
  );
}
