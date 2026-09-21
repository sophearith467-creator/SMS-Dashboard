import React from 'react';
import { CalculatorIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonText } from '../ui/Skeleton';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { AllowanceBreakdown } from '../../types/mission';

export interface AllowancePanelProps {
  data?: AllowanceBreakdown;
  loading: boolean;
  onCalculate: () => void;
}

export function AllowancePanel({ data, loading, onCalculate }: AllowancePanelProps) {
  if (loading) return <SkeletonText lines={6} />;

  if (!data) {
    return (
      <EmptyState
        icon={CalculatorIcon}
        title="Allowance not calculated yet"
        description="Run the policy engine to break the entitlement down by per diem, accommodation, transport and incidentals."
        action={
        <Button icon={CalculatorIcon} onClick={onCalculate}>
            Calculate allowance
          </Button>
        } />);


  }

  return (
    <div>
      <ul className="divide-y divide-line">
        {data.lines.map((line) =>
        <li key={line.label} className="flex items-start justify-between gap-6 py-3 first:pt-0">
            <div className="min-w-0">
              <p className="text-[13.5px] font-medium text-fg">{line.label}</p>
              <p className="mt-0.5 text-[12.5px] text-fg-subtle">{line.description}</p>
            </div>
            <span className="shrink-0 text-[13.5px] font-medium tabular-nums text-fg">
              {formatCurrency(line.amount, data.currency)}
            </span>
          </li>
        )}
      </ul>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-soft px-4 py-3.5">
        <div>
          <p className="text-[13px] font-medium text-brand-text">Total entitlement</p>
          <p className="text-[11.5px] text-brand-text/80">
            {data.days} days · calculated {formatDate(data.calculatedAt, "MMM d 'at' HH:mm")}
          </p>
        </div>
        <span className="text-xl font-semibold tabular-nums tracking-[-0.02em] text-brand-text">
          {formatCurrency(data.total, data.currency)}
        </span>
      </div>

      <div className="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" icon={CalculatorIcon} onClick={onCalculate}>
          Recalculate
        </Button>
      </div>
    </div>);

}