import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearSession, login as loginRequest, persistSession, readSession } from '../api/auth';
import { UNAUTHORIZED_EVENT } from '../api/client';
import type { AuthUser, LoginRequest, Role } from '../types/auth';
import { hasAnyRole, primaryRole } from '../lib/roles';
import { DIRECTORY_USERS } from '../data/users';
import { useScreenInit } from '../useScreenInit.js';

function userFromEmail(email: string): AuthUser | null {
  const match = DIRECTORY_USERS.find((candidate) => candidate.email === email);
  if (!match) return null;
  const { status, lastActiveAt, missions, ...authUser } = match;
  return authUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  role: Role;
  signIn: (payload: LoginRequest) => Promise<AuthUser>;
  signOut: () => void;
  can: (roles?: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const screenInit = useScreenInit() as {screenUser?: string | null;};

  useEffect(() => {
    if ('screenUser' in screenInit) {
      setUser(screenInit.screenUser ? userFromEmail(screenInit.screenUser) : null);
    } else {
      setUser(readSession());
    }
    setIsBootstrapping(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    const handler = () => signOut();
    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
  }, [signOut]);

  const signIn = useCallback(async (payload: LoginRequest) => {
    const session = await loginRequest(payload);
    const authUser = persistSession(session);
    setUser(authUser);
    return authUser;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      role: primaryRole(user?.roles ?? ['ROLE_STAFF']),
      signIn,
      signOut,
      can: (roles) => hasAnyRole(user?.roles ?? [], roles)
    }),
    [user, isBootstrapping, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}