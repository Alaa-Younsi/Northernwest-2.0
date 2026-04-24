import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  token: string | null;
  isAdmin: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      isAdmin: false,

      setToken: (token) => {
        localStorage.setItem('nw_admin_token', token);
        set({ token, isAdmin: true });
      },

      logout: () => {
        localStorage.removeItem('nw_admin_token');
        set({ token: null, isAdmin: false });
      },
    }),
    {
      name: 'northernwest-auth',
    }
  )
);
