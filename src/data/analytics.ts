import type {
  AllowanceSpend,
  ApprovalTurnaround,
  ExceptionsResponse,
  MissionSummary } from
'../types/analytics';

export const MISSION_SUMMARY: MissionSummary = {
  total: 128,
  pending: 14,
  approved: 32,
  inProgress: 9,
  completed: 67,
  rejected: 6,
  changeVsLastMonthPct: 12.4,
  trend: [
  { month: 'Apr', submitted: 14, completed: 11 },
  { month: 'May', submitted: 18, completed: 15 },
  { month: 'Jun', submitted: 22, completed: 17 },
  { month: 'Jul', submitted: 19, completed: 18 },
  { month: 'Aug', submitted: 26, completed: 21 },
  { month: 'Sep', submitted: 29, completed: 23 }],

  byDepartment: [
  { department: 'Field Ops', missions: 46 },
  { department: 'Programmes', missions: 31 },
  { department: 'Finance', missions: 18 },
  { department: 'Biz Ops', missions: 22 },
  { department: 'People', missions: 11 }]

};

export const ALLOWANCE_SPEND: AllowanceSpend = {
  currency: 'USD',
  totalSpend: 486200,
  budget: 620000,
  pendingSettlement: 38450,
  changeVsLastMonthPct: 6.8,
  monthly: [
  { month: 'Apr', planned: 72000, actual: 64100 },
  { month: 'May', planned: 78000, actual: 81200 },
  { month: 'Jun', planned: 84000, actual: 79600 },
  { month: 'Jul', planned: 86000, actual: 88400 },
  { month: 'Aug', planned: 92000, actual: 86700 },
  { month: 'Sep', planned: 95000, actual: 86200 }]

};

export const APPROVAL_TURNAROUND: ApprovalTurnaround = {
  averageHours: 31.4,
  medianHours: 22,
  withinSlaPct: 87,
  changeVsLastMonthPct: -9.2,
  byStage: [
  { stage: 'Function Manager', hours: 6.2 },
  { stage: 'HRBP', hours: 5.4 },
  { stage: 'Finance', hours: 9.8 },
  { stage: 'Biz Ops', hours: 5.1 },
  { stage: 'Executive', hours: 4.9 }]

};

export const EXCEPTIONS: ExceptionsResponse = {
  open: 7,
  changeVsLastMonthPct: 3.1,
  items: [
  {
    id: 'ex-91',
    missionReference: 'MSN-1034',
    type: 'Budget breach',
    severity: 'HIGH',
    message: 'Estimated cost exceeds the Executive Office quarterly envelope by 18%.',
    raisedAt: '2026-09-18T14:22:00Z'
  },
  {
    id: 'ex-90',
    missionReference: 'MSN-1042',
    type: 'SLA at risk',
    severity: 'MEDIUM',
    message: 'Finance approval pending for 38 hours against a 24-hour SLA.',
    raisedAt: '2026-09-19T09:05:00Z'
  },
  {
    id: 'ex-89',
    missionReference: 'MSN-1040',
    type: 'Missing annex',
    severity: 'MEDIUM',
    message: 'Activity report (Annex B) not submitted within 3 days of mission close.',
    raisedAt: '2026-09-20T06:40:00Z'
  },
  {
    id: 'ex-88',
    missionReference: 'MSN-1031',
    type: 'Duplicate claim',
    severity: 'LOW',
    message: 'Mileage claim ANX-D-510 overlaps a previously settled route segment.',
    raisedAt: '2026-09-17T11:12:00Z'
  },
  {
    id: 'ex-87',
    missionReference: 'MSN-1037',
    type: 'Policy exception',
    severity: 'HIGH',
    message: 'Business class fare requested without an executive waiver on file.',
    raisedAt: '2026-09-11T08:30:00Z'
  }]

};