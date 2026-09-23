import React, { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Textarea } from '../ui/Textarea';
import { useApproveMission, useRejectMission } from '../../hooks/useApprovals';

export interface DecisionTarget {
  missionId: number;
  label: string; // e.g. mission code or "requester → destination"
  requesterName: string;
}

export interface DecisionDialogProps {
  target: DecisionTarget | null;
  decision: 'APPROVED' | 'REJECTED';
  onClose: () => void;
}

export function DecisionDialog({ target, decision, onClose }: DecisionDialogProps) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const approve = useApproveMission();
  const reject = useRejectMission();
  const rejecting = decision === 'REJECTED';
  const mutation = rejecting ? reject : approve;

  function handleClose() {
    setComment('');
    setError(null);
    onClose();
  }

  async function handleConfirm() {
    if (!target) return;
    if (rejecting && comment.trim().length < 10) {
      setError('A rejection needs a reason of at least 10 characters.');
      return;
    }
    await mutation.mutateAsync({ id: target.missionId, comment: comment.trim() || undefined });
    handleClose();
  }

  return (
    <ConfirmDialog
      open={Boolean(target)}
      tone={rejecting ? 'danger' : 'primary'}
      title={rejecting ? 'Reject this mission?' : 'Approve this mission?'}
      message={
        target
          ? rejecting
            ? `${target.label} will be returned to ${target.requesterName} and removed from the approval queue.`
            : `${target.label} moves to the next stage of the approval chain. ${target.requesterName} will be notified.`
          : ''
      }
      confirmLabel={rejecting ? 'Reject mission' : 'Approve mission'}
      loading={mutation.isPending}
      onConfirm={handleConfirm}
      onCancel={handleClose}
    >
      <Textarea
        label={rejecting ? 'Reason for rejection' : 'Comment (optional)'}
        rows={3}
        value={comment}
        error={error ?? undefined}
        placeholder={rejecting ? 'Explain what needs to change before resubmission…' : 'Add context for the next approver…'}
        onChange={(event) => {
          setComment(event.target.value);
          setError(null);
        }}
      />
    </ConfirmDialog>
  );
}