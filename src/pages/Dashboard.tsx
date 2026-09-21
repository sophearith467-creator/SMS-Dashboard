import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  ClockIcon,
  PlusIcon,
  TriangleAlertIcon,
  WalletIcon,
  MapIcon } from
'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { PageTransition } from '../components/shared/PageTransition';
import { StatCard } from '../components/shared/StatCard';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton, SkeletonText } from '../components/ui/Skeleton';
import { MissionTrendChart } from '../components/dashboard/MissionTrendChart';
import { SpendBreakdown } from '../components/dashboard/SpendBreakdown';
import { TurnaroundPanel } from '../components/dashboard/TurnaroundPanel';
import { ExceptionsList } from '../components/dashboard/ExceptionsList';
import { MissionFormModal } from '../components/missions/MissionFormModal';
import {
  useAllowanceSpend,
  useApprovalTurnaround,
  useExceptions,
  useMissionSummary } from
'../hooks/useAnalytics';
import { useAuth } from '../context/AuthContext';
import { APPROVER_ROLES } from '../lib/roles';
import { formatCurrency, formatNumber } from '../lib/utils';

export function Dashboard() {
  const { user, can } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  const summary = useMissionSummary();
  const spend = useAllowanceSpend();
  const turnaround = useApprovalTurnaround();
  const exceptions = useExceptions();

  const firstName = user?.fullName.split(' ')[0] ?? 'there';

  return (
    <PageTransition>
      <PageHeader
        title={`Good morning, ${firstName}`}
        description="Here is how missions, allowances and approvals are tracking across the organisation this quarter."
        actions={
        <>
            {can(APPROVER_ROLES) &&
          <Link
            to="/approvals"
            className="hidden h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium text-fg transition-[background-color,border-color] duration-150 ease-out hover:border-line-strong hover:bg-surface-muted sm:inline-flex">
            
                Review approvals
              </Link>
          }
            <Button icon={PlusIcon} onClick={() => setCreateOpen(true)}>
              New mission
            </Button>
          </>
        } />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total missions"
          value={summary.data ? formatNumber(summary.data.total) : '—'}
          caption={summary.data ? `${summary.data.inProgress} currently in the field` : ''}
          icon={MapIcon}
          accent="brand"
          changePct={summary.data?.changeVsLastMonthPct}
          loading={summary.isLoading} />
        
        <StatCard
          label="Allowance spend"
          value={spend.data ? formatCurrency(spend.data.totalSpend, spend.data.currency, true) : '—'}
          caption={
          spend.data ?
          `${Math.round(spend.data.totalSpend / spend.data.budget * 100)}% of the annual envelope` :
          ''
          }
          icon={WalletIcon}
          accent="success"
          changePct={spend.data?.changeVsLastMonthPct}
          positiveIsGood={false}
          loading={spend.isLoading} />
        
        <StatCard
          label="Approval turnaround"
          value={turnaround.data ? `${turnaround.data.averageHours}h` : '—'}
          caption={turnaround.data ? `${turnaround.data.withinSlaPct}% resolved within SLA` : ''}
          icon={ClockIcon}
          accent="warning"
          changePct={turnaround.data?.changeVsLastMonthPct}
          positiveIsGood={false}
          loading={turnaround.isLoading} />
        
        <StatCard
          label="Open exceptions"
          value={exceptions.data ? formatNumber(exceptions.data.open) : '—'}
          caption={exceptions.data ? `${exceptions.data.items.length} need a decision this week` : ''}
          icon={TriangleAlertIcon}
          accent="danger"
          changePct={exceptions.data?.changeVsLastMonthPct}
          positiveIsGood={false}
          loading={exceptions.isLoading} />
        
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader
            title="Mission throughput"
            description="Submitted versus completed missions over the last six months."
            action={
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[12px] text-fg-muted">
                  <span className="h-2 w-2 rounded-full bg-brand" aria-hidden />
                  Submitted
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-fg-muted">
                  <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
                  Completed
                </span>
              </div>
            } />
          
          <div className="mt-5">
            {summary.isLoading || !summary.data ?
            <Skeleton className="h-[268px] w-full rounded-xl" /> :

            <MissionTrendChart data={summary.data.trend} />
            }
          </div>

          {summary.data &&
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
              {[
            { label: 'Pending', value: summary.data.pending },
            { label: 'Approved', value: summary.data.approved },
            { label: 'Completed', value: summary.data.completed },
            { label: 'Rejected', value: summary.data.rejected }].
            map((stat) =>
            <div key={stat.label} className="bg-surface px-4 py-3">
                  <dt className="text-[12px] text-fg-muted">{stat.label}</dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums text-fg">{stat.value}</dd>
                </div>
            )}
            </dl>
          }
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader
            title="Approval turnaround"
            description="Average hours spent at each stage of the chain." />
          
          <div className="mt-5">
            {turnaround.isLoading || !turnaround.data ?
            <SkeletonText lines={6} /> :

            <TurnaroundPanel data={turnaround.data} />
            }
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <Card padded={false} className="xl:col-span-7">
          <CardHeader
            className="px-5 pb-4 pt-5"
            title="Exceptions needing attention"
            description="Policy breaches and SLA risks raised by the compliance engine." />
          
          {exceptions.isLoading || !exceptions.data ?
          <div className="space-y-4 px-5 pb-5">
              <SkeletonText lines={2} />
              <SkeletonText lines={2} />
              <SkeletonText lines={2} />
            </div> :

          <ExceptionsList items={exceptions.data.items} />
          }
          <div className="border-t border-line px-5 py-3">
            <Link
              to="/missions"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-text transition-colors duration-150 ease-out hover:text-brand">
              
              View all missions
              <ArrowRightIcon size={14} aria-hidden />
            </Link>
          </div>
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader
            title="Allowance budget"
            description="Settled and committed spend against the annual travel envelope." />
          
          <div className="mt-5">
            {spend.isLoading || !spend.data ? <SkeletonText lines={5} /> : <SpendBreakdown spend={spend.data} />}
          </div>
        </Card>
      </div>

      <MissionFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </PageTransition>);

}