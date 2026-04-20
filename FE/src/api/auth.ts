import api from './client';
import type { User } from '@/types/api';

export interface LoginDto { email: string; password: string; }
export interface RegisterDto { email: string; password: string; firstName: string; lastName: string; role: 'client' | 'performer'; }

export const authApi = {
  login: (dto: LoginDto) =>
    api.post<{ data: { user: User; accessToken: string } }>('/auth/login', dto).then((r) => r.data.data),

  register: (dto: RegisterDto) =>
    api.post<{ data: { user: User; accessToken: string } }>('/auth/register', dto).then((r) => r.data.data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<{ data: User }>('/users/me').then((r) => r.data.data),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};