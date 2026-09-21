import React, { forwardRef, useId } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
{ label, error, options, className, id, ...props },
ref)
{
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="w-full">
      {label &&
      <label htmlFor={selectId} className="mb-1.5 block text-[13px] font-medium text-fg">
          {label}
        </label>
      }
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-10 w-full appearance-none rounded-xl border bg-surface px-3 pr-9 text-sm text-fg',
            'transition-[border-color,box-shadow] duration-150 ease-out',
            'hover:border-line-strong focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/12',
            error ? 'border-danger' : 'border-line',
            className
          )}
          {...props}>
          
          {options.map((option) =>
          <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )}
        </select>
        <ChevronDownIcon
          size={16}
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
        
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-danger-text">{error}</p>}
    </div>);

});