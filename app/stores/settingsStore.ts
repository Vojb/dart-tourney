import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  tournamentName: string;
  numTeams: number;
  numBoards: number;
  numGroups: number;
  matchDuration: number;
  startTime: string;
  teamsAdvancing: number;
  activeTab: string;
  matchView: "list" | "boardGrid";

  // Actions
  setTournamentName: (name: string) => void;
  setNumTeams: (num: number) => void;
  setNumBoards: (num: number) => void;
  setNumGroups: (num: number) => void;
  setMatchDuration: (duration: number) => void;
  setStartTime: (time: string) => void;
  setTeamsAdvancing: (num: number) => void;
  setActiveTab: (tab: string) => void;
  setMatchView: (view: "list" | "boardGrid") => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS = {
  tournamentName: "Dart Tournament Scheduler",
  numTeams: 8,
  numBoards: 2,
  numGroups: 2,
  matchDuration: 15,
  startTime: "09:00",
  teamsAdvancing: 2,
  activeTab: "setup",
  matchView: "list" as const,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      // Actions
      setTournamentName: (name) => set({ tournamentName: name }),
      setNumTeams: (num) => set({ numTeams: num }),
      setNumBoards: (num) => set({ numBoards: num }),
      setNumGroups: (num) => set({ numGroups: num }),
      setMatchDuration: (duration) => set({ matchDuration: duration }),
      setStartTime: (time) => set({ startTime: time }),
      setTeamsAdvancing: (num) => set({ teamsAdvancing: num }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setMatchView: (view) => set({ matchView: view }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: "dart-tournament-settings",
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
