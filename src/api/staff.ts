import { http } from './client';

export interface StaffOption {
  id: number;
  fullName: string;
  employeeCode: string;
  jobLevel: string;
  functionName: string | null;
  business: string | null;
  roles: string[];
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchStaffList(): Promise<StaffOption[]> {
  const res = await http.get<ApiEnvelope<StaffOption[]>>('/api/users');
  return res.data.data;
}
