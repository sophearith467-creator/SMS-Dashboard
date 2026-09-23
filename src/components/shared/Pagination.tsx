import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '../ui/Button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange, disabled }: PaginationProps) {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between">
      <p className="text-[13px] text-fg-muted">
        Showing <span className="font-medium text-fg">{start}–{end}</span> of{' '}
        <span className="font-medium text-fg">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="h-8 px-2.5"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeftIcon size={16} />
        </Button>
        <span className="text-[13px] text-fg-muted">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          className="h-8 px-2.5"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRightIcon size={16} />
        </Button>
      </div>
    </div>
  );
}
