import type { DirectoryUser } from '../data/users';
import type { Role } from '../types/auth';
import { request, ApiError } from './client';
import { demoState } from './demoStore';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface BackendUser {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  jobLevel: string;
  functionName: string | null;
  business: string | null;
  isActive: boolean;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface BackendPage {
  items: BackendUser[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FetchUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CreateUserPayload {
  employeeCode: string;
  fullName: string;
  email: string;
  password: string;
  jobLevel: string;
  functionName?: string;
  business?: string;
  roles: Role[];
}

export interface UpdateUserPayload {
  fullName: string;
  jobLevel: string;
  functionName?: string;
  business?: string;
  roles: Role[];
  isActive: boolean;
}

function mapBackendUser(u: BackendUser): DirectoryUser {
  return {
    id: String(u.id),
    fullName: u.fullName,
    email: u.email,
    department: u.functionName || u.business || '—',
    roles: u.roles ?? [],
    missions: 0,
    lastActiveAt: u.updatedAt,
    status: u.isActive ? 'ACTIVE' : 'SUSPENDED',
  };
}

function matchesSearch(user: DirectoryUser, search: string) {
  return [user.fullName, user.email, user.department]
    .join(' ')
    .toLowerCase()
    .includes(search.trim().toLowerCase());
}

export async function fetchUsers({
  page = 1,
  pageSize = 10,
  search = '',
}: FetchUsersParams = {}): Promise<PaginatedResult<DirectoryUser>> {
  const res = await request<ApiResponse<BackendPage> | PaginatedResult<DirectoryUser>>(
    { url: '/api/users', params: { page, pageSize, search: search.trim() || undefined } },
    () => {
      const filtered = search.trim()
        ? demoState.users.filter((u) => matchesSearch(u, search))
        : demoState.users;
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      return {
        items: filtered.slice(start, start + pageSize),
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      };
    }
  );

  if ('success' in res) {
    const { items, ...rest } = res.data;
    return { ...rest, items: items.map(mapBackendUser) };
  }
  return res;
}

export async function fetchUserById(id: string): Promise<DirectoryUser> {
  const res = await request<ApiResponse<BackendUser> | DirectoryUser>(
    { url: `/api/users/${id}` },
    () => {
      const user = demoState.users.find((u) => u.id === id);
      if (!user) throw new ApiError('User not found', 404);
      return user;
    }
  );
  if ('data' in res && res.data) return mapBackendUser(res.data as BackendUser);
  return res as DirectoryUser;
}

export async function createUser(payload: CreateUserPayload): Promise<DirectoryUser> {
  const res = await request<ApiResponse<BackendUser> | DirectoryUser>(
    { url: '/api/users', method: 'POST', data: payload },
    () => {
      const newUser: DirectoryUser = {
        id: `u-${Date.now()}`,
        fullName: payload.fullName,
        email: payload.email,
        department: payload.functionName || payload.business || '—',
        roles: payload.roles,
        missions: 0,
        lastActiveAt: new Date().toISOString(),
        status: 'ACTIVE',
      };
      demoState.users = [newUser, ...demoState.users];
      return newUser;
    }
  );
  if ('data' in res && res.data) return mapBackendUser(res.data as BackendUser);
  return res as DirectoryUser;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<DirectoryUser> {
  const res = await request<ApiResponse<BackendUser> | DirectoryUser>(
    { url: `/api/users/${id}`, method: 'PUT', data: payload },
    () => {
      demoState.users = demoState.users.map((user) =>
        user.id === id
          ? {
              ...user,
              fullName: payload.fullName,
              department: payload.functionName || payload.business || user.department,
              roles: payload.roles,
              status: payload.isActive ? 'ACTIVE' : 'SUSPENDED',
            }
          : user
      );
      return demoState.users.find((user) => user.id === id) as DirectoryUser;
    }
  );
  if ('data' in res && res.data) return mapBackendUser(res.data as BackendUser);
  return res as DirectoryUser;
}

export async function deactivateUser(id: string): Promise<DirectoryUser> {
  const res = await request<ApiResponse<BackendUser> | DirectoryUser>(
    { url: `/api/users/${id}`, method: 'DELETE' },
    () => {
      demoState.users = demoState.users.map((user) =>
        user.id === id ? { ...user, status: 'SUSPENDED' as const } : user
      );
      return demoState.users.find((user) => user.id === id) as DirectoryUser;
    }
  );
  if ('data' in res && res.data) return mapBackendUser(res.data as BackendUser);
  return res as DirectoryUser;
}
