import React from 'react';
import { Badge, type BadgeTone } from '../ui/Badge';
import { titleCase } from '../../lib/utils';
import type { MissionStatus } from '../../types/mission';
import type { RecordStatus } from '../../types/annex';

type AnyStatus = MissionStatus | RecordStatus | 'ACTIVE' | 'INVITED' | 'SUSPENDED';

const TONE_BY_STATUS: Record<string, BadgeTone> = {
  DRAFT: 'neutral',
  SUBMITTED: 'brand',
  FM_REVIEW: 'warning',
  HRBP_REVIEW: 'warning',
  FINANCE_REVIEW: 'warning',
  BIZOPS_REVIEW: 'warning',
  EXECUTIVE_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
  REPORT_SUBMITTED: 'brand',
  SETTLED: 'neutral',
  PAID: 'success',
  ACTIVE: 'success',
  INVITED: 'brand',
  SUSPENDED: 'danger'
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  return (
    <Badge tone={TONE_BY_STATUS[status] ?? 'neutral'} dot>
      {titleCase(status)}
    </Badge>
  );
}