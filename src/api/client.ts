import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { ua } from '@/i18n/ua';
import { useSessionStore } from '@/stores/session';
import type { ApiErrorBody, Session } from './types';

export const CSRF_HEADER = 'x-sg-csrf';

export const api = axios.create({ baseURL: '/api/v1', withCredentials: true });

let refreshing: Promise<Session | null> | null = null;

export function refreshSession(): Promise<Session | null> {
  refreshing ??= axios
    .post<Session>('/api/v1/auth/refresh', null, {
      withCredentials: true,
      headers: { [CSRF_HEADER]: '1' },
    })
    .then(({ data }) => {
      useSessionStore.getState().setSession(data);
      return data;
    })
    .catch(() => {
      useSessionStore.getState().clear();
      return null;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

api.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetriableConfig | undefined;
  const hadToken = Boolean(config?.headers?.Authorization);
  if (error.response?.status !== 401 || !config || config._retried || !hadToken) throw error;
  config._retried = true;
  const session = await refreshSession();
  if (!session) throw error;
  config.headers = { ...config.headers, Authorization: `Bearer ${session.accessToken}` };
  return api(config);
});

export interface NormalizedError {
  code: string;
  message: string;
  details: { field: string; message: string }[];
  status: number | null;
}

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error) {
      return {
        code: body.error.code,
        message: body.error.message,
        details: body.error.details ?? [],
        status: error.response?.status ?? null,
      };
    }
    if (!error.response) {
      return { code: 'NETWORK', message: ua.common.noConnection, details: [], status: null };
    }
    return {
      code: 'HTTP',
      message: ua.common.genericError,
      details: [],
      status: error.response.status,
    };
  }
  return { code: 'UNKNOWN', message: ua.common.genericError, details: [], status: null };
}

export function errorMessage(error: unknown) {
  return normalizeError(error).message;
}

export function errorCode(error: unknown) {
  return normalizeError(error).code;
}
