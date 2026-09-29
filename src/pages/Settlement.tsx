import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BanknoteIcon,
  CheckIcon,
  EyeIcon,
  MoreHorizontalIcon,
  ReceiptTextIcon,
  SearchIcon
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterTabs } from '../components/ui/FilterTabs';
import { Input } from '../components/ui/Input';
import { useAnnexStatusUpdate, useSettlements } from '../hooks/useAnnexes';
import { formatCurrency, formatDate, titleCase } from '../lib/utils';
import type { SettlementRecord, SettlementStatus } from '../types/annex';

type Filter = 'ALL' | SettlementStatus;

const FILTERS: Filter[] = ['ALL', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID'];

export function Settlement() {
  const { data, isLoading } = useSettlements();
  const updateStatus = useAnnexStatusUpdate('settlements');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');

  const settlements = data ?? [];

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return settlements.filter((record) => {
      const matchesFilter = filter === 'ALL' || record.status === filter;
      const matchesSearch =
        !q ||
        [`STL-${record.id}`, `MSN-${record.missionId}`, record.notes ?? '']
          .join(' ')
          .toLowerCase()
          .includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [settlements, filter, search]);

  const open = settlements.filter((record) => record.status !== 'PAID');
  const totalOutstanding = open.reduce((sum, r) => sum + r.grandTotal, 0);

  const columns: Array<Column<SettlementRecord>> = [
    {
      key: 'record',
      header: 'Settlement',
      render: (record) => (
        <div className="min-w-0">
          <Link
            to={`/missions/${record.missionId}`}
            className="truncate text-[13.5px] font-medium tracking-[-0.01em] text-fg transition-colors duration-150 ease-out hover:text-brand-text"
          >
            Mission MSN-{record.missionId}
          </Link>
          <p className="mt-0.5 font-mono text-[11px] text-fg-subtle">STL-{record.id}</p>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (record) => (
        <div>
          <p className="text-[13px] tabular-nums text-fg">
            {record.settledAt ? formatDate(record.settledAt) : formatDate(record.createdAt)}
          </p>
          <p className="mt-0.5 text-[12px] text-fg-subtle">
            {record.settledAt ? 'Settled' : 'Created'}
          </p>
        </div>
      )
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
          width="w-52"
          items={[
            {
              label: 'Start review',
              icon: EyeIcon,
              disabled: ['UNDER_REVIEW', 'APPROVED', 'PAID'].includes(record.status),
              onSelect: () => updateStatus.mutate({ id: record.id, status: 'UNDER_REVIEW' })
            },
            {
              label: 'Approve settlement',
              icon: CheckIcon,
              disabled: record.status === 'APPROVED' || record.status === 'PAID',
              onSelect: () => updateStatus.mutate({ id: record.id, status: 'APPROVED' })
            },
            {
              label: 'Mark as paid',
              icon: BanknoteIcon,
              disabled: record.status === 'PAID',
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
        meta={
          !isLoading && (
            <>
              <Badge tone={open.length > 0 ? 'warning' : 'success'} dot>
                {formatCurrency(totalOutstanding, 'USD')} outstanding
              </Badge>
              <Badge tone="neutral">{open.length} open</Badge>
            </>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="overflow-x-auto pb-1">
          <FilterTabs
            ariaLabel="Filter settlements"
            layoutId="settlement-filter"
            value={filter}
            onChange={setFilter}
            options={FILTERS.map((value) => ({
              value,
              label: value === 'ALL' ? 'All' : titleCase(value),
              count:
                value === 'ALL'
                  ? settlements.length
                  : settlements.filter((r) => r.status === value).length
            }))}
          />
        </div>
        <div className="w-full sm:w-72">
          <Input
            type="search"
            icon={SearchIcon}
            aria-label="Search settlements"
            placeholder="Search settlement, mission, notes…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9"
          />
        </div>
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
