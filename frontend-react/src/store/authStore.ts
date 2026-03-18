import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'BOOTH_OFFICER' | null;

interface User {
  id: number;
  username: string;
  role: UserRole;
  school_id?: number;
  booth_id?: number;
  school_code?: string;
  school_name?: string;
  school_logo?: string;
  must_change_password?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setPasswordChanged: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setPasswordChanged: () => set((state) => ({
        user: state.user ? { ...state.user, must_change_password: 0 } : null
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
