import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  fetchMission,
  fetchMissionAllowance,
  fetchMissions,
  submitApprovalDecision,
  submitMission } from
'../api/missions';
import { useAuth } from '../context/AuthContext';
import { queryKeys } from '../lib/queryKeys';
import type { ApprovalActionInput, MissionInput } from '../types/mission';

export function useMissions() {
  return useQuery({ queryKey: queryKeys.missions.all, queryFn: fetchMissions });
}

export function useMission(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.missions.detail(id ?? ''),
    queryFn: () => fetchMission(id as string),
    enabled: Boolean(id)
  });
}

export function useMissionAllowance(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.missions.allowance(id ?? ''),
    queryFn: () => fetchMissionAllowance(id as string),
    enabled: false
  });
}

export function useCreateMission() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: MissionInput) => submitMission(input, user!),
    onSuccess: (mission) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.summary });
      toast.success(`${mission.reference} submitted for approval`);
    },
    onError: (error: Error) => toast.error(error.message || 'Could not create the mission')
  });
}

export function useApprovalDecision() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: ApprovalActionInput) => submitApprovalDecision(input, user!),
    onSuccess: (mission) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.missions.detail(mission.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.summary });
      toast.success(
        mission.status === 'REJECTED' ?
        `${mission.reference} rejected` :
        `${mission.reference} approved`
      );
    },
    onError: (error: Error) => toast.error(error.message || 'Could not record the decision')
  });
}