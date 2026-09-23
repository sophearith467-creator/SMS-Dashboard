import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchMission, fetchMissionAllowance, fetchMissions, submitMission, updateMission, deleteMission } from '../api/missions';
import { queryKeys } from '../lib/queryKeys';
import type { MissionInput } from '../types/mission';

export function useMissions() {
  return useQuery({ queryKey: queryKeys.missions.all, queryFn: fetchMissions });
}

export function useMission(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.missions.detail(String(id ?? '')),
    queryFn: () => fetchMission(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MissionInput) => submitMission(input),
    onSuccess: (mission) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.summary });
      toast.success(`${mission.missionCode ?? 'Mission'} submitted`);
    },
    onError: (error: Error) => toast.error(error.message || 'Could not create the mission'),
  });
}

export function useUpdateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<MissionInput> }) => updateMission(id, input),
    onSuccess: (mission) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.missions.detail(String(mission.id)) });
      toast.success(`${mission.missionCode ?? 'Mission'} updated`);
    },
    onError: (error: Error) => toast.error(error.message || 'Could not update the mission'),
  });
}

export function useMissionAllowance(id: number | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.missions.allowance(String(id ?? '')),
    queryFn: async () => {
      const mission = await fetchMissionAllowance(id as number);
      queryClient.setQueryData(queryKeys.missions.detail(String(id)), mission);
      return mission;
    },
    enabled: false,
  });
}

export function useDeleteMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions.all });
      toast.success('Mission deleted');
    },
    onError: (error: Error) => toast.error(error.message || 'Could not delete the mission'),
  });
}
