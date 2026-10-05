import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { CheckIcon } from 'lucide-react';

export interface DropdownItem {
  label: string;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  icon?: ComponentType<{ size?: number; className?: string }>;
  selected?: boolean;
  count?: number;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  trigger: (args: { toggle: () => void; open: boolean }) => ReactNode;
  placement?: 'top' | 'bottom' | 'auto';
  align?: 'left' | 'right';
  width?: string;
  maxHeight?: string;
}

const GAP = 6;
const EDGE = 8;

export function DropdownMenu({
  items,
  trigger,
  placement = 'auto',
  align = 'right',
  width = 'min-w-44',
  maxHeight,
}: DropdownMenuProps) {
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
    const openUp =
      placement === 'top' ? fitsAbove || !fitsBelow : !fitsBelow && fitsAbove;

    const top = openUp ? a.top - GAP - m.height : a.bottom + GAP;
    const desiredLeft = align === 'left' ? a.left : a.right - m.width;
    const left = Math.max(
      EDGE,
      Math.min(desiredLeft, window.innerWidth - m.width - EDGE)
    );
    setPos({ top, left });
  }, [open, placement, align]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onScroll = (e: Event) => {
      // keep open while scrolling inside the menu itself
      if (menuRef.current?.contains(e.target as Node)) return;
      close();
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
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
            className={`z-50 ${width} ${maxHeight ?? ''} overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-lg`}
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
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
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors',
                    'disabled:cursor-not-allowed disabled:opacity-40',
                    item.tone === 'danger'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-fg hover:bg-surface-muted',
                    item.selected ? 'font-medium' : '',
                  ].join(' ')}
                >
                  {Icon && <Icon size={15} className="shrink-0" />}
                  <span className="flex-1 truncate">{item.label}</span>
                  {typeof item.count === 'number' && (
                    <span className="text-[11.5px] tabular-nums text-fg-subtle">{item.count}</span>
                  )}
                  {item.selected && <CheckIcon size={14} className="shrink-0 text-fg-subtle" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
