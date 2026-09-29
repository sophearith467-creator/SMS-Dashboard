import type {
  ActivityReport,
  MileageClaim,
  RecordStatus,
  SettlementRecord,
  VehicleRequest } from
'../types/annex';
import { request } from './client';
import { demoState } from './demoStore';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

function unwrap<T>(res: ApiEnvelope<T> | T): T {
  if (res && typeof res === 'object' && 'success' in (res as object) && 'data' in (res as object)) {
    return (res as ApiEnvelope<T>).data;
  }
  return res as T;
}

export async function fetchActivityReports(): Promise<ActivityReport[]> {
  const res = await request<ApiEnvelope<ActivityReport[]> | ActivityReport[]>(
    { url: '/api/annexes/activity-reports' },
    () => [...demoState.activityReports]
  );
  return unwrap(res) ?? [];
}

export async function fetchVehicleRequests(): Promise<VehicleRequest[]> {
  const res = await request<ApiEnvelope<VehicleRequest[]> | VehicleRequest[]>(
    { url: '/api/annexes/vehicle-requests' },
    () => [...demoState.vehicleRequests]
  );
  return unwrap(res) ?? [];
}

export async function fetchMileageClaims(): Promise<MileageClaim[]> {
  const res = await request<ApiEnvelope<MileageClaim[]> | MileageClaim[]>(
    { url: '/api/annexes/mileage-claims' },
    () => [...demoState.mileageClaims]
  );
  return unwrap(res) ?? [];
}

export async function fetchSettlements(): Promise<SettlementRecord[]> {
  const res = await request<ApiEnvelope<SettlementRecord[]> | SettlementRecord[]>(
    { url: '/api/settlements' },
    () => [...demoState.settlements]
  );
  return unwrap(res) ?? [];
}

export type AnnexKind = 'activity-reports' | 'vehicle-requests' | 'mileage-claims' | 'settlements';

export async function updateAnnexStatus(
  kind: AnnexKind,
  id: number,
  status: RecordStatus
): Promise<{ id: number; status: RecordStatus }> {
  const endpoint = kind === 'settlements' ? `/api/settlements/${id}` : `/api/annexes/${kind}/${id}`;

  const res = await request<ApiEnvelope<{ id: number; status: string }> | { id: number; status: string }>(
    { url: endpoint, method: 'PATCH', data: { status } },
    () => {
      if (kind === 'activity-reports') {
        demoState.activityReports = demoState.activityReports.map((r) =>
          r.id === id ? { ...r, status: status as ActivityReport['status'] } : r
        );
      } else if (kind === 'vehicle-requests') {
        demoState.vehicleRequests = demoState.vehicleRequests.map((r) =>
          r.id === id ? { ...r, status: status as VehicleRequest['status'] } : r
        );
      } else if (kind === 'mileage-claims') {
        demoState.mileageClaims = demoState.mileageClaims.map((r) =>
          r.id === id ? { ...r, status: status as MileageClaim['status'] } : r
        );
      } else {
        demoState.settlements = demoState.settlements.map((r) =>
          r.id === id ? { ...r, status: status as SettlementRecord['status'] } : r
        );
      }
      return { id, status };
    }
  );

  const unwrapped = unwrap(res);
  return { id: unwrapped.id, status: unwrapped.status as RecordStatus };
}
