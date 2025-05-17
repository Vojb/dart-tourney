import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ScheduleState {
  scheduleView: "list" | "boardGrid";
  showCompletedMatches: boolean;

  // Actions
  setScheduleView: (view: "list" | "boardGrid") => void;
  setShowCompletedMatches: (show: boolean) => void;
  reset: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      scheduleView: "list",
      showCompletedMatches: true,

      // Actions
      setScheduleView: (view) => set({ scheduleView: view }),
      setShowCompletedMatches: (show) => set({ showCompletedMatches: show }),
      reset: () =>
        set({
          scheduleView: "list",
          showCompletedMatches: true,
        }),
    }),
    {
      name: "dart-tournament-schedule",
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
