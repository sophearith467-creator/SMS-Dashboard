import React from "react";
import { ArrowDownRightIcon, ArrowUpRightIcon, BoxIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Skeleton } from "../ui/Skeleton";
type Accent = 'brand' | 'success' | 'warning' | 'danger';
const ACCENTS: Record<Accent, string> = {
  brand: 'bg-gradient-brand text-white shadow-brand',
  success: 'bg-success-soft text-success-text',
  warning: 'bg-warning-soft text-warning-text',
  danger: 'bg-danger-soft text-danger-text'
};
export interface StatCardProps {
  label: string;
  value: string;
  caption: string;
  icon: BoxIcon;
  accent?: Accent;
  changePct?: number;
  positiveIsGood?: boolean;
  loading?: boolean;
  index?: number;
}
export function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  accent = 'brand',
  changePct,
  positiveIsGood = true,
  loading = false,
  index = 0
}: StatCardProps) {
  if (loading) {
    return <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <Skeleton className="mt-5 h-8 w-28" />
        <Skeleton className="mt-3 h-3 w-36" />
      </div>;
  }
  const rising = (changePct ?? 0) >= 0;
  const good = rising === positiveIsGood;
  const TrendIcon = rising ? ArrowUpRightIcon : ArrowDownRightIcon;
  return <div
      className="group animate-fade-in-up rounded-2xl border border-line bg-surface p-5 shadow-soft transition-[box-shadow,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-fg-muted">{label}</p>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3', ACCENTS[accent])}>
          <Icon size={17} aria-hidden />
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-2.5">
        <span className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-fg tabular-nums">
          {value}
        </span>
        {typeof changePct === 'number' && <span className={cn('inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums', good ? 'bg-success-soft text-success-text' : 'bg-danger-soft text-danger-text')}>
            <TrendIcon size={12} aria-hidden />
            {Math.abs(changePct).toFixed(1)}%
          </span>}
      </div>

      <p className="mt-2.5 text-[13px] text-fg-subtle">{caption}</p>
    </div>;
}
