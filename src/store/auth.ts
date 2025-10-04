import { create } from 'zustand';

type AuthUser = {
  id: string;
  email: string | null;
  avatarUrl: string | null;
} | null;

type AuthState = {
  isLoggedIn: boolean;
  user: AuthUser;
  setUser: (user: AuthUser) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  clear: () => set({ user: null, isLoggedIn: false }),
}));