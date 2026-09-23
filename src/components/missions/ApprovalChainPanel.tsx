import React from 'react';
import { CheckIcon, ClockIcon } from 'lucide-react';
import { cn, formatDate, titleCase } from '../../lib/utils';
import type { ApprovalStage } from '../../types/mission';
import type { ApprovalHistoryEntry } from '../../types/approval';

const CHAIN: ApprovalStage[] = ['FUNCTION_MANAGER', 'HRBP', 'FINANCE', 'BIZOPS', 'EXECUTIVE'];

export interface ApprovalChainPanelProps {
  history: ApprovalHistoryEntry[];
  currentStep: ApprovalStage | null;
}

export function ApprovalChainPanel({ history, currentStep }: ApprovalChainPanelProps) {
  const byStage = new Map(history.map((entry) => [entry.step, entry]));
  const clearedCount = history.filter((entry) => entry.decision === 'APPROVED').length;

  return (
    <div>
      <p className="mb-4 text-[13px] text-fg-muted">
        {clearedCount} of {CHAIN.length} stages cleared.
      </p>
      <ol className="relative">
        {CHAIN.map((stage, index) => {
          const entry = byStage.get(stage);
          const isCurrent = stage === currentStep;
          const isLast = index === CHAIN.length - 1;

          const state: 'approved' | 'rejected' | 'pending' = entry
            ? entry.decision === 'APPROVED' ? 'approved' : 'rejected'
            : 'pending';

          const ring =
            state === 'approved' ? 'bg-success text-white' :
            state === 'rejected' ? 'bg-danger text-white' :
            'bg-surface text-fg-subtle border border-line';

          const line = state === 'approved' ? 'bg-success/40' : 'bg-line';

          return (
            <li key={stage} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className={cn('absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px', line)}
                />
              )}
              <span className={cn('relative z-10 mt-0.5 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full', ring)}>
                {state === 'pending' ? <ClockIcon size={14} aria-hidden /> : <CheckIcon size={14} aria-hidden />}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-sm font-medium text-fg">{titleCase(stage)}</p>
                  <span className="text-xs text-fg-subtle">
                    {entry ? formatDate(entry.decidedAt, "MMM d, yyyy 'at' HH:mm") : isCurrent ? 'Awaiting decision' : ''}
                  </span>
                </div>
                {entry?.comment && (
                  <p className="mt-2 rounded-xl border border-line bg-surface-muted px-3 py-2 text-[13px] leading-relaxed text-fg-muted">
                    "{entry.comment}"
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
