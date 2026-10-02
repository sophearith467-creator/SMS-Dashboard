import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { addReportComment } from '../../api/reportsAdmin';
import { useAnnexStatusUpdate } from '../../hooks/useAnnexes';
import type { ActivityReport } from '../../types/annex';

export type ReviewStep = 'FM' | 'BIZOPS';

/** FM comments first, then BizOps. Returns null when nothing is left to review. */
export function nextReviewStep(r: ActivityReport): ReviewStep | null {
  if (r.status === 'DRAFT' || r.status === 'APPROVED' || r.status === 'REJECTED') return null;
  if (!r.functionManagerComment) return 'FM';
  if (!r.bizOpsComment) return 'BIZOPS';
  return null;
}

const STEP_LABEL: Record<ReviewStep, string> = { FM: 'Function Manager', BIZOPS: 'Business Operations' };

export function ReportReviewDialog({ report, onClose }: { report: ActivityReport | null; onClose: () => void }) {
  const qc = useQueryClient();
  const updateStatus = useAnnexStatusUpdate('activity-reports');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const step = report ? nextReviewStep(report) : null;
  if (!report || !step) return null;

  const decide = async (approve: boolean) => {
    if (!comment.trim()) return toast.error('Please add a comment');
    setBusy(true);
    try {
      await addReportComment(report.missionId, report.id, comment.trim());
      const status = !approve ? 'REJECTED' : step === 'FM' ? 'UNDER_REVIEW' : 'APPROVED';
      await updateStatus.mutateAsync({ id: report.id, status });
      qc.invalidateQueries();
      setComment('');
      onClose();
    } catch (e) {
      toast.error((e as Error).message || 'Review failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-5 shadow-pop">
        <h2 className="text-[16px] font-semibold text-fg">Review as {STEP_LABEL[step]}</h2>
        <p className="mt-1 text-[12px] text-fg-muted">RPT-{report.id} - {report.requesterName} - MSN-{report.missionId}</p>
        <div className="mt-3 rounded-lg bg-surface-muted p-3 text-[13px] text-fg">
          <p><b>Results:</b> {report.achievedResults}</p>
          {report.nextPlan && <p className="mt-1"><b>Next plan:</b> {report.nextPlan}</p>}
          {report.functionManagerComment && <p className="mt-1"><b>FM comment:</b> {report.functionManagerComment}</p>}
        </div>
        <label className="mt-3 block text-[12px] text-fg">Your comment
          <textarea className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-fg" rows={3}
            value={comment} onChange={(e) => setComment(e.target.value)} />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-lg border border-line px-3 py-2 text-[13px] text-fg" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="rounded-lg border border-line px-3 py-2 text-[13px] text-danger" onClick={() => decide(false)} disabled={busy}>Reject</button>
          <button className="rounded-lg bg-fg px-3 py-2 text-[13px] text-surface disabled:opacity-50" onClick={() => decide(true)} disabled={busy}>
            {step === 'FM' ? 'Approve & send to BizOps' : 'Approve report'}
          </button>
        </div>
      </div>
    </div>
  );
}
