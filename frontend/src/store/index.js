import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      profileCompleted: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.login({ email, password });
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          set({
            user: data.user,
            isAuthenticated: true,
            profileCompleted: data.user?.profile_completed ?? false,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.detail || 'Login failed. Check your credentials.';
          set({ isLoading: false, error: msg });
          return { success: false, error: msg };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.register({ name, email, password });
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          set({
            user: data.user,
            isAuthenticated: true,
            profileCompleted: false,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.email?.[0] || err.response?.data?.detail || err.message || 'Registration failed.';
          set({ isLoading: false, error: msg });
          return { success: false, error: msg };
        }
      },

      logout: async () => {
        try { await authAPI.logout(); } catch {}
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false, profileCompleted: false });
      },

      setProfileCompleted: () => {
        set((state) => ({
          profileCompleted: true,
          user: state.user ? { ...state.user, profile_completed: true } : state.user,
        }));
      },

      updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'stocksense-auth',
      partializer: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        profileCompleted: state.profileCompleted,
      }),
    }
  )
);

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  activeTab: 'dashboard',
  theme: 'dark',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
