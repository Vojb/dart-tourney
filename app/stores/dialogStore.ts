import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Match } from "../types/tournament";

interface DialogState {
  // Score Dialog
  showScoreDialog: boolean;
  selectedMatch: (Match & { isKnockout?: boolean }) | null;
  score1: string;
  score2: string;

  // Team Name Dialog
  showTeamNameDialog: boolean;
  selectedTeam: string | null;
  editingTeamName: string;

  // Actions
  openScoreDialog: (match: Match, isKnockout?: boolean) => void;
  closeScoreDialog: () => void;
  setScore1: (score: string) => void;
  setScore2: (score: string) => void;

  openTeamNameDialog: (team: string) => void;
  closeTeamNameDialog: () => void;
  setEditingTeamName: (name: string) => void;
  setSelectedTeam: (team: string | null) => void;

  resetAllDialogs: () => void;
}

export const useDialogStore = create<DialogState>()(
  persist(
    (set) => ({
      // Score Dialog
      showScoreDialog: false,
      selectedMatch: null,
      score1: "",
      score2: "",

      // Team Name Dialog
      showTeamNameDialog: false,
      selectedTeam: null,
      editingTeamName: "",

      // Actions
      openScoreDialog: (match, isKnockout = false) =>
        set({
          showScoreDialog: true,
          selectedMatch: { ...match, isKnockout },
          score1: match.score1 !== null ? match.score1.toString() : "",
          score2: match.score2 !== null ? match.score2.toString() : "",
        }),

      closeScoreDialog: () =>
        set({
          showScoreDialog: false,
          selectedMatch: null,
          score1: "",
          score2: "",
        }),

      setScore1: (score) => set({ score1: score }),

      setScore2: (score) => set({ score2: score }),

      openTeamNameDialog: (team) =>
        set({
          showTeamNameDialog: true,
          selectedTeam: team,
          editingTeamName: team,
        }),

      closeTeamNameDialog: () =>
        set({
          showTeamNameDialog: false,
          selectedTeam: null,
          editingTeamName: "",
        }),

      setEditingTeamName: (name) => set({ editingTeamName: name }),

      setSelectedTeam: (team) => set({ selectedTeam: team }),

      resetAllDialogs: () =>
        set({
          showScoreDialog: false,
          selectedMatch: null,
          score1: "",
          score2: "",
          showTeamNameDialog: false,
          selectedTeam: null,
          editingTeamName: "",
        }),
    }),
    {
      name: "dart-tournament-dialog",
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
      partialize: (state) => ({
        // Don't persist dialog states by default to avoid unexpected open dialogs after refresh
        // But you could persist specific fields if needed
      }),
    }
  )
);
