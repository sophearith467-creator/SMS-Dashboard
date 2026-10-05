import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  id?: string;
}

const GAP = 6;
const EDGE = 8;

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  disabled,
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      `${o.label} ${o.description ?? ''}`.toLowerCase().includes(q)
    );
  }, [options, query]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !panelRef.current) return;
    const a = triggerRef.current.getBoundingClientRect();
    const p = panelRef.current.getBoundingClientRect();
    const fitsBelow = a.bottom + GAP + p.height <= window.innerHeight - EDGE;
    const fitsAbove = a.top - GAP - p.height >= EDGE;
    const openUp = !fitsBelow && fitsAbove;
    setPos({
      top: openUp ? a.top - GAP - p.height : a.bottom + GAP,
      left: a.left,
      width: a.width,
    });
  }, [open, filtered.length]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const close = () => setOpen(false);
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      close();
    };
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  function openPanel() {
    if (disabled) return;
    setQuery('');
    setActive(0);
    setPos(null);
    setOpen(true);
  }

  function choose(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 text-left text-[13px] text-fg transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selected ? 'truncate' : 'truncate text-fg-subtle'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDownIcon size={16} className="shrink-0 text-fg-subtle" />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            onKeyDown={onKeyDown}
            style={{
              position: 'fixed',
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              width: pos?.width ?? triggerRef.current?.offsetWidth,
              visibility: pos ? 'visible' : 'hidden',
            }}
            className="z-[100] rounded-xl border border-line bg-surface p-1.5 shadow-lg"
          >
            <div className="relative mb-1.5">
              <SearchIcon
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-subtle"
              />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-lg border border-line bg-surface pl-8 pr-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-brand"
              />
            </div>

            <ul role="listbox" className="max-h-56 overflow-y-auto">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-[12.5px] text-fg-subtle">
                  No results found
                </li>
              )}
              {filtered.map((o, i) => (
                <li key={o.value} role="option" aria-selected={o.value === value}>
                  <button
                    type="button"
                    onClick={() => choose(o)}
                    onMouseEnter={() => setActive(i)}
                    className={[
                      'flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors',
                      i === active ? 'bg-surface-muted' : '',
                      o.value === value ? 'font-medium' : '',
                    ].join(' ')}
                  >
                    <span className="truncate text-[13px] text-fg">{o.label}</span>
                    {o.description && (
                      <span className="truncate text-[12px] text-fg-subtle">{o.description}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </>
  );
}
