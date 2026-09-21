import type { Role } from '../types/auth';

export const ROLE_LABELS: Record<Role, string> = {
  ROLE_STAFF: 'Staff',
  ROLE_FUNCTION_MANAGER: 'Function Manager',
  ROLE_HRBP: 'HR Business Partner',
  ROLE_FINANCE: 'Finance',
  ROLE_BIZOPS: 'Business Operations',
  ROLE_EXECUTIVE: 'Executive',
  ROLE_ADMIN: 'Administrator'
};

export const APPROVER_ROLES: Role[] = [
'ROLE_FUNCTION_MANAGER',
'ROLE_HRBP',
'ROLE_FINANCE',
'ROLE_BIZOPS',
'ROLE_EXECUTIVE',
'ROLE_ADMIN'];


export function roleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? role;
}

export function primaryRole(roles: Role[]): Role {
  const precedence: Role[] = [
  'ROLE_ADMIN',
  'ROLE_EXECUTIVE',
  'ROLE_BIZOPS',
  'ROLE_FINANCE',
  'ROLE_HRBP',
  'ROLE_FUNCTION_MANAGER',
  'ROLE_STAFF'];

  return precedence.find((role) => roles.includes(role)) ?? 'ROLE_STAFF';
}

export function hasAnyRole(userRoles: Role[], allowed?: Role[]): boolean {
  if (!allowed || allowed.length === 0) return true;
  return userRoles.some((role) => allowed.includes(role));
}