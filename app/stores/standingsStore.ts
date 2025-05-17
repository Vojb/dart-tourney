import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StandingsState {
  sortBy: "points" | "goalDifference" | "headToHead";
  showTiebreakers: boolean;

  // Actions
  setSortBy: (sortBy: "points" | "goalDifference" | "headToHead") => void;
  setShowTiebreakers: (show: boolean) => void;
  reset: () => void;
}

export const useStandingsStore = create<StandingsState>()(
  persist(
    (set) => ({
      sortBy: "points",
      showTiebreakers: false,

      // Actions
      setSortBy: (sortBy) => set({ sortBy }),
      setShowTiebreakers: (show) => set({ showTiebreakers: show }),
      reset: () =>
        set({
          sortBy: "points",
          showTiebreakers: false,
        }),
    }),
    {
      name: "dart-tournament-standings",
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
