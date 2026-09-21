import React, { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
{ label, hint, error, className, id, rows = 4, ...props },
ref)
{
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="w-full">
      {label &&
      <label htmlFor={textareaId} className="mb-1.5 block text-[13px] font-medium text-fg">
          {label}
        </label>
      }
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(
          'w-full resize-y rounded-xl border bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-fg-subtle',
          'transition-[border-color,box-shadow] duration-150 ease-out',
          'hover:border-line-strong focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/12',
          error ? 'border-danger' : 'border-line',
          className
        )}
        {...props} />
      
      {error ?
      <p className="mt-1.5 text-xs font-medium text-danger-text">{error}</p> :
      hint ?
      <p className="mt-1.5 text-xs text-fg-muted">{hint}</p> :
      null}
    </div>);

});