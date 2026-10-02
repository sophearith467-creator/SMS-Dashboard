import React from 'react';
import { CalculatorIcon } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonText } from '../ui/Skeleton';
import type { Mission } from '../../types/mission';

export interface AllowancePanelProps {
  data?: Mission;
  loading: boolean;
  vehicleReimbursement?: number;
}

export function AllowancePanel({ data, loading, vehicleReimbursement = 0 }: AllowancePanelProps) {
  const vehicleReimbursementSummary = vehicleReimbursement > 0 && (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
      <div>
        <p className="text-[13.5px] font-medium text-fg">Personal car reimbursement</p>
        <p className="mt-0.5 text-[12.5px] text-fg-subtle">Round-trip distance at $0.20/km</p>
      </div>
      <span className="shrink-0 text-[13.5px] font-medium tabular-nums text-fg">
        ${vehicleReimbursement.toFixed(2)}
      </span>
    </div>
  );

  if (loading && (!data || data.totalExpense == null)) {
    return (
      <div className="space-y-4">
        {vehicleReimbursementSummary}
        <SkeletonText lines={4} />
      </div>
    );
  }

  if (!data || data.totalExpense == null) {
    return (
      <div className="space-y-4">
        {vehicleReimbursementSummary}
        <EmptyState
          icon={CalculatorIcon}
          title="Allowance not available yet"
          description="The allowance breakdown will appear automatically when the calculation is available."
        />
      </div>
    );
  }

  const lines = [
    { label: 'Breakfast', qty: data.breakfastQuantity, rate: data.breakfastAmount, total: data.breakfastTotal },
    { label: 'Lunch', qty: data.lunchQuantity, rate: data.lunchAmount, total: data.lunchTotal },
    { label: 'Dinner', qty: data.dinnerQuantity, rate: data.dinnerAmount, total: data.dinnerTotal },
    { label: 'Accommodation', qty: data.numberOfNightStay, rate: data.accommodationAmountPerNight, total: data.accommodationTotal },
  ].filter((line) => line.total != null);
  const totalEntitlement = data.totalExpense + vehicleReimbursement;

  return (
    <div>
      <ul className="divide-y divide-line">
        {lines.map((line) => (
          <li key={line.label} className="flex items-start justify-between gap-6 py-3 first:pt-0">
            <div className="min-w-0">
              <p className="text-[13.5px] font-medium text-fg">{line.label}</p>
              <p className="mt-0.5 text-[12.5px] text-fg-subtle">
                {line.rate != null ? `${line.qty} x $${line.rate.toFixed(2)}` : "Combined for all travelers"}
              </p>
            </div>
            <span className="shrink-0 text-[13.5px] font-medium tabular-nums text-fg">
              ${line.total?.toFixed(2)}
            </span>
          </li>
        ))}
        {vehicleReimbursement > 0 && (
          <li className="flex items-start justify-between gap-6 py-3">
            <div className="min-w-0">
              <p className="text-[13.5px] font-medium text-fg">Personal car reimbursement</p>
              <p className="mt-0.5 text-[12.5px] text-fg-subtle">Round-trip distance at $0.20/km</p>
            </div>
            <span className="shrink-0 text-[13.5px] font-medium tabular-nums text-fg">
              ${vehicleReimbursement.toFixed(2)}
            </span>
          </li>
        )}
      </ul>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-soft px-4 py-3.5">
        <div>
          <p className="text-[13px] font-medium text-brand-text">Total entitlement</p>
          <p className="text-[11.5px] text-brand-text/80">
            {vehicleReimbursement > 0
              ? `${data.numberOfTravelDays} days + personal car reimbursement`
              : `${data.numberOfTravelDays} days`}
          </p>
        </div>
        <span className="text-xl font-semibold tabular-nums tracking-[-0.02em] text-brand-text">
          ${totalEntitlement.toFixed(2)}
        </span>
      </div>

    </div>
  );
}
