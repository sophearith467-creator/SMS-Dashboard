import React, { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Textarea } from '../ui/Textarea';
import { useApprovalDecision } from '../../hooks/useMissions';
import type { Mission } from '../../types/mission';

export interface DecisionDialogProps {
  mission: Mission | null;
  decision: 'APPROVED' | 'REJECTED';
  onClose: () => void;
}

export function DecisionDialog({ mission, decision, onClose }: DecisionDialogProps) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mutation = useApprovalDecision();
  const rejecting = decision === 'REJECTED';

  function handleClose() {
    setComment('');
    setError(null);
    onClose();
  }

  async function handleConfirm() {
    if (!mission) return;
    if (rejecting && comment.trim().length < 10) {
      setError('A rejection needs a reason of at least 10 characters.');
      return;
    }
    await mutation.mutateAsync({ missionId: mission.id, decision, comment: comment.trim() });
    handleClose();
  }

  return (
    <ConfirmDialog
      open={Boolean(mission)}
      tone={rejecting ? 'danger' : 'primary'}
      title={rejecting ? 'Reject this mission?' : 'Approve this mission?'}
      message={
      mission ?
      rejecting ?
      `${mission.reference} will be returned to ${mission.requesterName} and removed from the approval queue.` :
      `${mission.reference} moves to the next stage of the approval chain. ${mission.requesterName} will be notified.` :
      ''
      }
      confirmLabel={rejecting ? 'Reject mission' : 'Approve mission'}
      loading={mutation.isPending}
      onConfirm={handleConfirm}
      onCancel={handleClose}>
      
      <Textarea
        label={rejecting ? 'Reason for rejection' : 'Comment (optional)'}
        rows={3}
        value={comment}
        error={error ?? undefined}
        placeholder={
        rejecting ? 'Explain what needs to change before resubmission…' : 'Add context for the next approver…'
        }
        onChange={(event) => {
          setComment(event.target.value);
          setError(null);
        }} />
      
    </ConfirmDialog>);

}