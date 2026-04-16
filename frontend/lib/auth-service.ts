import api from './api';
import Cookies from 'js-cookie';

export type UserRole = 'candidat' | 'client' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending' | 'deleted';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  status: UserStatus;
  created_at: string;
  candidate?: {
    photo_url?: string;
  };
  client?: {
    company_name?: string;
    logo_url?: string;
  };
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export const TOKEN_KEY = 'opside_access_token';
export const REFRESH_KEY = 'opside_refresh_token';
export const USER_KEY = 'opside_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  Cookies.set('access_token', access, { path: '/', expires: 7 });
  Cookies.set('refresh_token', refresh, { path: '/', expires: 7 });
}

export function setUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  Cookies.set('user', JSON.stringify(user), { path: '/', expires: 7 });
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  Cookies.remove('access_token', { path: '/' });
  Cookies.remove('refresh_token', { path: '/' });
  Cookies.remove('user', { path: '/' });
}

export const clearTokens = clearAuth;

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getDashboardByRole(role: UserRole): string {
  if (role === 'admin') return '/admin/users';
  if (role === 'candidat') return '/candidat/dashboard';
  return '/client/dashboard';
}

export const authApi = {
  register: (data: any) => api.post<AuthResponse>('/auth/register', data),
  login: (email: string, password: string) => api.post<AuthResponse>('/auth/login', { email, password }),
  logout: (refresh_token: string) => api.post('/auth/logout', { refresh_token }),
  me: () => api.get<User>('/auth/me'),
  verifyEmail: (token: string) => api.get<AuthResponse>(`/auth/verify-email?token=${token}`),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
};
