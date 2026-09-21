import React from "react";
import { cn } from "../../lib/utils";
import { BoxIcon } from "lucide-react";
export interface EmptyStateProps {
  icon: BoxIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-muted text-fg-subtle">
        <Icon size={20} aria-hidden />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold text-fg">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-fg-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>;
}