import { ALLOWANCE_SPEND, APPROVAL_TURNAROUND, EXCEPTIONS, MISSION_SUMMARY } from '../data/analytics';
import type {
  AllowanceSpend,
  ApprovalTurnaround,
  ExceptionsResponse,
  MissionSummary } from
'../types/analytics';
import { request } from './client';
import { demoState } from './demoStore';

const PENDING_STATUSES = ['SUBMITTED', 'FM_REVIEW', 'HRBP_REVIEW', 'FINANCE_REVIEW', 'BIZOPS_REVIEW', 'EXECUTIVE_REVIEW'];

export async function fetchMissionSummary(): Promise<MissionSummary> {
  return request<MissionSummary>({ url: '/api/analytics/missions/summary' }, () => {
    const count = (statuses: string[]) =>
      demoState.missions.filter((m) => statuses.includes(m.status as string)).length;
    return {
      ...MISSION_SUMMARY,
      total: demoState.missions.length,
      pending: count(PENDING_STATUSES),
      approved: count(['APPROVED']),
      inProgress: count(PENDING_STATUSES),
      completed: count(['SETTLED', 'REPORT_SUBMITTED']),
      reportSubmitted: count(['REPORT_SUBMITTED']),
      rejected: count(['REJECTED'])
    };
  });
}

export async function fetchAllowanceSpend(): Promise<AllowanceSpend> {
  return request<AllowanceSpend>({ url: '/api/analytics/allowances/spend' }, () => ALLOWANCE_SPEND);
}

export async function fetchApprovalTurnaround(): Promise<ApprovalTurnaround> {
  return request<ApprovalTurnaround>(
    { url: '/api/analytics/approvals/turnaround' },
    () => APPROVAL_TURNAROUND
  );
}

export async function fetchExceptions(): Promise<ExceptionsResponse> {
  return request<ExceptionsResponse>({ url: '/api/analytics/exceptions' }, () => EXCEPTIONS);
}
