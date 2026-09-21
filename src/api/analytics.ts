import { ALLOWANCE_SPEND, APPROVAL_TURNAROUND, EXCEPTIONS, MISSION_SUMMARY } from '../data/analytics';
import type {
  AllowanceSpend,
  ApprovalTurnaround,
  ExceptionsResponse,
  MissionSummary } from
'../types/analytics';
import { request } from './client';
import { demoState } from './demoStore';

export async function fetchMissionSummary(): Promise<MissionSummary> {
  return request<MissionSummary>({ url: '/api/analytics/missions/summary' }, () => {
    const missions = demoState.missions;
    return {
      ...MISSION_SUMMARY,
      pending: missions.filter((m) => m.status === 'PENDING').length + 11,
      approved: missions.filter((m) => m.status === 'APPROVED').length + 30,
      inProgress: missions.filter((m) => m.status === 'IN_PROGRESS').length + 8,
      rejected: missions.filter((m) => m.status === 'REJECTED').length + 5
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