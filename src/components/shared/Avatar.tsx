import React from 'react';
import { cn, initials } from '../../lib/utils';

const SIZES = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm'
};

export function Avatar({
  name,
  size = 'md',
  className




}: {name: string;size?: keyof typeof SIZES;className?: string;}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold uppercase tracking-wide text-brand-text ring-1 ring-inset ring-brand/15',
        SIZES[size],
        className
      )}>
      
      {initials(name)}
    </span>);

}