import { create } from "zustand";

interface UIStore {
  mobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;

  mobileFriendsActivityOpen: boolean;
  toggleMobileFriendsActivity: () => void;
  closeMobileFriendsActivity: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

  mobileFriendsActivityOpen: false,
  toggleMobileFriendsActivity: () => set((state) => ({ mobileFriendsActivityOpen: !state.mobileFriendsActivityOpen })),
  closeMobileFriendsActivity: () => set({ mobileFriendsActivityOpen: false }),
}));
