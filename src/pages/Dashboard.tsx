import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  TriangleAlertIcon,
  WalletIcon,
  MapIcon,
  UsersIcon
} from 'lucide-react';
import { PageTransition } from '../components/shared/PageTransition';
import { StatCard } from '../components/shared/StatCard';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton, SkeletonText } from '../components/ui/Skeleton';
import {
  MissionTrendChart,
  type TrendPeriod
} from '../components/dashboard/MissionTrendChart';
import { SpendBreakdown } from '../components/dashboard/SpendBreakdown';
import { ExceptionsList } from '../components/dashboard/ExceptionsList';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { MyReportsCard } from '../components/dashboard/MyReportsCard';
import { MissionFormModal } from '../components/missions/MissionFormModal';
import {
  useAllowanceSpend,
  useExceptions,
  useMissionSummary
} from '../hooks/useAnalytics';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../context/AuthContext';
import { APPROVER_ROLES } from '../lib/roles';
import { formatCurrency, formatNumber } from '../lib/utils';

function budgetCaption(totalSpend: number, budget: number): string {
  if (!Number.isFinite(budget) || budget <= 0) {
    return totalSpend > 0 ? 'No annual envelope set' : 'No spend yet';
  }
  const pct = Math.round((totalSpend / budget) * 100);
  return `${pct}% of the annual envelope`;
}

const PERIODS: { value: TrendPeriod; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
];

const PERIOD_DESCRIPTION: Record<TrendPeriod, string> = {
  day: 'Submitted versus completed missions by day.',
  week: 'Submitted versus completed missions by week.',
  month: 'Submitted versus completed missions over the last six months.',
  year: 'Submitted versus completed missions by year.'
};

export function Dashboard() {
  const { user, can } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('month');
  const summary = useMissionSummary();
  const spend = useAllowanceSpend();
  const exceptions = useExceptions();
  const users = useUsers({ page: 1, pageSize: 1 });
  const firstName = user?.fullName.split(' ')[0] ?? 'there';

  return (
    <PageTransition>
      <DashboardHero
        firstName={firstName}
        description="Here is how missions, allowances and approvals are tracking across the organisation this quarter."
        showApprovalsLink={can(APPROVER_ROLES)}
        onCreateMission={() => setCreateOpen(true)}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Total missions"
          value={summary.data ? formatNumber(summary.data.total) : '—'}
          caption={summary.data ? `${summary.data.inProgress} currently in the field` : ''}
          icon={MapIcon}
          accent="brand"
          changePct={summary.data?.changeVsLastMonthPct}
          loading={summary.isLoading}
        />

        <StatCard
          index={1}
          label="Allowance spend"
          value={spend.data ? formatCurrency(spend.data.totalSpend, spend.data.currency, true) : '—'}
          caption={spend.data ? budgetCaption(spend.data.totalSpend, spend.data.budget) : ''}
          icon={WalletIcon}
          accent="success"
          changePct={spend.data?.changeVsLastMonthPct}
          positiveIsGood={false}
          loading={spend.isLoading}
        />

        <StatCard
          index={2}
          label="Total users"
          value={users.data ? formatNumber(users.data.total) : '—'}
          caption="Across all roles and departments"
          icon={UsersIcon}
          accent="brand"
          loading={users.isLoading}
        />

        <StatCard
          index={3}
          label="Open exceptions"
          value={exceptions.data ? formatNumber(exceptions.data.open) : '—'}
          caption={exceptions.data ? `${exceptions.data.items.length} need a decision this week` : ''}
          icon={TriangleAlertIcon}
          accent="danger"
          changePct={exceptions.data?.changeVsLastMonthPct}
          positiveIsGood={false}
          loading={exceptions.isLoading}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <Card interactive className="xl:col-span-12">
          <CardHeader
            title="Mission throughput"
            description={PERIOD_DESCRIPTION[trendPeriod]}
            action={
              <div className="flex flex-wrap items-center gap-3">
                <div
                  role="tablist"
                  aria-label="Throughput period"
                  className="inline-flex rounded-xl border border-line bg-surface-muted p-0.5"
                >
                  {PERIODS.map(({ value, label }) => {
                    const active = trendPeriod === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setTrendPeriod(value)}
                        className={
                          active
                            ? 'rounded-[10px] bg-surface px-2.5 py-1 text-[12px] font-semibold text-fg shadow-soft'
                            : 'rounded-[10px] px-2.5 py-1 text-[12px] font-medium text-fg-muted transition-colors hover:text-fg'
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="hidden items-center gap-4 sm:flex">
                  <span className="flex items-center gap-1.5 text-[12px] text-fg-muted">
                    <span className="h-2 w-2 rounded-full bg-brand" aria-hidden />
                    Submitted
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] text-fg-muted">
                    <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
                    Completed
                  </span>
                </div>
              </div>
            }
          />

          <div className="mt-5">
            {summary.isLoading || !summary.data ? (
              <Skeleton className="h-[268px] w-full rounded-xl" />
            ) : (
              <MissionTrendChart data={summary.data.trend} period={trendPeriod} />
            )}
          </div>

          {summary.data && (
            <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-5">
              {[
                { label: 'Pending', value: summary.data.pending },
                { label: 'Approved', value: summary.data.approved },
                { label: 'Report submitted', value: summary.data.reportSubmitted ?? 0 },
                { label: 'Completed', value: summary.data.completed },
                { label: 'Rejected', value: summary.data.rejected }
              ].map((stat) => (
                <div key={stat.label} className="bg-surface px-4 py-3">
                  <dt className="text-[12px] text-fg-muted">{stat.label}</dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums text-fg">{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <Card interactive padded={false} className="xl:col-span-7">
          <CardHeader
            className="px-5 pb-4 pt-5"
            title="Exceptions needing attention"
            description="Policy breaches and SLA risks raised by the compliance engine."
          />
          {exceptions.isLoading || !exceptions.data ? (
            <div className="space-y-4 px-5 pb-5">
              <SkeletonText lines={2} />
              <SkeletonText lines={2} />
              <SkeletonText lines={2} />
            </div>
          ) : (
            <ExceptionsList items={exceptions.data.items} />
          )}
          <div className="border-t border-line px-5 py-3">
            <Link
              to="/missions"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-text transition-colors duration-150 ease-out hover:text-brand"
            >
              View all missions
              <ArrowRightIcon size={14} aria-hidden />
            </Link>
          </div>
        </Card>

        <Card interactive className="xl:col-span-5">
          <CardHeader
            title="Allowance budget"
            description="Settled and committed spend against the annual travel envelope."
          />
          <div className="mt-5">
            {spend.isLoading || !spend.data ? (
              <SkeletonText lines={5} />
            ) : (
              <SpendBreakdown spend={spend.data} />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <MyReportsCard />
      </div>

      <MissionFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </PageTransition>
  );
}


