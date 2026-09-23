import { request } from './client';
import { demoState } from './demoStore';

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

interface PageEnvelope<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function fetchStaffList(): Promise<StaffOption[]> {
  return request<ApiEnvelope<PageEnvelope<StaffOption>>>(
    { url: '/api/users', params: { page: 1, pageSize: 500 } },
    () => ({
      success: true,
      message: 'Demo data',
      data: {
        items: demoState.users.map((u) => ({
          id: Number(u.id.replace(/\D/g, '')) || 0,
          fullName: u.fullName,
          employeeCode: u.id,
          jobLevel: 'STAFF',
          functionName: u.department,
          business: null,
          roles: u.roles,
        })),
        page: 1,
        pageSize: 500,
        total: demoState.users.length,
        totalPages: 1,
      },
    })
  ).then((res) => res.data.items);
}
