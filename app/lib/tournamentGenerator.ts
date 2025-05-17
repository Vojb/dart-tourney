// Tournament generation functions

import { Match } from "../types/tournament";
import { parseTime, formatTime } from "../utils/tournament";

/**
 * Function to get teams that advance from group stage
 */
export const getAdvancingTeams = (
  tournament: any,
  calculateStandings: (groupIndex: number) => any[],
  teamsAdvancing: number,
  teamColors: { [key: string]: string }
) => {
  if (!tournament) return [];

  const advancingTeams: any[] = [];

  tournament.groups.forEach((group: string[], groupIndex: number) => {
    const standings = calculateStandings(groupIndex);
    // Take top N teams from each group
    const topTeams = standings.slice(0, teamsAdvancing);
    advancingTeams.push(
      ...topTeams.map((team: any) => ({
        name: team.name,
        group: groupIndex + 1,
        position: advancingTeams.length + 1,
        color: teamColors[team.name],
      }))
    );
  });

  return advancingTeams;
};

/**
 * Create knockout stage matches
 */
export const createKnockoutMatches = (
  tournament: any,
  getAdvancingTeams: () => any[],
  numBoards: number,
  calculateKnockoutMatchTime: (round: number, matchIndex: number) => string
) => {
  if (!tournament) return null;

  // Check if we have enough completed matches
  const completedMatches = tournament.matches.filter(
    (match: Match) => match.completed
  );
  const totalMatches = tournament.matches.length;

  if (completedMatches.length < totalMatches) {
    return {
      success: false,
      message: "Please complete all group stage matches first.",
    };
  }

  // Determine the bracket size (8, 16, 32, etc.)
  let bracketSize = 2;
  const advancingTeams = getAdvancingTeams();
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

  return {
    success: true,
    matches,
    message: `Created knockout bracket with ${advancingTeams.length} advancing teams.`,
  };
};

/**
 * Calculate time for knockout match
 */
export const calculateKnockoutMatchTime = (
  round: number,
  matchIndex: number,
  knockoutStartTime: string,
  startTime: string,
  tournament: any,
  matchDuration: number
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

/**
 * Function to check if a team plays in consecutive time slots
 */
export const getTeamSchedule = (teamName: string, tournament: any) => {
  if (!tournament) return [];

  return tournament.matches
    .filter(
      (match: Match) => match.team1 === teamName || match.team2 === teamName
    )
    .sort((a: Match, b: Match) => parseTime(a.time) - parseTime(b.time))
    .map((match: Match) => ({
      time: match.time,
      opponent: match.team1 === teamName ? match.team2 : match.team1,
      board: match.board,
      completed: match.completed,
      result: match.completed
        ? match.team1 === teamName
          ? `${match.score1}-${match.score2}`
          : `${match.score2}-${match.score1}`
        : null,
    }));
};
