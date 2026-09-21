export type Role =
'ROLE_STAFF' |
'ROLE_FUNCTION_MANAGER' |
'ROLE_HRBP' |
'ROLE_FINANCE' |
'ROLE_BIZOPS' |
'ROLE_EXECUTIVE' |
'ROLE_ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: Role[];
  department?: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthUser {
  token: string;
}