import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInCalendarDays, format, formatDistanceToNowStrict, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'USD', compact = false): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? 'compact' : 'standard'
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDate(iso: string, pattern = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}

export function formatDateRange(start: string, end: string): string {
  try {
    const s = parseISO(start);
    const e = parseISO(end);
    const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
    return sameMonth ?
    `${format(s, 'MMM d')} – ${format(e, 'd, yyyy')}` :
    `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`;
  } catch {
    return `${start} – ${end}`;
  }
}

export function fromNow(iso: string): string {
  try {
    return `${formatDistanceToNowStrict(parseISO(iso))} ago`;
  } catch {
    return iso;
  }
}

export function durationInDays(start: string, end: string): number {
  try {
    return Math.max(1, differenceInCalendarDays(parseISO(end), parseISO(start)) + 1);
  } catch {
    return 1;
  }
}

export function initials(fullName: string): string {
  return fullName.
  split(' ').
  filter(Boolean).
  slice(0, 2).
  map((part) => part[0]?.toUpperCase() ?? '').
  join('');
}

export function titleCase(value: string): string {
  return value.
  toLowerCase().
  split('_').
  map((word) => word.charAt(0).toUpperCase() + word.slice(1)).
  join(' ');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}