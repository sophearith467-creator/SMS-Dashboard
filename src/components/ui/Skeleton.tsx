import React from 'react';
import { cn } from '../../lib/utils';

export function Skeleton({ className }: {className?: string;}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-surface-muted',
        "after:absolute after:inset-0 after:content-[''] after:-translate-x-full after:animate-shimmer",
        'after:bg-gradient-to-r after:from-transparent after:via-white/45 after:to-transparent dark:after:via-white/5',
        className
      )}
      aria-hidden />);


}

export function SkeletonText({ lines = 3, className }: {lines?: number;className?: string;}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) =>
      <Skeleton
        key={index}
        className={cn('h-3.5', index === lines - 1 ? 'w-2/3' : 'w-full')} />

      )}
    </div>);

}