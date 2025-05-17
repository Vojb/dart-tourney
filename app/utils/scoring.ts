// Scoring utility functions

import { Match } from "../types/tournament";

/**
 * Calculates standings for a group based on matches
 */
export const calculateStandings = (
  groupTeams: string[],
  groupMatches: Match[]
) => {
  const standings = groupTeams.map((team: string) => ({
    name: team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    points: 0,
    legsFor: 0,
    legsAgainst: 0,
    legDiff: 0,
  }));

  groupMatches.forEach((m: Match) => {
    if (!m.completed) return;
    const team1Index = standings.findIndex(
      (t: { name: string }) => t.name === m.team1
    );
    const team2Index = standings.findIndex(
      (t: { name: string }) => t.name === m.team2
    );
    if (team1Index === -1 || team2Index === -1) return;

    // Update matches played
    standings[team1Index].played++;
    standings[team2Index].played++;

    // Update legs statistics, with null checks
    if (m.score1 !== null && m.score2 !== null) {
      standings[team1Index].legsFor += m.score1;
      standings[team1Index].legsAgainst += m.score2;
      standings[team2Index].legsFor += m.score2;
      standings[team2Index].legsAgainst += m.score1;
      if (m.score1 > m.score2) {
        standings[team1Index].won++;
        standings[team1Index].points += 3;
        standings[team2Index].lost++;
      } else if (m.score1 < m.score2) {
        standings[team2Index].won++;
        standings[team2Index].points += 3;
        standings[team1Index].lost++;
      } else {
        standings[team1Index].drawn++;
        standings[team2Index].drawn++;
        standings[team1Index].points += 1;
        standings[team2Index].points += 1;
      }
    }
  });

  // Calculate leg difference
  standings.forEach(
    (team: { legsFor: number; legsAgainst: number; legDiff: number }) => {
      team.legDiff = team.legsFor - team.legsAgainst;
    }
  );

  // Sort by points (descending), then by leg difference
  return standings.sort(
    (
      a: { points: number; legDiff: number },
      b: { points: number; legDiff: number }
    ) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.legDiff - a.legDiff;
    }
  );
};
