import { ApiError, TOKEN_KEY, USER_KEY, request } from './client';
import { DEMO_PASSWORD, DIRECTORY_USERS } from '../data/users';
import type { AuthUser, LoginRequest, LoginResponse } from '../types/auth';

function demoLogin({ email, password }: LoginRequest): LoginResponse {
  const user = DIRECTORY_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    throw new ApiError('No account matches that email address.', 401);
  }
  if (password !== DEMO_PASSWORD) {
    throw new ApiError('Incorrect password. Try the demo password shown below.', 401);
  }
  if (user.status === 'SUSPENDED') {
    throw new ApiError('This account has been suspended. Contact an administrator.', 403);
  }

  return {
    token: `demo.${btoa(user.email)}.${Date.now()}`,
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles,
    department: user.department
  };
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>(
    { url: '/api/auth/login', method: 'POST', data: payload },
    () => demoLogin(payload)
  );
}

export function persistSession(session: LoginResponse): AuthUser {
  const { token, ...user } = session;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function readSession(): AuthUser | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);
  if (!token || !raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    clearSession();
    return null;
  }
}