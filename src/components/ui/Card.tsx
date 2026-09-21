import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'article';
  padded?: boolean;
  interactive?: boolean;
}

export function Card({
  as: Tag = 'div',
  padded = true,
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border border-line bg-surface shadow-soft',
        padded && 'p-5',
        interactive &&
        'transition-[box-shadow,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card',
        className
      )}
      {...props}>
      
      {children}
    </Tag>);

}

export function CardHeader({
  title,
  description,
  action,
  className





}: {title: React.ReactNode;description?: React.ReactNode;action?: React.ReactNode;className?: string;}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-fg">{title}</h2>
        {description && <p className="mt-1 text-[13px] text-fg-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>);

}