import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  fetchActivityReports,
  fetchMileageClaims,
  fetchMissionVehicleRequests,
  fetchSettlements,
  fetchVehicleRequests,
  createVehicleRequest,
  updateAnnexStatus,
  type AnnexKind } from
'../api/annexes';
import { queryKeys } from '../lib/queryKeys';
import type { CreateVehicleRequestInput, RecordStatus } from '../types/annex';
import { titleCase } from '../lib/utils';

export function useActivityReports() {
  return useQuery({ queryKey: queryKeys.annexes.activityReports, queryFn: fetchActivityReports });
}

export function useVehicleRequests() {
  return useQuery({ queryKey: queryKeys.annexes.vehicleRequests, queryFn: fetchVehicleRequests });
}

export function useMissionVehicleRequests(missionId: number | undefined) {
  return useQuery({
    queryKey: missionId == null
      ? ['missions', 'unknown', 'vehicle-requests']
      : queryKeys.missions.vehicleRequests(missionId),
    queryFn: () => fetchMissionVehicleRequests(missionId!),
    enabled: missionId != null,
  });
}

export function useCreateVehicleRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ missionId, input }: { missionId: number; input: CreateVehicleRequestInput }) =>
      createVehicleRequest(missionId, input),
    onSuccess: (request) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.missions.vehicleRequests(request.missionId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.annexes.vehicleRequests });
      toast.success('Vehicle request submitted');
    },
    onError: (error: Error) => toast.error(error.message || 'Could not create the vehicle request'),
  });
}

export function useMileageClaims() {
  return useQuery({ queryKey: queryKeys.annexes.mileageClaims, queryFn: fetchMileageClaims });
}

export function useSettlements() {
  return useQuery({ queryKey: queryKeys.annexes.settlements, queryFn: fetchSettlements });
}

const KEY_BY_KIND: Record<AnnexKind, readonly string[]> = {
  'activity-reports': queryKeys.annexes.activityReports,
  'vehicle-requests': queryKeys.annexes.vehicleRequests,
  'mileage-claims': queryKeys.annexes.mileageClaims,
  settlements: queryKeys.annexes.settlements
};

export function useAnnexStatusUpdate(kind: AnnexKind) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: RecordStatus }) =>
    updateAnnexStatus(kind, id, status),
    onSuccess: ({ status }) => {
      queryClient.invalidateQueries({ queryKey: KEY_BY_KIND[kind] });
      toast.success(`Marked as ${titleCase(status)}`);
    },
    onError: (error: Error) => toast.error(error.message || 'Could not update the record')
  });
}
