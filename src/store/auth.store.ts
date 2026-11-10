import { create } from 'zustand';
import { api } from '@/lib/api';
import type { AuthUser, User } from '@/types';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest';

interface RegisterValues {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  fetchMe: () => Promise<void>;
  login: (values: { email: string; password: string }) => Promise<AuthUser>;
  register: (values: RegisterValues) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setGuest: () => void;
}

const toAuthUser = (user: User): AuthUser => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

/**
 * The user lives in memory only. The token lives in an httpOnly cookie
 * set by the backend — nothing is ever written to localStorage.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  fetchMe: async () => {
    set({ status: 'loading' });
    try {
      const { data } = await api.get<AuthUser>('/auth/me');
      set({ user: data, status: 'authenticated' });
    } catch {
      set({ user: null, status: 'guest' });
    }
  },

  login: async (values) => {
    const { data } = await api.post<{ user: User }>('/auth/login', values);
    const user = toAuthUser(data.user);
    set({ user, status: 'authenticated' });
    return user;
  },

  register: async (values) => {
    const { data } = await api.post<{ user: User }>('/auth/register', values);
    const user = toAuthUser(data.user);
    set({ user, status: 'authenticated' });
    return user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null, status: 'guest' });
    }
  },

  setGuest: () => set({ user: null, status: 'guest' }),
}));