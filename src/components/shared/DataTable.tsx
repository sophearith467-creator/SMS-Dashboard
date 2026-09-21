import React from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from '../ui/Skeleton';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  headerClassName?: string;
  render: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  skeletonRows?: number;
  empty?: React.ReactNode;
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
  caption?: string;
}

const ALIGN = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center'
};

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  loading = false,
  skeletonRows = 6,
  empty,
  toolbar,
  onRowClick,
  caption
}: DataTableProps<T>) {
  const showEmpty = !loading && rows.length === 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
      {toolbar &&
      <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          {toolbar}
        </div>
      }

      {showEmpty ?
      empty :

      <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            {caption && <caption className="sr-only">{caption}</caption>}
            <thead>
              <tr className="border-b border-line bg-surface-muted/60">
                {columns.map((column) =>
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-subtle',
                  ALIGN[column.align ?? 'left'],
                  column.headerClassName
                )}>
                
                    {column.header}
                  </th>
              )}
              </tr>
            </thead>
            <tbody>
              {loading ?
            Array.from({ length: skeletonRows }).map((_, rowIndex) =>
            <tr key={rowIndex} className="border-b border-line last:border-0">
                      {columns.map((column) =>
              <td key={column.key} className="px-4 py-4">
                          <Skeleton className={cn('h-4', rowIndex % 2 ? 'w-2/3' : 'w-4/5')} />
                        </td>
              )}
                    </tr>
            ) :
            rows.map((row) =>
            <tr
              key={getRowId(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
              onRowClick ?
              (event) => {
                if (event.key === 'Enter') onRowClick(row);
              } :
              undefined
              }
              className={cn(
                'border-b border-line transition-colors duration-150 ease-out last:border-0',
                onRowClick && 'cursor-pointer hover:bg-surface-muted/70'
              )}>
              
                      {columns.map((column) =>
              <td
                key={column.key}
                className={cn(
                  'px-4 py-3.5 align-middle text-fg-muted',
                  ALIGN[column.align ?? 'left'],
                  column.className
                )}>
                
                          {column.render(row)}
                        </td>
              )}
                    </tr>
            )}
            </tbody>
          </table>
        </div>
      }
    </section>);

}