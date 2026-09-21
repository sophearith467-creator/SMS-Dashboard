import React, { forwardRef, useId } from "react";
import { cn } from "../../lib/utils";
import { BoxIcon } from "lucide-react";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: BoxIcon;
  trailing?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  label,
  hint,
  error,
  icon: Icon,
  trailing,
  className,
  id,
  ...props
}, ref) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return <div className="w-full">
      {label && <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-medium text-fg">
          {label}
        </label>}
      <div className="relative">
        {Icon && <Icon size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />}
        <input ref={ref} id={inputId} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={cn('h-10 w-full rounded-xl border bg-surface px-3 text-sm text-fg placeholder:text-fg-subtle', 'transition-[border-color,box-shadow] duration-150 ease-out', 'hover:border-line-strong focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/12', 'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-fg-muted', Icon && 'pl-9', trailing && 'pr-10', error ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-line', className)} {...props} />
        {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-subtle">{trailing}</div>}
      </div>
      {error ? <p id={`${inputId}-error`} className="mt-1.5 text-xs font-medium text-danger-text">
          {error}
        </p> : hint ? <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-fg-muted">
          {hint}
        </p> : null}
    </div>;
});