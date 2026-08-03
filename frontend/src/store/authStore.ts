import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

interface User {
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          Cookies.set('accessToken', data.accessToken, { secure: true, sameSite: 'strict' });
          Cookies.set('refreshToken', data.refreshToken, { secure: true, sameSite: 'strict' });
          set({ user: { email: data.email, role: data.role }, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register({ email, password, fullName });
          Cookies.set('accessToken', data.accessToken, { secure: true, sameSite: 'strict' });
          Cookies.set('refreshToken', data.refreshToken, { secure: true, sameSite: 'strict' });
          set({ user: { email: data.email, role: data.role }, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          await authApi.logout(refreshToken).catch(() => {});
        }
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }
  )
);
