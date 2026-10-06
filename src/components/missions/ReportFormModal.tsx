import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { XIcon } from 'lucide-react';
import { SearchableSelect } from '../ui/SearchableSelect';
import { AttachmentPicker } from '../missions/AttachmentPicker';
import { createReport } from '../../api/reportsAdmin';
export interface MissionLite {
  id: number;
  requesterName?: string;
  requesterId?: string | number | null;
  employeeCode?: string | null;
  position?: string | null;
  function?: string | null;
  business?: string | null;
  basedLocation?: string | null;
  destinationLocation?: string | null;
  departureDate?: string;
  arrivalDate?: string;
  travelObjectives?: string;
}

interface FormState {
  requesterName: string;
  requesterId: string;
  position: string;
  function: string;
  business: string;
  basedLocation: string;
  destinationLocation: string;
  travelStartDate: string;
  travelEndDate: string;
  travelObjectives: string;
  achievedResults: string;
  nextPlan: string;
  attachedDocuments: string;
  requesterSignatureDate: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY: FormState = {
  requesterName: '', requesterId: '', position: '', function: '', business: '',
  basedLocation: '', destinationLocation: '', travelStartDate: '', travelEndDate: '',
  travelObjectives: '', achievedResults: '', nextPlan: '', attachedDocuments: '',
  requesterSignatureDate: today()
};

const input =
  'mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-fg outline-none focus:ring-2 focus:ring-offset-0';

function fromMission(m: MissionLite): Partial<FormState> {
  return {
    requesterName: m.requesterName ?? '',
    requesterId: String(m.employeeCode ?? (typeof m.requesterId === 'string' ? m.requesterId : '') ?? ''),
    position: m.position ?? '',
    function: m.function ?? '',
    business: m.business ?? '',
    basedLocation: m.basedLocation ?? '',
    destinationLocation: m.destinationLocation ?? '',
    travelStartDate: (m.departureDate ?? '').slice(0, 10),
    travelEndDate: (m.arrivalDate ?? '').slice(0, 10),
    travelObjectives: m.travelObjectives ?? ''
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function ReportFormModal({  open, onClose, missions, defaultMissionId
}: {
  open: boolean;
  onClose: () => void;
  missions: MissionLite[];
  defaultMissionId?: number;
}) {
  const qc = useQueryClient();
  const [missionId, setMissionId] = useState<number | ''>(defaultMissionId ?? '');
  const [form, setForm] = useState<FormState>(EMPTY);
  const [attachments, setAttachments] = useState<File[]>([]);
  const set = (k: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const m = missions.find((x) => x.id === missionId);
    if (m) setForm((f) => ({ ...f, ...fromMission(m) }));
  }, [missionId, missions]);

  const save = useMutation({
        mutationFn: async () => {
      const orNull = (v: string) => (v.trim() ? v.trim() : null);

      let attachedDocuments: string | null = orNull(form.attachedDocuments);
      if (attachments.length > 0) {
        const items = await Promise.all(
          attachments.map(async (file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: await fileToDataUrl(file)
          }))
        );
        attachedDocuments = JSON.stringify(items);
      }

      return createReport(Number(missionId), {
        requesterName: form.requesterName,
        requesterId: orNull(form.requesterId),
        position: orNull(form.position),
        function: orNull(form.function),
        business: orNull(form.business),
        basedLocation: orNull(form.basedLocation),
        destinationLocation: orNull(form.destinationLocation),
        travelStartDate: form.travelStartDate,
        travelEndDate: form.travelEndDate,
        travelObjectives: form.travelObjectives,
        achievedResults: form.achievedResults,
        nextPlan: orNull(form.nextPlan),
        attachedDocuments,
        requesterSignatureDate: orNull(form.requesterSignatureDate)
      });
    },
    onSuccess: () => {
      toast.success('Report saved');
      qc.invalidateQueries();
      setForm({ ...EMPTY, requesterSignatureDate: today() });
      setAttachments([]);
      onClose();
    },
    onError: (e: Error) => toast.error(e.message || 'Could not save report')
  });

  if (!open) return null;

  const valid =
    missionId !== '' && form.requesterName.trim() && form.travelStartDate && form.travelEndDate &&
    form.travelObjectives.trim() && form.achievedResults.trim();

  const field = (k: keyof FormState, label: string, type = 'text') => (
    <label className="block text-[12px] text-fg">{label}
      <input className={input} type={type} value={form[k]} onChange={set(k)} />
    </label>
  );
  const area = (k: keyof FormState, label: string, rows = 3) => (
    <label className="block text-[12px] text-fg sm:col-span-2">{label}
      <textarea className={input} rows={rows} value={form[k]} onChange={set(k)} />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-pop">
               <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-fg">Write activity report</h2>
            <p className="mt-1 text-[12px] text-fg-muted">
              Pick a mission to pre-fill the header, then edit anything you need.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={save.isPending}
            aria-label="Close"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center  text-fg-muted transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg disabled:opacity-50"
          >
            <XIcon size={16} aria-hidden />
          </button>
        </div>
        <div className="mt-4 block text-[12px] text-fg">
          <label htmlFor="mission-select">Mission</label>
          <div className="mt-1">
            <SearchableSelect
              id="mission-select"
              value={missionId === '' ? '' : String(missionId)}
              onChange={(v) => setMissionId(Number(v) || '')}
              placeholder="Select a mission..."
              searchPlaceholder="Search by mission no., requester or destination..."
              options={missions.map((m) => ({
                value: String(m.id),
                label: `MSN-${m.id} - ${m.requesterName ?? 'Unknown'}`,
                description: m.destinationLocation ?? m.travelObjectives ?? undefined,
              }))}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {field('requesterName', 'Requester name')}
          {field('requesterId', 'Requester ID (e.g. EMP002)')}
          {field('position', 'Position')}
          {field('function', 'Function')}
          {field('business', 'Business')}
          {field('basedLocation', 'Based location')}
          {field('destinationLocation', 'Destination location')}
          {field('requesterSignatureDate', 'Requester signature date', 'date')}
          {field('travelStartDate', 'Travel start date', 'date')}
          {field('travelEndDate', 'Travel end date', 'date')}
          {area('travelObjectives', 'Travel objectives')}
          {area('achievedResults', 'Achieved results', 4)}
          {area('nextPlan', 'Next plan')}
          <div className="sm:col-span-2">
            <AttachmentPicker
              files={attachments}
              onChange={setAttachments}
              maxSizeMB={5}
              disabled={save.isPending}
            />
          </div>        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-lg border border-line px-3 py-2 text-[13px] text-fg" onClick={onClose}>Cancel</button>
          <button
            className="rounded-lg bg-fg px-3 py-2 text-[13px] text-surface disabled:opacity-50"
            disabled={!valid || save.isPending}
            onClick={() => save.mutate()}>
            {save.isPending ? 'Saving...' : 'Save report'}
          </button>
        </div>
      </div>
    </div>
  );
}

