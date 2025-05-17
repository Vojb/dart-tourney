import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DashboardState {
  activeTab:
    | "teams"
    | "groups"
    | "schedule"
    | "results"
    | "standings"
    | "finals";

  // Actions
  setActiveTab: (
    tab: "teams" | "groups" | "schedule" | "results" | "standings" | "finals"
  ) => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      activeTab: "teams",

      // Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      reset: () => set({ activeTab: "teams" }),
    }),
    {
      name: "dart-tournament-dashboard",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return {
            state: JSON.parse(str),
          };
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value.state));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
