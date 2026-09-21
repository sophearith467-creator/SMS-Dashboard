import { ACTIVITY_REPORTS, MILEAGE_CLAIMS, SETTLEMENTS, VEHICLE_REQUESTS } from '../data/annexes';
import { APPROVAL_CHAIN, MISSIONS, buildApprovalChain } from '../data/missions';
import { DIRECTORY_USERS, type DirectoryUser } from '../data/users';
import type {
  ActivityReport,
  MileageClaim,
  SettlementRecord,
  VehicleRequest } from
'../types/annex';
import type {
  AllowanceBreakdown,
  ApprovalActionInput,
  Mission,
  MissionInput } from
'../types/mission';
import { durationInDays } from '../lib/utils';
import { ApiError } from './client';

interface DemoState {
  missions: Mission[];
  activityReports: ActivityReport[];
  vehicleRequests: VehicleRequest[];
  mileageClaims: MileageClaim[];
  settlements: SettlementRecord[];
  users: DirectoryUser[];
}

export const demoState: DemoState = {
  missions: MISSIONS.map((mission) => ({ ...mission, approvals: [...mission.approvals] })),
  activityReports: [...ACTIVITY_REPORTS],
  vehicleRequests: [...VEHICLE_REQUESTS],
  mileageClaims: [...MILEAGE_CLAIMS],
  settlements: [...SETTLEMENTS],
  users: [...DIRECTORY_USERS]
};

const DAILY_RATES: Record<string, number> = {
  Ghana: 180,
  Kenya: 210,
  Rwanda: 195,
  'South Africa': 230,
  Portugal: 320,
  Switzerland: 410,
  Germany: 350,
  UAE: 340
};

export function listMissions(): Mission[] {
  return [...demoState.missions];
}

export function getMission(id: string): Mission {
  const mission = demoState.missions.find((m) => m.id === id || m.reference === id);
  if (!mission) throw new ApiError(`Mission ${id} was not found.`, 404);
  return mission;
}

export function createMission(input: MissionInput, requester: {id: string;fullName: string;}): Mission {
  const highest = demoState.missions.reduce((max, mission) => {
    const value = Number(mission.reference.replace('MSN-', ''));
    return Number.isFinite(value) && value > max ? value : max;
  }, 1042);
  const nextNumber = highest + 1;
  const id = `m-${nextNumber}`;
  const mission: Mission = {
    id,
    reference: `MSN-${nextNumber}`,
    title: input.title,
    purpose: input.purpose,
    requesterId: requester.id,
    requesterName: requester.fullName,
    department: input.department,
    destination: input.destination,
    country: input.country,
    startDate: input.startDate,
    endDate: input.endDate,
    status: 'PENDING',
    transport: input.transport,
    estimatedCost: input.estimatedCost,
    currency: 'USD',
    createdAt: new Date().toISOString(),
    priority: input.priority,
    approvals: buildApprovalChain(id)
  };
  demoState.missions = [mission, ...demoState.missions];
  return mission;
}

export function decideMission(input: ApprovalActionInput, actor: {fullName: string;}): Mission {
  const mission = getMission(input.missionId);
  const nextStage = APPROVAL_CHAIN.find(
    (stage) => mission.approvals.find((step) => step.stage === stage)?.decision === 'PENDING'
  );

  mission.approvals = mission.approvals.map((step) =>
  step.stage === nextStage ?
  {
    ...step,
    decision: input.decision,
    decidedAt: new Date().toISOString(),
    comment: input.comment || step.comment,
    approverName: actor.fullName || step.approverName
  } :
  step
  );

  if (input.decision === 'REJECTED') {
    mission.status = 'REJECTED';
  } else {
    const allApproved = mission.approvals.every((step) => step.decision === 'APPROVED');
    mission.status = allApproved ? 'APPROVED' : 'PENDING';
  }

  demoState.missions = demoState.missions.map((m) => m.id === mission.id ? { ...mission } : m);
  return mission;
}

export function calculateAllowance(missionId: string): AllowanceBreakdown {
  const mission = getMission(missionId);
  const days = durationInDays(mission.startDate, mission.endDate);
  const dailyRate = DAILY_RATES[mission.country] ?? 200;
  const perDiem = days * dailyRate;
  const accommodation = Math.round(days * dailyRate * 0.55);
  const transport =
  mission.transport === 'AIR' ? 1240 : mission.transport === 'RAIL' ? 320 : mission.transport === 'ROAD' ? 180 : 90;
  const incidentals = Math.round(days * 42);
  const insurance = mission.transport === 'AIR' ? 145 : 60;

  const lines = [
  { label: 'Per diem', description: `${days} days × $${dailyRate}/day`, amount: perDiem },
  { label: 'Accommodation', description: `${days} nights at the ${mission.country} band rate`, amount: accommodation },
  { label: 'Transport', description: `${mission.transport.replace('_', ' ').toLowerCase()} to ${mission.destination}`, amount: transport },
  { label: 'Incidentals', description: 'Local travel, communications and sundries', amount: incidentals },
  { label: 'Travel insurance', description: 'Policy cover for the mission window', amount: insurance }];


  return {
    missionId: mission.id,
    reference: mission.reference,
    days,
    currency: mission.currency,
    dailyRate,
    lines,
    total: lines.reduce((sum, line) => sum + line.amount, 0),
    calculatedAt: new Date().toISOString()
  };
}