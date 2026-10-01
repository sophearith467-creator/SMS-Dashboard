import { Avatar } from '../shared/Avatar';
import type { MissionParticipant } from '../../types/mission';

export interface ParticipantsPanelProps {
  participants: MissionParticipant[];
}

export function ParticipantsPanel({ participants }: ParticipantsPanelProps) {
  if (participants.length === 0) {
    return <p className="text-sm text-fg-muted">No travelers on this mission yet.</p>;
  }

  const total = participants.reduce((sum, p) => sum + p.totalExpense, 0);

  return (
    <div>
      <ul className="divide-y divide-line">
        {participants.map((p) => {
          const meals = p.breakfastTotal + p.lunchTotal + p.dinnerTotal;
          return (
            <li key={p.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={p.fullName} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium text-fg">
                    {p.fullName}
                    {p.requester && <span className="ml-2 text-[11.5px] text-fg-subtle">requester</span>}
                  </p>
                  <p className="text-[12.5px] text-fg-subtle">
                    {p.jobLevel.replace(/_/g, ' ')} - Meals ${meals.toFixed(2)} - Stay ${p.accommodationTotal.toFixed(2)}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-[13.5px] font-medium tabular-nums text-fg">
                ${p.totalExpense.toFixed(2)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-soft px-4 py-3.5">
        <p className="text-[13px] font-medium text-brand-text">
          {participants.length} travelers combined
        </p>
        <span className="text-xl font-semibold tabular-nums tracking-[-0.02em] text-brand-text">
          ${total.toFixed(2)}
        </span>
      </div>

      {total === 0 && (
        <p className="mt-3 text-[12.5px] text-fg-subtle">
          Amounts are 0 until you click "Calculate allowance".
        </p>
      )}
    </div>
  );
}