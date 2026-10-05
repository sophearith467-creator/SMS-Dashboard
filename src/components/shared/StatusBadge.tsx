import React from 'react';
import { Badge, type BadgeTone } from '../ui/Badge';
import { titleCase } from '../../lib/utils';
import type { MissionStatus } from '../../types/mission';
import type { RecordStatus } from '../../types/annex';

type AnyStatus = MissionStatus | RecordStatus | 'ACTIVE' | 'INVITED' | 'SUSPENDED';

const TONE_BY_STATUS: Record<string, BadgeTone> = {
  DRAFT: 'neutral',
  SUBMITTED: 'brand',
  UNDER_REVIEW: 'warning',
  FM_REVIEW: 'warning',
  HRBP_REVIEW: 'warning',
  FINANCE_REVIEW: 'warning',
  BIZOPS_REVIEW: 'warning',
  EXECUTIVE_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
  REPORT_SUBMITTED: 'brand',
  PAID: 'success',
  ACTIVE: 'success',
  INVITED: 'brand',
  SUSPENDED: 'danger'
};

export function StatusBadge({ status }: { status?: AnyStatus | null }) {
  const safe = status ?? 'DRAFT';
  return (
    <Badge tone={TONE_BY_STATUS[safe] ?? 'neutral'} dot>
      {safe === 'SETTLED' ? 'Submit Complete' : titleCase(safe)}
    </Badge>
  );
}
