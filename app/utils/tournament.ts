// Tournament utility functions

import { Match } from "../types/tournament";

/**
 * Parses a time string in format "HH:MM" and returns timestamp
 */
export const parseTime = (timeString: string): number => {
  // Create a static date to avoid hydration issues
  const [hours, minutes] = timeString.split(":").map(Number);
  // Use the same date reference (Jan 1, 2023) for consistency
  const date = new Date(2023, 0, 1, hours, minutes, 0, 0);
  return date.getTime();
};

/**
 * Formats a timestamp into "HH:MM" format
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  // Get hours and minutes and format with leading zeros
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Creates groups from a list of teams
 */
export const createGroups = (
  teams: string[],
  numGroups: number
): string[][] => {
  // Input validation
  if (!teams || !Array.isArray(teams) || teams.length === 0) {
    console.error("Invalid teams array provided to createGroups", teams);
    return Array.from({ length: numGroups }, () => []);
  }

  if (!numGroups || numGroups <= 0) {
    console.error("Invalid numGroups provided to createGroups", numGroups);
    return [teams]; // Default to one group if invalid
  }

  console.log("Creating groups with teams:", teams, "numGroups:", numGroups);

  // Create empty groups
  const groups: string[][] = Array.from({ length: numGroups }, () => []);

  // Shuffle teams array to randomize distribution
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

  // Calculate base teams per group and remainder
  const baseTeamsPerGroup = Math.floor(shuffledTeams.length / numGroups);
  const remainder = shuffledTeams.length % numGroups;

  // Distribute teams
  let teamIndex = 0;

  // First distribute remainder teams (one extra team to first 'remainder' groups)
  for (let i = 0; i < remainder; i++) {
    const teamsInThisGroup = baseTeamsPerGroup + 1;
    for (let j = 0; j < teamsInThisGroup; j++) {
      if (teamIndex < shuffledTeams.length) {
        groups[i].push(shuffledTeams[teamIndex++]);
      }
    }
  }

  // Then distribute remaining teams evenly
  for (let i = remainder; i < numGroups; i++) {
    for (let j = 0; j < baseTeamsPerGroup; j++) {
      if (teamIndex < shuffledTeams.length) {
        groups[i].push(shuffledTeams[teamIndex++]);
      }
    }
  }

  // Verify all teams were distributed
  const totalDistributed = groups.reduce((acc, group) => acc + group.length, 0);
  if (totalDistributed !== shuffledTeams.length) {
    console.error(
      "Not all teams were distributed to groups!",
      totalDistributed,
      "of",
      shuffledTeams.length
    );
  }

  console.log("Created groups:", groups);
  return groups;
};

/**
 * Generates round-robin matches for a group of teams
 */
export const generateRoundRobinMatches = (
  teams: string[]
): Partial<Match>[] => {
  const matches: Partial<Match>[] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        team1: teams[i],
        team2: teams[j],
      });
    }
  }
  return matches;
};

/**
 * Generates a random vibrant color not in the usedColors list
 */
export const generateRandomColor = (usedColors: string[]) => {
  // Use a predefined set of vibrant colors with good contrast
  const vibrantColors = [
    "#3498db", // Blue
    "#e74c3c", // Red
    "#2ecc71", // Green
    "#f39c12", // Orange
    "#9b59b6", // Purple
    "#1abc9c", // Teal
    "#f1c40f", // Yellow
    "#34495e", // Navy Blue
    "#16a085", // Dark Teal
    "#d35400", // Burnt Orange
    "#c0392b", // Dark Red
    "#8e44ad", // Dark Purple
    "#27ae60", // Dark Green
    "#2980b9", // Ocean Blue
    "#ff6b81", // Pink
    "#5352ed", // Bright Blue
    "#ff4757", // Bright Red
    "#7bed9f", // Light Green
    "#70a1ff", // Sky Blue
    "#a4b0be", // Gray
    "#ff6348", // Coral
    "#7158e2", // Indigo
    "#3742fa", // Royal Blue
  ];

  // Find unused colors
  const unusedColors = vibrantColors.filter(
    (color) => !usedColors.includes(color)
  );

  // If there are unused colors, return one of them
  if (unusedColors.length > 0) {
    return unusedColors[Math.floor(Math.random() * unusedColors.length)];
  }

  // If all colors are used, generate a modified version of a random color
  const baseColor =
    vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
  // Slightly modify the color by adjusting hue
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);

  // Generate a variation until we find one that's not already used
  let newColor;
  do {
    const variation = 30; // Color variation amount
    const newR = Math.max(
      0,
      Math.min(255, r + Math.floor(Math.random() * variation * 2) - variation)
    );
    const newG = Math.max(
      0,
      Math.min(255, g + Math.floor(Math.random() * variation * 2) - variation)
    );
    const newB = Math.max(
      0,
      Math.min(255, b + Math.floor(Math.random() * variation * 2) - variation)
    );

    newColor = `#${newR.toString(16).padStart(2, "0")}${newG
      .toString(16)
      .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  } while (usedColors.includes(newColor));

  return newColor;
};

/**
 * Updates knockout bracket when a match is completed
 */
export const updateKnockoutBracket = (
  matches: Match[],
  matchId: number,
  winner: string
) => {
  // Find the completed match
  const completedMatch = matches.find((m) => m.id === matchId);
  if (!completedMatch || !completedMatch.nextMatchId) return;

  // Update the next match with the winner
  for (const match of matches) {
    if (match.id === completedMatch.nextMatchId) {
      if (completedMatch.nextMatchPosition === "team1") {
        match.team1 = winner;
      } else if (completedMatch.nextMatchPosition === "team2") {
        match.team2 = winner;
      }

      // If this updated match is already completed, we need to propagate
      // the winner up the bracket as well
      if (match.completed && match.nextMatchId) {
        updateKnockoutBracket(
          matches,
          match.id,
          match.winner ||
            (match.score1 !== null &&
            match.score2 !== null &&
            match.score1 > match.score2
              ? match.team1
              : match.team2)
        );
      }

      break;
    }
  }

  // Save the updated bracket to localStorage
  if (typeof window !== "undefined") {
    const savedData = localStorage.getItem("tournamentData");
    if (savedData) {
      const data = JSON.parse(savedData);
      localStorage.setItem(
        "tournamentData",
        JSON.stringify({
          ...data,
          knockoutMatches: matches,
        })
      );
    }
  }
};

/**
 * Get knockout round name based on round number and total teams
 */
export const getKnockoutRoundName = (round: number, totalTeams: number) => {
  const totalRounds = Math.ceil(Math.log2(totalTeams));
  const roundsFromFinal = totalRounds - round;

  switch (roundsFromFinal) {
    case 0:
      return "Final";
    case 1:
      return "Semi-Finals";
    case 2:
      return "Quarter-Finals";
    case 3:
      return "Round of 16";
    case 4:
      return "Round of 32";
    default:
      return `Round ${round}`;
  }
};
