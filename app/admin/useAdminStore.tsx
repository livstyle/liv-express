import { create } from 'zustand';

const useAdminStore = create((set) => ({
  appName: 'Admin',
  appLogo: '/logo.png',
  appMenus: [] as { name: string; path: string }[],
  // state
  admin: false,
  // actions
  setAdmin: (admin: boolean) => set(() => ({ admin })),
}));