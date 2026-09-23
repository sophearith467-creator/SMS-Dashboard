import type { Mission, MissionInput } from '../types/mission';
import { http, request } from './client';

export async function fetchMissions(): Promise<Mission[]> {
  return request<Mission[]>({ url: '/api/missions' }, () => []);
}

export async function fetchMission(id: number): Promise<Mission> {
  return request<Mission>({ url: `/api/missions/${id}` }, () => {
    throw new Error('Mission not found');
  });
}

export async function fetchMissionAllowance(id: number): Promise<Mission> {
  const res = await http.get<Mission>(`/api/missions/${id}/allowances`);
  return res.data;
}

export async function submitMission(input: MissionInput): Promise<Mission> {
  const res = await http.post<Mission>('/api/missions', input);
  return res.data;
}

export async function updateMission(id: number, input: Partial<MissionInput>): Promise<Mission> {
  const res = await http.put<Mission>(`/api/missions/${id}`, input);
  return res.data;
}

export async function deleteMission(id: number): Promise<void> {
  await http.delete(`/api/missions/${id}`);
}
