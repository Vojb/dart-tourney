import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Match } from "../types/tournament";

interface ResultsState {
  matchView: "list" | "boardGrid";

  // Actions
  setMatchView: (view: "list" | "boardGrid") => void;
  reset: () => void;
}

export const useResultsStore = create<ResultsState>()(
  persist(
    (set) => ({
      matchView: "list",

      // Actions
      setMatchView: (view) => set({ matchView: view }),
      reset: () => set({ matchView: "list" }),
    }),
    {
      name: "dart-tournament-results",
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
