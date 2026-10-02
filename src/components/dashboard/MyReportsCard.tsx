import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../ui/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { useActivityReports } from '../../hooks/useAnnexes';
import { useAuth } from '../../context/AuthContext';
import { formatDateRange } from '../../lib/utils';

export function MyReportsCard() {
  const { user, can } = useAuth();
  const { data } = useActivityReports();
  const all = data ?? [];
  const reports = (can(['ROLE_ADMIN']) ? all : all.filter((r) => r.requesterName === user?.fullName)).slice(0, 5);

  return (
    <Card>
      <CardHeader
        title="Activity reports"
        description="Latest reports written for missions."
        action={
          <Link to="/activity-reports" className="text-[13px] font-medium text-brand-text hover:text-brand">
            View all
          </Link>
        }
      />
      <ul className="mt-4 divide-y divide-line">
        {reports.map((r) => (
          <li key={r.id} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <Link to={`/missions/${r.missionId}`} className="min-w-0">
                <p className="truncate text-[13px] font-medium text-fg">{r.travelObjectives || `RPT-${r.id}`}</p>
                <p className="mt-0.5 text-[12px] text-fg-subtle">
                  {r.requesterName} - {formatDateRange(r.travelStartDate, r.travelEndDate)}
                </p>
              </Link>
              <StatusBadge status={r.status ?? 'DRAFT'} />
            </div>
            {(r.functionManagerComment || r.bizOpsComment) && (
              <p className="mt-1.5 text-[12px] text-fg-muted">{r.functionManagerComment ?? r.bizOpsComment}</p>
            )}
          </li>
        ))}
        {!reports.length && <li className="py-4 text-[13px] text-fg-muted">No reports yet.</li>}
      </ul>
    </Card>
  );
}
