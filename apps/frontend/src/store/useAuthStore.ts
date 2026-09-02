import { create } from 'zustand';
import { UserDTO } from '@reachinbox/shared-types';
import { api } from '../lib/api';

interface AuthState {
  user: UserDTO | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: (mockProfile?: Partial<UserDTO>) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  loginWithGoogle: async (mockProfile) => {
    try {
      set({ isLoading: true });
      const payload = mockProfile || {
        email: 'alex.johnson@reachinbox.ai',
        name: 'Alex Johnson',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        googleId: 'google-uid-demo-999',
      };

      const res = await api.post('/auth/google', payload);
      if (res.data.success) {
        const { user, token } = res.data.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ user, token, isAuthenticated: true, isLoading: false });
      }
    } catch (err) {
      console.error('Google login failed:', err);
      set({ isLoading: false });
    }
  },

  fetchCurrentUser: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/auth/me');
      if (res.data.success) {
        const { user, token } = res.data.data;
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ user, token: token || localStorage.getItem('token'), isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
