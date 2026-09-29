import React, { useMemo, useState } from 'react';
import {
  CheckIcon,
  ClipboardListIcon,
  MoreHorizontalIcon,
  SearchIcon,
  ShieldXIcon,
  EyeIcon
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterTabs } from '../components/ui/FilterTabs';
import { Input } from '../components/ui/Input';
import { useActivityReports, useAnnexStatusUpdate } from '../hooks/useAnnexes';
import { formatDateRange, titleCase } from '../lib/utils';
import type { ActivityReport, ActivityReportStatus } from '../types/annex';

type Filter = 'ALL' | ActivityReportStatus;

const FILTERS: Filter[] = ['ALL', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

export function ActivityReports() {
  const { data, isLoading } = useActivityReports();
  const updateStatus = useAnnexStatusUpdate('activity-reports');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');

  const reports = data ?? [];
  const rows = useMemo(
    () =>
      reports.filter((report) => {
        const status = report.status ?? 'DRAFT';
        const matchesFilter = filter === 'ALL' || status === filter;
        const matchesSearch =
          !search.trim() ||
          [
            report.requesterName,
            report.travelObjectives,
            `MSN-${report.missionId}`,
            report.destinationLocation ?? ''
          ]
            .join(' ')
            .toLowerCase()
            .includes(search.trim().toLowerCase());
        return matchesFilter && matchesSearch;
      }),
    [reports, filter, search]
  );

  const columns: Array<Column<ActivityReport>> = [
    {
      key: 'report',
      header: 'Report',
      render: (report) => (
        <div className="min-w-0 max-w-[300px]">
          <p className="truncate text-[13.5px] font-medium tracking-[-0.01em] text-fg">
            {report.travelObjectives || 'Untitled report'}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-fg-subtle">RPT-{report.id}</p>
        </div>
      )
    },
    {
      key: 'requester',
      header: 'Requester',
      render: (report) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-fg">{report.requesterName}</p>
          <p className="mt-0.5 text-[12px] text-fg-subtle">{report.destinationLocation ?? '—'}</p>
        </div>
      )
    },
    {
      key: 'mission',
      header: 'Mission',
      render: (report) => (
        <span className="font-mono text-[12px] text-fg-muted">MSN-{report.missionId}</span>
      )
    },
    {
      key: 'period',
      header: 'Travel period',
      render: (report) => (
        <span className="text-[13px] tabular-nums text-fg">
          {formatDateRange(report.travelStartDate, report.travelEndDate)}
        </span>
      )
    },
    {
      key: 'review',
      header: 'Review',
      render: (report) => {
        const fm = Boolean(report.functionManagerComment);
        const biz = Boolean(report.bizOpsComment);
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={
                fm
                  ? 'inline-flex h-6 items-center rounded-md bg-success-soft px-1.5 text-[11px] font-semibold text-success-text'
                  : 'inline-flex h-6 items-center rounded-md bg-surface-muted px-1.5 text-[11px] font-medium text-fg-subtle'
              }
            >
              FM
            </span>
            <span
              className={
                biz
                  ? 'inline-flex h-6 items-center rounded-md bg-success-soft px-1.5 text-[11px] font-semibold text-success-text'
                  : 'inline-flex h-6 items-center rounded-md bg-surface-muted px-1.5 text-[11px] font-medium text-fg-subtle'
              }
            >
              BizOps
            </span>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (report) => <StatusBadge status={report.status ?? 'DRAFT'} />
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (report) => (
        <DropdownMenu
          width="w-48"
          items={[
            {
              label: 'Mark under review',
              icon: EyeIcon,
              onSelect: () => updateStatus.mutate({ id: report.id, status: 'UNDER_REVIEW' })
            },
            {
              label: 'Approve report',
              icon: CheckIcon,
              onSelect: () => updateStatus.mutate({ id: report.id, status: 'APPROVED' })
            },
            {
              label: 'Reject report',
              icon: ShieldXIcon,
              tone: 'danger',
              onSelect: () => updateStatus.mutate({ id: report.id, status: 'REJECTED' })
            }
          ]}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-label={`Actions for report ${report.id}`}
              aria-expanded={open}
              className="rounded-lg p-1.5 text-fg-subtle transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg data-[open=true]:bg-surface-muted data-[open=true]:text-fg"
              data-open={open}
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
        title="Activity Reports"
        description="Annex B narrative reports submitted at the close of each mission."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="overflow-x-auto pb-1">
          <FilterTabs
            ariaLabel="Filter activity reports"
            layoutId="reports-filter"
            value={filter}
            onChange={setFilter}
            options={FILTERS.map((value) => ({
              value,
              label: value === 'ALL' ? 'All' : titleCase(value),
              count:
                value === 'ALL'
                  ? reports.length
                  : reports.filter((r) => (r.status ?? 'DRAFT') === value).length
            }))}
          />
        </div>
        <div className="w-full sm:w-72">
          <Input
            type="search"
            icon={SearchIcon}
            aria-label="Search activity reports"
            placeholder="Search requester, objective, mission…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9"
          />
        </div>
      </div>

      <DataTable
        caption="Activity reports"
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(report) => String(report.id)}
        empty={
          <EmptyState
            icon={ClipboardListIcon}
            title="No activity reports"
            description="Reports appear once staff submit their Annex B narrative at the end of a mission."
          />
        }
      />
    </PageTransition>
  );
}
