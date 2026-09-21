import type { AuthUser } from '../types/auth';
import type {
  AllowanceBreakdown,
  ApprovalActionInput,
  Mission,
  MissionInput } from
'../types/mission';
import { request } from './client';
import { calculateAllowance, createMission, decideMission, getMission, listMissions } from './demoStore';

export async function fetchMissions(): Promise<Mission[]> {
  return request<Mission[]>({ url: '/api/missions' }, listMissions);
}

export async function fetchMission(id: string): Promise<Mission> {
  return request<Mission>({ url: `/api/missions/${id}` }, () => getMission(id));
}

export async function fetchMissionAllowance(id: string): Promise<AllowanceBreakdown> {
  return request<AllowanceBreakdown>({ url: `/api/missions/${id}/allowances` }, () =>
  calculateAllowance(id)
  );
}

export async function submitMission(input: MissionInput, user: AuthUser): Promise<Mission> {
  return request<Mission>({ url: '/api/missions', method: 'POST', data: input }, () =>
  createMission(input, { id: user.id, fullName: user.fullName })
  );
}

export async function submitApprovalDecision(
input: ApprovalActionInput,
user: AuthUser)
: Promise<Mission> {
  return request<Mission>(
    {
      url: `/api/missions/${input.missionId}/approvals`,
      method: 'POST',
      data: { decision: input.decision, comment: input.comment }
    },
    () => decideMission(input, { fullName: user.fullName })
  );
}