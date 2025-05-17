import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateRandomColor } from "../utils/tournament";
import { getColorName } from "../utils/colorUtils";

interface TeamsState {
  teamNames: string[];
  teamColors: Record<string, string>;
  selectedTeam: string | null;
  editingTeamName: string;
  showTeamNameDialog: boolean;
  editingTeamIndex: number | null;

  // Actions
  setTeamNames: (names: string[]) => void;
  setTeamColors: (colors: Record<string, string>) => void;
  setSelectedTeam: (team: string | null) => void;
  setEditingTeamName: (name: string) => void;
  setShowTeamNameDialog: (show: boolean) => void;
  setEditingTeamIndex: (index: number | null) => void;
  initializeTeamNames: (numTeams: number) => void;
  handleTeamNameChange: (
    index: number,
    newName: string,
    tournament: { groups: string[][]; matches: any[] } | null,
    knockoutMatches: any[]
  ) => {
    updatedTournament?: { groups: string[][]; matches: any[] };
    updatedKnockout?: any[];
  } | null;
  openTeamNameDialog: (team: string) => void;
  saveTeamName: (tournament: { groups: string[][]; matches: any[] } | null) => {
    updatedTournament?: { groups: string[][]; matches: any[] };
    updatedKnockout?: any[];
  } | null;
  reset: () => void;
}

export const useTeamsStore = create<TeamsState>()(
  persist(
    (set, get) => ({
      teamNames: [],
      teamColors: {},
      selectedTeam: null,
      editingTeamName: "",
      showTeamNameDialog: false,
      editingTeamIndex: null,

      // Actions
      setTeamNames: (names) => set({ teamNames: names }),

      setTeamColors: (colors) => set({ teamColors: colors }),

      setSelectedTeam: (team) => set({ selectedTeam: team }),

      setEditingTeamName: (name) => set({ editingTeamName: name }),

      setShowTeamNameDialog: (show) => set({ showTeamNameDialog: show }),

      setEditingTeamIndex: (index) => set({ editingTeamIndex: index }),

      initializeTeamNames: (numTeams) => {
        const newTeamNames = Array.from(
          { length: numTeams },
          (_, i) => `${i + 1}. Team ${i + 1}`
        );

        // Initialize colors for each team
        const newTeamColors: Record<string, string> = {};
        const usedColors: string[] = [];

        newTeamNames.forEach((teamName) => {
          const color = generateRandomColor(usedColors);
          newTeamColors[teamName] = color;
          usedColors.push(color);
        });

        set({
          teamNames: newTeamNames,
          teamColors: newTeamColors,
        });
      },

      handleTeamNameChange: (
        index: number,
        newName: string,
        tournament: { groups: string[][]; matches: any[] } | null,
        knockoutMatches: any[]
      ) => {
        const { teamNames, teamColors } = get();
        const updatedTeamNames = [...teamNames];
        const oldName = updatedTeamNames[index];
        updatedTeamNames[index] = newName;

        // Update team colors
        const updatedColors = { ...teamColors };
        if (updatedColors[oldName]) {
          updatedColors[newName] = updatedColors[oldName];
          delete updatedColors[oldName];
        }

        set({
          teamNames: updatedTeamNames,
          teamColors: updatedColors,
        });

        // Return updated tournament and knockout matches if needed
        const result: {
          updatedTournament?: { groups: string[][]; matches: any[] };
          updatedKnockout?: any[];
        } = {};

        // If tournament exists, update all references to this team
        if (tournament) {
          // Update tournament groups
          const updatedGroups = tournament.groups.map((group: string[]) =>
            group.map((team: string) => (team === oldName ? newName : team))
          );

          // Update matches
          const updatedMatches = tournament.matches.map((match: any) => ({
            ...match,
            team1: match.team1 === oldName ? newName : match.team1,
            team2: match.team2 === oldName ? newName : match.team2,
          }));

          result.updatedTournament = {
            groups: updatedGroups,
            matches: updatedMatches,
          };

          // Update knockout matches if necessary
          if (knockoutMatches && knockoutMatches.length > 0) {
            const updatedKnockout = knockoutMatches.map((match: any) => ({
              ...match,
              team1: match.team1 === oldName ? newName : match.team1,
              team2: match.team2 === oldName ? newName : match.team2,
            }));

            result.updatedKnockout = updatedKnockout;
          }
        }

        return result;
      },

      openTeamNameDialog: (team) => {
        set({
          selectedTeam: team,
          editingTeamName: team,
          showTeamNameDialog: true,
        });
      },

      saveTeamName: (
        tournament: { groups: string[][]; matches: any[] } | null
      ): {
        updatedTournament?: { groups: string[][]; matches: any[] };
        updatedKnockout?: any[];
      } | null => {
        const { selectedTeam, editingTeamName, teamNames } = get();

        if (!selectedTeam || !editingTeamName.trim()) return null;

        // Find the team in the tournament
        let teamIndex = -1;
        if (tournament) {
          tournament.groups.forEach((group: string[]) => {
            const index = group.findIndex(
              (team: string) => team === selectedTeam
            );
            if (index !== -1) {
              teamIndex = teamNames.findIndex((name) => name === selectedTeam);
            }
          });
        } else {
          teamIndex = teamNames.findIndex((name) => name === selectedTeam);
        }

        if (teamIndex !== -1) {
          const result = get().handleTeamNameChange(
            teamIndex,
            editingTeamName.trim(),
            tournament,
            [] // We'll handle knockoutMatches separately
          );

          set({
            showTeamNameDialog: false,
            selectedTeam: null,
            editingTeamName: "",
          });

          return result;
        }

        set({
          showTeamNameDialog: false,
          selectedTeam: null,
          editingTeamName: "",
        });

        return null;
      },

      reset: () =>
        set({
          teamNames: [],
          teamColors: {},
          selectedTeam: null,
          editingTeamName: "",
          showTeamNameDialog: false,
          editingTeamIndex: null,
        }),
    }),
    {
      name: "dart-tournament-teams",
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
        teamNames: state.teamNames,
        teamColors: state.teamColors,
      }),
    }
  )
);
