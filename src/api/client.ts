import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { sleep } from '../lib/utils';

export const API_BASE_URL = 'http://localhost:8080';
export const TOKEN_KEY = 'mms.token';
export const USER_KEY = 'mms.user';

export const UNAUTHORIZED_EVENT = 'mms:unauthorized';

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 2500,
  headers: { 'Content-Type': 'application/json' }
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.set?.('Authorization', `Bearer ${token}`);
  }
  return config;
});

/**
 * `null` = not probed yet, `true` = live backend, `false` = unreachable (demo data).
 */
let backendOnline: boolean | null = null;

export function backendStatus(): 'unknown' | 'online' | 'offline' {
  if (backendOnline === null) return 'unknown';
  return backendOnline ? 'online' : 'offline';
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function resolveFallback<T>(fallback: () => T | Promise<T>): Promise<T> {
  await sleep(240 + Math.random() * 260);
  return fallback();
}

/**
 * Calls the real API first. If the backend is unreachable (network error, CORS,
 * timeout or 5xx) the request transparently resolves against the local demo
 * dataset so the product stays fully explorable without a running server.
 */
export async function request<T>(
config: AxiosRequestConfig,
fallback: () => T | Promise<T>)
: Promise<T> {
  if (backendOnline === false) return resolveFallback(fallback);

  try {
    const response = await http.request<T>(config);
    backendOnline = true;
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{message?: string;}>;

    if (!axiosError.response) {
      backendOnline = false;
      return resolveFallback(fallback);
    }

    backendOnline = true;
    const { status, data } = axiosError.response;

    if (status >= 500) return resolveFallback(fallback);

    if (status === 401) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    throw new ApiError(data?.message ?? axiosError.message ?? 'Request failed', status);
  }
}