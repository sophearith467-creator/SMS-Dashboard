import React from 'react';
import { CheckIcon, ClockIcon, MinusIcon, XIcon } from 'lucide-react';
import { cn, formatDate, titleCase } from '../../lib/utils';
import { roleLabel } from '../../lib/roles';
import type { ApprovalStep } from '../../types/mission';

const DECISION_STYLES = {
  APPROVED: { icon: CheckIcon, ring: 'bg-success text-white', line: 'bg-success/40' },
  REJECTED: { icon: XIcon, ring: 'bg-danger text-white', line: 'bg-line' },
  PENDING: { icon: ClockIcon, ring: 'bg-surface text-fg-subtle border border-line', line: 'bg-line' },
  SKIPPED: { icon: MinusIcon, ring: 'bg-surface-muted text-fg-subtle', line: 'bg-line' }
} as const;

export function ApprovalTimeline({ steps }: {steps: ApprovalStep[];}) {
  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const style = DECISION_STYLES[step.decision];
        const Icon = style.icon;
        const isLast = index === steps.length - 1;

        return (
          <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast &&
            <span
              aria-hidden
              className={cn('absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px', style.line)} />

            }
            <span
              className={cn(
                'relative z-10 mt-0.5 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full',
                style.ring
              )}>
              
              <Icon size={14} aria-hidden />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-sm font-medium text-fg">{titleCase(step.stage)}</p>
                <span className="text-xs text-fg-subtle">
                  {step.decidedAt ? formatDate(step.decidedAt, "MMM d, yyyy 'at' HH:mm") : 'Awaiting decision'}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] text-fg-muted">
                {step.approverName} · {roleLabel(step.approverRole)}
              </p>
              {step.comment &&
              <p className="mt-2 rounded-xl border border-line bg-surface-muted px-3 py-2 text-[13px] leading-relaxed text-fg-muted">
                  “{step.comment}”
                </p>
              }
            </div>
          </li>);

      })}
    </ol>);

}