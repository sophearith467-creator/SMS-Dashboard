
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface DropdownItem {
  label: string;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  trigger: (args: { toggle: () => void; open: boolean }) => ReactNode;
  placement?: 'top' | 'bottom' | 'auto';
}

const GAP = 6;
const EDGE = 8;

export function DropdownMenu({ items, trigger, placement = 'auto' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current || !menuRef.current) return;
    const a = anchorRef.current.getBoundingClientRect();
    const m = menuRef.current.getBoundingClientRect();

    const fitsBelow = a.bottom + GAP + m.height <= window.innerHeight - EDGE;
    const fitsAbove = a.top - GAP - m.height >= EDGE;

    let openUp: boolean;
    if (placement === 'top') openUp = fitsAbove || !fitsBelow;
    else openUp = !fitsBelow && fitsAbove;

    const top = openUp ? a.top - GAP - m.height : a.bottom + GAP;
    const left = Math.max(
      EDGE,
      Math.min(a.right - m.width, window.innerWidth - m.width - EDGE)
    );

    setPos({ top, left });
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const toggle = () => {
    setPos(null);
    setOpen((v) => !v);
  };

  return (
    <>
      <span ref={anchorRef} className="inline-flex">
        {trigger({ toggle, open })}
      </span>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              visibility: pos ? 'visible' : 'hidden',
            }}
            className="z-50 min-w-44 rounded-xl border border-border bg-surface p-1 shadow-lg"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={[
                  'flex w-full items-center rounded-lg px-3 py-2 text-left text-[13px] transition-colors',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                  item.tone === 'danger'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-fg hover:bg-surface-muted',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}