import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface FilterTabOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export interface FilterTabsProps<T extends string> {
  options: Array<FilterTabOption<T>>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  layoutId?: string;
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  layoutId = 'filter-tab'
}: FilterTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface-muted p-1">
      
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ease-out',
              active ? 'text-fg' : 'text-fg-muted hover:text-fg'
            )}>
            
            {active &&
            <motion.span
              layoutId={layoutId}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 rounded-lg bg-surface shadow-soft" />

            }
            <span className="relative flex items-center gap-1.5">
              {option.label}
              {typeof option.count === 'number' &&
              <span
                className={cn(
                  'rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                  active ? 'bg-brand-soft text-brand-text' : 'bg-surface text-fg-subtle'
                )}>
                
                  {option.count}
                </span>
              }
            </span>
          </button>);

      })}
    </div>);

}