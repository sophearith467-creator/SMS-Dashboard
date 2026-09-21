import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl'
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className={cn(
            'relative z-10 w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-pop',
            SIZES[size]
          )}>
          
            <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                <h2 className="text-base font-semibold tracking-[-0.01em] text-fg">{title}</h2>
                {description && <p className="mt-1 text-[13px] text-fg-muted">{description}</p>}
              </div>
              <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="-mr-1 rounded-lg p-1.5 text-fg-subtle transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg">
              
                <XIcon size={18} />
              </button>
            </header>

            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>

            {footer &&
          <footer className="flex items-center justify-end gap-2 border-t border-line bg-surface-muted px-6 py-4">
                {footer}
              </footer>
          }
          </motion.div>
        </div>
      }
    </AnimatePresence>,
    document.body
  );
}