import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-fg-muted ring-line',
  brand: 'bg-brand-soft text-brand-text ring-brand/20',
  success: 'bg-success-soft text-success-text ring-success/20',
  warning: 'bg-warning-soft text-warning-text ring-warning/25',
  danger: 'bg-danger-soft text-danger-text ring-danger/20'
};

export interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ tone = 'neutral', dot = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        TONES[tone],
        className
      )}>
      
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />}
      {children}
    </span>);

}