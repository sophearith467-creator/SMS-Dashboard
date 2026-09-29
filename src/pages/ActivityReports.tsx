import React, { useMemo, useState } from 'react';
import { ClipboardListIcon, MoreHorizontalIcon, SearchIcon } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterTabs } from '../components/ui/FilterTabs';
import { Input } from '../components/ui/Input';
import { useActivityReports, useAnnexStatusUpdate } from '../hooks/useAnnexes';
import { formatDate, formatDateRange, titleCase } from '../lib/utils';
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
        const matchesFilter = filter === 'ALL' || report.status === filter;
        const matchesSearch =
          !search.trim() ||
          [report.requesterName, report.travelObjectives, `MSN-${report.missionId}`, report.destinationLocation ?? '']
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
        <div className="min-w-0">
          <span className="font-mono text-[11.5px] text-fg-subtle">RPT-{report.id}</span>
          <p className="mt-0.5 truncate text-[13.5px] font-medium text-fg">{report.travelObjectives}</p>
          <p className="mt-0.5 truncate text-[12px] text-fg-subtle">{report.achievedResults}</p>
        </div>
      )
    },
    {
      key: 'mission',
      header: 'Mission',
      render: (report) => <span className="font-mono text-[12px] text-fg">MSN-{report.missionId}</span>
    },
    {
      key: 'requester',
      header: 'Requester',
      render: (report) => (
        <div>
          <p className="text-[13px] text-fg">{report.requesterName}</p>
          <p className="text-[11.5px] text-fg-subtle">
            {report.requesterSignatureDate ? formatDate(report.requesterSignatureDate) : 'Not signed'}
          </p>
        </div>
      )
    },
    {
      key: 'period',
      header: 'Travel period',
      render: (report) => (
        <span className="text-[13px] text-fg">
          {formatDateRange(report.travelStartDate, report.travelEndDate)}
        </span>
      )
    },
    {
      key: 'comments',
      header: 'Comments',
      render: (report) => (
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <span
            className={
              report.functionManagerComment
                ? 'rounded-md bg-success-soft px-1.5 py-0.5 font-medium text-success-text'
                : 'rounded-md bg-surface-muted px-1.5 py-0.5 font-medium text-fg-subtle'
            }
          >
            FM {report.functionManagerComment ? '✓' : '—'}
          </span>
          <span
            className={
              report.bizOpsComment
                ? 'rounded-md bg-success-soft px-1.5 py-0.5 font-medium text-success-text'
                : 'rounded-md bg-surface-muted px-1.5 py-0.5 font-medium text-fg-subtle'
            }
          >
            BizOps {report.bizOpsComment ? '✓' : '—'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (report) => <StatusBadge status={report.status} />
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (report) => (
        <DropdownMenu
          items={[
            {
              label: 'Mark under review',
              onSelect: () => updateStatus.mutate({ id: report.id, status: 'UNDER_REVIEW' })
            },
            {
              label: 'Approve report',
              onSelect: () => updateStatus.mutate({ id: report.id, status: 'APPROVED' })
            },
            {
              label: 'Reject report',
              tone: 'danger',
              onSelect: () => updateStatus.mutate({ id: report.id, status: 'REJECTED' })
            }
          ]}
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-label={`Actions for report ${report.id}`}
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
        title="Activity Reports"
        description="Annex B narrative reports submitted at the close of each mission."
      />

      <div className="mb-4 overflow-x-auto pb-1">
        <FilterTabs
          ariaLabel="Filter activity reports"
          layoutId="reports-filter"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((value) => ({
            value,
            label: value === 'ALL' ? 'All' : titleCase(value),
            count: value === 'ALL' ? reports.length : reports.filter((r) => r.status === value).length
          }))}
        />
      </div>

      <DataTable
        caption="Activity reports"
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(report) => String(report.id)}
        toolbar={
          <>
            <p className="text-[13px] text-fg-muted">
              <span className="font-medium text-fg">{rows.length}</span> reports
            </p>
            <div className="w-full sm:w-72">
              <Input
                type="search"
                icon={SearchIcon}
                aria-label="Filter activity reports"
                placeholder="Filter by requester, objective or mission"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-9"
              />
            </div>
          </>
        }
        empty={
          <EmptyState
            icon={ClipboardListIcon}
            title="No activity reports here"
            description="Reports appear once staff submit their Annex B narrative at the end of a mission."
          />
        }
      />
    </PageTransition>
  );
}
