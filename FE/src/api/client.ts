import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = axios
            .post<{ data: { accessToken: string } }>('/api/auth/refresh', {}, { withCredentials: true })
            .then((r) => r.data.data.accessToken)
            .finally(() => { refreshing = null; });
        }
        const newToken = await refreshing;
        useAuthStore.getState().setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/auth';
      }
    }
    return Promise.reject(err);
  },
);

export default api;