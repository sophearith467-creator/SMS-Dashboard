import React from 'react';
import { CalculatorIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonText } from '../ui/Skeleton';
import type { Mission } from '../../types/mission';

export interface AllowancePanelProps {
  data?: Mission;
  loading: boolean;
  onCalculate: () => void;
}

export function AllowancePanel({ data, loading, onCalculate }: AllowancePanelProps) {
  if (loading) return <SkeletonText lines={6} />;

  if (!data || data.totalExpense == null) {
    return (
      <EmptyState
        icon={CalculatorIcon}
        title="Allowance not calculated yet"
        description="Run the policy engine to break the entitlement down by meals and accommodation."
        action={
          <Button icon={CalculatorIcon} onClick={onCalculate}>
            Calculate allowance
          </Button>
        }
      />
    );
  }

  const lines = [
    { label: 'Breakfast', qty: data.breakfastQuantity, rate: data.breakfastAmount, total: data.breakfastTotal },
    { label: 'Lunch', qty: data.lunchQuantity, rate: data.lunchAmount, total: data.lunchTotal },
    { label: 'Dinner', qty: data.dinnerQuantity, rate: data.dinnerAmount, total: data.dinnerTotal },
    { label: 'Accommodation', qty: data.numberOfNightStay, rate: data.accommodationAmountPerNight, total: data.accommodationTotal },
  ].filter((line) => line.total != null);

  return (
    <div>
      <ul className="divide-y divide-line">
        {lines.map((line) => (
          <li key={line.label} className="flex items-start justify-between gap-6 py-3 first:pt-0">
            <div className="min-w-0">
              <p className="text-[13.5px] font-medium text-fg">{line.label}</p>
              <p className="mt-0.5 text-[12.5px] text-fg-subtle">
                {line.qty} x ${line.rate?.toFixed(2)}
              </p>
            </div>
            <span className="shrink-0 text-[13.5px] font-medium tabular-nums text-fg">
              ${line.total?.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-soft px-4 py-3.5">
        <div>
          <p className="text-[13px] font-medium text-brand-text">Total entitlement</p>
          <p className="text-[11.5px] text-brand-text/80">{data.numberOfTravelDays} days</p>
        </div>
        <span className="text-xl font-semibold tabular-nums tracking-[-0.02em] text-brand-text">
          ${data.totalExpense.toFixed(2)}
        </span>
      </div>

      <div className="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" icon={CalculatorIcon} onClick={onCalculate}>
          Recalculate
        </Button>
      </div>
    </div>
  );
}
