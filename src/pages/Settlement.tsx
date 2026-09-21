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
import { cn, formatCurrency, formatDate } from '../lib/utils';
import type { SettlementRecord } from '../types/annex';

type Filter = 'ALL' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PAID';

const FILTERS: Filter[] = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID'];

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
  const toReimburse = open.filter((r) => r.balance > 0).reduce((sum, r) => sum + r.balance, 0);
  const toRecover = Math.abs(open.filter((r) => r.balance < 0).reduce((sum, r) => sum + r.balance, 0));

  const columns: Array<Column<SettlementRecord>> = [
  {
    key: 'record',
    header: 'Settlement',
    render: (record) =>
    <div className="min-w-0">
          <span className="font-mono text-[11.5px] text-fg-subtle">{record.reference}</span>
          <p className="mt-0.5 truncate text-[13.5px] font-medium text-fg">{record.missionTitle}</p>
          <p className="text-[11.5px] text-fg-subtle">
            {record.missionReference} · {record.staffName}
          </p>
        </div>

  },
  {
    key: 'submitted',
    header: 'Submitted',
    render: (record) =>
    <span className="text-[13px] text-fg">{formatDate(record.submittedAt)}</span>

  },
  {
    key: 'advance',
    header: 'Advance',
    align: 'right',
    render: (record) =>
    <span className="text-[13px] tabular-nums text-fg-muted">
          {formatCurrency(record.advanceAmount, record.currency)}
        </span>

  },
  {
    key: 'actual',
    header: 'Actual',
    align: 'right',
    render: (record) =>
    <span className="text-[13px] tabular-nums text-fg">
          {record.actualAmount ? formatCurrency(record.actualAmount, record.currency) : '—'}
        </span>

  },
  {
    key: 'balance',
    header: 'Balance',
    align: 'right',
    render: (record) =>
    <span
      className={cn(
        'text-[13.5px] font-semibold tabular-nums',
        record.balance > 0 ? 'text-danger-text' : 'text-success-text'
      )}>
      
          {record.balance > 0 ? '+' : ''}
          {formatCurrency(record.balance, record.currency)}
        </span>

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
    render: (record) =>
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
      }]
      }
      trigger={({ toggle }) =>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Actions for ${record.reference}`}
        className="rounded-lg p-1.5 text-fg-subtle transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg">
        
              <MoreHorizontalIcon size={16} />
            </button>
      } />


  }];


  return (
    <PageTransition>
      <PageHeader
        title="Settlement"
        description="Reconcile mission advances against actual spend and close out the financial record." />
      

      <div className="mb-4 grid gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-soft sm:grid-cols-3">
        {[
        { label: 'Open settlements', value: isLoading ? null : String(open.length), tone: 'text-fg' },
        {
          label: 'To reimburse staff',
          value: isLoading ? null : formatCurrency(toReimburse, 'USD'),
          tone: 'text-danger-text'
        },
        {
          label: 'To recover',
          value: isLoading ? null : formatCurrency(toRecover, 'USD'),
          tone: 'text-success-text'
        }].
        map((stat) =>
        <div key={stat.label} className="bg-surface px-5 py-4">
            <p className="text-[12.5px] text-fg-muted">{stat.label}</p>
            {stat.value === null ?
          <Skeleton className="mt-2 h-6 w-24" /> :

          <p className={cn('mt-1 text-xl font-semibold tabular-nums tracking-[-0.02em]', stat.tone)}>
                {stat.value}
              </p>
          }
          </div>
        )}
      </div>

      <div className="mb-4 overflow-x-auto pb-1">
        <FilterTabs
          ariaLabel="Filter settlements"
          layoutId="settlement-filter"
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
            count:
            value === 'ALL' ? settlements.length : settlements.filter((r) => r.status === value).length
          }))} />
        
      </div>

      <DataTable
        caption="Settlements"
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(record) => record.id}
        empty={
        <EmptyState
          icon={ReceiptTextIcon}
          title="Nothing to settle"
          description="Settlements appear once a completed mission has its actual costs submitted by the traveller." />

        } />
      
    </PageTransition>);

}