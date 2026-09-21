import type { Role } from './auth';

export type MissionStatus =
'DRAFT' |
'PENDING' |
'APPROVED' |
'REJECTED' |
'IN_PROGRESS' |
'COMPLETED' |
'SETTLED';

export type TransportMode = 'AIR' | 'ROAD' | 'RAIL' | 'COMPANY_VEHICLE';

export type ApprovalStage =
'FUNCTION_MANAGER' |
'HRBP' |
'FINANCE' |
'BIZOPS' |
'EXECUTIVE';

export type ApprovalDecision = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';

export interface ApprovalStep {
  id: string;
  stage: ApprovalStage;
  approverName: string;
  approverRole: Role;
  decision: ApprovalDecision;
  decidedAt?: string;
  comment?: string;
}

export interface Mission {
  id: string;
  reference: string;
  title: string;
  purpose: string;
  requesterId: string;
  requesterName: string;
  department: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  status: MissionStatus;
  transport: TransportMode;
  estimatedCost: number;
  currency: string;
  createdAt: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  approvals: ApprovalStep[];
}

export interface MissionInput {
  title: string;
  purpose: string;
  department: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  transport: TransportMode;
  estimatedCost: number;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
}

export interface AllowanceLine {
  label: string;
  description: string;
  amount: number;
}

export interface AllowanceBreakdown {
  missionId: string;
  reference: string;
  days: number;
  currency: string;
  dailyRate: number;
  lines: AllowanceLine[];
  total: number;
  calculatedAt: string;
}

export interface ApprovalActionInput {
  missionId: string;
  decision: 'APPROVED' | 'REJECTED';
  comment?: string;
}