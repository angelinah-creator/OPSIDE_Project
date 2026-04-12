'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setTokens, setUser, clearAuth, getUser } from '@/lib/auth';
import { User, AuthResponse } from '@/types';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const register = async (data: {
    email: string;
    password: string;
    role: 'candidat' | 'client';
    first_name: string;
    last_name: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<AuthResponse>('/auth/register', data);
      setTokens(res.data.access_token, res.data.refresh_token);
      setUser(res.data.user);
      return res.data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erreur lors de l'inscription";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      setTokens(res.data.access_token, res.data.refresh_token);
      setUser(res.data.user);
      const role = res.data.user.role;
      if (role === 'admin') router.push('/admin');
      else if (role === 'candidat') router.push('/candidat/dashboard');
      else router.push('/client/dashboard');
      return res.data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Email ou mot de passe incorrect';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', { refresh_token: localStorage.getItem('opside_refresh_token') });
    } catch (_) {}
    clearAuth();
    router.push('/');
  };

  const me = async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    setUser(res.data);
    return res.data;
  };

  return { register, login, logout, me, loading, error };
}
