import React from 'react';
import { formatNumber } from '../../lib/utils';
import type { ApprovalTurnaround } from '../../types/analytics';

export function TurnaroundPanel({ data }: {data: ApprovalTurnaround;}) {
  const max = Math.max(...data.byStage.map((stage) => stage.hours));

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[26px] font-semibold leading-none tracking-[-0.03em] text-fg tabular-nums">
            {data.averageHours}h
          </p>
          <p className="mt-1.5 text-[13px] text-fg-muted">
            Median {data.medianHours}h · {data.withinSlaPct}% within SLA
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-3.5">
        {data.byStage.map((stage) =>
        <li key={stage.stage}>
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="text-fg-muted">{stage.stage}</span>
              <span className="font-medium text-fg tabular-nums">{formatNumber(stage.hours)}h</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <span
              className="block h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
              style={{ width: `${Math.round(stage.hours / max * 100)}%` }} />
            
            </div>
          </li>
        )}
      </ul>
    </div>);

}