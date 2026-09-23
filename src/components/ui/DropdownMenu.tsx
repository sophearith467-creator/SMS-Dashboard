import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, type BoxIcon } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { cn } from "../../lib/utils";
export interface DropdownItem {
  label: string;
  icon?: BoxIcon;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  selected?: boolean;
  count?: number;
}
export interface DropdownMenuProps {
  trigger: (props: {
    open: boolean;
    toggle: () => void;
  }) => React.ReactNode;
  items: DropdownItem[];
  header?: React.ReactNode;
  align?: 'left' | 'right';
  width?: string;
  maxHeight?: string;
  closeOnSelect?: boolean;
}
export function DropdownMenu({
  trigger,
  items,
  header,
  align = 'right',
  width = 'w-60',
  maxHeight,
  closeOnSelect = true
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setOpen(false), open);
  return <div ref={containerRef} className="relative">
      {trigger({
      open,
      toggle: () => setOpen((value) => !value)
    })}

      <AnimatePresence>
        {open && <motion.div role="menu" initial={{
        opacity: 0,
        y: -4,
        scale: 0.98
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} exit={{
        opacity: 0,
        y: -4,
        scale: 0.98
      }} transition={{
        duration: 0.15,
        ease: [0.23, 1, 0.32, 1]
      }} className={cn('absolute z-40 mt-2 origin-top overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-pop', align === 'right' ? 'right-0' : 'left-0', width)}>
            {header && <div className="border-b border-line px-3 py-2.5">{header}</div>}
            <div className={cn(header && 'pt-1.5', maxHeight && 'overflow-y-auto', maxHeight)}>
              {items.map((item) => <button key={item.label} type="button" role="menuitemradio" aria-checked={item.selected} disabled={item.disabled} onClick={() => {
            if (closeOnSelect) setOpen(false);
            item.onSelect();
          }} className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium', 'transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-40', item.tone === 'danger' ? 'text-danger-text hover:bg-danger-soft' : item.selected ? 'bg-brand-soft text-brand-text' : 'text-fg-muted hover:bg-surface-muted hover:text-fg')}>
                  {item.icon && <item.icon size={15} aria-hidden />}
                  <span className="flex-1 truncate">{item.label}</span>
                  {typeof item.count === 'number' && <span className={cn('rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums', item.selected ? 'bg-brand/15 text-brand-text' : 'bg-surface-muted text-fg-subtle')}>
                      {item.count}
                    </span>}
                  {item.selected && <CheckIcon size={14} className="shrink-0 text-brand-text" aria-hidden />}
                </button>)}
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}
