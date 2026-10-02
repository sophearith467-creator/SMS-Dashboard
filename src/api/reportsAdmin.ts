import { request, ApiError } from './client';
import type { ActivityReport } from '../types/annex';
import type { MissionLite } from '../components/missions/ReportFormModal';

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}

function unwrap<T>(res: Envelope<T> | T): T {
  if (res && typeof res === 'object' && 'success' in (res as object) && 'data' in (res as object)) {
    return (res as Envelope<T>).data;
  }
  return res as T;
}

const offline = (): never => {
  throw new ApiError('Backend is offline - nothing was saved', 503);
};

export async function createReport(missionId: number, body: Partial<ActivityReport>): Promise<ActivityReport> {
  const res = await request<Envelope<ActivityReport> | ActivityReport>(
    { url: `/api/missions/${missionId}/reports`, method: 'POST', data: body },
    offline
  );
  return unwrap(res);
}

export async function addReportComment(missionId: number, reportId: number, comment: string): Promise<ActivityReport> {
  const res = await request<Envelope<ActivityReport> | ActivityReport>(
    { url: `/api/missions/${missionId}/reports/${reportId}/comment`, method: 'POST', data: { comment } },
    offline
  );
  return unwrap(res);
}

export async function deleteReport(missionId: number, reportId: number): Promise<void> {
  await request<unknown>({ url: `/api/missions/${missionId}/reports/${reportId}`, method: 'DELETE' }, offline);
}

export async function fetchMissionsLite(): Promise<MissionLite[]> {
  const res = await request<unknown>({ url: '/api/missions' }, () => []);
  const d = unwrap(res as Envelope<unknown> | unknown) as { content?: MissionLite[] } | MissionLite[] | null;
  return Array.isArray(d) ? d : d?.content ?? [];
}
