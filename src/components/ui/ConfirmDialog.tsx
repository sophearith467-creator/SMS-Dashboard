import React from 'react';
import { AlertTriangleIcon, CheckCircle2Icon } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  loading?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  loading = false,
  children,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const Icon = tone === 'danger' ? AlertTriangleIcon : CheckCircle2Icon;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
      <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }>
      
      <div className="flex gap-4">
        <span
          className={
          tone === 'danger' ?
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger-text' :
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-text'
          }>
          
          <Icon size={18} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-fg-muted">{message}</p>
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </Modal>);

}