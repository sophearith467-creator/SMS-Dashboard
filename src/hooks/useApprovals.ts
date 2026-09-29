// src/hooks/useApprovals.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  submitMission,
  approveMission,
  rejectMission,
  cancelMission,
  getApprovalHistory,
  getPendingApprovals,
} from '../api/approvals';
import { queryKeys } from '../lib/queryKeys';

export function usePendingApprovals() {
  return useQuery({
    queryKey: queryKeys.approvals.pending,
    queryFn: getPendingApprovals,
  });
}

export function useApprovalHistory(missionId: number) {
  return useQuery({
    queryKey: queryKeys.approvals.history(missionId),
    queryFn: () => getApprovalHistory(missionId),
    enabled: !!missionId,
  });
}

export function useSubmitMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => submitMission(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.missions.all });
      qc.invalidateQueries({ queryKey: queryKeys.approvals.pending });
    },
  });
}

export function useApproveMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      approveMission(id, { comment }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.missions.all });
      qc.invalidateQueries({ queryKey: queryKeys.approvals.pending });
      qc.invalidateQueries({ queryKey: queryKeys.approvals.history(variables.id) });
    },
  });
}

export function useRejectMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      rejectMission(id, { comment }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.missions.all });
      qc.invalidateQueries({ queryKey: queryKeys.approvals.pending });
      qc.invalidateQueries({ queryKey: queryKeys.approvals.history(variables.id) });
    },
  });
}

export function useCancelMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelMission(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.missions.all });
    },
  });
}
