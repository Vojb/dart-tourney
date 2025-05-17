import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Match, Tournament } from "../types/tournament";
import {
  createGroups,
  generateRoundRobinMatches,
  parseTime,
  formatTime,
} from "../utils/tournament";
import { toast } from "../../components/ui/use-toast";

interface TournamentState {
  tournament: Tournament | null;
  knockoutMatches: Match[];
  isLoading: boolean;
  selectedMatch: (Match & { isKnockout?: boolean }) | null;
  score1: string;
  score2: string;
  knockoutStartTime: string;

  // Actions
  setTournament: (tournament: Tournament | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  generateTournament: (
    teamNames: string[],
    numGroups: number,
    numBoards: number,
    startTime: string,
    matchDuration: number,
    teamColors: Record<string, string>,
    setTeamColors: (colors: Record<string, string>) => void
  ) => void;
  setKnockoutMatches: (matches: Match[]) => void;
  setSelectedMatch: (match: (Match & { isKnockout?: boolean }) | null) => void;
  setScore1: (score: string) => void;
  setScore2: (score: string) => void;
  saveScore: (
    teamColors: Record<string, string>,
    updateKnockoutBracket: (
      matches: Match[],
      matchId: number,
      winner: string
    ) => void
  ) => void;
  handleScoreChange: (
    matchId: string | number,
    team: "team1" | "team2",
    change: number
  ) => void;
  handleScoreSave: (match: Match) => void;
  reset: () => void;
  createKnockoutStage: (
    numBoards: number,
    teamsAdvancing: number,
    startTime: string,
    matchDuration: number,
    teamColors: Record<string, string>,
    setActiveTab: (tab: string) => void
  ) => void;
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      tournament: null,
      knockoutMatches: [],
      isLoading: true,
      selectedMatch: null,
      score1: "",
      score2: "",
      knockoutStartTime: "",

      // Actions
      setTournament: (tournament) => {
        // Ensure tournament has valid groups property if it's not null
        if (tournament) {
          // Clone to avoid mutating the original reference
          const fixedTournament = { ...tournament };

          // Make sure groups is an array
          if (
            !fixedTournament.groups ||
            !Array.isArray(fixedTournament.groups)
          ) {
            console.log(
              "Fixing tournament structure: adding empty groups array"
            );
            fixedTournament.groups = [];
          }

          // Make sure matches is an array
          if (
            !fixedTournament.matches ||
            !Array.isArray(fixedTournament.matches)
          ) {
            console.log(
              "Fixing tournament structure: adding empty matches array"
            );
            fixedTournament.matches = [];
          }

          set({ tournament: fixedTournament });
        } else {
          set({ tournament: null });
        }
      },

      setIsLoading: (isLoading) => set({ isLoading }),

      generateTournament: (
        teamNames,
        numGroups,
        numBoards,
        startTime,
        matchDuration,
        teamColors,
        setTeamColors
      ) => {
        // Validate inputs
        if (!teamNames || !Array.isArray(teamNames) || teamNames.length < 2) {
          console.error(
            "Cannot generate tournament: Invalid or insufficient team names",
            teamNames
          );
          toast({
            title: "Error generating tournament",
            description: "There are not enough teams to generate a tournament.",
            variant: "destructive",
          });
          return;
        }

        if (!numGroups || numGroups < 1) {
          console.error(
            "Cannot generate tournament: Invalid number of groups",
            numGroups
          );
          toast({
            title: "Error generating tournament",
            description: "Invalid number of groups.",
            variant: "destructive",
          });
          return;
        }

        if (!numBoards || numBoards < 1) {
          console.error(
            "Cannot generate tournament: Invalid number of boards",
            numBoards
          );
          toast({
            title: "Error generating tournament",
            description: "Invalid number of boards.",
            variant: "destructive",
          });
          return;
        }

        // Log for debugging
        console.log("Generating tournament with:", {
          teamCount: teamNames.length,
          numGroups,
          numBoards,
          startTime,
          matchDuration,
        });

        try {
          // Create groups
          const groups = createGroups(teamNames, numGroups);
          console.log("Created groups:", groups);

          if (!groups || !Array.isArray(groups) || groups.length === 0) {
            throw new Error("Failed to create groups");
          }

          // Check if any groups are empty
          const emptyGroups = groups.filter((group) => group.length === 0);
          if (emptyGroups.length > 0) {
            console.warn(`Warning: ${emptyGroups.length} empty groups created`);
          }

          // Generate matches for each group but keep them separated by group
          const groupMatches: Match[][] = [];
          groups.forEach((group, groupIndex) => {
            if (group.length < 2) {
              console.warn(
                `Group ${
                  groupIndex + 1
                } has less than 2 teams, skipping match generation`
              );
              groupMatches[groupIndex] = [];
              return;
            }

            const matches = generateRoundRobinMatches(group);
            groupMatches[groupIndex] = matches.map((match) => ({
              ...match,
              group: groupIndex + 1,
              id: 0, // placeholder, will be set later
              time: "",
              board: 0,
              score1: null,
              score2: null,
              completed: false,
              team1: match.team1 || "",
              team2: match.team2 || "",
            }));
          });

          // Schedule matches
          const matches: Match[] = [];
          let currentTime = parseTime(startTime);
          let currentTimeSlot = 0;

          // Track when each team last played (by time slot index)
          const teamLastPlayed: Record<string, number> = {};
          teamNames.forEach((team) => {
            teamLastPlayed[team] = -1; // -1 means never played yet
          });

          // Continue scheduling until all group matches are scheduled
          let allMatchesScheduled = false;
          let currentGroupBlockStart = 0; // Track which group block we're currently scheduling

          while (!allMatchesScheduled) {
            // Check if there are any matches left to schedule
            const matchesRemaining = groupMatches.some(
              (group) => group.length > 0
            );
            if (!matchesRemaining) {
              allMatchesScheduled = true;
              break;
            }

            // Teams already playing in this time slot
            const teamsInCurrentTimeSlot = new Set<string>();
            // Boards already in use in this time slot
            const boardsInUse = new Set<number>();
            let boardsAssigned = 0;

            // Schedule in blocks of numBoards groups at a time
            // For example, with 4 groups and 2 boards:
            // Round 1: Group 0, 1
            // Round 2: Group 2, 3
            // Round 3: Group 0, 1
            // etc.
            for (let i = 0; i < numBoards && boardsAssigned < numBoards; i++) {
              // Get the current group index to schedule
              const groupIndex = (currentGroupBlockStart + i) % numGroups;

              console.log(
                `Attempting to schedule a match from Group ${
                  groupIndex + 1
                } in time slot ${currentTimeSlot}`
              );

              // Skip if no matches in this group
              if (groupMatches[groupIndex].length === 0) continue;

              // Find eligible match from this group
              const eligibleMatches = groupMatches[groupIndex].filter(
                (match) =>
                  !teamsInCurrentTimeSlot.has(match.team1) &&
                  !teamsInCurrentTimeSlot.has(match.team2)
              );

              if (eligibleMatches.length === 0) continue;

              // Select match with teams that have had the most rest
              const selectedMatch = eligibleMatches
                .map((match) => {
                  const team1RestScore =
                    currentTimeSlot - teamLastPlayed[match.team1];
                  const team2RestScore =
                    currentTimeSlot - teamLastPlayed[match.team2];
                  const minRestScore = Math.min(team1RestScore, team2RestScore);
                  return { match, score: minRestScore };
                })
                .sort((a, b) => b.score - a.score)[0].match;

              // Find next available board
              let boardNumber = 1;
              while (boardsInUse.has(boardNumber) && boardNumber <= numBoards) {
                boardNumber++;
              }

              if (boardNumber > numBoards) break;

              // Mark board and teams as in use
              boardsInUse.add(boardNumber);
              teamsInCurrentTimeSlot.add(selectedMatch.team1);
              teamsInCurrentTimeSlot.add(selectedMatch.team2);

              // Update last played for these teams
              teamLastPlayed[selectedMatch.team1] = currentTimeSlot;
              teamLastPlayed[selectedMatch.team2] = currentTimeSlot;

              // Schedule the match
              const scheduledMatch: Match = {
                ...selectedMatch,
                id: matches.length + 1,
                time: formatTime(currentTime),
                board: boardNumber,
              };

              // Add to matches
              matches.push(scheduledMatch);
              boardsAssigned++;

              // Remove match from its group's list
              const originalGroupIndex = selectedMatch.group
                ? selectedMatch.group - 1
                : groupMatches.findIndex((group) =>
                    group.some(
                      (m) =>
                        m.team1 === selectedMatch.team1 &&
                        m.team2 === selectedMatch.team2
                    )
                  );

              if (originalGroupIndex >= 0) {
                const matchIndex = groupMatches[originalGroupIndex].findIndex(
                  (m) =>
                    m.team1 === selectedMatch.team1 &&
                    m.team2 === selectedMatch.team2
                );
                if (matchIndex !== -1) {
                  groupMatches[originalGroupIndex].splice(matchIndex, 1);
                }
              }
            }

            // If we couldn't schedule any more matches in the current group block or time slot,
            // we should try a second pass to fill remaining boards with any available matches
            if (boardsAssigned < numBoards) {
              // Try to fill remaining boards with matches from any group
              // but prioritize matches from the next group block
              let nextGroupBlockMatches: Match[] = [];

              // Get matches from next group block
              for (let i = 0; i < numBoards; i++) {
                const nextBlockGroupIndex =
                  (((currentGroupBlockStart + numBoards) % numGroups) + i) %
                  numGroups;
                if (
                  groupMatches[nextBlockGroupIndex] &&
                  groupMatches[nextBlockGroupIndex].length > 0
                ) {
                  nextGroupBlockMatches.push(
                    ...groupMatches[nextBlockGroupIndex]
                  );
                }
              }

              // Filter for eligible matches
              const eligibleNextBlockMatches = nextGroupBlockMatches.filter(
                (match) =>
                  !teamsInCurrentTimeSlot.has(match.team1) &&
                  !teamsInCurrentTimeSlot.has(match.team2)
              );

              // Try to schedule from next block first, then any remaining matches
              const flatEligibleMatches = [
                ...eligibleNextBlockMatches,
                ...groupMatches
                  .flat()
                  .filter(
                    (match) =>
                      !teamsInCurrentTimeSlot.has(match.team1) &&
                      !teamsInCurrentTimeSlot.has(match.team2) &&
                      !eligibleNextBlockMatches.some(
                        (m) =>
                          m.team1 === match.team1 && m.team2 === match.team2
                      )
                  ),
              ];

              while (
                boardsAssigned < numBoards &&
                flatEligibleMatches.length > 0
              ) {
                // Select match with teams that have had the most rest
                const selectedMatchInfo = flatEligibleMatches
                  .map((match, index) => {
                    const team1RestScore =
                      currentTimeSlot - teamLastPlayed[match.team1];
                    const team2RestScore =
                      currentTimeSlot - teamLastPlayed[match.team2];
                    const minRestScore = Math.min(
                      team1RestScore,
                      team2RestScore
                    );
                    return { match, index, score: minRestScore };
                  })
                  .sort((a, b) => b.score - a.score)[0];

                const selectedMatch = selectedMatchInfo.match;

                // Find next available board
                let boardNumber = 1;
                while (
                  boardsInUse.has(boardNumber) &&
                  boardNumber <= numBoards
                ) {
                  boardNumber++;
                }

                if (boardNumber > numBoards) break;

                // Mark board and teams as in use
                boardsInUse.add(boardNumber);
                teamsInCurrentTimeSlot.add(selectedMatch.team1);
                teamsInCurrentTimeSlot.add(selectedMatch.team2);

                // Update last played for these teams
                teamLastPlayed[selectedMatch.team1] = currentTimeSlot;
                teamLastPlayed[selectedMatch.team2] = currentTimeSlot;

                // Schedule the match
                const scheduledMatch: Match = {
                  ...selectedMatch,
                  id: matches.length + 1,
                  time: formatTime(currentTime),
                  board: boardNumber,
                };

                // Add to matches
                matches.push(scheduledMatch);
                boardsAssigned++;

                // Remove match from its group's list
                const originalGroupIndex = selectedMatch.group
                  ? selectedMatch.group - 1
                  : groupMatches.findIndex((group) =>
                      group.some(
                        (m) =>
                          m.team1 === selectedMatch.team1 &&
                          m.team2 === selectedMatch.team2
                      )
                    );

                if (originalGroupIndex >= 0) {
                  const matchIndex = groupMatches[originalGroupIndex].findIndex(
                    (m) =>
                      m.team1 === selectedMatch.team1 &&
                      m.team2 === selectedMatch.team2
                  );
                  if (matchIndex !== -1) {
                    groupMatches[originalGroupIndex].splice(matchIndex, 1);
                  }
                }

                // Remove from eligible matches
                flatEligibleMatches.splice(selectedMatchInfo.index, 1);
              }
            }

            // Move to next group block if we either filled all boards
            // or couldn't schedule anything in this time slot
            if (boardsAssigned > 0) {
              // Move group block forward by numBoards
              currentGroupBlockStart =
                (currentGroupBlockStart + numBoards) % numGroups;
              console.log(
                `Moving to next group block, starting with Group ${
                  currentGroupBlockStart + 1
                }`
              );
            } else if (boardsAssigned === 0) {
              // If we couldn't schedule any matches in this time slot,
              // try the next group block instead of getting stuck
              currentGroupBlockStart =
                (currentGroupBlockStart + numBoards) % numGroups;
              console.log(
                `No matches scheduled, trying next group block starting with Group ${
                  currentGroupBlockStart + 1
                }`
              );
            }

            // Move to the next time slot
            currentTime += matchDuration * 60 * 1000;
            currentTimeSlot++;
          }

          // Sort matches by time for the schedule view
          const sortedMatches = [...matches].sort((a, b) => {
            if (a.time === b.time) {
              return a.board - b.board;
            }
            return parseTime(a.time) - parseTime(b.time);
          });

          // Calculate knockout start time (30 minutes after last match)
          if (sortedMatches.length > 0) {
            const lastMatch = [...sortedMatches].sort(
              (a, b) =>
                parseTime(a.time) +
                matchDuration * 60000 -
                (parseTime(b.time) + matchDuration * 60000)
            )[sortedMatches.length - 1];

            const lastMatchEndTime =
              parseTime(lastMatch.time) + matchDuration * 60000;
            const knockoutTime = new Date(lastMatchEndTime + 30 * 60000);
            set({ knockoutStartTime: formatTime(knockoutTime.getTime()) });
          }

          const newTournament = { groups, matches: sortedMatches };
          set({
            tournament: newTournament,
            knockoutMatches: [],
          });

          toast({
            title: "Tournament generated",
            description: `Created a tournament with ${teamNames.length} teams, ${numGroups} groups, and ${numBoards} dartboards.`,
          });
        } catch (error) {
          console.error("Error generating tournament:", error);
          toast({
            title: "Error generating tournament",
            description: "An error occurred while generating the tournament.",
            variant: "destructive",
          });
        }
      },

      setKnockoutMatches: (matches) => set({ knockoutMatches: matches }),

      setSelectedMatch: (match) => set({ selectedMatch: match }),

      setScore1: (score) => set({ score1: score }),

      setScore2: (score) => set({ score2: score }),

      saveScore: (teamColors, updateKnockoutBracket) => {
        const { selectedMatch, score1, score2, tournament } = get();

        if (!selectedMatch || !tournament) return;

        if (selectedMatch.isKnockout) {
          // Get the knockout matches from state
          const { knockoutMatches } = get();

          // Determine the winner - in knockout matches, we can't have a tie
          let winner: string;
          const score1Int = parseInt(score1) || 0;
          const score2Int = parseInt(score2) || 0;

          // Handle ties in knockout matches
          if (score1Int === score2Int) {
            toast({
              title: "Invalid score",
              description:
                "Knockout matches cannot end in a tie. Please enter different scores.",
              variant: "destructive",
            });
            return;
          }

          winner =
            score1Int > score2Int ? selectedMatch.team1 : selectedMatch.team2;

          const updatedMatches = knockoutMatches.map((m: Match) => {
            if (m.id === selectedMatch.id) {
              return {
                ...m,
                score1: score1Int,
                score2: score2Int,
                completed: true,
                winner: winner,
              };
            }
            return m;
          });

          // Use the provided updateKnockoutBracket utility
          if (selectedMatch.nextMatchId) {
            updateKnockoutBracket(updatedMatches, selectedMatch.id, winner);
          }

          // Update state
          set({
            knockoutMatches: updatedMatches,
            selectedMatch: null,
            score1: "",
            score2: "",
          });
        } else {
          // Update group stage match
          const updatedMatches = tournament.matches.map((m: Match) => {
            if (m.id === selectedMatch.id) {
              return {
                ...m,
                score1: parseInt(score1) || 0,
                score2: parseInt(score2) || 0,
                completed: true,
              };
            }
            return m;
          });

          // Update tournament state
          set({
            tournament: {
              groups: tournament.groups,
              matches: updatedMatches,
            },
            selectedMatch: null,
            score1: "",
            score2: "",
          });
        }
      },

      handleScoreChange: (matchId, team, change) => {
        const { tournament } = get();
        if (!tournament) return;

        const matchIdNum =
          typeof matchId === "string" ? parseInt(matchId) : matchId;

        // Update the match in state
        const updatedMatches = tournament.matches.map((m) => {
          if (m.id === matchIdNum) {
            const newMatch = { ...m };

            if (team === "team1") {
              newMatch.score1 = (newMatch.score1 || 0) + change;
              if (newMatch.score1 < 0) newMatch.score1 = 0;
            } else {
              newMatch.score2 = (newMatch.score2 || 0) + change;
              if (newMatch.score2 < 0) newMatch.score2 = 0;
            }

            // Mark as completed if not already
            if (!newMatch.completed) {
              newMatch.completed = true;
            }

            return newMatch;
          }
          return m;
        });

        set({
          tournament: {
            ...tournament,
            matches: updatedMatches,
          },
        });
      },

      handleScoreSave: (match) => {
        const { tournament } = get();
        if (!tournament) return;

        // Check if this is a knockout match
        const { knockoutMatches } = get();
        const isKnockoutMatch = knockoutMatches.some((m) => m.id === match.id);

        if (isKnockoutMatch) {
          // Handle knockout match save
          // First check if scores are valid (no ties in knockout matches)
          if (match.score1 === match.score2) {
            toast({
              title: "Invalid score",
              description:
                "Knockout matches cannot end in a tie. Please enter different scores.",
              variant: "destructive",
            });
            return;
          }

          // Determine winner
          const score1 = match.score1 || 0;
          const score2 = match.score2 || 0;
          const winner = score1 > score2 ? match.team1 : match.team2;
          match.winner = winner;

          // Update the knockout matches array
          const updatedMatches = knockoutMatches.map((m) =>
            m.id === match.id ? { ...match, completed: true } : m
          );

          // Use the utility to update bracket and propagate winner
          const { updateKnockoutBracket } = require("../utils/tournament");
          updateKnockoutBracket(updatedMatches, match.id, winner);

          // Update state
          set({ knockoutMatches: updatedMatches });

          toast({
            title: "Score updated",
            description: `${match.team1} ${match.score1 || 0} - ${
              match.score2 || 0
            } ${match.team2}`,
            duration: 2000,
          });

          return;
        }

        // Regular group match handling
        const updatedMatches = tournament.matches.map((m) =>
          m.id === match.id ? match : m
        );

        // Update the tournament state
        set({
          tournament: {
            ...tournament,
            matches: updatedMatches,
          },
        });

        // Only show toast on significant changes to avoid too many notifications
        if ((match.score1 || 0) > 0 || (match.score2 || 0) > 0) {
          toast({
            title: "Score updated",
            description: `${match.team1} ${match.score1 || 0} - ${
              match.score2 || 0
            } ${match.team2}`,
            duration: 2000, // shorter toast duration
          });
        }
      },

      reset: () =>
        set({
          tournament: null,
          knockoutMatches: [],
          selectedMatch: null,
          score1: "",
          score2: "",
          knockoutStartTime: "",
        }),

      createKnockoutStage: (
        numBoards,
        teamsAdvancing,
        startTime,
        matchDuration,
        teamColors,
        setActiveTab
      ) => {
        const { tournament, knockoutStartTime } = get();

        if (!tournament) {
          toast({
            title: "Cannot start finals",
            description: "No tournament data is available.",
            variant: "destructive",
          });
          return;
        }

        // Check if all group matches are completed
        const completedMatches = tournament.matches.filter(
          (match: Match) => match.completed
        );
        const totalMatches = tournament.matches.length;

        if (completedMatches.length < totalMatches) {
          toast({
            title: "Cannot start finals",
            description: "Please complete all group stage matches first.",
            variant: "destructive",
          });
          return;
        }

        // Helper function to calculate standings for a specific group
        const calculateStandingsForGroup = (groupIndex: number) => {
          if (!tournament) return [];

          // Safety check for groups
          if (
            !tournament.groups ||
            !Array.isArray(tournament.groups) ||
            groupIndex < 0 ||
            groupIndex >= tournament.groups.length
          ) {
            return [];
          }

          const groupTeams = tournament.groups[groupIndex];

          if (!Array.isArray(groupTeams) || groupTeams.length === 0) {
            return [];
          }

          // Get matches for this group
          const groupMatches = tournament.matches.filter(
            (m: Match) => m.group === groupIndex + 1
          );

          // Calculate standings using utility
          const { calculateStandings } = require("../utils/scoring");
          return calculateStandings(groupTeams, groupMatches);
        };

        // Get advancing teams from each group
        const getAdvancingTeams = () => {
          if (!tournament) return [];

          const advancingTeams: any[] = [];

          tournament.groups.forEach((group: string[], groupIndex: number) => {
            const standings = calculateStandingsForGroup(groupIndex);
            // Take top N teams from each group
            const topTeams = standings.slice(0, teamsAdvancing);

            // Assign each team its correct position within its group
            topTeams.forEach((team: any, positionIndex: number) => {
              advancingTeams.push({
                name: team.name,
                group: groupIndex + 1,
                position: positionIndex + 1, // Position within the group (1st, 2nd, etc.)
                color: teamColors[team.name],
              });
            });
          });

          return advancingTeams;
        };

        // Calculate time for a knockout match
        const calculateKnockoutMatchTime = (
          round: number,
          matchIndex: number
        ): string => {
          // Use knockout start time for base
          const baseTime = knockoutStartTime
            ? parseTime(knockoutStartTime)
            : parseTime(startTime) +
              (tournament?.matches.length || 0) * matchDuration * 60000;

          // Add time based on round and match index
          const timeOffset =
            (round - 1) * 60 * 60000 + matchIndex * matchDuration * 60000;
          return formatTime(baseTime + timeOffset);
        };

        // Determine the bracket size (8, 16, 32, etc.)
        let bracketSize = 2;
        const advancingTeams = getAdvancingTeams();

        if (advancingTeams.length === 0) {
          toast({
            title: "Cannot start finals",
            description: "No teams available to advance to the knockout stage.",
            variant: "destructive",
          });
          return;
        }

        while (bracketSize < advancingTeams.length) {
          bracketSize *= 2;
        }

        // Create knockout matches
        const matches = [];
        let matchId = 1;
        let currentRound = 1;
        let teamsInRound = advancingTeams;
        let nextRoundFirstMatchId = Math.ceil(teamsInRound.length / 2) + 1;

        // For first round, match teams based on group performance
        // Example: Group A 1st vs Group B 2nd, Group B 1st vs Group A 2nd
        while (teamsInRound.length > 1) {
          const roundMatches = [];
          const numMatchesInRound = Math.floor(teamsInRound.length / 2);

          // For the first round, create matchups
          if (currentRound === 1) {
            // Sort teams by position in group
            const sortedTeams = [...teamsInRound].sort((a, b) => {
              // First by group number
              if (a.group !== b.group) return a.group - b.group;
              // Then by position within group
              return a.position - b.position;
            });

            // Create matchups (1st vs last, 2nd vs 2nd last, etc.)
            for (let i = 0; i < Math.floor(sortedTeams.length / 2); i++) {
              const team1 = sortedTeams[i];
              const team2 = sortedTeams[sortedTeams.length - 1 - i];

              // Calculate which match in the next round this will feed into
              const nextMatchId =
                currentRound < Math.log2(bracketSize)
                  ? nextRoundFirstMatchId + Math.floor(i / 2)
                  : null;
              const nextMatchPosition = i % 2 === 0 ? "team1" : "team2";

              roundMatches.push({
                id: matchId++,
                round: currentRound,
                team1: team1.name,
                team2: team2.name,
                time: calculateKnockoutMatchTime(currentRound, i),
                board: (i % numBoards) + 1,
                score1: null,
                score2: null,
                completed: false,
                winner: null,
                nextMatchId,
                nextMatchPosition,
              });
            }
          } else {
            // For later rounds, create placeholder matches
            for (let i = 0; i < numMatchesInRound; i++) {
              const nextMatchId =
                currentRound < Math.log2(bracketSize)
                  ? nextRoundFirstMatchId + Math.floor(i / 2)
                  : null;
              const nextMatchPosition = i % 2 === 0 ? "team1" : "team2";

              // For matches after the first round, teams will be determined by winners
              const previousRoundFirstIndex = matchId - numMatchesInRound * 2;

              // Create match referencing the previous matches
              const previousMatch1Id = previousRoundFirstIndex + i * 2;
              const previousMatch2Id = previousRoundFirstIndex + i * 2 + 1;

              roundMatches.push({
                id: matchId++,
                round: currentRound,
                team1: `Winner of Match ${previousMatch1Id}`,
                team2: `Winner of Match ${previousMatch2Id}`,
                time: calculateKnockoutMatchTime(currentRound, i),
                board: (i % numBoards) + 1,
                score1: null,
                score2: null,
                completed: false,
                winner: null,
                nextMatchId,
                nextMatchPosition,
              });
            }
          }

          matches.push(...roundMatches);

          // Prepare for next round
          teamsInRound = roundMatches.map((match) => ({
            name: `Winner of Match ${match.id}`,
            match: match.id,
          }));

          currentRound++;
          nextRoundFirstMatchId = matchId;
        }

        // Update the knockout matches in state
        set({ knockoutMatches: matches });

        // Navigate to the finals tab
        setActiveTab("finals");

        toast({
          title: "Knockout stage created",
          description: `Created knockout bracket with ${advancingTeams.length} advancing teams.`,
        });
      },
    }),
    {
      name: "dart-tournament-data",
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
        tournament: state.tournament,
        knockoutMatches: state.knockoutMatches,
        knockoutStartTime: state.knockoutStartTime,
        isLoading: state.isLoading,
      }),
      onRehydrateStorage: () => (state) => {
        // This will be called after the store is rehydrated
        if (state) {
          state.setIsLoading(false);
        }
      },
    }
  )
);

// Use setTimeout to ensure the store is fully initialized
setTimeout(() => {
  useTournamentStore.setState({ isLoading: false });
}, 1000);
