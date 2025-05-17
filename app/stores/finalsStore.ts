import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Match } from "../types/tournament";

interface FinalsState {
  bracketView: "single" | "compact";

  // Actions
  setBracketView: (view: "single" | "compact") => void;
  reset: () => void;
}

export const useFinalsStore = create<FinalsState>()(
  persist(
    (set) => ({
      bracketView: "single",

      // Actions
      setBracketView: (view) => set({ bracketView: view }),
      reset: () => set({ bracketView: "single" }),
    }),
    {
      name: "dart-tournament-finals",
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
