import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, TargetIcon } from 'lucide-react';
import type { ApprovalTurnaround } from '../../types/analytics';

function formatHours(hours: number): string {
  if (!Number.isFinite(hours)) return '—';
  if (hours < 1) {
    const minutes = Math.max(1, Math.round(hours * 60));
    return `${minutes}m`;
  }
  if (hours < 10) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours)}h`;
}

export function TurnaroundPanel({ data }: { data: ApprovalTurnaround }) {
  if (!data) return null;
  const max = Math.max(...data.byStage.map((stage) => stage.hours), 0.01);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[26px] font-semibold leading-none tracking-[-0.03em] text-fg tabular-nums">
            {formatHours(data.averageHours)}
          </p>
          <p className="mt-1.5 text-[12px] text-fg-subtle">Average turnaround</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-[12px] font-medium text-fg-muted">
            <ClockIcon size={12} aria-hidden />
            Median {formatHours(data.medianHours)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[12px] font-medium text-success-text">
            <TargetIcon size={12} aria-hidden />
            {data.withinSlaPct}% within SLA
          </span>
        </div>
      </div>

      <ul className="mt-5 space-y-3.5">
        {data.byStage.map((stage, index) => (
          <li key={stage.stage}>
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="text-fg-muted">{stage.stage}</span>
              <span className="font-medium text-fg tabular-nums">{formatHours(stage.hours)}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <motion.span
                className="block h-full rounded-full bg-gradient-brand"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.round((stage.hours / max) * 100))}%` }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: index * 0.08 }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
