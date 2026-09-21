import React from 'react';
import { formatCurrency } from '../../lib/utils';
import type { AllowanceSpend } from '../../types/analytics';

export function SpendBreakdown({ spend }: {spend: AllowanceSpend;}) {
  const usedPct = Math.min(100, Math.round(spend.totalSpend / spend.budget * 100));
  const committedPct = Math.min(
    100 - usedPct,
    Math.round(spend.pendingSettlement / spend.budget * 100)
  );

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-[26px] font-semibold leading-none tracking-[-0.03em] text-fg tabular-nums">
          {formatCurrency(spend.totalSpend, spend.currency, true)}
        </p>
        <p className="text-[13px] text-fg-muted">
          of {formatCurrency(spend.budget, spend.currency, true)}
        </p>
      </div>

      <div
        className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-surface-muted"
        role="img"
        aria-label={`${usedPct}% of the travel budget used`}>
        
        <span className="h-full bg-brand" style={{ width: `${usedPct}%` }} />
        <span className="h-full bg-brand/35" style={{ width: `${committedPct}%` }} />
      </div>

      <dl className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-[13px]">
          <dt className="flex items-center gap-2 text-fg-muted">
            <span className="h-2 w-2 rounded-full bg-brand" aria-hidden />
            Settled spend
          </dt>
          <dd className="font-medium text-fg tabular-nums">
            {formatCurrency(spend.totalSpend, spend.currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <dt className="flex items-center gap-2 text-fg-muted">
            <span className="h-2 w-2 rounded-full bg-brand/35" aria-hidden />
            Pending settlement
          </dt>
          <dd className="font-medium text-fg tabular-nums">
            {formatCurrency(spend.pendingSettlement, spend.currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-line pt-3 text-[13px]">
          <dt className="text-fg-muted">Remaining</dt>
          <dd className="font-semibold text-success-text tabular-nums">
            {formatCurrency(spend.budget - spend.totalSpend - spend.pendingSettlement, spend.currency)}
          </dd>
        </div>
      </dl>
    </div>);

}