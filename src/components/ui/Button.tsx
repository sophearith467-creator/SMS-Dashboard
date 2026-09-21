import React, { forwardRef } from "react";
import { Loader2Icon, BoxIcon } from "lucide-react";
import { cn } from "../../lib/utils";
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
type Size = 'sm' | 'md' | 'lg' | 'icon';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: BoxIcon;
  iconRight?: BoxIcon;
  loading?: boolean;
  fullWidth?: boolean;
}
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white shadow-brand hover:bg-brand-strong active:scale-[0.985] disabled:shadow-none',
  secondary: 'bg-surface text-fg border border-line hover:border-line-strong hover:bg-surface-muted active:scale-[0.985]',
  ghost: 'text-fg-muted hover:bg-surface-muted hover:text-fg',
  danger: 'bg-danger text-white hover:brightness-95 active:scale-[0.985]',
  soft: 'bg-brand-soft text-brand-text hover:brightness-[0.97] active:scale-[0.985]'
};
const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
  icon: 'h-9 w-9 rounded-xl'
};
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}, ref) {
  const iconSize = size === 'sm' ? 14 : 16;
  return <button ref={ref} disabled={disabled || loading} className={cn('inline-flex select-none items-center justify-center whitespace-nowrap font-medium', 'transition-[background-color,border-color,color,box-shadow,transform,filter] duration-150 ease-out', 'disabled:pointer-events-none disabled:opacity-50', VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)} {...props}>
      {loading ? <Loader2Icon size={iconSize} className="animate-spin" aria-hidden /> : Icon && <Icon size={iconSize} aria-hidden />}
      {size !== 'icon' && children}
      {!loading && IconRight && size !== 'icon' && <IconRight size={iconSize} aria-hidden />}
    </button>;
});