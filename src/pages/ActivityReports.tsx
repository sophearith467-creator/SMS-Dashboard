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
import { formatDate, formatDateRange } from '../lib/utils';
import type { ActivityReport } from '../types/annex';

type Filter = 'ALL' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'DRAFT';

const FILTERS: Filter[] = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'DRAFT'];

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
      [report.reference, report.title, report.authorName, report.missionReference].
      join(' ').
      toLowerCase().
      includes(search.trim().toLowerCase());
      return matchesFilter && matchesSearch;
    }),
    [reports, filter, search]
  );

  const columns: Array<Column<ActivityReport>> = [
  {
    key: 'report',
    header: 'Report',
    render: (report) =>
    <div className="min-w-0">
          <span className="font-mono text-[11.5px] text-fg-subtle">{report.reference}</span>
          <p className="mt-0.5 truncate text-[13.5px] font-medium text-fg">{report.title}</p>
          <p className="mt-0.5 truncate text-[12px] text-fg-subtle">{report.summary}</p>
        </div>

  },
  {
    key: 'mission',
    header: 'Mission',
    render: (report) =>
    <span className="font-mono text-[12px] text-fg">{report.missionReference}</span>

  },
  {
    key: 'author',
    header: 'Author',
    render: (report) =>
    <div>
          <p className="text-[13px] text-fg">{report.authorName}</p>
          <p className="text-[11.5px] text-fg-subtle">{formatDate(report.submittedAt)}</p>
        </div>

  },
  {
    key: 'period',
    header: 'Period',
    render: (report) =>
    <span className="text-[13px] text-fg">
          {formatDateRange(report.periodStart, report.periodEnd)}
        </span>

  },
  {
    key: 'objectives',
    header: 'Objectives',
    render: (report) => {
      const pct = Math.round(report.objectivesMet / report.objectivesTotal * 100);
      return (
        <div className="w-28">
            <p className="text-[12.5px] font-medium tabular-nums text-fg">
              {report.objectivesMet}/{report.objectivesTotal}
            </p>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <span
              className={pct === 100 ? 'block h-full bg-success' : 'block h-full bg-brand'}
              style={{ width: `${pct}%` }} />
            
            </div>
          </div>);

    }
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
    render: (report) =>
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
      }]
      }
      trigger={({ toggle }) =>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Actions for ${report.reference}`}
        className="rounded-lg p-1.5 text-fg-subtle transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg">
        
              <MoreHorizontalIcon size={16} />
            </button>
      } />


  }];


  return (
    <PageTransition>
      <PageHeader
        title="Activity Reports"
        description="Annex B narrative reports submitted at the close of each mission." />
      

      <div className="mb-4 overflow-x-auto pb-1">
        <FilterTabs
          ariaLabel="Filter activity reports"
          layoutId="reports-filter"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((value) => ({
            value,
            label: value === 'ALL' ? 'All' : value === 'UNDER_REVIEW' ? 'Under review' : value.charAt(0) + value.slice(1).toLowerCase(),
            count: value === 'ALL' ? reports.length : reports.filter((r) => r.status === value).length
          }))} />
        
      </div>

      <DataTable
        caption="Activity reports"
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(report) => report.id}
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
              placeholder="Filter by title, author or mission"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9" />
            
            </div>
          </>
        }
        empty={
        <EmptyState
          icon={ClipboardListIcon}
          title="No activity reports here"
          description="Reports appear once staff submit their Annex B narrative at the end of a mission." />

        } />
      
    </PageTransition>);

}