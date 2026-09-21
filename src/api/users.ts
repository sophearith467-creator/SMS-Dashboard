import type { DirectoryUser } from '../data/users';
import type { Role } from '../types/auth';
import { request } from './client';
import { demoState } from './demoStore';

export async function fetchUsers(): Promise<DirectoryUser[]> {
  return request<DirectoryUser[]>({ url: '/api/users' }, () => [...demoState.users]);
}

export async function updateUserStatus(
id: string,
status: DirectoryUser['status'])
: Promise<DirectoryUser> {
  return request<DirectoryUser>(
    { url: `/api/users/${id}`, method: 'PATCH', data: { status } },
    () => {
      demoState.users = demoState.users.map((user) =>
      user.id === id ? { ...user, status } : user
      );
      return demoState.users.find((user) => user.id === id) as DirectoryUser;
    }
  );
}

export async function updateUserRoles(id: string, roles: Role[]): Promise<DirectoryUser> {
  return request<DirectoryUser>(
    { url: `/api/users/${id}/roles`, method: 'PUT', data: { roles } },
    () => {
      demoState.users = demoState.users.map((user) => user.id === id ? { ...user, roles } : user);
      return demoState.users.find((user) => user.id === id) as DirectoryUser;
    }
  );
}