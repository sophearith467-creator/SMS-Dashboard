import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useClickOutside } from "../../hooks/useClickOutside";
import { cn } from "../../lib/utils";
import { BoxIcon } from "lucide-react";
export interface DropdownItem {
  label: string;
  icon?: BoxIcon;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
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
}
export function DropdownMenu({
  trigger,
  items,
  header,
  align = 'right',
  width = 'w-60'
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
            <div className={cn(header && 'pt-1.5')}>
              {items.map((item) => <button key={item.label} type="button" role="menuitem" disabled={item.disabled} onClick={() => {
            setOpen(false);
            item.onSelect();
          }} className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium', 'transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-40', item.tone === 'danger' ? 'text-danger-text hover:bg-danger-soft' : 'text-fg-muted hover:bg-surface-muted hover:text-fg')}>
                  {item.icon && <item.icon size={15} aria-hidden />}
                  {item.label}
                </button>)}
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}