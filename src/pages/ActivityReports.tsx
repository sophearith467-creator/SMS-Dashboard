import { useMemo, useState } from 'react';
import {
  ChevronDownIcon,
  ClipboardListIcon,
  EyeIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { ReportFormModal } from '../components/missions/ReportFormModal';
import { ReportReviewDialog, nextReviewStep } from '../components/missions/ReportReviewDialog';
import { fetchMissionsLite } from '../api/reportsAdmin';
import {
  useActivityReports,
  useAnnexStatusUpdate,
  useDeleteActivityReport,
} from '../hooks/useAnnexes';
import { cn, formatDateRange, titleCase } from '../lib/utils';
import type { ActivityReport, ActivityReportStatus } from '../types/annex';

type Filter = 'ALL' | ActivityReportStatus;

const FILTERS: Filter[] = ['ALL', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

const ROW_ACCENT: Record<string, string> = {
  DRAFT: 'border-l-2 last:border-l-2 border-l-transparent',
  SUBMITTED: 'border-l-2 last:border-l-2 border-l-brand',
  UNDER_REVIEW: 'border-l-2 last:border-l-2 border-l-warning',
  APPROVED: 'border-l-2 last:border-l-2 border-l-success',
  REJECTED: 'border-l-2 last:border-l-2 border-l-danger',
};

export function ActivityReports() {
  const { data, isLoading } = useActivityReports();
  const updateStatus = useAnnexStatusUpdate('activity-reports');
  const deleteReport = useDeleteActivityReport();
  const { can } = useAuth();

  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [reviewing, setReviewing] = useState<ActivityReport | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ActivityReport | null>(null);
  const [writeOpen, setWriteOpen] = useState(false);

  const isAdmin = can(['ROLE_ADMIN']);
  const isReviewer = can(['ROLE_FUNCTION_MANAGER']) || can(['ROLE_BIZOPS']);

  const missionsQuery = useQuery({
    queryKey: ['missions-lite'],
    queryFn: fetchMissionsLite,
    enabled: isAdmin,
  });

  // Can this user mark the report "under review"?
  // Admin: any report that isn't already under review.
  // FM / BizOps: only reports that were submitted and not yet picked up.
  const canMarkUnderReview = (r: ActivityReport) => {
    const status = r.status ?? 'DRAFT';
    if (status === 'UNDER_REVIEW') return false;
    if (isAdmin) return true;
    return isReviewer && status === 'SUBMITTED';
  };

  // Can this user comment? Admin: always (when a step is open).
  // FM / BizOps: only after the report has been marked under review.
  const canComment = (r: ActivityReport) => {
    const step = nextReviewStep(r);
    if (!step) return false;
    if (isAdmin) return true;
    const status = r.status ?? 'DRAFT';
    if (status !== 'UNDER_REVIEW') return false;
    return can([step === 'FM' ? 'ROLE_FUNCTION_MANAGER' : 'ROLE_BIZOPS']);
  };

  const reports = data ?? [];

  // Missions that already have a report are hidden from the "Write report" picker
    const availableMissions = useMemo(() => {
    const reportedMissionIds = new Set(
      (data ?? []).map((report) => String(report.missionId))
    );
    return (missionsQuery.data ?? []).filter(
      (mission) => !reportedMissionIds.has(String(mission.id))
    );
  }, [data, missionsQuery.data]);

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
            report.destinationLocation ?? '',
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
      ),
    },
    {
      key: 'requester',
      header: 'Requester',
      render: (report) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-fg">{report.requesterName}</p>
          <p className="mt-0.5 text-[12px] text-fg-subtle">{report.destinationLocation ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'mission',
      header: 'Mission',
      render: (report) => (
        <span className="font-mono text-[12px] text-fg-muted">MSN-{report.missionId}</span>
      ),
    },
    {
      key: 'period',
      header: 'Travel period',
      render: (report) => (
        <span className="text-[13px] tabular-nums text-fg">
          {formatDateRange(report.travelStartDate, report.travelEndDate)}
        </span>
      ),
    },
    {
      key: 'review',
      header: 'Review',
      render: (report) => {
        const fm = Boolean(report.functionManagerComment);
        const biz = Boolean(report.bizOpsComment);
        const done =
          'inline-flex h-6 items-center rounded-md bg-success-soft px-1.5 text-[11px] font-semibold text-success-text';
        const todo =
          'inline-flex h-6 items-center rounded-md bg-surface-muted px-1.5 text-[11px] font-medium text-fg-subtle';
        return (
          <div className="flex items-center gap-1.5">
            <span className={fm ? done : todo}>FM</span>
            <span className={biz ? done : todo}>BizOps</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (report) => <StatusBadge status={report.status ?? 'DRAFT'} />,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (report) => {
        const items = [
          ...(canMarkUnderReview(report)
            ? [
                {
                  label: 'Mark under review',
                  icon: EyeIcon,
                  onSelect: () =>
                    updateStatus.mutate({ id: report.id, status: 'UNDER_REVIEW' }),
                },
              ]
            : []),
          ...(canComment(report)
            ? [
                {
                  label: 'Review & comment',
                  icon: MessageSquareIcon,
                  onSelect: () => setReviewing(report),
                },
              ]
            : []),
          ...(isAdmin
            ? [
                {
                  label: 'Delete report',
                  icon: Trash2Icon,
                  tone: 'danger' as const,
                  onSelect: () => setPendingDelete(report),
                },
              ]
            : []),
        ];

        // Nothing available for this user on this report
        if (items.length === 0) return null;

        return (
          <DropdownMenu
            width="w-48"
            placement="top"
            items={items}
            trigger={({ open, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                aria-label={`Actions for report ${report.id}`}
                aria-expanded={open}
                data-open={open}
                className="rounded-lg p-1.5 text-fg-subtle transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg data-[open=true]:bg-surface-muted data-[open=true]:text-fg"
              >
                <MoreHorizontalIcon size={16} />
              </button>
            )}
          />
        );
      },
    },
  ];

  return (
    <PageTransition>
      <PageHeader
        title="Activity Reports"
        description="Annex B narrative reports submitted at the close of each mission."
      />

      {isAdmin && (
        <div className="mb-3 flex justify-end">
          <Button icon={PlusIcon} onClick={() => setWriteOpen(true)}>
            Write report
          </Button>
        </div>
      )}

      <ReportReviewDialog report={reviewing} onClose={() => setReviewing(null)} />
      <ReportFormModal
        open={writeOpen}
        onClose={() => setWriteOpen(false)}
        missions={availableMissions}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DropdownMenu
          align="left"
          width="w-64"
          maxHeight="max-h-80"
          items={FILTERS.map((value) => ({
            label: value === 'ALL' ? 'All statuses' : titleCase(value),
            selected: value === filter,
            count:
              value === 'ALL'
                ? reports.length
                : reports.filter((r) => (r.status ?? 'DRAFT') === value).length,
            onSelect: () => setFilter(value),
          }))}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-[13px] font-medium text-fg shadow-soft transition-colors duration-150 ease-out hover:border-line-strong"
            >
              <span className="text-fg-subtle">Status:</span>
              {filter === 'ALL' ? 'All statuses' : titleCase(filter)}
              <ChevronDownIcon
                size={15}
                className={cn('text-fg-subtle transition-transform duration-150', open && 'rotate-180')}
                aria-hidden
              />
            </button>
          )}
        />
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
        rowClassName={(report) =>
          cn(
            ROW_ACCENT[
              String(report.status ?? 'DRAFT')
                .trim()
                .toUpperCase()
                .replace(/[\s-]+/g, '_')
            ]
          )
        }
        empty={
          <EmptyState
            icon={ClipboardListIcon}
            title="No activity reports"
            description="Reports appear once staff submit their Annex B narrative at the end of a mission."
          />
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        tone="danger"
        title="Delete this report?"
        message={
          pendingDelete
            ? `RPT-${pendingDelete.id} will be permanently removed. This can't be undone.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleteReport.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteReport.mutate({ missionId: pendingDelete.missionId, id: pendingDelete.id }, {
              onSuccess: () => setPendingDelete(null),
            });
          }
        }}
      />
    </PageTransition>
  );
}