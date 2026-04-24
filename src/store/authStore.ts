import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

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
        set({ token, isAdmin: true });
      },

      logout: () => {
        supabase.auth.signOut();
        set({ token: null, isAdmin: false });
      },
    }),
    {
      name: 'northernwest-auth',
    }
  )
);
