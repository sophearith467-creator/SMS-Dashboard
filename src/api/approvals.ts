// src/api/approvals.ts
import { http, request } from './client';
import type {
  ApprovalHistoryEntry,
  PendingApprovalItem,
  ApprovalDecisionPayload,
} from '../types/approval';

// Write actions — call the backend directly, no demo fallback.
// If the backend is down, the user should see a real error, not a fake success.

export async function submitMission(id: number) {
  const res = await http.post(`/api/missions/${id}/submit`);
  return res.data;
}

export async function approveMission(id: number, payload?: ApprovalDecisionPayload) {
  const res = await http.post(`/api/missions/${id}/approve`, payload);
  return res.data;
}

export async function rejectMission(id: number, payload?: ApprovalDecisionPayload) {
  const res = await http.post(`/api/missions/${id}/reject`, payload);
  return res.data;
}

export async function cancelMission(id: number) {
  const res = await http.post(`/api/missions/${id}/cancel`);
  return res.data;
}

// Read actions — use request() with a demo fallback, matching analytics.ts

export async function getApprovalHistory(missionId: number): Promise<ApprovalHistoryEntry[]> {
  return request<ApprovalHistoryEntry[]>(
    { url: `/api/missions/${missionId}/approvals` },
    () => []
  );
}

export async function getPendingApprovals(): Promise<PendingApprovalItem[]> {
  return request<PendingApprovalItem[]>(
    { url: '/api/missions/approvals/pending' },
    () => []
  );
}