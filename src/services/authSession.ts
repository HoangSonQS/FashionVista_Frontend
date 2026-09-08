import { AUTH_CHANGE_EVENT, ADMIN_AUTH_CHANGE_EVENT } from '../constants/events';
import type { AuthResponse } from '../types/auth';

type AuthKind = 'user' | 'admin';

let userAuth: AuthResponse | null = null;
let adminAuth: AuthResponse | null = null;

const normalizeAuth = (auth: AuthResponse | null): AuthResponse | null => {
  if (!auth) return null;
  const token = auth.accessToken || auth.token;
  return { ...auth, token, accessToken: token, refreshToken: undefined as unknown as string };
};

export const setAuthSession = (kind: AuthKind, auth: AuthResponse | null) => {
  const normalized = normalizeAuth(auth);
  if (kind === 'admin') {
    adminAuth = normalized;
    window.dispatchEvent(new Event(ADMIN_AUTH_CHANGE_EVENT));
    return;
  }
  userAuth = normalized;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const getAuthSession = (kind: AuthKind = 'user') => (kind === 'admin' ? adminAuth : userAuth);

export const getAccessToken = (kind: AuthKind = 'user') => getAuthSession(kind)?.token || null;

export const clearAuthSession = (kind: AuthKind) => setAuthSession(kind, null);
