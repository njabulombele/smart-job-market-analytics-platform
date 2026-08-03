import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = Cookies.get('refreshToken');

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          Cookies.set('accessToken', data.accessToken, { secure: true, sameSite: 'strict' });
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
};

export const jobsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/jobs', { params }),
  get: (id: number) =>
    api.get(`/jobs/${id}`),
  search: (q: string, page = 0) =>
    api.get('/jobs/search', { params: { q, page } }),
  trending: (limit = 10) =>
    api.get('/jobs/trending', { params: { limit } }),
};

export const analyticsApi = {
  topSkills: (limit = 20) =>
    api.get('/analytics/skills/top', { params: { limit } }),
  topLocations: (limit = 10) =>
    api.get('/analytics/locations/top', { params: { limit } }),
  salaryStats: (skill?: string, city?: string) =>
    api.get('/analytics/salary', { params: { skill, city } }),
  trends: (skill: string, months = 12) =>
    api.get('/analytics/trends', { params: { skill, months } }),
};

export const aiApi = {
  matchResume: (formData: FormData) =>
    api.post('/ai/resume/match', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  predictSalary: (data: { experienceYears: number; skills: string[]; city: string; company?: string }) =>
    api.post('/ai/salary/predict', data),
  forecastDemand: (data: { skill: string; months: number }) =>
    api.post('/ai/demand/forecast', data),
  chat: (data: { message: string; sessionId?: string }) =>
    api.post('/ai/coach/chat', data),
};
