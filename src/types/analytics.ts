export interface MissionSummary {
  total: number;
  pending: number;
  approved: number;
  inProgress: number;
  completed: number;
  rejected: number;
  changeVsLastMonthPct: number;
  trend: Array<{month: string;submitted: number;completed: number;}>;
  byDepartment: Array<{department: string;missions: number;}>;
}

export interface AllowanceSpend {
  currency: string;
  totalSpend: number;
  budget: number;
  pendingSettlement: number;
  changeVsLastMonthPct: number;
  monthly: Array<{month: string;planned: number;actual: number;}>;
}

export interface ApprovalTurnaround {
  averageHours: number;
  medianHours: number;
  withinSlaPct: number;
  changeVsLastMonthPct: number;
  byStage: Array<{stage: string;hours: number;}>;
}

export type ExceptionSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ExceptionItem {
  id: string;
  missionReference: string;
  type: string;
  severity: ExceptionSeverity;
  message: string;
  raisedAt: string;
}

export interface ExceptionsResponse {
  open: number;
  changeVsLastMonthPct: number;
  items: ExceptionItem[];
}