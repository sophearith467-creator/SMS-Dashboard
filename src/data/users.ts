import type { AuthUser, Role } from '../types/auth';

export interface DirectoryUser extends AuthUser {
  department: string;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  lastActiveAt: string;
  missions: number;
}

export const DIRECTORY_USERS: DirectoryUser[] = [
{
  id: 'u-001',
  email: 'amara.okoye@nexus.com',
  fullName: 'Amara Okoye',
  roles: ['ROLE_ADMIN', 'ROLE_BIZOPS'],
  department: 'Business Operations',
  status: 'ACTIVE',
  lastActiveAt: '2026-09-20T07:12:00Z',
  missions: 34
},
{
  id: 'u-002',
  email: 'daniel.reyes@nexus.com',
  fullName: 'Daniel Reyes',
  roles: ['ROLE_FUNCTION_MANAGER'],
  department: 'Field Operations',
  status: 'ACTIVE',
  lastActiveAt: '2026-09-19T16:40:00Z',
  missions: 21
},
{
  id: 'u-003',
  email: 'lena.fischer@nexus.com',
  fullName: 'Lena Fischer',
  roles: ['ROLE_HRBP'],
  department: 'People & Culture',
  status: 'ACTIVE',
  lastActiveAt: '2026-09-19T11:05:00Z',
  missions: 12
},
{
  id: 'u-004',
  email: 'tomas.eriksen@nexus.com',
  fullName: 'Tomas Eriksen',
  roles: ['ROLE_FINANCE'],
  department: 'Finance',
  status: 'ACTIVE',
  lastActiveAt: '2026-09-18T09:22:00Z',
  missions: 8
},
{
  id: 'u-005',
  email: 'priya.nair@nexus.com',
  fullName: 'Priya Nair',
  roles: ['ROLE_EXECUTIVE'],
  department: 'Executive Office',
  status: 'ACTIVE',
  lastActiveAt: '2026-09-20T06:02:00Z',
  missions: 5
},
{
  id: 'u-006',
  email: 'james.okafor@nexus.com',
  fullName: 'James Okafor',
  roles: ['ROLE_STAFF'],
  department: 'Field Operations',
  status: 'ACTIVE',
  lastActiveAt: '2026-09-17T14:48:00Z',
  missions: 17
},
{
  id: 'u-007',
  email: 'sofia.marino@nexus.com',
  fullName: 'Sofia Marino',
  roles: ['ROLE_STAFF'],
  department: 'Programmes',
  status: 'INVITED',
  lastActiveAt: '2026-09-12T10:15:00Z',
  missions: 0
},
{
  id: 'u-008',
  email: 'kwame.mensah@nexus.com',
  fullName: 'Kwame Mensah',
  roles: ['ROLE_BIZOPS'],
  department: 'Business Operations',
  status: 'SUSPENDED',
  lastActiveAt: '2026-08-29T08:31:00Z',
  missions: 9
}];


export const DEMO_PASSWORD = 'demo1234';

export const DEMO_ACCOUNTS: Array<{email: string;label: string;role: Role;}> = [
{ email: 'amara.okoye@nexus.com', label: 'Amara Okoye', role: 'ROLE_ADMIN' },
{ email: 'daniel.reyes@nexus.com', label: 'Daniel Reyes', role: 'ROLE_FUNCTION_MANAGER' },
{ email: 'tomas.eriksen@nexus.com', label: 'Tomas Eriksen', role: 'ROLE_FINANCE' },
{ email: 'james.okafor@nexus.com', label: 'James Okafor', role: 'ROLE_STAFF' }];