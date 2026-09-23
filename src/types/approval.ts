// src/types/approval.ts
import type { ApprovalStage, MissionStatus } from './mission';

export type ApprovalOutcome = 'APPROVED' | 'REJECTED';

// One row from GET /api/missions/{id}/approvals
export interface ApprovalHistoryEntry {
  id: number;
  missionId: number;
  step: ApprovalStage;
  decision: ApprovalOutcome;
  comment: string | null;
  decidedBy: number;
  decidedAt: string; // ISO Instant
}

// One row from GET /api/missions/approvals/pending
export interface PendingApprovalItem {
  missionId: number;
  missionCode: string | null;
  requesterName: string;
  destinationLocation: string;
  departureDate: string; // ISO date
  arrivalDate: string;   // ISO date
  status: string; // backend's real MissionStatus values — see warning below
  currentApprovalStep: ApprovalStage | null;
}

export interface ApprovalDecisionPayload {
  comment?: string;
}