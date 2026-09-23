import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);
    el.addEventListener('scroll', updateScrollState, { passive: true });

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('scroll', updateScrollState);
    };
  }, [options.length]);

  function scrollBy(direction: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -160 : 160, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute left-9 top-0 z-10 h-full w-10 bg-gradient-to-r from-canvas to-transparent"
          />
          <button
            type="button"
            onClick={() => scrollBy('left')}
            aria-label="Scroll filters left"
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-fg-muted shadow-soft transition-colors duration-150 ease-out hover:text-fg"
          >
            <ChevronLeftIcon size={14} aria-hidden />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        role="tablist"
        aria-label={ariaLabel}
        className="scrollbar-none flex items-center gap-1 overflow-x-auto scroll-smooth rounded-xl border border-line bg-surface-muted p-1"
      >
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
                'relative shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ease-out',
                active ? 'text-fg' : 'text-fg-muted hover:text-fg'
              )}>
              
              {active &&
              <motion.span
                layoutId={layoutId}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0 rounded-lg bg-surface shadow-soft" />

              }
              <span className="relative flex items-center gap-1.5 whitespace-nowrap">
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
      </div>

      {canScrollRight && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute right-9 top-0 z-10 h-full w-10 bg-gradient-to-l from-canvas to-transparent"
          />
          <button
            type="button"
            onClick={() => scrollBy('right')}
            aria-label="Scroll filters right"
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-fg-muted shadow-soft transition-colors duration-150 ease-out hover:text-fg"
          >
            <ChevronRightIcon size={14} aria-hidden />
          </button>
        </>
      )}
    </div>);

}
