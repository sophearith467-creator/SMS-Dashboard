import type {
  ActivityReport,
  MileageClaim,
  RecordStatus,
  SettlementRecord,
  VehicleRequest } from
'../types/annex';
import { request } from './client';
import { demoState } from './demoStore';

export async function fetchActivityReports(): Promise<ActivityReport[]> {
  return request<ActivityReport[]>({ url: '/api/annexes/activity-reports' }, () => [
  ...demoState.activityReports]
  );
}

export async function fetchVehicleRequests(): Promise<VehicleRequest[]> {
  return request<VehicleRequest[]>({ url: '/api/annexes/vehicle-requests' }, () => [
  ...demoState.vehicleRequests]
  );
}

export async function fetchMileageClaims(): Promise<MileageClaim[]> {
  return request<MileageClaim[]>({ url: '/api/annexes/mileage-claims' }, () => [
  ...demoState.mileageClaims]
  );
}

export async function fetchSettlements(): Promise<SettlementRecord[]> {
  return request<SettlementRecord[]>({ url: '/api/settlements' }, () => [...demoState.settlements]);
}

export type AnnexKind = 'activity-reports' | 'vehicle-requests' | 'mileage-claims' | 'settlements';

export async function updateAnnexStatus(
kind: AnnexKind,
id: string,
status: RecordStatus)
: Promise<{id: string;status: RecordStatus;}> {
  const endpoint = kind === 'settlements' ? `/api/settlements/${id}` : `/api/annexes/${kind}/${id}`;

  return request<{id: string;status: RecordStatus;}>(
    { url: endpoint, method: 'PATCH', data: { status } },
    () => {
      if (kind === 'activity-reports') {
        demoState.activityReports = demoState.activityReports.map((r) =>
        r.id === id ? { ...r, status } : r
        );
      } else if (kind === 'vehicle-requests') {
        demoState.vehicleRequests = demoState.vehicleRequests.map((r) =>
        r.id === id ? { ...r, status } : r
        );
      } else if (kind === 'mileage-claims') {
        demoState.mileageClaims = demoState.mileageClaims.map((r) =>
        r.id === id ? { ...r, status } : r
        );
      } else {
        demoState.settlements = demoState.settlements.map((r) =>
        r.id === id ? { ...r, status } : r
        );
      }
      return { id, status };
    }
  );
}