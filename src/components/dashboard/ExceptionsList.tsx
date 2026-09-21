import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ShieldCheckIcon } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { fromNow } from '../../lib/utils';
import type { ExceptionItem, ExceptionSeverity } from '../../types/analytics';

const SEVERITY_TONE: Record<ExceptionSeverity, 'danger' | 'warning' | 'neutral'> = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'neutral'
};

export function ExceptionsList({ items }: {items: ExceptionItem[];}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheckIcon}
        title="No open exceptions"
        description="Every mission in flight is within policy. New breaches will appear here as they are raised." />);


  }

  return (
    <ul className="divide-y divide-line">
      {items.map((item) =>
      <li key={item.id}>
          <Link
          to="/missions"
          className="group flex items-start gap-3 px-5 py-3.5 transition-colors duration-150 ease-out hover:bg-surface-muted/70">
          
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={SEVERITY_TONE[item.severity]}>{item.type}</Badge>
                <span className="font-mono text-[11.5px] text-fg-subtle">{item.missionReference}</span>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{item.message}</p>
              <p className="mt-1 text-[11.5px] text-fg-subtle">{fromNow(item.raisedAt)}</p>
            </div>
            <ArrowRightIcon
            size={15}
            aria-hidden
            className="mt-1 shrink-0 text-fg-subtle opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100" />
          
          </Link>
        </li>
      )}
    </ul>);

}